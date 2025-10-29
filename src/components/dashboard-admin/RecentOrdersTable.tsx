import { Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  date: string;
  client: string;
  type: string;
  status: string;
  driver: string;
  amount: string;
}

const MOCK_ORDERS: Order[] = [
  { id: "CMD-2024-001", date: "29 Oct 2025", client: "Pharmacie Centrale", type: "Express", status: "En cours", driver: "Jean Dupont", amount: "45,00 €" },
  { id: "CMD-2024-002", date: "29 Oct 2025", client: "Cabinet Médical", type: "Standard", status: "Livré", driver: "Marie Martin", amount: "32,50 €" },
  { id: "CMD-2024-003", date: "28 Oct 2025", client: "Optique Vision", type: "Express", status: "En cours", driver: "Paul Bernard", amount: "58,00 €" },
  { id: "CMD-2024-004", date: "28 Oct 2025", client: "Avocat & Associés", type: "Urgent", status: "Livré", driver: "Sophie Dubois", amount: "75,00 €" },
  { id: "CMD-2024-005", date: "27 Oct 2025", client: "Notaire Legrand", type: "Standard", status: "Livré", driver: "Luc Thomas", amount: "40,00 €" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Livré":
      return <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Livré</Badge>;
    case "En cours":
      return <Badge variant="default" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">En cours</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const RecentOrdersTable = () => {
  return (
    <Card className="rounded-3xl border-none bg-background/80 shadow-sm ring-1 ring-black/5">
      <CardHeader>
        <CardTitle className="text-xl">Dernières commandes</CardTitle>
        <CardDescription>Les 10 commandes les plus récentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-muted-foreground/20">
                <TableHead className="font-semibold text-foreground">N° Commande</TableHead>
                <TableHead className="font-semibold text-foreground">Date</TableHead>
                <TableHead className="font-semibold text-foreground">Client</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Statut</TableHead>
                <TableHead className="font-semibold text-foreground">Chauffeur</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Montant</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  <TableCell>{order.client}</TableCell>
                  <TableCell className="text-muted-foreground">{order.type}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.driver}</TableCell>
                  <TableCell className="text-right font-semibold">{order.amount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersTable;
