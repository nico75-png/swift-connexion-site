const Factures = () => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-[#0B2D55]">Factures</h1>
        <p className="mt-2 text-sm text-slate-600">
          Consultez l'historique de facturation, téléchargez vos reçus et suivez l'état des paiements. Préparez cette
          section pour y intégrer des tableaux ou des exports.
        </p>
      </header>

      <div className="rounded-xl border border-[#E0E9F5] bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Aucune facture n'est affichée pour le moment. Connectez votre API de facturation pour alimenter cette vue.
        </p>
      </div>
    </section>
  );
};

export default Factures;
