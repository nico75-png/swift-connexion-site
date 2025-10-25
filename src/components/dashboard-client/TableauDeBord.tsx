const TableauDeBord = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
      <p className="text-muted-foreground mt-2">Vue d'ensemble de votre activité</p>
    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Commandes en cours</p>
        <p className="text-3xl font-bold text-foreground mt-2">12</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Commandes livrées</p>
        <p className="text-3xl font-bold text-foreground mt-2">48</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Messages non lus</p>
        <p className="text-3xl font-bold text-foreground mt-2">3</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Factures en attente</p>
        <p className="text-3xl font-bold text-foreground mt-2">2</p>
      </div>
    </div>
  </div>
);

export default TableauDeBord;
