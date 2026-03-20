/**
 * Planet Motors — Firebase Cloud Functions
 * ─────────────────────────────────────────────────────────────
 * Handles:
 *   1. Price drop detection → Brevo email automation
 *   2. New contact form → Brevo notification email to staff
 *   3. New sell request → Brevo notification email to staff
 *   4. New reservation → confirmation email to customer
 *   5. Delivery distance calculator proxy (Google Maps Distance Matrix)
 *
 * SETUP — run these commands once in Cloud Shell:
 *   firebase functions:secrets:set BREVO_API_KEY
 *   firebase functions:secrets:set STAFF_EMAIL
 *   firebase functions:secrets:set GOOGLE_MAPS_API_KEY
 *   firebase deploy --only functions --project planet-motors
 */

const functions  = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const admin      = require('firebase-admin');
const axios      = require('axios');

admin.initializeApp();
const db = admin.firestore();

// ── Declare secrets (values injected at runtime via Secret Manager) ─
const secretBrevoApiKey    = defineSecret('BREVO_API_KEY');
const secretStaffEmail     = defineSecret('STAFF_EMAIL');
const secretGoogleMapsKey  = defineSecret('GOOGLE_MAPS_API_KEY');

// ── Static config ───────────────────────────────────────────────────
const FROM_EMAIL = 'noreply@planetmotors.app';
const FROM_NAME  = 'Planet Motors';
const SITE_URL   = 'https://www.planetmotors.app';

// ─────────────────────────────────────────────────────────────────
// BREVO EMAIL HELPER
// ─────────────────────────────────────────────────────────────────

async function sendBrevoEmail({ to, toName, subject, htmlContent, apiKey }) {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender:      { name: FROM_NAME, email: FROM_EMAIL },
      to:          [{ email: to, name: toName || to }],
      subject,
      htmlContent
    }, {
      headers: {
        'api-key':      apiKey,
        'Content-Type': 'application/json'
      }
    });
    functions.logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    functions.logger.error('Brevo email error:', err.response?.data || err.message);
  }
}

// ─────────────────────────────────────────────────────────────────
// 1. PRICE DROP ALERT
//    Triggered when a vehicle document in /inventory/{vehicleId}
//    is updated with a lower price
// ─────────────────────────────────────────────────────────────────

