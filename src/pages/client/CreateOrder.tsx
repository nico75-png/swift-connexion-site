import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import CreateOrderForm, { type CreateOrderFormValues, parseLocaleNumber } from "@/components/orders/CreateOrderForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { createOrder } from "@/lib/services/orders.service";
import { quoteOrder, type QuoteOrderResult } from "@/lib/services/quotes.service";
import { useAuth } from "@/lib/stores/auth.store";
import { getClientPackageLabel, type PackageType } from "@/lib/packageTaxonomy";

type Step = 1 | 2;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (date: string, time: string) => {
  if (!date || !time) {
    return "-";
  }

  const candidate = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`);

  if (Number.isNaN(candidate.getTime())) {
    return `${date} à ${time}`;
  }

  return candidate.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CreateOrder = () => {
  const { currentUser, currentClient } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [quoteChecked, setQuoteChecked] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [quoteRequestVersion, setQuoteRequestVersion] = useState(0);
  const [quoteResult, setQuoteResult] = useState<QuoteOrderResult>({ success: false });
  const [quoteStatus, setQuoteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const customer = useMemo(() => {
    if (currentClient) {
      return currentClient;
    }

    return {
      id: currentUser?.id ?? "client-temp",
      contactName: currentUser?.name ?? "Client connecté",
      company: currentUser?.name ?? "Client",
      siret: "000 000 000 00000",
      defaultPickupAddress: "",
      defaultDeliveryAddress: "",
    };
  }, [currentClient, currentUser]);

  const initialFormValues = useMemo<CreateOrderFormValues>(
    () => ({
      packageType: "",
      packageNote: "",
      pickupAddress: customer.defaultPickupAddress ?? "",
      deliveryAddress: customer.defaultDeliveryAddress ?? "",
      date: "",
      time: "",
      weight: "",
      volume: "",
      driverInstructions: "",
      expressDelivery: false,
      fragilePackage: false,
      temperatureControlled: false,
    }),
    [customer.defaultDeliveryAddress, customer.defaultPickupAddress],
  );

  const [draftValues, setDraftValues] = useState<CreateOrderFormValues>(initialFormValues);

  useEffect(() => {
    setDraftValues(initialFormValues);
  }, [initialFormValues]);

  useEffect(() => {
    if (step !== 2) {
      return;
    }

    let isActive = true;

    const runQuote = async () => {
      setQuoteStatus("loading");
      setQuoteResult({ success: false });

      try {
        const response = await quoteOrder({
          customerId: customer.id,
          sector: customer.sector,
          packageType: draftValues.packageType,
          packageNote: draftValues.packageNote?.trim() || undefined,
          pickupAddress: draftValues.pickupAddress,
          deliveryAddress: draftValues.deliveryAddress,
          date: draftValues.date,
          time: draftValues.time,
          weight: parseLocaleNumber(draftValues.weight),
          volume: parseLocaleNumber(draftValues.volume),
          driverInstructions: draftValues.driverInstructions?.trim() || undefined,
          expressDelivery: draftValues.expressDelivery,
          fragilePackage: draftValues.fragilePackage,
          temperatureControlled: draftValues.temperatureControlled,
        });

        if (!isActive) {
          return;
        }

        setQuoteResult(response);
        setQuoteStatus(response.success ? "success" : "error");
      } catch (error) {
        if (!isActive) {
          return;
        }

        setQuoteStatus("error");
        setQuoteResult({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "La tarification est temporairement indisponible.",
        });
      }
    };

    runQuote();

    return () => {
      isActive = false;
    };
  }, [customer.id, draftValues, quoteRequestVersion, step]);

  const handleReview = (values: CreateOrderFormValues) => {
    setDraftValues(values);
    setStep(2);
    setQuoteChecked(false);
    setQuoteRequestVersion(version => version + 1);
  };

  const handleRetryQuote = () => {
    setQuoteRequestVersion(version => version + 1);
  };

  const handleEdit = () => {
    setStep(1);
    setQuoteStatus("idle");
  };

  const handleConfirm = async () => {
    if (!quoteResult.success || !quoteResult.quote) {
      toast.error("Confirmation impossible", {
        description: "Veuillez obtenir un tarif valide avant de confirmer.",
      });
      return;
    }

    setIsConfirming(true);

    try {
      const response = await createOrder(
        {
          customerId: customer.id,
          sector: customer.sector || "B2B",
          packageType: draftValues.packageType,
          packageNote: draftValues.packageNote?.trim() || undefined,
          pickupAddress: draftValues.pickupAddress,
          deliveryAddress: draftValues.deliveryAddress,
          date: draftValues.date,
          time: draftValues.time,
          weight: parseLocaleNumber(draftValues.weight),
          volume: parseLocaleNumber(draftValues.volume),
          driverInstructions: draftValues.driverInstructions?.trim() || undefined,
          expressDelivery: draftValues.expressDelivery,
          fragilePackage: draftValues.fragilePackage,
          temperatureControlled: draftValues.temperatureControlled,
          quoteId: quoteResult.quote.id,
          quoteAmount: quoteResult.quote.amount,
        },
        {
          customerDisplayName: customer.contactName,
          customerCompany: customer.company,
        },
      );

      if (response.success && response.orderId) {
        toast.success("Commande confirmée", {
          description: "Votre commande a été enregistrée avec succès.",
        });
        navigate(`/espace-client/commandes/${response.orderId}`);
        return;
      }

      toast.error("Confirmation impossible", {
        description: response.error ?? "Une erreur est survenue. Veuillez réessayer.",
      });
    } catch (error) {
      toast.error("Confirmation impossible", {
        description:
          error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName={currentUser?.name} />}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader className="border-b bg-muted/40 py-6">
            <CardTitle className="text-2xl font-semibold">Créer une commande</CardTitle>
            <CardDescription>
              Renseignez les informations de votre transport. Les champs marqués d&apos;un astérisque sont obligatoires.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            {step === 1 ? (
              <CreateOrderForm
                customer={customer}
                defaultValues={draftValues}
                onSubmit={handleReview}
                isSubmitting={quoteStatus === "loading"}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Étape 2</span>
                  <span>•</span>
                  <span>Récapitulatif &amp; tarif</span>
                </div>
                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                  <section className="space-y-4">
                    <header>
                      <h3 className="text-lg font-semibold">Informations saisies</h3>
                      <p className="text-sm text-muted-foreground">
                        Vérifiez l&apos;ensemble des détails avant de confirmer votre commande.
                      </p>
                    </header>
                    <Alert className="border-primary/40 bg-primary/5">
                      <AlertDescription className="flex items-start gap-2 text-sm text-primary">
                        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>
                          💡 Le tarif est automatiquement calculé selon la distance parcourue. Les champs poids et volume sont
                          collectés uniquement pour organiser la logistique et affecter le véhicule adéquat.
                        </span>
                      </AlertDescription>
                    </Alert>
                    <div className="rounded-lg border bg-muted/20 p-6">
                      {draftValues.packageType ? (
                        <div className="mb-4 flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-background/80">
                            {getClientPackageLabel(draftValues.packageType as PackageType)}
                          </Badge>
                        </div>
                      ) : null}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Société</p>
                          <p className="font-medium">{customer.company}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">SIRET</p>
                          <p className="font-medium">{customer.siret}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Type de transport</p>
                          <p className="font-medium">
                            {draftValues.packageType
                              ? getClientPackageLabel(draftValues.packageType as PackageType)
                              : "-"}
                          </p>
                        </div>
                        {quoteResult.success && quoteResult.quote?.transportLabel ? (
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">Catégorie tarifaire</p>
                            <p className="font-medium capitalize">{quoteResult.quote.transportLabel}</p>
                          </div>
                        ) : null}
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Date &amp; heure</p>
                          <p className="font-medium">{formatDate(draftValues.date, draftValues.time)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Adresse de départ</p>
                          <p className="font-medium">{draftValues.pickupAddress || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Adresse de livraison</p>
                          <p className="font-medium">{draftValues.deliveryAddress || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Poids</p>
                          <p className="font-medium">{draftValues.weight ? `${draftValues.weight} kg` : "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Volume</p>
                          <p className="font-medium">{draftValues.volume ? `${draftValues.volume} m³` : "-"}</p>
                        </div>
                      </div>
                      <p className="mt-6 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-sm text-primary">
                        Le poids et le volume renseignés sont utilisés pour préparer le transport. Ils n&apos;impactent pas votre
                        tarif.
                      </p>
                      {(() => {
                        const options: string[] = [];
                        if (draftValues.expressDelivery) {
                          options.push("Livraison express (+30 %)");
                        }
                        if (draftValues.fragilePackage) {
                          options.push("Colis fragile (+15 %)");
                        }
                        if (draftValues.temperatureControlled) {
                          options.push("Température contrôlée");
                        }
                        if (options.length === 0) {
                          return null;
                        }
                        return (
                          <div className="mt-6 space-y-2">
                            <p className="text-xs uppercase text-muted-foreground">Options sélectionnées</p>
                            <div className="flex flex-wrap gap-2">
                              {options.map(option => (
                                <Badge key={option} variant="secondary">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                      {draftValues.packageNote?.trim() ? (
                        <div className="mt-6 rounded-md border bg-background/60 p-4">
                          <p className="text-xs uppercase text-muted-foreground">Précision sur le colis</p>
                          <p className="mt-1 text-sm">{draftValues.packageNote}</p>
                        </div>
                      ) : null}
                      {draftValues.driverInstructions?.trim() ? (
                        <div className="mt-6 rounded-md border bg-background/60 p-4">
                          <p className="text-xs uppercase text-muted-foreground">Instructions particulières</p>
                          <p className="mt-1 text-sm">{draftValues.driverInstructions}</p>
                        </div>
                      ) : null}
                    </div>
                  </section>
                  <aside className="space-y-4">
                    <header>
                      <h3 className="text-lg font-semibold">Tarif estimé</h3>
                      <p className="text-sm text-muted-foreground">Montant à confirmer avant création de la commande.</p>
                    </header>
                    <Alert className="border-primary/40 bg-primary/5">
                      <AlertDescription className="flex items-start gap-2 text-xs text-primary sm:text-sm">
                        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span>
                          Le prix est calculé exclusivement sur la distance entre l&apos;enlèvement et la livraison. Les données de
                          poids et volume sont conservées à des fins logistiques uniquement.
                        </span>
                      </AlertDescription>
                    </Alert>
                    <div className="rounded-lg border bg-muted/10 p-6">
                      {quoteStatus === "loading" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      )}
                      {quoteStatus === "error" && (
                        <div className="space-y-4 text-sm">
                          <p className="font-medium text-destructive">Impossible de calculer le tarif pour le moment.</p>
                          <p className="text-muted-foreground">
                            {quoteResult.error ??
                              "La tarification est temporairement indisponible. Vous pouvez réessayer dans un instant ou contacter notre support."}
                          </p>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <Button variant="outline" onClick={handleRetryQuote} disabled={quoteStatus !== "error"}>
                              Réessayer
                            </Button>
                            <Button asChild variant="ghost">
                              <Link to="/contact">Contacter le support</Link>
                            </Button>
                          </div>
                        </div>
                      )}
                      {quoteStatus === "success" && quoteResult.success && quoteResult.quote ? (
                        <div className="space-y-5">
                          <div>
                            <p className="text-xs uppercase text-muted-foreground">Total TTC estimé</p>
                            <p className="text-3xl font-semibold">{formatCurrency(quoteResult.quote.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              Référence devis : {quoteResult.quote.id}
                            </p>
                          </div>
                          <Separator />
                          <dl className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-muted-foreground">Base</dt>
                              <dd className="font-medium">
                                {formatCurrency(quoteResult.quote.breakdown.base)}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-muted-foreground">Distance</dt>
                              <dd className="font-medium">
                                {formatCurrency(quoteResult.quote.breakdown.distance)}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-muted-foreground">Suppléments</dt>
                              <dd className="font-medium">
                                {formatCurrency(quoteResult.quote.breakdown.supplements)}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-muted-foreground">Options</dt>
                              <dd className="font-medium">
                                {formatCurrency(quoteResult.quote.breakdown.options ?? 0)}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-muted-foreground">Remise</dt>
                              <dd className="font-medium text-emerald-600">
                                {quoteResult.quote.breakdown.discount > 0
                                  ? `-${formatCurrency(quoteResult.quote.breakdown.discount)}`
                                  : formatCurrency(0)}
                              </dd>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-muted-foreground">Total HT</dt>
                              <dd className="font-medium">
                                {formatCurrency(quoteResult.quote.breakdown.totalHT)}
                              </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <dt className="text-muted-foreground">Taxes</dt>
                              <dd className="font-medium">
                                {formatCurrency(quoteResult.quote.breakdown.taxes)}
                              </dd>
                            </div>
                          </dl>
                          <Badge variant="outline" className="w-full justify-between text-base">
                            <span>Total TTC</span>
                            <span>{formatCurrency(quoteResult.quote.breakdown.totalTTC)}</span>
                          </Badge>
                        </div>
                      ) : null}
                    </div>
                  </aside>
                </div>

                <Separator />

                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="quote-ack"
                      checked={quoteChecked}
                      onCheckedChange={checked => setQuoteChecked(Boolean(checked))}
                      disabled={quoteStatus !== "success" || isConfirming}
                    />
                    <div className="space-y-1 text-sm">
                      <label className="font-medium" htmlFor="quote-ack">
                        J&apos;ai vérifié mon récapitulatif
                      </label>
                      <p className="text-muted-foreground">
                        En confirmant, vous acceptez nos {" "}
                        <Link to="/cgv" className="text-primary underline">
                          conditions générales de vente
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={handleEdit} disabled={isConfirming}>
                      Modifier
                    </Button>
                    <Button
                      variant="cta"
                      onClick={handleConfirm}
                      disabled={
                        !quoteChecked ||
                        quoteStatus !== "success" ||
                        !quoteResult.success ||
                        !quoteResult.quote ||
                        isConfirming
                      }
                    >
                      {isConfirming ? "Confirmation..." : "Confirmer la commande"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOrder;
