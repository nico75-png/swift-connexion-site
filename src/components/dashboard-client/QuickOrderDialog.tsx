import * as React from "react";

import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type QuickOrderFormValues = {
  packageType: "document" | "standard" | "palette";
  pickupAddress: string;
  deliveryAddress: string;
  weightKg: number | "";
  lengthCm: number | "";
  widthCm: number | "";
  heightCm: number | "";
  pickupTime: string;
  deliveryTime: string;
  date: string;
  serviceLevel: "express" | "standard" | "economique";
};

export type QuickOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: QuickOrderFormValues) => void;
  defaultValues?: Partial<QuickOrderFormValues>;
  className?: string;
};

const PACKAGE_TYPES: { label: string; value: QuickOrderFormValues["packageType"] }[] = [
  { label: "Document", value: "document" },
  { label: "Colis standard", value: "standard" },
  { label: "Palette", value: "palette" },
];

const SERVICE_LEVELS: { label: string; value: QuickOrderFormValues["serviceLevel"] }[] = [
  { label: "Express", value: "express" },
  { label: "Standard", value: "standard" },
  { label: "Économique", value: "economique" },
];

const defaultFormValues: QuickOrderFormValues = {
  packageType: "document",
  pickupAddress: "",
  deliveryAddress: "",
  weightKg: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  pickupTime: "",
  deliveryTime: "",
  date: "",
  serviceLevel: "express",
};

/**
 * Composant modale inspiré de la fenêtre de paiement One connexion.
 *
 * Intégration :
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Button onClick={() => setIsOpen(true)}>Créer une commande</Button>
 * <QuickOrderDialog open={isOpen} onOpenChange={setIsOpen} onSubmit={handleSubmit} />
 * ```
 */
const clampNumber = (value: FormDataEntryValue | null, options?: { max?: number }) => {
  if (value === null) {
    return "";
  }

  const asString = String(value).trim();
  if (asString.length === 0) {
    return "";
  }

  const parsed = Number(asString.replace(",", "."));
  if (Number.isNaN(parsed)) {
    return "";
  }

  const positiveValue = Math.max(parsed, 0);

  if (typeof options?.max === "number") {
    return Math.min(positiveValue, options.max);
  }

  return positiveValue;
};

