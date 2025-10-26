import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Lock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

type QuickOrderCustomerInfo = {
  companyName: string;
  email: string;
  phone: string;
  siret: string;
  sector: string;
};

type QuickOrderFormValues = {
  packageType: "palette" | "boite" | "documents" | "autre";
  deliveryFormula: "standard" | "express" | "flash";
  shippingDate: string;
  pickupTime: string;
  deliveryTime: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: string;
  length: string;
  width: string;
  height: string;
};

type QuickOrderModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: QuickOrderFormValues) => void;
  customerInfo: QuickOrderCustomerInfo;
};

const PACKAGE_OPTIONS: { value: QuickOrderFormValues["packageType"]; label: string }[] = [
  { value: "palette", label: "Palette" },
  { value: "boite", label: "Boîte" },
  { value: "documents", label: "Documents" },
  { value: "autre", label: "Autre" },
];

const FORMULA_OPTIONS: { value: QuickOrderFormValues["deliveryFormula"]; label: string; description: string }[] = [
  { value: "standard", label: "Standard", description: "Jusqu'à 48 h" },
  { value: "express", label: "Express", description: "Livraison en 24 h" },
  { value: "flash", label: "Flash Express", description: "Enlèvement immédiat" },
];

const INITIAL_FORM_VALUES: QuickOrderFormValues = {
  packageType: "palette",
  deliveryFormula: "standard",
  shippingDate: "",
  pickupTime: "",
  deliveryTime: "",
  pickupAddress: "",
  deliveryAddress: "",
  weight: "",
  length: "",
  width: "",
  height: "",
};

