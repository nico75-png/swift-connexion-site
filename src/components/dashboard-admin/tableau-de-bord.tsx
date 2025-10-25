const TableauDeBord = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Tableau de bord admin</h1>
      <p className="text-muted-foreground mt-2">Vue d'ensemble de l'activité</p>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Commandes du jour</p>
        <p className="text-3xl font-bold text-foreground mt-2">28</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Clients actifs</p>
        <p className="text-3xl font-bold text-foreground mt-2">156</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Chauffeurs disponibles</p>
        <p className="text-3xl font-bold text-foreground mt-2">12</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
        <p className="text-3xl font-bold text-foreground mt-2">€8,450</p>
      </div>
    </div>
  </div>
);

export default TableauDeBord;
