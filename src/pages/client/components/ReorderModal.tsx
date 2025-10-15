import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Loader2, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import {
  ClientOrder,
  OrderOptions,
  estimatePrice,
  formatCurrencyEUR,
  formatDateTime,
} from "@/lib/reorder";

interface ReorderModalProps {
  draft: ClientOrder | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: (order: ClientOrder) => Promise<void> | void;
}

const focusableSelector = [
  "button",
  "[href]",
  "input",
  "select",
  "textarea",
  "[tabindex]:not([tabindex='-1'])",
]
  .map((part) => `${part}:not([disabled])`)
  .join(",");

const toDatetimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset();
  const localISO = new Date(date.getTime() - tzOffset * 60_000).toISOString();
  return localISO.slice(0, 16);
};

const fromDatetimeLocal = (value: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
};

const normalizeNumberInput = (value: string) => {
  if (!value) return "";
  return value.replace(/,/g, ".");
};

type FormErrors = Partial<Record<"pickupAt" | "dropoffEta" | "weightKg" | "volumeM3", string>>;

type FormState = {
  pickupAt: string;
  dropoffEta: string;
  weightKg: string;
  volumeM3: string;
  notes: string;
  options: OrderOptions;
};

export const ReorderModal = ({ draft, open, onCancel, onConfirm }: ReorderModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formValues, setFormValues] = useState<FormState | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || !draft) {
      setFormValues(null);
      setIsEditing(false);
      setErrors({});
      return;
    }
    setFormValues({
      pickupAt: toDatetimeLocal(draft.pickupAt),
      dropoffEta: toDatetimeLocal(draft.dropoffEta),
      weightKg: String(draft.weightKg ?? ""),
      volumeM3: String(draft.volumeM3 ?? ""),
      notes: draft.notes ?? "",
      options: {
        express: draft.options?.express ?? false,
        fragile: draft.options?.fragile ?? false,
        insurance: draft.options?.insurance ?? false,
        returnDocuments: draft.options?.returnDocuments ?? false,
      },
    });
  }, [draft, open]);

  useEffect(() => {
    if (!open) return;
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const overlay = overlayRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      if (!node) return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleOverlayClick = (event: MouseEvent) => {
      if (event.target === overlay) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    overlay?.addEventListener("mousedown", handleOverlayClick);
    window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 20);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      overlay?.removeEventListener("mousedown", handleOverlayClick);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open, onCancel]);

  const validate = (values: FormState): FormErrors => {
    if (!values) return {};
    const now = new Date();
    const pickupDate = values.pickupAt ? new Date(values.pickupAt) : null;
    const dropoffDate = values.dropoffEta ? new Date(values.dropoffEta) : null;
    const weight = Number.parseFloat(values.weightKg);
    const volume = Number.parseFloat(values.volumeM3);
    const nextErrors: FormErrors = {};

    if (!pickupDate || Number.isNaN(pickupDate.getTime())) {
      nextErrors.pickupAt = "Indiquez une date et heure d'enlèvement";
    } else if (pickupDate.getTime() <= now.getTime()) {
      nextErrors.pickupAt = "L'enlèvement doit être programmé dans le futur";
    }

    if (values.dropoffEta) {
      if (!dropoffDate || Number.isNaN(dropoffDate.getTime())) {
        nextErrors.dropoffEta = "Indiquez une date de livraison valide";
      } else if (pickupDate && dropoffDate.getTime() <= pickupDate.getTime()) {
        nextErrors.dropoffEta = "La livraison doit être postérieure à l'enlèvement";
      }
    }

    if (Number.isNaN(weight) || weight <= 0) {
      nextErrors.weightKg = "Le poids doit être supérieur à 0";
    }

    if (Number.isNaN(volume) || volume <= 0) {
      nextErrors.volumeM3 = "Le volume doit être supérieur à 0";
    }

    return nextErrors;
  };

  useEffect(() => {
    if (!formValues) return;
    if (!isEditing) {
      setErrors({});
      return;
    }
    setErrors(validate(formValues));
  }, [formValues, isEditing]);

  const pricePreview = useMemo(() => {
    if (!draft || !formValues) return null;
    const base = draft.price?.breakdown?.base ?? 10;
    const km = draft.km ?? 10;
    return estimatePrice({
      base,
      km,
      express: formValues.options?.express,
      fragile: formValues.options?.fragile,
    });
  }, [draft, formValues]);

  const handleCheckbox = (field: keyof OrderOptions) => (checked: boolean | string) => {
    if (!formValues) return;
    const value = Boolean(checked);
    setFormValues((prev) =>
      prev
        ? {
            ...prev,
            options: {
              ...prev.options,
              [field]: value,
            },
          }
        : prev,
    );
  };

  const updateField = (field: keyof FormState) => (value: string) => {
    setFormValues((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev,
    );
  };

  const disableSubmit = useMemo(() => {
    if (!formValues) return true;
    if (!isEditing) return false;
    const validationErrors = validate(formValues);
    return Object.keys(validationErrors).length > 0;
  }, [formValues, isEditing]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || !formValues) {
      onCancel();
      return;
    }
    if (disableSubmit) {
      setErrors(validate(formValues));
      return;
    }
    setIsSubmitting(true);
    const express = Boolean(formValues.options?.express);
    const fragile = Boolean(formValues.options?.fragile);
    const updatedPrice = pricePreview ?? draft.price;
    const updatedDraft: ClientOrder = {
      ...draft,
      pickupAt: fromDatetimeLocal(formValues.pickupAt) || draft.pickupAt,
      dropoffEta: formValues.dropoffEta ? fromDatetimeLocal(formValues.dropoffEta) : draft.dropoffEta,
      weightKg: Number.parseFloat(normalizeNumberInput(formValues.weightKg)) || draft.weightKg,
      volumeM3: Number.parseFloat(normalizeNumberInput(formValues.volumeM3)) || draft.volumeM3,
      notes: formValues.notes?.trim() ?? draft.notes,
      options: {
        ...draft.options,
        express,
        fragile,
        insurance: Boolean(formValues.options?.insurance),
        returnDocuments: Boolean(formValues.options?.returnDocuments),
      },
      price: updatedPrice,
    };
    try {
      await onConfirm(updatedDraft);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open || !draft || !formValues) {
    return null;
  }

  const renderSummaryRow = (label: string, value: string | number | undefined) => (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );

  const optionsList = [
    { label: "Express", value: formValues.options?.express },
    { label: "Fragile", value: formValues.options?.fragile },
    { label: "Assurance", value: formValues.options?.insurance },
    { label: "Retour de documents", value: formValues.options?.returnDocuments },
  ].filter((item) => item.value);

  const price = pricePreview ?? draft.price;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div ref={overlayRef} className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-background shadow-xl focus:outline-none"
      >
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <header className="flex items-start justify-between gap-4 border-b border-border bg-muted/30 px-6 py-4">
            <div>
              <p id={descriptionId} className="text-xs uppercase tracking-wide text-muted-foreground">
                Recommandation rapide
              </p>
              <h2 id={titleId} className="text-xl font-semibold text-foreground">
                Recommander la commande {draft.previousOrderId ?? ""}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Vérifiez les informations puis validez pour créer la nouvelle course.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                ref={closeButtonRef}
                type="button"
                variant="ghost"
                onClick={onCancel}
                aria-label="Fermer la modale de recommandation"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" tabIndex={-1}>
            <section className="grid gap-4 rounded-xl border border-border bg-muted/10 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Résumé de la livraison</h3>
                <p className="text-xs text-muted-foreground">Départ</p>
                <p className="text-sm font-medium text-foreground">{draft.from.address}</p>
                {draft.from.contact?.name && (
                  <p className="text-xs text-muted-foreground">Contact : {draft.from.contact.name}</p>
                )}
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Arrivée</p>
                  <p className="text-sm font-medium text-foreground">{draft.to.address}</p>
                  {draft.to.contact?.name && (
                    <p className="text-xs text-muted-foreground">Destinataire : {draft.to.contact.name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {renderSummaryRow("Type", draft.type)}
                {renderSummaryRow("Enlèvement", formatDateTime(draft.pickupAt))}
                {renderSummaryRow("Livraison estimée", draft.dropoffEta ? formatDateTime(draft.dropoffEta) : "—")}
                {renderSummaryRow("Distance estimée", `${draft.km ?? 0} km`)}
                {renderSummaryRow("Poids", `${draft.weightKg} kg`)}
                {renderSummaryRow("Volume", `${draft.volumeM3} m³`)}
                {optionsList.length > 0 ? (
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground font-medium">Options</span>
                    <span className="flex flex-wrap justify-end gap-1">
                      {optionsList.map((option) => (
                        <Badge key={option.label} variant="secondary" className="bg-primary/10 text-primary">
                          {option.label}
                        </Badge>
                      ))}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Aucune option complémentaire</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Modifier les informations</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing((current) => !current)}
                  aria-pressed={isEditing}
                >
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  {isEditing ? "Masquer les champs" : "Modifier les infos"}
                </Button>
              </div>

              {isEditing ? (
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="reorder-pickup">Date et heure d'enlèvement *</Label>
                      <Input
                        id="reorder-pickup"
                        type="datetime-local"
                        value={formValues.pickupAt}
                        onChange={(event) => updateField("pickupAt")(event.target.value)}
                        aria-invalid={Boolean(errors.pickupAt)}
                        aria-describedby={errors.pickupAt ? "reorder-pickup-error" : undefined}
                        required
                      />
                      {errors.pickupAt && (
                        <p id="reorder-pickup-error" className="mt-1 text-sm text-destructive">
                          {errors.pickupAt}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="reorder-dropoff">Livraison estimée</Label>
                      <Input
                        id="reorder-dropoff"
                        type="datetime-local"
                        value={formValues.dropoffEta}
                        onChange={(event) => updateField("dropoffEta")(event.target.value)}
                        aria-invalid={Boolean(errors.dropoffEta)}
                        aria-describedby={errors.dropoffEta ? "reorder-dropoff-error" : undefined}
                      />
                      {errors.dropoffEta && (
                        <p id="reorder-dropoff-error" className="mt-1 text-sm text-destructive">
                          {errors.dropoffEta}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="reorder-weight">Poids total (kg) *</Label>
                      <Input
                        id="reorder-weight"
                        inputMode="decimal"
                        value={formValues.weightKg}
                        onChange={(event) => updateField("weightKg")(normalizeNumberInput(event.target.value))}
                        aria-invalid={Boolean(errors.weightKg)}
                        aria-describedby={errors.weightKg ? "reorder-weight-error" : undefined}
                        required
                      />
                      {errors.weightKg && (
                        <p id="reorder-weight-error" className="mt-1 text-sm text-destructive">
                          {errors.weightKg}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="reorder-volume">Volume total (m³) *</Label>
                      <Input
                        id="reorder-volume"
                        inputMode="decimal"
                        value={formValues.volumeM3}
                        onChange={(event) => updateField("volumeM3")(normalizeNumberInput(event.target.value))}
                        aria-invalid={Boolean(errors.volumeM3)}
                        aria-describedby={errors.volumeM3 ? "reorder-volume-error" : undefined}
                        required
                      />
                      {errors.volumeM3 && (
                        <p id="reorder-volume-error" className="mt-1 text-sm text-destructive">
                          {errors.volumeM3}
                        </p>
                      )}
                    </div>
                  </div>

                  <fieldset className="grid gap-3" aria-describedby="reorder-options-desc">
                    <legend className="text-sm font-semibold text-foreground">Options</legend>
                    <p id="reorder-options-desc" className="text-xs text-muted-foreground">
                      Sélectionnez les compléments nécessaires pour la recommandation.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {["express", "fragile", "insurance", "returnDocuments"].map((optionKey) => {
                        const key = optionKey as keyof OrderOptions;
                        const optionLabels: Record<keyof OrderOptions, string> = {
                          express: "Express",
                          fragile: "Fragile",
                          insurance: "Assurance",
                          returnDocuments: "Retour documents",
                        };
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm font-medium text-foreground"
                          >
                            <Checkbox
                              checked={Boolean(formValues.options?.[key])}
                              onCheckedChange={handleCheckbox(key)}
                              aria-label={`Activer l'option ${optionLabels[key]}`}
                            />
                            {optionLabels[key]}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <Label htmlFor="reorder-notes">Instructions complémentaires</Label>
                    <Textarea
                      id="reorder-notes"
                      value={formValues.notes}
                      onChange={(event) => updateField("notes")(event.target.value)}
                      placeholder="Précisions pour le chauffeur (facultatif)"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                  <span>Les informations sont reprises à l'identique. Cliquez sur "Modifier les infos" pour ajuster.</span>
                </div>
              )}
            </section>

            <section className="grid gap-3 rounded-xl border border-border bg-muted/10 p-4">
              <h3 className="text-sm font-semibold text-foreground">Estimation tarifaire</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base</span>
                  <span className="font-semibold">{formatCurrencyEUR(price.breakdown.base)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Distance ({draft.km} km)</span>
                  <span className="font-semibold">{formatCurrencyEUR(price.breakdown.km)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Option Express</span>
                  <span className="font-semibold">{price.breakdown.express}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Option Fragile</span>
                  <span className="font-semibold">{price.breakdown.fragile}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
                <span className="text-sm font-semibold text-primary">Total estimé</span>
                <span className="text-lg font-bold text-primary">{formatCurrencyEUR(price.total)}</span>
              </div>
            </section>
          </div>

          <footer className="flex flex-col gap-3 border-t border-border bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {disableSubmit ? (
                <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              )}
              <span>
                {disableSubmit
                  ? "Complétez les champs requis pour activer la recommandation."
                  : "La commande sera créée avec un nouvel identifiant et le chauffeur le plus proche disponible."}
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="button" variant="outline" onClick={onCancel} className="sm:min-w-[140px]">
                Annuler
              </Button>
              <Button
                type="submit"
                className="sm:min-w-[220px] bg-[#FFB800] text-black hover:bg-[#ffca3d] focus-visible:ring-[#FFB800]"
                disabled={disableSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <Fragment>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Création en cours...
                  </Fragment>
                ) : (
                  <Fragment>
                    <RotateCcwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    Valider et recommander
                  </Fragment>
                )}
              </Button>
            </div>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
};

const RotateCcwIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    {...props}
  >
    <path
      d="M2 12a10 10 0 1 1 2.93 7.07"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2 12V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default ReorderModal;
