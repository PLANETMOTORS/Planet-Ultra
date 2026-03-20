import type { Metadata } from 'next';
import { BASE_URL, DEALER } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Companion GAP Coverage | Planet Motors Richmond Hill',
  description:
    'Companion GAP Coverage at Planet Motors pays the difference between your insurance payout and your remaining loan or lease balance after a total loss or theft. Richmond Hill, ON.',
  alternates: { canonical: `${BASE_URL}/protection/gap-coverage/` },
  openGraph: {
    title: 'Companion GAP Coverage | Planet Motors',
    description: "Bridge the gap between your insurance payout and your loan balance. Don't owe more than your car is worth.",
    url: `${BASE_URL}/protection/gap-coverage/`,
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630 }],
    type: 'website',
    locale: 'en_CA',
  },
};

export default function GapCoveragePage() {
  return (
    <main style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: '#1a1a2e', overflowX: 'hidden' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0d2240 0%, #1a3a6b 60%, #0d2240 100%)',
        color: '#fff', padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
        <p style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f0a500', marginBottom: '14px', fontWeight: 600 }}>PLANET MOTORS PROTECTION</p>
        <h1 style={{ fontSize: 'clamp(28px, 5.5vw, 56px)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.1 }}>Companion GAP Coverage</h1>
        <p style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', maxWidth: '560px', margin: '0 auto 14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
          Know what you owe. Know what you're covered for.
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          Don&apos;t let a gap between your insurance payout and your loan balance leave you thousands out of pocket.
        </p>
        <a href={`tel:${DEALER.phone}`} style={{
          display: 'inline-block', background: '#f0a500', color: '#0d2240',
          fontWeight: 700, fontSize: '15px', padding: '14px 36px', borderRadius: '50px', textDecoration: 'none',
        }}>
          Ask About GAP Coverage
        </a>
      </section>

      {/* What is the gap */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ width: '48px', height: '3px', background: '#f0a500', marginBottom: '24px', borderRadius: '2px' }} />
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>
              Bridge the Gap Between<br />Insurance and Your Loan
            </h2>
            <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.8, marginBottom: '24px' }}>
              When your car is stolen or declared a total loss, your insurance typically pays only the actual cash value of the vehicle, which often doesn&apos;t cover the full amount you owe on your loan or lease. This gap can leave you responsible for thousands out of pocket.
            </p>
            <div style={{ background: '#0d2240', borderRadius: '12px', padding: '20px 24px', color: '#fff', fontSize: '14px', lineHeight: 1.8 }}>
              Companion GAP Coverage protects you from this unexpected financial burden by paying the difference between your insurance payout and your remaining loan or lease balance.
            </div>
          </div>

          {/* GAP visual */}
          <div style={{ background: 'linear-gradient(135deg, #0d2240, #1a3a6b)', borderRadius: '20px', padding: '36px 28px', color: '#fff', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>EXAMPLE: If You Owed</p>
            <p style={{ fontSize: '42px', fontWeight: 800, color: '#f0a500', margin: '0 0 28px' }}>$15,000</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px 0 0 12px', padding: '18px 12px', borderRight: '2px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Insurance Payout</p>
                <p style={{ fontSize: '22px', fontWeight: 800 }}>$12,000</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>What insurer pays</p>
              </div>
              <div style={{ background: '#f0a500', borderRadius: '0 12px 12px 0', padding: '18px 12px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(13,34,64,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>GAP Covers</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#0d2240' }}>$3,000</p>
                <p style={{ fontSize: '11px', color: 'rgba(13,34,64,0.5)', marginTop: '6px' }}>Zero out of pocket</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#f5f7fa', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '3px', background: '#f0a500', margin: '0 auto 28px', borderRadius: '2px' }} />
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, marginBottom: '48px' }}>How GAP Coverage Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', icon: '💥', title: 'Total Loss Occurs', desc: 'Your vehicle is stolen or declared a total loss after an accident.' },
              { step: '02', icon: '💳', title: 'Insurer Pays Market Value', desc: "Your auto insurer pays the vehicle's current depreciated market value." },
              { step: '03', icon: '🛡️', title: 'GAP Covers the Difference', desc: 'If your loan balance is higher, GAP coverage pays the remaining amount.' },
            ].map(item => (
              <div key={item.step} style={{ background: '#fff', borderRadius: '14px', padding: '28px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f0a500', marginBottom: '8px' }}>{item.step}</div>
                <p style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
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
                { icon: '🔒', text: 'Financial security: Protects your finances from large unexpected bills.' },
                { icon: '⚙️', text: 'Built into your financing: Coverage attaches directly to your loan or lease.' },
                { icon: '🧘', text: "Peace of mind: Drive knowing you won't owe more than your car is worth." },
                { icon: '📋', text: 'Coverage term: Active for the full length of your loan or lease.' },
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

            <div style={{ marginTop: '20px', background: '#f5f7fa', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0d2240', marginBottom: '10px' }}>Who Should Consider GAP?</p>
              {[
                'Drivers with loans or leases where the balance exceeds the vehicle\'s market value.',
                'New car buyers who experience rapid depreciation in the first years.',
                'Anyone wanting to avoid surprise debts after theft or total loss.',
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
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, marginBottom: '16px' }}>Protect Your Loan From the Start</h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7 }}>
          Ask your Planet Motors specialist about adding Companion GAP Coverage to your financing today.
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
        <a href="/protection/replacement-warranty/">Replacement Warranty Plan</a>
        <a href="/finance/">Get Financing</a>
      </nav>
    </main>
  );
}
