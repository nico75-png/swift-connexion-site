const navigationTitles = [
  "Tableau de bord",
  "Commandes",
  "Chauffeurs",
  "Clients",
  "Statistiques",
  "Factures",
  "Messagerie",
  "Paramètres",
];

const Chauffeurs = () => (
  <section className="relative isolate flex min-h-[32rem] items-center justify-center overflow-hidden rounded-[2.5rem] border border-border bg-muted/30 p-6 sm:p-10">
    <aside className="w-full max-w-sm rounded-3xl border border-border bg-background/80 p-8 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
      <nav aria-label="Navigation administrateur" className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Swift Connexion</p>
          <h1 className="text-2xl font-bold text-foreground">Tableau pro</h1>
        </header>

        <ul className="space-y-2" role="list">
          {navigationTitles.map((item) => (
            <li key={item}>
              <button
                type="button"
                className="w-full rounded-2xl border border-transparent bg-muted px-5 py-3 text-left text-base font-semibold text-foreground transition-colors duration-200 hover:border-border hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  </section>
);

export default Chauffeurs;
