import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductsTable = ({ lines = [], fees = 0 }) => {
  const totals = lines.reduce(
    (acc, line) => {
      const quantity = Number(line.quantity ?? 0);
      const unitPrice = Number(line.unitPrice ?? 0);
      const total = quantity * unitPrice;
      return {
        quantity: acc.quantity + quantity,
        subtotal: acc.subtotal + total,
      };
    },
    { quantity: 0, subtotal: 0 },
  );

  const normalizedFees = Number(fees ?? 0);
  const grandTotal = totals.subtotal + normalizedFees;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table className="min-w-full">
        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200">
            <TableHead className="text-slate-500">Article</TableHead>
            <TableHead className="text-right text-slate-500">Quantité</TableHead>
            <TableHead className="text-right text-slate-500">Prix unitaire</TableHead>
            <TableHead className="text-right text-slate-500">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length ? (
            lines.map((item, index) => {
              const quantity = Number(item.quantity ?? 0);
              const unitPrice = Number(item.unitPrice ?? 0);
              const lineTotal = quantity * unitPrice;
              return (
                <TableRow
                  key={`${item.sku ?? index}`}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <TableCell className="text-sm font-medium text-slate-900">
                    {item.name ?? "Article"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-600">{quantity}</TableCell>
                  <TableCell className="text-right text-sm text-slate-600">
                    {unitPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-slate-900">
                    {lineTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="py-6 text-center text-sm text-slate-500">
                Aucun produit associé à cette commande.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col items-end gap-2 border-t border-slate-200 bg-white p-6 text-sm">
        <div className="flex w-full max-w-md justify-between text-slate-500">
          <span>Sous-total</span>
          <span className="font-medium text-slate-900">
            {totals.subtotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>
        </div>
        <div className="flex w-full max-w-md justify-between text-slate-500">
          <span>Frais</span>
          <span className="font-medium text-slate-900">
            {normalizedFees.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>
        </div>
        <div className="flex w-full max-w-md justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
          <span>Total TTC</span>
          <span>
            {grandTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
