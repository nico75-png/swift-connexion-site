import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import type {
  ClientOption,
  CreateOrderInput,
  CreateOrderResult,
  DriverOption,
} from "@/hooks/useOrders";
import { cn } from "@/lib/utils";

interface AdminOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientOption[];
  drivers: DriverOption[];
  isSubmitting: boolean;
  onSubmit: (input: CreateOrderInput) => Promise<CreateOrderResult>;
}

const PACKAGE_TYPES = [
  { label: "Course express", value: "express" },
  { label: "Colis standard", value: "standard" },
  { label: "Palette", value: "palette" },
  { label: "Document", value: "document" },
];

const RESET_VALUES = {
  clientId: "",
  driverId: "",
  packageType: "express",
  amount: "",
  eta: "",
  notes: "",
};

export const AdminOrderDialog = ({
  open,
  onOpenChange,
  clients,
  drivers,
  isSubmitting,
  onSubmit,
}: AdminOrderDialogProps) => {
  const [clientId, setClientId] = useState(RESET_VALUES.clientId);
  const [driverId, setDriverId] = useState(RESET_VALUES.driverId);
  const [packageType, setPackageType] = useState(RESET_VALUES.packageType);
  const [amount, setAmount] = useState(RESET_VALUES.amount);
  const [eta, setEta] = useState(RESET_VALUES.eta);
  const [notes, setNotes] = useState(RESET_VALUES.notes);

  useEffect(() => {
    if (!open) {
      setClientId(RESET_VALUES.clientId);
      setDriverId(RESET_VALUES.driverId);
      setPackageType(RESET_VALUES.packageType);
      setAmount(RESET_VALUES.amount);
      setEta(RESET_VALUES.eta);
      setNotes(RESET_VALUES.notes);
    }
  }, [open]);

  useEffect(() => {
    if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === clientId) ?? null,
    [clientId, clients],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clientId) {
      toast({ title: "Client requis", description: "Sélectionnez un client." });
      return;
    }

    if (!eta) {
      toast({ title: "ETA manquante", description: "Indiquez la date et l'heure de livraison estimée." });
      return;
    }

    const parsedAmount = Number(amount.replace(",", "."));
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast({ title: "Montant invalide", description: "Entrez un montant valide en euros." });
      return;
    }

    const result = await onSubmit({
      clientId,
      driverId: driverId || undefined,
      packageType,
      amount: parsedAmount,
      eta,
      notes: notes.trim() ? notes : undefined,
    });

    if (!result.success) {
      toast({
        title: "Création impossible",
        description: result.message ?? "Une erreur est survenue lors de l'enregistrement de la commande.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Commande créée",
      description: `La référence ${result.orderId ?? "commande"} a été ajoutée au suivi.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-[22px] border border-slate-200/70 bg-white/95 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
        <DialogHeader className="border-b border-slate-200/60 bg-slate-50/80 px-8 py-6 text-left">
          <DialogTitle className="text-2xl font-semibold text-slate-900">Créer une nouvelle commande</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-600">
            Affectez rapidement une course client depuis l'espace administrateur.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-8 px-8 py-6">
            <section className="grid gap-6 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-inner">
              <header>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Informations générales</p>
                <p className="mt-1 text-sm text-slate-600">Sélectionnez le client et la typologie de course.</p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-order-client">Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger id="admin-order-client" className="rounded-2xl border-slate-200 bg-white">
                      <SelectValue placeholder="Choisir un client" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {clients.length === 0 ? (
                        <SelectItem value="" disabled>
                          Aucun client disponible
                        </SelectItem>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <span className="flex flex-col">
                              <span className="font-medium">{client.company}</span>
                              {client.contactName && (
                                <span className="text-xs text-slate-500">{client.contactName}</span>
                              )}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-order-type">Type de commande</Label>
                  <Select value={packageType} onValueChange={setPackageType}>
                    <SelectTrigger id="admin-order-type" className="rounded-2xl border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {PACKAGE_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-order-amount">Montant (€)</Label>
                  <Input
                    id="admin-order-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="rounded-2xl border-slate-200"
                    placeholder="125.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-order-eta">ETA estimée</Label>
                  <Input
                    id="admin-order-eta"
                    type="datetime-local"
                    required
                    value={eta}
                    onChange={(event) => setEta(event.target.value)}
                    className="rounded-2xl border-slate-200"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-6 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-inner">
              <header>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Affectation chauffeur</p>
                <p className="mt-1 text-sm text-slate-600">Optionnel – sélectionnez un chauffeur disponible pour démarrer immédiatement.</p>
              </header>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-order-driver">Chauffeur</Label>
                  <Select value={driverId} onValueChange={setDriverId}>
                    <SelectTrigger id="admin-order-driver" className="rounded-2xl border-slate-200 bg-white">
                      <SelectValue placeholder="Aucun chauffeur attribué" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="">Aucun chauffeur</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{driver.name}</span>
                            <span className="text-xs text-slate-500">
                              {driver.vehicleType ? driver.vehicleType : "Véhicule non précisé"}
                              {driver.availability === false ? " · Indisponible" : ""}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-order-notes">Notes chauffeurs</Label>
                  <Textarea
                    id="admin-order-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Précisions de chargement, digicode, créneau…"
                    className="min-h-[120px] rounded-2xl border-slate-200"
                  />
                </div>
              </div>
              {selectedClient && (
                <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Informations client enregistrées</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Retrait</p>
                      <p className="mt-1 text-sm">
                        {selectedClient.defaultPickup ?? "Adresse à définir"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Livraison</p>
                      <p className="mt-1 text-sm">
                        {selectedClient.defaultDelivery ?? "Adresse à définir"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl border-slate-200 bg-white text-slate-600 hover:border-slate-300 sm:w-auto"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className={cn(
                  "w-full rounded-2xl bg-[#2563EB] px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8] sm:w-auto",
                  isSubmitting && "cursor-not-allowed opacity-80",
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création en cours…" : "Créer la commande"}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOrderDialog;

