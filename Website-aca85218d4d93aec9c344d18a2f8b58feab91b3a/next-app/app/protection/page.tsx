import type { Metadata } from 'next';
import { BASE_URL, DEALER } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Planet Care Protection Plans | Planet Motors Richmond Hill',
  description:
    'Planet Motors offers PlanetCare extended warranty, GAP coverage, Incident Pro, and Replacement Warranty plans for used cars in Richmond Hill, ON.',
  alternates: { canonical: `${BASE_URL}/protection/` },
  openGraph: {
    title: 'Planet Care Protection Plans | Planet Motors',
    description:
      'Explore PlanetCare™ packages, Companion GAP Coverage, Incident Pro, and Replacement Warranty, all designed to protect your used car investment.',
    url: `${BASE_URL}/protection/`,
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
    type: 'website',
    locale: 'en_CA',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is an extended warranty on a used car worth it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — an extended warranty can help protect you from costly repairs after the manufacturer warranty expires, especially on pre-owned vehicles.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is GAP insurance in Canada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "GAP insurance covers the difference between your car's value and what you still owe on your loan if your vehicle is stolen or written off.",
      },
    },
    {
      '@type': 'Question',
      name: 'What does tire & rim protection cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It helps cover the cost of repairs or replacement for damage caused by potholes, nails, curb impact, and road hazards.',
      },
    },
  ],
};

