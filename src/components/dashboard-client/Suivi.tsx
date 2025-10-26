const Suivi = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-[#0B2D55]">Suivi des livraisons</h1>
        <p className="mt-2 text-sm text-slate-600">
          Visualisez la progression des expéditions et les points de contrôle clés. Intégrez vos cartes, timelines ou
          indicateurs de performance dans cette zone centrale.
        </p>
      </header>

      <div className="rounded-xl border border-[#E0E9F5] bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Les informations de suivi apparaîtront ici dès qu'une source de données sera connectée.
        </p>
      </div>
    </section>
  );
};

export default Suivi;
