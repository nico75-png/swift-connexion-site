import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DeliveryInfoCard = ({ delivery }) => {
  const {
    address = "Adresse inconnue",
    city,
    postalCode,
    expectedDelivery,
    status,
    instructions,
  } = delivery ?? {};

  const formattedDate = expectedDelivery ?? "-";

  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <MapPin className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Livraison
          </CardTitle>
          <p className="text-sm text-slate-500">Adresse de destination</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <div>
          <p className="font-medium text-slate-900">{address}</p>
          <p className="text-sm text-slate-500">
            {[postalCode, city].filter(Boolean).join(" ")}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Livraison prévue
          </span>
          <span className="text-base font-semibold text-slate-900">{formattedDate}</span>
        </div>
        {status ? (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Statut
            </span>
            <span
              className={cn(
                "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold",
                status.toLowerCase().includes("livr")
                  ? "bg-emerald-100 text-emerald-700"
                  : status.toLowerCase().includes("cours") || status.toLowerCase().includes("transit")
                  ? "bg-sky-100 text-sky-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              {status}
            </span>
          </div>
        ) : null}
        {instructions ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Instructions</p>
            <p>{instructions}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DeliveryInfoCard;
