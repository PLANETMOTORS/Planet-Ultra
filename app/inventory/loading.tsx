export default function InventoryLoading() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Inventory</p>
            <h1>Loading used inventory...</h1>
          </div>
          <div className="card-grid three-up">
            <article className="card">
              <div className="placeholder-media small">Loading...</div>
            </article>
            <article className="card">
              <div className="placeholder-media small">Loading...</div>
            </article>
            <article className="card">
              <div className="placeholder-media small">Loading...</div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