export default function ProtectionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: '#1a1a2e', overflowX: 'hidden' }}>

        {/* ── HERO ─────────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(135deg, #0d2240 0%, #1a3a6b 60%, #0d2240 100%)',
          color: '#fff',
          textAlign: 'center',
          padding: '100px 24px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative rings */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '320px', height: '320px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: '-60px', left: '-60px',
            width: '260px', height: '260px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)',
          }} />

          <p style={{ fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0a500', marginBottom: '16px', fontWeight: 600 }}>
            HOW IT WORKS
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 20px', lineHeight: 1.1 }}>
            OUR PROTECTION PLANS
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2.5vw, 19px)', maxWidth: '620px', margin: '0 auto 40px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            Planet Motors has you covered with PlanetCare™ packages, GAP coverage,
            Incident Pro, and Replacement Warranty, all in one place.
          </p>
          <a href="#packages" style={{
            display: 'inline-block', background: '#f0a500', color: '#0d2240',
            fontWeight: 700, fontSize: '15px', padding: '14px 36px', borderRadius: '50px',
            textDecoration: 'none', letterSpacing: '0.5px',
          }}>
            See All Plans
          </a>
        </section>

        {/* ── INTRO ───────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '20px' }}>
              PLANET MOTORS HAS YOU COVERED
            </h2>
            <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.8 }}>
              We offer a range of coverage plans, from PlanetCare™ extended warranty packages
              to GAP insurance. PlanetCare™ gives you added protection so you can drive knowing
              your vehicle is covered.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '60px', maxWidth: '900px', margin: '60px auto 0' }}>
            {[
              { icon: '🛡️', title: 'Nationwide Coverage', desc: 'Access to repair locations across Canada to keep your costs low.' },
              { icon: '☀️', title: 'Peace of Mind', desc: "We've got you covered with free 24/7 roadside assistance and rental coverage." },
              { icon: '↩️', title: 'Cancel Anytime', desc: 'Cancel anytime to receive a prorated refund.' },
            ].map((item) => (
              <div key={item.title} style={{ flex: '1 1 220px', maxWidth: '260px', textAlign: 'left' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLANET CARE PACKAGES ──────────────────── */}
        <section id="packages" style={{ background: '#f5f7fa', padding: '80px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '14px' }}>
                PLANETCARE™ PACKAGES
              </h2>
              <p style={{ fontSize: '16px', color: '#555', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                See what package fits your budget and requirements. Prices vary depending on the vehicle.
              </p>
            </div>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

              {/* Essential Shield */}
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '36px 28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07)', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#94a3b8' }} />
                <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>PlanetCare™</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Essential Shield</h3>
                <p style={{ fontSize: '36px', fontWeight: 800, color: '#0d2240', margin: '16px 0 4px' }}>$1,950</p>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '28px' }}>+ $250 deposit at checkout</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {[
                    'Standard Warranty',
                    'Trade-in Credit Applied',
                    'Pickup or Delivery Anytime ✓',
                  ].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#444', marginBottom: '12px' }}>
                      <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px' }}>✓</span> {f}
                    </li>
                  ))}
                  {['Tire & Rim Protection', 'InvisitTrak™ Anti-Theft'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#bbb', marginBottom: '12px' }}>
                      <span style={{ color: '#e2e8f0', fontSize: '16px' }}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
                  Covered for depreciation, repairs, and unforeseen events. Job loss protection ensures next year&apos;s payments are covered.
                </div>
                <div style={{ fontSize: '13px', color: '#0d2240', fontWeight: 600 }}>
                  <div>$50K Replacement</div>
                  <div>~ $30K GAP</div>
                  <div>~ 12 Payments</div>
                </div>
              </div>

              {/* Smart Secure */}
              <div style={{
                background: '#0d2240', borderRadius: '16px', padding: '36px 28px',
                boxShadow: '0 8px 40px rgba(13,34,64,0.3)', position: 'relative', overflow: 'hidden',
                color: '#fff',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#f0a500' }} />
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#f0a500', color: '#0d2240', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '50px', letterSpacing: '1px' }}>POPULAR</div>
                <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>PlanetCare™</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Smart Secure</h3>
                <p style={{ fontSize: '36px', fontWeight: 800, color: '#f0a500', margin: '16px 0 4px' }}>$3,000</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>+ $250 deposit at checkout</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {[
                    'Extended Warranty',
                    'Trade-in Credit Applied',
                    'Pickup or Delivery Anytime',
                    'Tire & Rim Protection',
                  ].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: '12px' }}>
                      <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px' }}>✓</span> {f}
                    </li>
                  ))}
                  {['InvisitTrak™ Anti-Theft'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px' }}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Comprehensive protection where it matters. New-for-old replacement, zero deductibles, loan clearance on death or illness, and payment coverage during disability.
                </div>
                <div style={{ fontSize: '13px', color: '#f0a500', fontWeight: 600 }}>
                  <div>$60K Replacement</div>
                  <div>~ $1M Life</div>
                  <div>~ $500K CI · ~ $25K Payments</div>
                </div>
              </div>

              {/* Life Proof */}
              <div style={{
                background: '#fff', borderRadius: '16px', padding: '36px 28px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07)', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#0d2240' }} />
                <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>PlanetCare™</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Life Proof</h3>
                <p style={{ fontSize: '36px', fontWeight: 800, color: '#0d2240', margin: '16px 0 4px' }}>$4,850</p>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '28px' }}>+ $250 deposit at checkout</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {[
                    'Extended Warranty',
                    'Trade-in Credit Applied',
                    'Pickup or Delivery Anytime',
                    'Tire & Rim Protection',
                    'InvisitTrak™ Anti-Theft',
                  ].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#444', marginBottom: '12px' }}>
                      <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
                  All-around protection with no surprises. New-for-old replacement, zero deductibles, loan clearance on death or illness, payment coverage during disability, plus theft and GAP protection.
                </div>
                <div style={{ fontSize: '13px', color: '#0d2240', fontWeight: 600 }}>
                  <div>$60K Replacement</div>
                  <div>~ $1M Life</div>
                  <div>~ $500K CI · ~ $25K Payments</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INCIDENT PRO ──────────────────────────── */}
        <section id="incident-pro" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0a500', fontWeight: 700, marginBottom: '12px' }}>INCIDENT PRO</p>
                <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>
                  Small Damages,<br />Big Peace of Mind
                </h2>
                <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.8, marginBottom: '28px' }}>
                  Daily wear and tear is inevitable, but costly repairs don&apos;t have to be.
                  Incident Pro protects you against dings, windshield chips, and ripped upholstery
                  that regular insurance policies don&apos;t cover.
                </p>
                <div style={{ background: '#0d2240', borderRadius: '12px', padding: '20px 24px', color: '#fff', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
                  No more worrying about claims, deductibles, or watching your premium go up. Submit a claim, get it handled, and move on.
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    'Covers minor damage to interior and exterior',
                    'Claims processed quickly without affecting your insurance',
                    'No out-of-pocket expense for small repairs',
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#444', marginBottom: '10px' }}>
                      <span style={{ color: '#f0a500', flexShrink: 0 }}>→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {/* Coverage table */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ background: '#0d2240', color: '#fff', padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Covered ✓</div>
                    <div style={{ background: '#f8fafc', color: '#888', padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Not Covered ✗</div>
                  </div>
                  {[
                    ['Dents, dings, and minor scratches', 'Structural damage or full panel repair'],
                    ['Windshield chips or cracks', 'Damage from collisions'],
                    ['Lost or stolen key fobs', 'Normal wear and tear'],
                    ['', 'Pre-existing damage'],
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <div style={{ padding: '12px 20px', fontSize: '13px', color: '#333', borderRight: '1px solid #f0f0f0' }}>{row[0]}</div>
                      <div style={{ padding: '12px 20px', fontSize: '13px', color: '#666' }}>{row[1]}</div>
                    </div>
                  ))}
                </div>

                {/* Benefits grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                  {[
                    { icon: '💰', text: 'Saves money: Avoid deductibles and costly cosmetic repairs.' },
                    { icon: '⚡', text: 'Convenient: Fast approval process, minimal paperwork.' },
                    { icon: '📈', text: 'Boosts resale value: Keep your car in like-new condition.' },
                    { icon: '🔑', text: 'Continued protection: Covers interior, exterior, and key fobs.' },
                  ].map(b => (
                    <div key={b.text} style={{ background: '#f5f7fa', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                      <span style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── REPLACEMENT WARRANTY ──────────────────── */}
        <section id="replacement-warranty" style={{ background: '#f5f7fa', padding: '80px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'center' }}>
              {/* Visual side */}
              <div style={{ order: 1 }}>
                <div style={{ background: '#0d2240', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔄</div>
                  <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>A New Car, Not Just a Payout</p>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                    Standard insurance pays depreciated value. Our plan gives you a comparable replacement vehicle.
                  </p>
                </div>

                {/* Coverage table */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginTop: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ background: '#0d2240', color: '#fff', padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Covered ✓</div>
                    <div style={{ background: '#f8fafc', color: '#888', padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Not Covered ✗</div>
                  </div>
                  {[
                    ['Total loss from theft, fire, or collision', 'Partial damage or repairable claims'],
                    ['Replacement vehicle (similar make/model)', 'Used or previously owned vehicles'],
                    ['Fixed premium, no renewal fees', 'Wear and tear, cosmetic issues'],
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <div style={{ padding: '12px 20px', fontSize: '13px', color: '#333', borderRight: '1px solid #f0f0f0' }}>{row[0]}</div>
                      <div style={{ padding: '12px 20px', fontSize: '13px', color: '#666' }}>{row[1]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text side */}
              <div style={{ order: 2 }}>
                <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#f0a500', fontWeight: 700, marginBottom: '12px' }}>REPLACEMENT WARRANTY PLAN</p>
                <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>
                  A Replacement Vehicle,<br />Not Just a Cheque
                </h2>
                <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.8, marginBottom: '28px' }}>
                  If your vehicle is totalled due to theft, fire, or collision, standard insurance gives
                  you a cash payout based on depreciated value. That amount is often not enough
                  to replace your vehicle with a similar model.
                </p>
                <div style={{ background: '#0d2240', borderRadius: '12px', padding: '20px 24px', color: '#fff', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
                  The Replacement Warranty Plan ensures you receive a replacement vehicle matching your original model and value, not just a cheque.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    { icon: '🚗', text: 'Full vehicle replacement: No market value adjustments.' },
                    { icon: '📅', text: 'Long-term peace of mind: Coverage lasts up to 7 years.' },
                    { icon: '💵', text: 'Stability: One-time payment, no unexpected renewal fees.' },
                    { icon: '😌', text: 'No disruption: You avoid the stress of car shopping after a total loss.' },
                  ].map(b => (
                    <div key={b.text} style={{ background: '#fff', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                      <span style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GAP COVERAGE ──────────────────────────── */}
        <section id="gap-coverage" style={{ background: '#fff', padding: '80px 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '14px' }}>
                COMPANION GAP COVERAGE
              </h2>
              <p style={{ fontSize: '16px', color: '#555', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                Bridge the gap between your insurance payout and your loan balance.
              </p>
            </div>

            {/* GAP visual */}
            <div style={{ background: 'linear-gradient(135deg, #0d2240, #1a3a6b)', borderRadius: '20px', padding: '48px 40px', color: '#fff', marginBottom: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>EXAMPLE: If You Owed on Your Vehicle</p>
              <p style={{ fontSize: '48px', fontWeight: 800, color: '#f0a500', margin: '0 0 40px' }}>$15,000</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: '12px 0 0 12px', padding: '20px 16px', borderRight: '2px solid rgba(255,255,255,0.2)' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Insurance Payout</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>$12,000</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>What your insurer pays</p>
                </div>
                <div style={{ flex: 1, background: '#f0a500', borderRadius: '0 12px 12px 0', padding: '20px 16px' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(13,34,64,0.7)', marginBottom: '8px' }}>Amount Owed (GAP)</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: '#0d2240' }}>$3,000</p>
                  <p style={{ fontSize: '12px', color: 'rgba(13,34,64,0.6)', marginTop: '8px' }}>GAP coverage pays this</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>How GAP Coverage Works</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {[
                    "Your insurer pays the vehicle's current market value after a total loss.",
                    'If your loan or lease balance is higher, GAP coverage covers the leftover amount.',
                    'You avoid having to pay any remaining balance out of pocket.',
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#444', marginBottom: '12px', lineHeight: 1.6 }}>
                      <span style={{ color: '#f0a500', flexShrink: 0, marginTop: '2px' }}>→</span> {item}
                    </li>
                  ))}
                </ul>

                <div style={{ background: '#f5f7fa', borderRadius: '12px', padding: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#0d2240', marginBottom: '12px' }}>Who Should Consider GAP?</p>
                  {[
                    'Drivers with loans or leases where balance exceeds market value',
                    'New car buyers who experience rapid depreciation in the first years',
                    'Anyone wanting to avoid surprise debts after theft or total loss',
                  ].map(item => (
                    <p key={item} style={{ fontSize: '13px', color: '#555', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid #f0a500' }}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              {/* Coverage table */}
              <div>
                <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ background: '#0d2240', color: '#fff', padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Covered ✓</div>
                    <div style={{ background: '#f8fafc', color: '#888', padding: '14px 20px', fontSize: '13px', fontWeight: 700 }}>Not Covered ✗</div>
                  </div>
                  {[
                    ['Difference between insurance payout and loan/lease balance', 'Deductibles on your insurance policy'],
                    ['Theft or total loss due to collision, fire, or covered perils', 'Missed or late loan payments'],
                    ['Lease gap amount if applicable', 'Regular maintenance or repairs'],
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                      <div style={{ padding: '12px 20px', fontSize: '13px', color: '#333', borderRight: '1px solid #f0f0f0' }}>{row[0]}</div>
                      <div style={{ padding: '12px 20px', fontSize: '13px', color: '#666' }}>{row[1]}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '20px' }}>
                  {[
                    { icon: '🔒', text: 'Financial security: Protects your finances from large unexpected bills.' },
                    { icon: '⚙️', text: 'Built into your financing: Coverage attaches directly to your loan or lease.' },
                    { icon: '🧘', text: "Peace of mind: Drive knowing you won't owe more than your car is worth." },
                    { icon: '📋', text: 'Coverage term: Active for the full length of your loan or lease.' },
                  ].map(b => (
                    <div key={b.text} style={{ background: '#f5f7fa', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#444', lineHeight: 1.6 }}>
                      <span style={{ fontSize: '18px', display: 'block', marginBottom: '6px' }}>{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LAYERS OF PROTECTION ─────────────────── */}
        <section style={{ background: '#0d2240', padding: '80px 24px', color: '#fff', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '14px' }}>
              MULTIPLE LAYERS OF PROTECTION
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '56px', lineHeight: 1.7 }}>
              Every Planet Motors vehicle comes with a 10-Day Money-Back Guarantee and is eligible for our protection plans.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              {[
                { label: '10-Day Money Back', sub: 'Comes Standard', color: '#f0a500' },
                { label: '100-Day Limited Warranty', sub: 'Comes Standard', color: '#60a5fa' },
                { label: '150-Point Inspection', sub: 'Comes Standard', color: '#34d399' },
                { label: 'PlanetCare™', sub: 'Optional Add-on', color: '#a78bfa' },
                { label: 'GAP Coverage', sub: 'Optional Add-on', color: '#fb7185' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '24px 16px',
                  borderTop: `3px solid ${item.color}`,
                }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{item.label}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section style={{ background: '#f5f7fa', padding: '80px 24px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800 }}>
                FREQUENTLY ASKED QUESTIONS
              </h2>
            </div>
            {[
              {
                q: 'Is an extended warranty on a used car worth it?',
                a: 'Yes, an extended warranty can help protect you from costly repairs after the manufacturer warranty expires, especially on pre-owned vehicles.',
              },
              {
                q: 'What is GAP insurance in Canada?',
                a: "GAP insurance covers the difference between your car's value and what you still owe on your loan if your vehicle is stolen or written off.",
              },
              {
                q: 'What does tire & rim protection cover?',
                a: 'It helps cover the cost of repairs or replacement for damage caused by potholes, nails, curb impact, and road hazards.',
              },
              {
                q: 'Can I add protection plans after purchasing my vehicle?',
                a: 'Some plans can be added after purchase. Contact us directly to discuss your options and eligibility.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '14px', padding: '24px 28px',
                marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0d2240', marginBottom: '12px' }}>{item.q}</h3>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(135deg, #0d2240, #1a3a6b)',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: '16px' }}>
              Ready to Drive With Confidence?
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '36px' }}>
              Talk to one of our protection specialists today and find the plan that fits your budget and lifestyle.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`tel:${DEALER.phone}`} style={{
                background: '#f0a500', color: '#0d2240', fontWeight: 700,
                padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px',
              }}>
                Call {DEALER.phone.replace('+1', '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
              </a>
              <a href="/inventory/used/" style={{
                background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700,
                padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
                Browse Inventory
              </a>
            </div>
          </div>
        </section>

        {/* ── Internal nav ─────────────────────────── */}
        <nav aria-label="Protection plan links" style={{ display: 'none' }}>
          <a href="/protection/incident-pro/">Incident Pro Protection</a>
          <a href="/protection/replacement-warranty/">Replacement Warranty Plan</a>
          <a href="/protection/gap-coverage/">Companion GAP Coverage</a>
          <a href="/finance/">Get Financing</a>
          <a href="/inventory/used/">Browse Used Cars</a>
        </nav>
      </main>
    </>
  );
}
