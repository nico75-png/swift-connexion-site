import { Phone, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DriverInfoCard = ({ driver, onCallDriver }) => {
  const {
    name = "Chauffeur non assigné",
    phone,
    vehicle,
    vehicleType,
  } = driver ?? {};

  return (
    <Card className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Truck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Chauffeur
          </CardTitle>
          <p className="text-sm text-slate-500">Coordonnées de contact</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Nom
          </span>
          <p className="text-base font-semibold text-slate-900">{name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {vehicle ? (
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
              {vehicle}
            </span>
          ) : null}
          {vehicleType ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {vehicleType}
            </span>
          ) : null}
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Contact
          </span>
          <p className="text-base text-slate-900">{phone ?? "Non communiqué"}</p>
        </div>
        <Button
          variant="secondary"
          size="lg"
          disabled={!phone}
          onClick={onCallDriver}
          className="h-12 w-full rounded-xl font-semibold"
        >
          <Phone className="mr-2 h-5 w-5" /> Appeler le chauffeur
        </Button>
      </CardContent>
    </Card>
  );
};

export default DriverInfoCard;
