import type { Metadata } from 'next';
import { BASE_URL, DEALER } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Replacement Warranty Plan | Planet Motors Richmond Hill',
  description:
    'Planet Motors Replacement Warranty Plan ensures you receive a like-for-like replacement vehicle after a total loss, not just a depreciated cheque. Richmond Hill, ON.',
  alternates: { canonical: `${BASE_URL}/protection/replacement-warranty/` },
  openGraph: {
    title: 'Replacement Warranty Plan | Planet Motors',
    description: 'If your vehicle is totalled, you receive a comparable new replacement, not just a depreciated payout. One-time premium, coverage up to 7 years.',
    url: `${BASE_URL}/protection/replacement-warranty/`,
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
    type: 'website',
    locale: 'en_CA',
  },
};

export default function ReplacementWarrantyPage() {
  return (
    <main style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: '#1a1a2e', overflowX: 'hidden' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0d2240 0%, #1a3a6b 60%, #0d2240 100%)',
        color: '#fff', padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
        <p style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0a500', marginBottom: '14px', fontWeight: 600 }}>PLANET MOTORS PROTECTION</p>
        <h1 style={{ fontSize: 'clamp(28px, 5.5vw, 56px)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.1 }}>Replacement Warranty Plan</h1>
        <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', maxWidth: '560px', margin: '0 auto 14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
          A New Car, Not Just a Payout.
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          If your vehicle is totalled, we ensure you receive a comparable replacement, not just a depreciated cheque.
        </p>
        <a href={`tel:${DEALER.phone}`} style={{
          display: 'inline-block', background: '#f0a500', color: '#0d2240',
          fontWeight: 700, fontSize: '15px', padding: '14px 36px', borderRadius: '50px', textDecoration: 'none',
        }}>
          Ask About This Plan
        </a>
      </section>

      {/* The problem */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ width: '48px', height: '3px', background: '#f0a500', marginBottom: '24px', borderRadius: '2px' }} />
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>
              Standard Insurance<br />Isn&apos;t Enough
            </h2>
            <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.8, marginBottom: '24px' }}>
              If your new vehicle is totalled due to theft, fire, or collision, standard insurance gives
              you a cash payout based on the <strong>depreciated value</strong> of the vehicle. That amount
              is often not enough to replace your vehicle with a similar model.
            </p>
            <div style={{ background: '#0d2240', borderRadius: '12px', padding: '20px 24px', color: '#fff', fontSize: '14px', lineHeight: 1.8 }}>
              The Replacement Warranty Plan ensures you receive a replacement vehicle matching your original model and value, not just a cheque.
            </div>
          </div>

          {/* Visual comparison */}
          <div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ background: '#fee2e2', padding: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#ef4444', fontWeight: 700, marginBottom: '8px' }}>Without This Plan</p>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626' }}>Depreciated Payout</p>
                <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '8px' }}>Often $5,000–$10,000 less than replacement cost</p>
              </div>
              <div style={{ background: '#dcfce7', padding: '28px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#16a34a', fontWeight: 700, marginBottom: '8px' }}>With This Plan</p>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#15803d' }}>Like-for-Like Replacement</p>
                <p style={{ fontSize: '13px', color: '#16a34a', marginTop: '8px' }}>Same make, model, and value as your original vehicle</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#f5f7fa', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: '48px' }}>How the Replacement Warranty Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
            {[
              { icon: '🚨', step: '01', title: 'Total Loss Event', desc: "Your vehicle is declared a total loss due to theft, fire, or collision." },
              { icon: '📋', step: '02', title: 'File Your Claim', desc: 'Contact Planet Motors. We handle the replacement process quickly.' },
              { icon: '🚗', step: '03', title: 'Get Your Replacement', desc: 'Receive a comparable new vehicle matching your original make and model.' },
            ].map(item => (
              <div key={item.step} style={{ background: '#fff', borderRadius: '14px', padding: '28px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f0a500', marginBottom: '8px' }}>{item.step}</div>
                <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '32px', background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>
              Key facts: If your vehicle is declared a total loss, you&apos;re eligible for a like-for-like replacement.
              No depreciation adjustments. You get a comparable new model, covered by a fixed one-time premium with no annual renewals.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits + Coverage table */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Plan Benefits</h3>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { icon: '🚗', text: 'Full vehicle replacement: No market value adjustments or shortfalls.' },
                { icon: '📅', text: 'Long-term peace of mind: Coverage lasts up to 7 years.' },
                { icon: '💵', text: 'Stability: One-time payment, no unexpected renewal fees.' },
                { icon: '😌', text: 'No disruption: You avoid the stress of car shopping after a total loss.' },
              ].map(b => (
                <div key={b.text} style={{ display: 'flex', gap: '14px', padding: '16px', background: '#f5f7fa', borderRadius: '12px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{b.icon}</span>
                  <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, margin: 0 }}>{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Coverage Details</h3>
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
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

            <div style={{ marginTop: '20px', background: '#f5f7fa', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0d2240', marginBottom: '10px' }}>Who Should Consider This Plan?</p>
              {[
                'Buyers of brand-new vehicles who want long-term value protection.',
                'Drivers who want to avoid loss of value due to depreciation.',
                'Families who rely on having a reliable replacement vehicle quickly.',
              ].map(item => (
                <p key={item} style={{ fontSize: '13px', color: '#555', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid #f0a500' }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0d2240, #1a3a6b)', padding: '72px 24px', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '16px' }}>Drive With Confidence</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7 }}>
          Ask your Planet Motors specialist about the Replacement Warranty Plan today.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`tel:${DEALER.phone}`} style={{ background: '#f0a500', color: '#0d2240', fontWeight: 700, padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px' }}>
            Call Us
          </a>
          <a href="/protection/" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px', border: '1px solid rgba(255,255,255,0.2)' }}>
            All Protection Plans
          </a>
        </div>
      </section>

      <nav aria-label="Protection links" style={{ display: 'none' }}>
        <a href="/protection/">Planet Care Protection Packages</a>
        <a href="/protection/incident-pro/">Incident Pro</a>
        <a href="/protection/gap-coverage/">Companion GAP Coverage</a>
      </nav>
    </main>
  );
}
