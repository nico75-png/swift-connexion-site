const Commandes = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mes commandes</h1>
        <p className="text-muted-foreground mt-2">Gérez et suivez vos commandes</p>
      </div>
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
        Nouvelle commande
      </button>
    </div>

    <div className="rounded-lg border bg-card p-6">
      <p className="text-muted-foreground">Liste des commandes à venir...</p>
    </div>
  </div>
);

export default Commandes;
