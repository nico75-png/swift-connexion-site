import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldQuestion, Smartphone, Zap } from "lucide-react";

const Parametres = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    incidents: true,
    billing: true,
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2563EB]">Espace administrateur</p>
          <h1 className="mt-2 font-['Inter'] text-3xl font-semibold text-slate-900">Paramètres & sécurité</h1>
          <p className="mt-2 text-sm text-slate-500">
            Gérez vos informations personnelles, vos notifications et les accès de l'équipe.
          </p>
        </div>
        <Badge className="rounded-2xl bg-[#10B981]/10 px-3 py-1 text-[#047857]">Dernière sauvegarde il y a 12 min</Badge>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage alt="Administrateur" />
              <AvatarFallback className="bg-[#2563EB]/10 text-lg font-semibold text-[#2563EB]">CD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Profil administrateur</CardTitle>
              <CardDescription>Mettez à jour vos informations visibles pour les équipes</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" defaultValue="Clara" className="mt-2 rounded-2xl border-slate-200 bg-slate-50" />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" defaultValue="Dupont" className="mt-2 rounded-2xl border-slate-200 bg-slate-50" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="clara.dupont@oneconnexion.fr" className="mt-2 rounded-2xl border-slate-200 bg-slate-50" />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" defaultValue="+33 6 52 45 21 10" className="mt-2 rounded-2xl border-slate-200 bg-slate-50" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]">
                Enregistrer les modifications
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-[#2563EB]/40 hover:text-[#2563EB]"
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Notifications & alertes</CardTitle>
            <CardDescription>Choisissez les canaux et les alertes prioritaires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "email", label: "Notifications email", description: "Résumés quotidiens et rapports de performance" },
              { id: "sms", label: "Alertes SMS", description: "Retards critiques et incidents chauffeurs" },
              { id: "incidents", label: "Alertes incidents", description: "Notifications temps réel sur les anomalies" },
              { id: "billing", label: "Suivi facturation", description: "Statut des factures et relances automatiques" },
            ].map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <Switch
                  checked={notifications[item.id as keyof typeof notifications]}
                  onCheckedChange={(value) =>
                    setNotifications((previous) => ({ ...previous, [item.id]: value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Sécurité & accès</CardTitle>
            <CardDescription>Renforcez la protection de votre espace administrateur</CardDescription>
          </div>
          <Button className="rounded-2xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8]">
            Activer la double authentification
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-3 text-[#2563EB]">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-semibold text-slate-900">Accès validés</span>
            </div>
            <p className="mt-2 text-xs">Tous les membres de l'équipe ont confirmé leur connexion sécurisée cette semaine.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-3 text-[#F97316]">
              <ShieldQuestion className="h-5 w-5" />
              <span className="font-semibold text-slate-900">Tentatives suspectes</span>
            </div>
            <p className="mt-2 text-xs">2 tentatives bloquées sur l'espace facturation le 3 décembre.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-3 text-[#10B981]">
              <Zap className="h-5 w-5" />
              <span className="font-semibold text-slate-900">Logs en temps réel</span>
            </div>
            <p className="mt-2 text-xs">Synchronisation continue avec le centre de sécurité Swift Connexion.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none bg-white/95 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Sessions mobiles</CardTitle>
          <CardDescription>Surveillez les connexions actives sur les terminaux</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            { device: "iPhone 15 Pro", location: "Paris, FR", status: "Actif" },
            { device: "iPad Pro", location: "Lyon, FR", status: "Actif" },
            { device: "Android Pixel", location: "Marseille, FR", status: "Déconnecté" },
          ].map((session) => (
            <div key={session.device} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-3 text-[#2563EB]">
                <Smartphone className="h-5 w-5" />
                <span className="font-semibold text-slate-900">{session.device}</span>
              </div>
              <p className="mt-2 text-xs">Localisation : {session.location}</p>
              <p className="mt-2 text-xs font-semibold text-slate-900">Statut : {session.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Parametres;