exports.onVehiclePriceUpdate = functions
  .runWith({ secrets: [secretBrevoApiKey] })
  .firestore
  .document('inventory/{vehicleId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();
    const vehicleId = context.params.vehicleId;

    // Only trigger if price actually dropped
    if (!before.price || !after.price || after.price >= before.price) return null;

    const priceDrop  = before.price - after.price;
    const vehicleName = `${after.year} ${after.make} ${after.model}`;

    functions.logger.info(`Price drop on ${vehicleName}: $${before.price} → $${after.price}`);

    // Find all users watching this vehicle
    const alertsSnap = await db.collection('priceAlerts')
      .where('vehicleId', '==', vehicleId)
      .get();

    if (alertsSnap.empty) return null;

    const apiKey = secretBrevoApiKey.value();

    const emailPromises = alertsSnap.docs.map(alertDoc => {
      const alertData = alertDoc.data();
      return sendBrevoEmail({
        to:      alertData.userEmail,
        toName:  alertData.userEmail,
        apiKey,
        subject: `🚗 Price Drop: ${vehicleName} is now $${after.price.toLocaleString('en-CA')}`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#0f1e3d;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
              <h1 style="color:#c9a84c;margin:0;font-size:24px;">Planet Motors</h1>
              <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:14px;">Price Drop Alert</p>
            </div>
            <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;padding:30px;border-radius:0 0 10px 10px;">
              <h2 style="color:#0f1e3d;margin:0 0 16px;">Good news — the price just dropped!</h2>
              <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:16px;margin-bottom:20px;">
                <div style="font-size:18px;font-weight:700;color:#0f1e3d;">${vehicleName}</div>
                <div style="margin-top:8px;display:flex;align-items:center;gap:12px;">
                  <span style="font-size:14px;color:#888;text-decoration:line-through;">was $${before.price.toLocaleString('en-CA')}</span>
                  <span style="font-size:22px;font-weight:800;color:#16a34a;">$${after.price.toLocaleString('en-CA')}</span>
                  <span style="background:#d02126;color:#fff;font-size:12px;font-weight:700;padding:3px 8px;border-radius:20px;">
                    -$${priceDrop.toLocaleString('en-CA')}
                  </span>
                </div>
              </div>
              <a href="${SITE_URL}" style="display:inline-block;background:#d02126;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;">
                View Vehicle →
              </a>
              <p style="font-size:12px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
                You're receiving this because you set a price alert on this vehicle.<br>
                <a href="${SITE_URL}" style="color:#223c79;">Manage your alerts</a> · 🛡️ OMVIC Registered Dealer
              </p>
            </div>
          </div>
        `
      });
    });

    // Update stored price in each alert doc
    const updatePromises = alertsSnap.docs.map(alertDoc =>
      alertDoc.ref.update({ currentPrice: after.price })
    );

    await Promise.all([...emailPromises, ...updatePromises]);
    functions.logger.info(`Sent ${alertsSnap.docs.length} price drop alert(s) for ${vehicleName}`);
    return null;
  });

// ─────────────────────────────────────────────────────────────────
// 2. NEW CONTACT FORM — notify staff
// ─────────────────────────────────────────────────────────────────

exports.onNewContact = functions
  .runWith({ secrets: [secretBrevoApiKey, secretStaffEmail] })
  .firestore
  .document('contacts/{contactId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    const staffEmail = secretStaffEmail.value();
    if (!staffEmail) return null;

    await sendBrevoEmail({
      to:      staffEmail,
      toName:  'Planet Motors Team',
      apiKey:  secretBrevoApiKey.value(),
      subject: `📬 New Contact: ${data.subject || 'General Inquiry'} — ${data.name}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#0f1e3d;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:700;width:120px;">Name</td><td style="padding:8px;">${data.name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:700;">Phone</td><td style="padding:8px;">${data.phone || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:700;">Email</td><td style="padding:8px;">${data.email || '—'}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:700;">Subject</td><td style="padding:8px;">${data.subject || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:700;vertical-align:top;">Message</td><td style="padding:8px;">${data.message}</td></tr>
          </table>
        </div>
      `
    });
    return null;
  });

// ─────────────────────────────────────────────────────────────────
// 3. NEW SELL REQUEST — notify staff
// ─────────────────────────────────────────────────────────────────

exports.onNewSellRequest = functions
  .runWith({ secrets: [secretBrevoApiKey, secretStaffEmail] })
  .firestore
  .document('sellRequests/{reqId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    const staffEmail = secretStaffEmail.value();
    if (!staffEmail) return null;

    const v = data.vehicle || {};
    await sendBrevoEmail({
      to:      staffEmail,
      toName:  'Planet Motors Team',
      apiKey:  secretBrevoApiKey.value(),
      subject: `🚗 New Sell Request: ${v.year} ${v.make} ${v.model} — ${data.contact?.name}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#0f1e3d;">New Sell / Trade-in Request</h2>
          <h3 style="color:#555;">Vehicle</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:700;width:120px;">Year</td><td style="padding:8px;">${v.year}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:700;">Make</td><td style="padding:8px;">${v.make}</td></tr>
            <tr><td style="padding:8px;font-weight:700;">Model</td><td style="padding:8px;">${v.model}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:700;">Trim</td><td style="padding:8px;">${v.trim || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:700;">KM</td><td style="padding:8px;">${v.km || '—'}</td></tr>
          </table>
          <h3 style="color:#555;">Contact</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:700;width:120px;">Name</td><td style="padding:8px;">${data.contact?.name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:700;">Phone</td><td style="padding:8px;">${data.contact?.phone}</td></tr>
          </table>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        </div>
      `
    });
    return null;
  });

// ─────────────────────────────────────────────────────────────────
// 4. NEW RESERVATION — confirmation email to customer
// ─────────────────────────────────────────────────────────────────

exports.onNewReservation = functions
  .runWith({ secrets: [secretBrevoApiKey, secretStaffEmail] })
  .firestore
  .document('reservations/{resId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data.email) return null;

    const apiKey     = secretBrevoApiKey.value();
    const staffEmail = secretStaffEmail.value();

    await sendBrevoEmail({
      to:      data.email,
      toName:  data.name || data.email,
      apiKey,
      subject: `✅ Vehicle Reserved — ${data.vehicleName} — Planet Motors`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#0f1e3d;padding:20px;border-radius:10px 10px 0 0;text-align:center;">
            <h1 style="color:#c9a84c;margin:0;font-size:24px;">Planet Motors</h1>
          </div>
          <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;padding:30px;border-radius:0 0 10px 10px;">
            <h2 style="color:#0f1e3d;">Your vehicle is reserved! ✓</h2>
            <p style="color:#444;">Hi ${data.name || 'there'},</p>
            <p style="color:#444;">Your $250 refundable deposit has been received and your vehicle is now on hold for you.</p>
            <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:16px;margin:20px 0;">
              <div style="font-size:18px;font-weight:700;color:#0f1e3d;">${data.vehicleName}</div>
              <div style="font-size:14px;color:#555;margin-top:4px;">$250 refundable deposit received</div>
            </div>
            <p style="color:#444;">A Planet Motors representative will contact you within <strong>1 business hour</strong> to confirm next steps.</p>
            <p style="color:#444;">Questions? Call us: <a href="tel:+18667973332" style="color:#223c79;">1-866-797-3332</a></p>
            <p style="font-size:12px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
              Planet Motors Inc. · Richmond Hill, ON · 🛡️ OMVIC Registered Dealer<br>
              <a href="${SITE_URL}" style="color:#223c79;">${SITE_URL}</a>
            </p>
          </div>
        </div>
      `
    });

    // Also notify staff
    if (staffEmail) {
      const fin = data.financing;
      const tr  = data.trade;
      const del = data.delivery;
      const addr = data.address;
      await sendBrevoEmail({
        to:      staffEmail,
        toName:  'Planet Motors Team',
        apiKey,
        subject: `💰 New Reservation: ${data.vehicleName} — ${data.name}`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#0f1e3d;padding:16px 20px;border-radius:10px 10px 0 0;">
              <h2 style="color:#c9a84c;margin:0;">New Reservation — $250 Deposit</h2>
            </div>
            <div style="background:#fff;border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 10px 10px;">
              <h3 style="color:#0f1e3d;margin-top:0;">Vehicle</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <tr><td style="padding:6px 8px;font-weight:700;width:140px;color:#555;">Vehicle</td><td style="padding:6px 8px;">${data.vehicleName}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">Price</td><td style="padding:6px 8px;">$${data.vehiclePrice ? Number(data.vehiclePrice).toLocaleString() : '—'}</td></tr>
                <tr><td style="padding:6px 8px;font-weight:700;color:#555;">Ref #</td><td style="padding:6px 8px;font-weight:700;color:#0f1e3d;">${data.refNum}</td></tr>
              </table>

              <h3 style="color:#0f1e3d;">Customer</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <tr><td style="padding:6px 8px;font-weight:700;width:140px;color:#555;">Name</td><td style="padding:6px 8px;">${data.name}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">Email</td><td style="padding:6px 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
                <tr><td style="padding:6px 8px;font-weight:700;color:#555;">Phone</td><td style="padding:6px 8px;"><a href="tel:${data.phone}">${data.phone || '—'}</a></td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">DOB</td><td style="padding:6px 8px;">${data.dob || '—'}</td></tr>
                <tr><td style="padding:6px 8px;font-weight:700;color:#555;">Address</td><td style="padding:6px 8px;">${addr ? `${addr.addr}, ${addr.city}, ${addr.prov} ${addr.postal}` : '—'}</td></tr>
              </table>

              <h3 style="color:#0f1e3d;">Payment — ${data.payment === 'finance' ? 'Financing' : 'Cash'}</h3>
              ${fin ? `
              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <tr><td style="padding:6px 8px;font-weight:700;width:140px;color:#555;">Down Payment</td><td style="padding:6px 8px;">$${Number(fin.down||0).toLocaleString()}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">Term</td><td style="padding:6px 8px;">${fin.term} months</td></tr>
                <tr><td style="padding:6px 8px;font-weight:700;color:#555;">APR</td><td style="padding:6px 8px;">${fin.apr}%</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">Employment</td><td style="padding:6px 8px;">${fin.employed} — ${fin.employer || '—'} (${fin.income ? '$'+Number(fin.income).toLocaleString()+'/yr' : '—'})</td></tr>
                <tr><td style="padding:6px 8px;font-weight:700;color:#555;">GAP Insurance</td><td style="padding:6px 8px;">${fin.gap ? 'Yes' : 'No'}</td></tr>
              </table>` : '<p style="color:#555;">Cash purchase</p>'}

              ${tr ? `
              <h3 style="color:#0f1e3d;">Trade-In</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <tr><td style="padding:6px 8px;font-weight:700;width:140px;color:#555;">Vehicle</td><td style="padding:6px 8px;">${tr.year} ${tr.make} ${tr.model} ${tr.trim}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">KM</td><td style="padding:6px 8px;">${tr.km ? Number(tr.km).toLocaleString() : '—'}</td></tr>
                <tr><td style="padding:6px 8px;font-weight:700;color:#555;">Condition</td><td style="padding:6px 8px;">${tr.condition}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">Estimated Offer</td><td style="padding:6px 8px;font-weight:700;">$${Number(tr.offer||0).toLocaleString()}</td></tr>
              </table>` : ''}

              <h3 style="color:#0f1e3d;">Delivery</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                <tr><td style="padding:6px 8px;font-weight:700;width:140px;color:#555;">Method</td><td style="padding:6px 8px;">${del ? (del.method === 'deliver' ? 'Home Delivery' : 'Dealership Pickup') : '—'}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:6px 8px;font-weight:700;color:#555;">Date</td><td style="padding:6px 8px;">${del?.date || '—'} ${del?.time || ''}</td></tr>
                ${del && del.method === 'deliver' ? `<tr><td style="padding:6px 8px;font-weight:700;color:#555;">Address</td><td style="padding:6px 8px;">${del.addr}, ${del.city}, ${del.prov} ${del.postal}</td></tr>` : ''}
              </table>

              <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:12px 16px;margin-top:8px;">
                <strong style="color:#16a34a;">$250 deposit received · Ref: ${data.refNum}</strong>
              </div>
            </div>
          </div>
        `
      });
    }
    return null;
  });

// ─────────────────────────────────────────────────────────────────
// 5. DELIVERY DISTANCE API
//    GET ?destination=K1A+0A1
//    Returns { distanceKm: number } or { error: string }
//    Keeps GOOGLE_MAPS_API_KEY server-side; called by the static site.
// ─────────────────────────────────────────────────────────────────

const DISTANCE_ORIGIN    = 'L4C 1G7, Richmond Hill, Ontario, Canada';
const DISTANCE_POSTAL_RE = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
const ALLOWED_ORIGINS    = [
  'https://planetmotors.app',
  'https://www.planetmotors.app',
];

exports.getDistance = functions
  .runWith({ secrets: [secretGoogleMapsKey] })
  .https.onRequest(async (req, res) => {
    // CORS — allow only the production domain (and localhost for dev)
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost')) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

    const destination = (req.query.destination || '').trim();

    if (!DISTANCE_POSTAL_RE.test(destination)) {
      res.status(400).json({ error: 'Invalid postal code.' });
      return;
    }

    const GOOGLE_MAPS_API_KEY = secretGoogleMapsKey.value();
    if (!GOOGLE_MAPS_API_KEY) {
      functions.logger.error('[getDistance] GOOGLE_MAPS_API_KEY secret is not set');
      res.status(500).json({ error: 'Distance service is not configured.' });
      return;
    }

    const normalised = destination.toUpperCase().replace(/\s/g, '');
    const formatted  = `${normalised.slice(0, 3)} ${normalised.slice(3)}`;

    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins',      DISTANCE_ORIGIN);
    url.searchParams.set('destinations', `${formatted}, Canada`);
    url.searchParams.set('mode',         'driving');
    url.searchParams.set('units',        'metric');
    url.searchParams.set('region',       'ca');
    url.searchParams.set('key',          GOOGLE_MAPS_API_KEY);

    try {
      const googleRes = await axios.get(url.toString());
      const data      = googleRes.data;
      const element   = data?.rows?.[0]?.elements?.[0];
      const status    = element?.status;

      if (data.status !== 'OK' || status !== 'OK' || !element?.distance?.value) {
        functions.logger.warn('[getDistance] Unexpected Maps response:', JSON.stringify(data));
        res.status(422).json({ error: 'Route could not be calculated.' });
        return;
      }

      const distanceKm = Math.round(element.distance.value / 1000);
      res.status(200).json({ distanceKm });
    } catch (err) {
      functions.logger.error('[getDistance] Network error:', err.message);
      res.status(502).json({ error: 'Distance service unavailable.' });
    }
  });