const QuickOrderModal = ({ open, onClose, onSubmit, customerInfo }: QuickOrderModalProps) => {
  const [formValues, setFormValues] = useState<QuickOrderFormValues>(INITIAL_FORM_VALUES);

  useEffect(() => {
    if (open) {
      setFormValues(INITIAL_FORM_VALUES);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleFieldChange = (field: keyof QuickOrderFormValues) => (value: string) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  const pickupLabel = formValues.pickupAddress || "Adresse d'enlèvement à définir";
  const deliveryLabel = formValues.deliveryAddress || "Adresse de livraison à définir";

  const summaryLabel = useMemo(() => {
    const formulaLabel = FORMULA_OPTIONS.find((option) => option.value === formValues.deliveryFormula)?.label ?? "Formule";
    const weightLabel = formValues.weight ? `${formValues.weight} kg` : "Poids à préciser";

    return `Poids total : ${weightLabel} | Formule : ${formulaLabel}`;
  }, [formValues.deliveryFormula, formValues.weight]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-gray-800/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-order-title"
            aria-describedby="quick-order-description"
            className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <header className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="quick-order-title" className="text-2xl font-semibold text-slate-900">
                      Créer une commande
                    </h2>
                    <p id="quick-order-description" className="text-sm text-slate-500">
                      Renseignez les informations de transport ci-dessous.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                    aria-label="Fermer la modale"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <section className="rounded-2xl border border-slate-100 bg-blue-50/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">Informations client</h3>
                    <p className="text-xs text-slate-500">Pré-remplies depuis votre compte Swift Connexion.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {([
                    { label: "Nom de la société", value: customerInfo.companyName },
                    { label: "Courriel", value: customerInfo.email },
                    { label: "Téléphone", value: customerInfo.phone },
                    { label: "SIRET", value: customerInfo.siret },
                    { label: "Secteur", value: customerInfo.sector },
                  ] as const).map((item) => (
                    <div key={item.label} className="space-y-1">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {item.label}
                      </Label>
                      <div className="relative">
                        <Input
                          value={item.value}
                          readOnly
                          aria-readonly="true"
                          className="h-11 rounded-xl border-transparent bg-white/80 pr-10 text-sm font-medium text-slate-700 shadow-inner focus-visible:ring-0"
                        />
                        <Lock
                          aria-hidden
                          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Informations générales</h3>
                  <p className="text-xs text-slate-500">Choisissez le type d'expédition et vos créneaux prévisionnels.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="package-type" className="text-sm font-medium text-slate-600">
                      Type de colis
                    </Label>
                    <Select
                      value={formValues.packageType}
                      onValueChange={(value) => handleFieldChange("packageType")(value as QuickOrderFormValues["packageType"])}
                    >
                      <SelectTrigger
                        id="package-type"
                        className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus:ring-blue-100 focus-visible:ring-blue-100 focus-visible:ring-offset-0"
                      >
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Formule de livraison</Label>
                    <RadioGroup
                      value={formValues.deliveryFormula}
                      onValueChange={(value) =>
                        handleFieldChange("deliveryFormula")(value as QuickOrderFormValues["deliveryFormula"])
                      }
                      className="grid gap-3 sm:grid-cols-3"
                    >
                      {FORMULA_OPTIONS.map((option) => {
                        const isActive = formValues.deliveryFormula === option.value;
                        return (
                          <div
                            key={option.value}
                            className={cn(
                              "flex flex-col gap-2 rounded-xl border p-4 text-sm shadow-sm transition",
                              isActive
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Label
                                  htmlFor={`formula-${option.value}`}
                                  className="text-sm font-semibold text-current"
                                >
                                  {option.label}
                                </Label>
                                <p className="text-xs text-slate-500">{option.description}</p>
                              </div>
                              <RadioGroupItem
                                id={`formula-${option.value}`}
                                value={option.value}
                                className="mt-1 h-4 w-4 border-blue-500 text-blue-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="shipping-date" className="text-sm font-medium text-slate-600">
                      Date d'expédition prévue
                    </Label>
                    <Input
                      id="shipping-date"
                      type="date"
                      value={formValues.shippingDate}
                      onChange={(event) => handleFieldChange("shippingDate")(event.target.value)}
                      className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="pickup-time" className="text-sm font-medium text-slate-600">
                        Heure d'enlèvement prévue
                      </Label>
                      <Input
                        id="pickup-time"
                        type="time"
                        value={formValues.pickupTime}
                        onChange={(event) => handleFieldChange("pickupTime")(event.target.value)}
                        className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="delivery-time" className="text-sm font-medium text-slate-600">
                        Heure de livraison prévue
                      </Label>
                      <Input
                        id="delivery-time"
                        type="time"
                        value={formValues.deliveryTime}
                        onChange={(event) => handleFieldChange("deliveryTime")(event.target.value)}
                        className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Lieux d'enlèvement et de livraison</h3>
                  <p className="text-xs text-slate-500">
                    Indiquez les adresses complètes afin que nos équipes puissent préparer l'expédition.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pickup-address" className="text-sm font-medium text-slate-600">
                      Adresse complète du lieu d'enlèvement
                    </Label>
                    <Textarea
                      id="pickup-address"
                      value={formValues.pickupAddress}
                      onChange={(event) => handleFieldChange("pickupAddress")(event.target.value)}
                      placeholder="Ex. 24 rue des Frères-Lumière, 75015 Paris"
                      className="min-h-[88px] rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                    <p className="text-xs text-slate-400">Saisie assistée Google Maps activée.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery-address" className="text-sm font-medium text-slate-600">
                      Adresse complète du lieu de livraison
                    </Label>
                    <Textarea
                      id="delivery-address"
                      value={formValues.deliveryAddress}
                      onChange={(event) => handleFieldChange("deliveryAddress")(event.target.value)}
                      placeholder="Ex. Parc logistique Lyon Sud, bâtiment C, 69960 Corbas"
                      className="min-h-[88px] rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                    <p className="text-xs text-slate-400">Suggestions automatiques selon vos adresses sauvegardées.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Dimensions et poids</h3>
                  <TooltipProvider delayDuration={80}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                          aria-label="Informations sur le calcul du volume"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs text-slate-600">
                        Ces données servent à calculer le volume et le tarif.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-sm font-medium text-slate-600">
                      Poids (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={formValues.weight}
                      onChange={(event) => handleFieldChange("weight")(event.target.value)}
                      className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="length" className="text-sm font-medium text-slate-600">
                      Longueur (cm)
                    </Label>
                    <Input
                      id="length"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={formValues.length}
                      onChange={(event) => handleFieldChange("length")(event.target.value)}
                      className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="width" className="text-sm font-medium text-slate-600">
                      Largeur (cm)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={formValues.width}
                      onChange={(event) => handleFieldChange("width")(event.target.value)}
                      className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="height" className="text-sm font-medium text-slate-600">
                      Hauteur (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={formValues.height}
                      onChange={(event) => handleFieldChange("height")(event.target.value)}
                      className="h-11 rounded-xl border-gray-300 text-sm text-slate-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Résumé rapide</p>
                <p>
                  Lieu d'enlèvement : <span className="font-medium text-slate-900">{pickupLabel}</span> → Lieu de livraison :
                  <span className="font-medium text-slate-900"> {deliveryLabel}</span>
                </p>
                <p>{summaryLabel}</p>
              </section>

              <div className="pt-2 text-center">
                <Button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-[0_18px_40px_rgba(37,99,235,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:ring-blue-500"
                >
                  Créer la commande
                </Button>
                <p className="mt-3 text-xs text-slate-500">
                  Votre commande sera visible dans la section Commandes dès sa création.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export type { QuickOrderCustomerInfo, QuickOrderFormValues };
export { QuickOrderModal };
