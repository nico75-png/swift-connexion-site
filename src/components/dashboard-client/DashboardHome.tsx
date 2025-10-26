const DashboardHome = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-[#0B2D55]">Bienvenue sur votre tableau de bord</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Retrouvez ici une vue d'ensemble de vos activités Swift Connexion. Les indicateurs et graphiques
          personnalisés pourront être ajoutés ultérieurement sans modifier cette structure.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Commandes actives", value: "12" },
          { title: "Livraisons du mois", value: "58" },
          { title: "Messages en attente", value: "3" },
          { title: "Factures en cours", value: "2" },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-[#E0E9F5] bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#0B2D55]/70">{item.title}</p>
            <p className="mt-3 text-2xl font-semibold text-[#0B2D55]">{item.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-[#E0E9F5] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#0B2D55]">Activité récente</h2>
        <p className="mt-2 text-sm text-slate-600">
          Cette section pourra accueillir un flux d'activités détaillé ou un graphique interactif dans une itération
          future.
        </p>
      </section>
    </section>
  );
};

export default DashboardHome;
