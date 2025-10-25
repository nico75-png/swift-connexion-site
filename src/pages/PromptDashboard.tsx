import MainLayout from "@/components/prompt-dashboard/MainLayout";
import HeaderSection from "@/components/prompt-dashboard/HeaderSection";
import StatsCards from "@/components/prompt-dashboard/StatsCards";
import ActivityChart from "@/components/prompt-dashboard/ActivityChart";

const PromptDashboard = () => {
  const user = {
    email: "marie.dupont@swift-connexion.fr",
    name: "Marie Dupont",
  };

  return (
    <MainLayout userEmail={user.email}>
      <div className="space-y-12">
        <HeaderSection userName={user.name} />
        <StatsCards />

        <section id="orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Mes commandes</h2>
            <button
              type="button"
              className="rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-100"
            >
              Créer une commande
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {["Express", "Classique"].map((type) => (
              <div
                key={type}
                className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Commande {type}</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Livrée
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">Dernière mise à jour il y a 2 heures.</p>
              </div>
            ))}
          </div>
        </section>

        <section id="tracking" className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Suivi en temps réel</h2>
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-slate-900 p-6 text-white shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Mission en cours</p>
            <p className="text-2xl font-semibold">Order #SC-2025-118</p>
            <p className="text-sm text-white/80">Le chauffeur est en route vers le point de collecte. ETA 14:25.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Collecte", value: "13:40" },
                { label: "Livraison", value: "14:25" },
                { label: "Statut", value: "En cours" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/60">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="invoices" className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Mes factures</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {["F-2025-031", "F-2025-030"].map((invoice) => (
              <div key={invoice} className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{invoice}</p>
                <p className="mt-1 text-xs text-slate-500">Émise le 12 février 2025</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">1 220 €</p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Télécharger
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="messages" className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Support Swift</p>
              <span className="text-xs font-medium text-slate-500">il y a 10 min</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Bonjour Marie, nous avons bien reçu votre demande concernant les nouveaux créneaux de collecte. Nous revenons vers vous
              d'ici la fin de journée.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Répondre
            </button>
          </div>
        </section>

        <section id="dashboard" className="space-y-6">
          <ActivityChart />
        </section>
      </div>
    </MainLayout>
  );
};

export default PromptDashboard;
