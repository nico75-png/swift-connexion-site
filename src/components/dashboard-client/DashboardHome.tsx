import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, MapPin, FileText, MessageCircle } from "lucide-react";

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, Clara Dupont 👋
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Suivez vos commandes, les livraisons réussies et vos délais moyens en toute clarté.
        </p>
      </div>

      {/* Vos indicateurs du mois */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Vos indicateurs du mois</h2>
            <p className="text-sm text-slate-600">
              Visualisez l'avancement de vos commandes et livraisons pour le mois en cours.
            </p>
          </div>
          <span className="text-xs text-blue-600">Mise à jour à16:24</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Vos commandes du mois */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Vos commandes du mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">117</span>
                  <span className="text-sm text-slate-500">/ 122 objectif</span>
                </div>
                <p className="text-sm text-green-600">+12 % vs. mois dernier</p>
              </div>
            </CardContent>
          </Card>

          {/* Commandes livrées avec succès */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Commandes livrées avec succès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={87} className="h-2" />
                <p className="text-sm text-slate-600">
                  87 % atteints · cible 95 %
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Temps moyen de livraison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Temps moyen de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">30,1</span>
                  <span className="text-sm text-slate-500">min</span>
                </div>
                <p className="text-sm text-blue-600">3,3 min vs. mois dernier</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activité mensuelle & Livrées vs En attente */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activité mensuelle */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Activité mensuelle
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Visualisez les commandes et livraisons selon la période.
                </p>
              </div>
              <Tabs defaultValue="mois" className="w-auto">
                <TabsList>
                  <TabsTrigger value="semaine">Semaine</TabsTrigger>
                  <TabsTrigger value="mois">Mois</TabsTrigger>
                  <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-lg bg-slate-50 flex items-center justify-center">
              <p className="text-sm text-slate-500">Graphique d'activité (S2, S3, S4)</p>
            </div>
          </CardContent>
        </Card>

        {/* Livrées vs En attente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Livrées vs En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative h-48 w-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset="25.12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset="215.52"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-slate-600">Livrées</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">342</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-slate-600">En attente</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">55</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides & Activités récentes */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Actions rapides
            </CardTitle>
            <p className="text-sm text-slate-600">
              Accédez immédiatement aux fonctionnalités clés pour suivre, facturer et échanger avec vos clients.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                <MapPin className="h-5 w-5" />
                <span className="text-xs">Suivi</span>
              </Button>
              <Button className="h-24 flex-col gap-2 bg-green-600 hover:bg-green-700">
                <FileText className="h-5 w-5" />
                <span className="text-xs">Factures</span>
              </Button>
              <Button className="h-24 flex-col gap-2 bg-purple-600 hover:bg-purple-700">
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">Messagerie</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Activités récentes
              </CardTitle>
              <Button variant="link" className="text-xs text-blue-600">
                Mis à jour en direct
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              Un aperçu instantané des dernières interactions.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-medium text-slate-900">Commande #SC-2048</p>
                <p className="text-xs text-slate-600">
                  Livrée à temps avec signature électronique confirmée.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-medium text-slate-900">Nouvelle facture disponible</p>
                <p className="text-xs text-slate-600">
                  Facture de mars générée et envoyée par email.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-medium text-slate-900">Message de Laura Martin</p>
                <p className="text-xs text-slate-600">
                  Question concernant la prise en charge express.
                </p>
              </div>
            </div>
            <Button variant="link" className="mt-3 w-full text-xs text-blue-600">
              Voir plus
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
