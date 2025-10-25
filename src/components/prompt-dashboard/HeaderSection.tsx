import { AlertCircle } from "lucide-react";

const HeaderSection = ({ userName }: { userName: string }) => {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-500">Bienvenue {userName}</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tableau de bord professionnel</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Surveillez vos opérations, suivez vos commandes et gardez un œil sur vos indicateurs clés en un clin d'œil.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900">
        <AlertCircle className="mt-0.5 h-5 w-5" />
        <div>
          <p className="text-sm font-semibold">Complétez votre profil</p>
          <p className="text-xs text-amber-800/80">
            Ajoutez les informations manquantes pour sécuriser vos livraisons et accélérer vos futures commandes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeaderSection;
