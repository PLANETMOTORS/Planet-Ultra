export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">Planet Motors</div>
          <nav className="nav">
            <a href="#">Shop Inventory</a>
            <a href="#">Sell or Trade</a>
            <a href="#">Finance</a>
            <a href="#">More</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-pills">
              <span className="pill">4.8 · 274+ Google Reviews</span>
              <span className="pill">OMVIC Registered Dealer</span>
            </div>
            <h1 className="hero-title">Buy, sell, or trade your next vehicle online.</h1>
            <p className="hero-copy">
              This is the first UI shell for Planet Motors. Final data, finance logic, and live inventory
              will be connected after the structure is locked.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#">
                Shop Inventory
              </a>
              <a className="button button-secondary" href="#">
                Sell or Trade
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="placeholder-media">Hero / vehicle visual placeholder</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Trust</p>
            <h2>Built for confidence</h2>
            <p className="muted">
              These are placeholder trust blocks for reviews, inspection, delivery, and dealer credibility.
            </p>
          </div>

          <div className="card-grid three-up">
            <article className="card">
              <h3>Google Reviews</h3>
              <p className="muted">Review badge area and reputation proof.</p>
            </article>
            <article className="card">
              <h3>Inspected Vehicles</h3>
              <p className="muted">Inspection summary and condition-report entry point.</p>
            </article>
            <article className="card">
              <h3>Ontario Dealer Trust</h3>
              <p className="muted">OMVIC and dealership trust messaging placeholder.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Inventory Preview</p>
            <h2>Featured vehicles</h2>
            <p className="muted">Static card placeholders for the first homepage shell.</p>
          </div>

          <div className="card-grid three-up">
            <article className="card vehicle-card">
              <div className="placeholder-media small">Vehicle Image</div>
              <h3>2021 BMW X3</h3>
              <p className="muted">58,000 km · AWD · Auto</p>
              <strong>$34,995</strong>
            </article>
            <article className="card vehicle-card">
              <div className="placeholder-media small">Vehicle Image</div>
              <h3>2020 Audi Q5</h3>
              <p className="muted">63,000 km · Quattro · Auto</p>
              <strong>$31,995</strong>
            </article>
            <article className="card vehicle-card">
              <div className="placeholder-media small">Vehicle Image</div>
              <h3>2022 Tesla Model 3</h3>
              <p className="muted">29,000 km · EV · Auto</p>
              <strong>$39,995</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-grid">
          <article className="card">
            <p className="eyebrow">Sell or Trade</p>
            <h2>Get a real offer fast</h2>
            <p className="muted">
              Placeholder section for trade-in flow, plate/VIN entry, and instant appraisal steps.
            </p>
            <a className="button button-primary" href="#">
              Start Trade-In
            </a>
          </article>

          <article className="card">
            <p className="eyebrow">Finance</p>
            <h2>Flexible payment options</h2>
            <p className="muted">
              Placeholder section for finance calculator, approval steps, and payment confidence messaging.
            </p>
            <a className="button button-secondary" href="#">
              Explore Financing
            </a>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Planet Motors</strong>
            <p className="muted">Starter homepage shell for the Next.js rebuild.</p>
          </div>
          <div className="footer-links">
            <a href="#">Inventory</a>
            <a href="#">Sell or Trade</a>
            <a href="#">Finance</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
