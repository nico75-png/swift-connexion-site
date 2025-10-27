import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import type { QuickOrderFormValues } from "./QuickOrderDialog";

export type CreateOrderDrawerProps = {
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

const numberFieldDefault = (value: QuickOrderFormValues["weightKg"]) =>
  value === "" ? "" : String(value);

const dimensionDefault = (value: QuickOrderFormValues["lengthCm"]) =>
  value === "" ? "" : String(value);

export function CreateOrderDrawer({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  className,
}: CreateOrderDrawerProps) {
  const mergedDefaults = React.useMemo(
    () => ({
      ...defaultFormValues,
      ...defaultValues,
    }),
    [defaultValues],
  );

  const [packageType, setPackageType] = React.useState<QuickOrderFormValues["packageType"]>(
    mergedDefaults.packageType,
  );
  const [serviceLevel, setServiceLevel] = React.useState<QuickOrderFormValues["serviceLevel"]>(
    mergedDefaults.serviceLevel,
  );

  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setPackageType(mergedDefaults.packageType);
    setServiceLevel(mergedDefaults.serviceLevel);
  }, [mergedDefaults.packageType, mergedDefaults.serviceLevel, open]);

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
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={cn(
          "z-[1300] flex h-full w-full flex-col border-l border-slate-200/60 bg-white/95 p-0 text-slate-900 shadow-xl sm:max-w-xl",
          "dark:border-slate-800/80 dark:bg-slate-950/95",
          className,
        )}
      >
        <SheetHeader className="border-b border-slate-200/60 px-6 py-6 text-left dark:border-slate-800/70">
          <SheetTitle className="text-xl font-semibold tracking-tight">Créer une commande</SheetTitle>
          <SheetDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Saisissez les informations essentielles pour planifier votre prochaine course sans quitter votre tableau de bord.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-13rem)] px-6 py-6">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
          >
            <div className="grid gap-5">
              <div className="grid gap-3">
                <Label htmlFor="packageType">Type de colis</Label>
                <Select value={packageType} onValueChange={(value) => setPackageType(value as QuickOrderFormValues["packageType"]) }>
                  <SelectTrigger id="packageType" className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 bg-white shadow-xl">
                    {PACKAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-sm">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="pickupAddress">Adresse de départ</Label>
                <Input
                  id="pickupAddress"
                  name="pickupAddress"
                  placeholder="Ex. 12 rue des Artisans, 75010 Paris"
                  defaultValue={mergedDefaults.pickupAddress}
                  className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="deliveryAddress">Adresse de livraison</Label>
                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  placeholder="Ex. 28 avenue des Champs-Élysées, 75008 Paris"
                  defaultValue={mergedDefaults.deliveryAddress}
                  className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="grid gap-3 sm:col-span-1">
                  <Label htmlFor="weightKg">Poids (kg)</Label>
                  <Input
                    id="weightKg"
                    name="weightKg"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={50}
                    step="0.1"
                    placeholder="0"
                    defaultValue={numberFieldDefault(mergedDefaults.weightKg)}
                    className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                    aria-describedby="weight-helper"
                  />
                  <span id="weight-helper" className="text-xs text-slate-500">
                    Limité à 50 kg
                  </span>
                </div>
                <div className="grid gap-3 sm:col-span-1">
                  <Label htmlFor="lengthCm">Longueur (cm)</Label>
                  <Input
                    id="lengthCm"
                    name="lengthCm"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="1"
                    placeholder="0"
                    defaultValue={dimensionDefault(mergedDefaults.lengthCm)}
                    className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>
                <div className="grid gap-3 sm:col-span-1">
                  <Label htmlFor="widthCm">Largeur (cm)</Label>
                  <Input
                    id="widthCm"
                    name="widthCm"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="1"
                    placeholder="0"
                    defaultValue={dimensionDefault(mergedDefaults.widthCm)}
                    className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>
                <div className="grid gap-3 sm:col-span-1">
                  <Label htmlFor="heightCm">Hauteur (cm)</Label>
                  <Input
                    id="heightCm"
                    name="heightCm"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="1"
                    placeholder="0"
                    defaultValue={dimensionDefault(mergedDefaults.heightCm)}
                    className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="pickupTime">Heure d’enlèvement prévue</Label>
                  <Input
                    id="pickupTime"
                    name="pickupTime"
                    type="time"
                    defaultValue={mergedDefaults.pickupTime}
                    className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="deliveryTime">Heure de livraison prévue</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    type="time"
                    defaultValue={mergedDefaults.deliveryTime}
                    className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={mergedDefaults.date}
                  className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="serviceLevel">Formule souhaitée</Label>
                <Select value={serviceLevel} onValueChange={(value) => setServiceLevel(value as QuickOrderFormValues["serviceLevel"]) }>
                  <SelectTrigger id="serviceLevel" className="h-11 rounded-xl border-slate-300 bg-white text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                    <SelectValue placeholder="Sélectionnez une formule" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 bg-white shadow-xl">
                    {SERVICE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-sm">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SheetFooter className="flex flex-col-reverse gap-3 border-t border-slate-200/60 pt-5 dark:border-slate-800/70 sm:flex-row sm:justify-end">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-xl border border-transparent bg-white text-slate-600 shadow-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                >
                  Annuler
                </Button>
              </SheetClose>
              <Button
                type="submit"
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
              >
                Valider la course
              </Button>
            </SheetFooter>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default CreateOrderDrawer;

/**
 * Exemple d'intégration :
 * ```tsx
 * const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 *
 * <Button onClick={() => setIsDrawerOpen(true)}>Créer une commande</Button>
 * <CreateOrderDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
 * ```
 */
