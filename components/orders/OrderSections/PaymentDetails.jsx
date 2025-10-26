import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentDetails = ({ payment }) => {
  const {
    method = "Mode de paiement",
    amount = 0,
    status = "À traiter",
    reference,
  } = payment ?? {};

  const formattedAmount = Number(amount ?? 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 pb-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <CreditCard className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Paiement
          </CardTitle>
          <p className="text-sm text-slate-500">Détails de facturation</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 text-sm text-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mode
            </span>
            <p className="text-base font-semibold text-slate-900">{method}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Montant total
            </span>
            <p className="text-xl font-bold text-slate-900">{formattedAmount}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Statut de paiement
            </span>
            <p className="text-base font-semibold text-slate-900">{status}</p>
          </div>
          {reference ? (
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Référence
              </span>
              <p className="text-base font-medium text-slate-900">{reference}</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentDetails;