export function QuickOrderDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  className,
}: QuickOrderDialogProps) {
  const mergedDefaults = React.useMemo(() => ({
    ...defaultFormValues,
    ...defaultValues,
  }), [defaultValues]);

  const formKey = React.useMemo(() => JSON.stringify(mergedDefaults), [mergedDefaults]);

  const [packageType, setPackageType] = React.useState<QuickOrderFormValues["packageType"]>(
    mergedDefaults.packageType
  );
  const [serviceLevel, setServiceLevel] = React.useState<QuickOrderFormValues["serviceLevel"]>(
    mergedDefaults.serviceLevel
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setPackageType(mergedDefaults.packageType);
    setServiceLevel(mergedDefaults.serviceLevel);
  }, [mergedDefaults.packageType, mergedDefaults.serviceLevel, open]);

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const values: QuickOrderFormValues = {
      packageType,
      pickupAddress: String(formData.get("pickupAddress") ?? ""),
      deliveryAddress: String(formData.get("deliveryAddress") ?? ""),
      weightKg: clampNumber(formData.get("weightKg"), { max: 50 }),
      lengthCm: clampNumber(formData.get("lengthCm")),
      widthCm: clampNumber(formData.get("widthCm")),
      heightCm: clampNumber(formData.get("heightCm")),
      pickupTime: String(formData.get("pickupTime") ?? ""),
      deliveryTime: String(formData.get("deliveryTime") ?? ""),
      date: String(formData.get("date") ?? ""),
      serviceLevel,
    };

    onSubmit?.(values);
  };

  const handleClose = (nextState: boolean) => {
    if (!nextState && formRef.current) {
      formRef.current.reset();
    }
    onOpenChange(nextState);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-w-2xl overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_rgba(15,23,42,0.20)]",
          "dark:border-slate-700/60 dark:bg-slate-900",
          className,
        )}
      >
        <div className="overflow-hidden rounded-[18px] border border-transparent">
          <div className="border-b border-slate-200 bg-slate-50/90 px-8 py-6 dark:border-slate-700 dark:bg-slate-900/60">
            <DialogHeader className="items-start space-y-3 text-left">
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Créer une course express
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
                Renseignez les informations essentielles pour générer rapidement une nouvelle commande. Vos données client sont déjà enregistrées.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[70vh]">
            <form
              key={formKey}
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-8 px-8 py-8"
              noValidate
            >
              <fieldset className="grid gap-6 rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/60">
                <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Informations transport
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="packageType">Type de colis</Label>
                    <Select value={packageType} onValueChange={(value) => setPackageType(value as QuickOrderFormValues["packageType"])}>
                      <SelectTrigger
                        id="packageType"
                        className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-[#60A5FA]"
                      >
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        {PACKAGE_TYPES.map((item) => (
                          <SelectItem key={item.value} value={item.value} className="text-sm">
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceLevel">Formule souhaitée</Label>
                    <Select value={serviceLevel} onValueChange={(value) => setServiceLevel(value as QuickOrderFormValues["serviceLevel"])}>
                      <SelectTrigger
                        id="serviceLevel"
                        className="h-11 w-full rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-[#60A5FA]"
                      >
                        <SelectValue placeholder="Sélectionnez une formule" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        {SERVICE_LEVELS.map((item) => (
                          <SelectItem key={item.value} value={item.value} className="text-sm">
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickupAddress">Adresse de départ</Label>
                    <Input
                      id="pickupAddress"
                      name="pickupAddress"
                      type="text"
                      defaultValue={mergedDefaults.pickupAddress}
                      placeholder="Ex. 12 avenue des Champs-Élysées, Paris"
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Adresse de livraison</Label>
                    <Input
                      id="deliveryAddress"
                      name="deliveryAddress"
                      type="text"
                      defaultValue={mergedDefaults.deliveryAddress}
                      placeholder="Ex. 5 rue Sainte-Catherine, Bordeaux"
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="grid gap-6 rounded-2xl border border-slate-200/70 bg-white/60 p-6 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/60">
                <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Dimensions &amp; horaires
                </legend>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="weightKg">Poids (kg)</Label>
                    <Input
                      id="weightKg"
                      name="weightKg"
                      type="number"
                      min={0}
                      max={50}
                      step="0.1"
                      defaultValue={mergedDefaults.weightKg ?? ""}
                      placeholder="0.0"
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Limité à 50 kg.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lengthCm">Longueur (cm)</Label>
                    <Input
                      id="lengthCm"
                      name="lengthCm"
                      type="number"
                      min={0}
                      step="1"
                      defaultValue={mergedDefaults.lengthCm ?? ""}
                      placeholder="0"
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widthCm">Largeur (cm)</Label>
                    <Input
                      id="widthCm"
                      name="widthCm"
                      type="number"
                      min={0}
                      step="1"
                      defaultValue={mergedDefaults.widthCm ?? ""}
                      placeholder="0"
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heightCm">Hauteur (cm)</Label>
                    <Input
                      id="heightCm"
                      name="heightCm"
                      type="number"
                      min={0}
                      step="1"
                      defaultValue={mergedDefaults.heightCm ?? ""}
                      placeholder="0"
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime">Heure d’enlèvement prévue</Label>
                    <Input
                      id="pickupTime"
                      name="pickupTime"
                      type="time"
                      defaultValue={mergedDefaults.pickupTime}
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Heure de livraison prévue</Label>
                    <Input
                      id="deliveryTime"
                      name="deliveryTime"
                      type="time"
                      defaultValue={mergedDefaults.deliveryTime}
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={mergedDefaults.date}
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-[#60A5FA]"
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <DialogFooter className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="submit"
                  className="h-12 rounded-xl bg-[#2563EB] px-6 text-base font-semibold text-white shadow-lg shadow-[#2563EB]/30 transition-transform duration-200 hover:-translate-y-[1px] hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                >
                  Valider la course
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuickOrderDialog;
