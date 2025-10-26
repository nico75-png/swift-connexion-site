const Commandes = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-[#0B2D55]">Commandes</h1>
        <p className="mt-2 text-sm text-slate-600">
          Gérez vos commandes en cours, consultez leur statut et préparez vos expéditions. Cette zone est prête à
          accueillir des tableaux, des filtres ou toute intégration future avec vos systèmes métiers.
        </p>
      </header>

      <div className="rounded-xl border border-[#E0E9F5] bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Aucun module de commandes n'est connecté pour le moment. Ajoutez ici votre composant personnalisé pour afficher
          les données clients.
        </p>
      </div>
    </section>
  );
};

export default Commandes;
