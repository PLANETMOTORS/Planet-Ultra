import type { Metadata } from 'next';
import { BASE_URL, DEALER } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Incident Pro Protection | Planet Motors Richmond Hill',
  description:
    'Incident Pro at Planet Motors covers dings, windshield chips, ripped upholstery, and lost key fobs, all without affecting your insurance.',
  alternates: { canonical: `${BASE_URL}/protection/incident-pro/` },
  openGraph: {
    title: 'Incident Pro Protection | Planet Motors',
    description: 'Covers minor damage to interior and exterior. Claims processed quickly without affecting your insurance. No out-of-pocket expense.',
    url: `${BASE_URL}/protection/incident-pro/`,
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
    type: 'website',
    locale: 'en_CA',
  },
};

export default function IncidentProPage() {
  return (
    <main style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: '#1a1a2e', overflowX: 'hidden' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0d2240 0%, #1a3a6b 60%, #0d2240 100%)',
        color: '#fff', padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
        <p style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0a500', marginBottom: '14px', fontWeight: 600 }}>PLANET MOTORS PROTECTION</p>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.1 }}>Incident Pro</h1>
        <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', maxWidth: '560px', margin: '0 auto 14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
          Coverage for the small stuff that adds up.
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          Daily wear and tear is inevitable, but costly repairs don&apos;t have to be.
        </p>
        <a href={`tel:${DEALER.phone}`} style={{
          display: 'inline-block', background: '#f0a500', color: '#0d2240',
          fontWeight: 700, fontSize: '15px', padding: '14px 36px', borderRadius: '50px', textDecoration: 'none',
        }}>
          Ask About Incident Pro
        </a>
      </section>

      {/* What it covers */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ width: '48px', height: '3px', background: '#f0a500', marginBottom: '24px', borderRadius: '2px' }} />
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>
              Small Damages,<br />Big Peace of Mind
            </h2>
            <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.8, marginBottom: '24px' }}>
              Incident Pro protects you against the kinds of damage that regular insurance policies don&apos;t cover, including dings, windshield chips, and ripped upholstery.
            </p>
            <div style={{ background: '#0d2240', borderRadius: '12px', padding: '20px 24px', color: '#fff', fontSize: '14px', lineHeight: 1.8 }}>
              No more worrying about claims, deductibles, or watching your insurance premium go up. Submit a claim, get it handled quickly, and move on.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: '🚗', label: 'Exterior Dings', desc: 'Dents, dings, and minor scratches on your vehicle body.' },
              { icon: '🪟', label: 'Windshield Chips', desc: 'Chips or cracks from road debris, handled before they spread.' },
              { icon: '🪑', label: 'Interior Damage', desc: 'Ripped or torn upholstery from daily use.' },
              { icon: '🔑', label: 'Key Fobs', desc: 'Lost or stolen key fobs replaced at no out-of-pocket cost.' },
            ].map(item => (
              <div key={item.label} style={{ background: '#f5f7fa', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0d2240' }}>{item.label}</p>
                <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#f5f7fa', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: '48px' }}>How Incident Pro Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', title: 'Notice damage', desc: 'Spot a ding, chip, or lost key fob on your vehicle.' },
              { step: '02', title: 'Submit a claim', desc: 'Contact us for a fast, paperwork-minimal claim process.' },
              { step: '03', title: 'Get it fixed', desc: 'Repair is fully covered. Zero out-of-pocket, zero insurance impact.' },
            ].map(item => (
              <div key={item.step} style={{ background: '#fff', borderRadius: '14px', padding: '28px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f0a500', marginBottom: '10px' }}>{item.step}</div>
                <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage table */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800 }}>What&apos;s Covered</h2>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ background: '#0d2240', color: '#fff', padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>Covered ✓</div>
              <div style={{ background: '#f8fafc', color: '#888', padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>Not Covered ✗</div>
            </div>
            {[
              ['Dents, dings, and minor scratches', 'Structural damage or full panel repair'],
              ['Windshield chips or cracks', 'Damage from collisions'],
              ['Lost or stolen key fobs', 'Normal wear and tear'],
              ['Interior upholstery tears', 'Pre-existing damage'],
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                <div style={{ padding: '14px 24px', fontSize: '14px', color: '#333', borderRight: '1px solid #f0f0f0' }}>{row[0]}</div>
                <div style={{ padding: '14px 24px', fontSize: '14px', color: '#666' }}>{row[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0d2240, #1a3a6b)', padding: '72px 24px', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '16px' }}>Protect What You've Paid For</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7 }}>
          Ask your Planet Motors specialist about adding Incident Pro to your next vehicle.
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
        <a href="/protection/replacement-warranty/">Replacement Warranty Plan</a>
        <a href="/protection/gap-coverage/">Companion GAP Coverage</a>
      </nav>
    </main>
  );
}
