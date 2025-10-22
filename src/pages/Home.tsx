import { type ChangeEvent, type FormEvent, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Zap, Lock, Eye, Heart, FileText, ArrowRight, Check, Star, X } from "lucide-react";
type ServiceType = "Standard" | "Express" | "Flash Express";
const servicePricing: Record<ServiceType, {
  base: number;
  perKm: number;
  delay: string;
}> = {
  Standard: {
    base: 20,
    perKm: 1.5,
    delay: "Jusqu'à 3 h"
  },
  Express: {
    base: 26,
    perKm: 1.7,
    delay: "Jusqu'à 2 h"
  },
  "Flash Express": {
    base: 32,
    perKm: 2,
    delay: "≈ 45 min"
  }
};
const PALIER_KM = 10;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
const hasMapboxToken = Boolean(MAPBOX_TOKEN);
const FRENCH_HOLIDAYS = ["01-01", "04-01", "05-01", "05-08", "05-09", "07-14", "08-15", "11-01", "11-11", "12-25"];
const roundToNearestHalf = (value: number) => Math.round(value * 2) / 2;
const formatCurrency = (value: number) => new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2
}).format(value);
const isNightTime = (time: string) => {
  if (!time) return false;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes ?? 0)) return false;
  const decimalHour = hours + (minutes ?? 0) / 60;
  return decimalHour >= 20 || decimalHour < 6;
};
const isSundayOrHoliday = (date: string) => {
  if (!date) return false;
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return false;
  const checkDate = new Date(year, month - 1, day);
  const isSunday = checkDate.getDay() === 0;
  const monthDay = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return isSunday || FRENCH_HOLIDAYS.includes(monthDay);
};
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!MAPBOX_TOKEN) return null;
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&language=fr&autocomplete=true&limit=1`);
  if (!response.ok) return null;
  const data = await response.json();
  const [longitude, latitude] = data.features?.[0]?.center ?? [];
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return null;
  }
  return [longitude, latitude];
};
const getDistanceFromMapbox = async (origin: string, destination: string): Promise<number | null> => {
  if (!MAPBOX_TOKEN) return null;
  const [originCoords, destinationCoords] = await Promise.all([geocodeAddress(origin), geocodeAddress(destination)]);
  if (!originCoords || !destinationCoords) {
    return null;
  }
  const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destinationCoords[0]},${destinationCoords[1]}?overview=false&access_token=${MAPBOX_TOKEN}`);
  if (!response.ok) return null;
  const data = await response.json();
  const distanceMeters = data.routes?.[0]?.distance;
  if (typeof distanceMeters !== "number") {
    return null;
  }
  return distanceMeters / 1000;
};
type EstimateResult = {
  total: number;
  totalBeforeRound: number;
  distance: number;
  service: ServiceType;
  baseAmount: number;
  extraAmount: number;
  extraKm: number;
  majorations: {
    label: string;
    amount: number;
  }[];
  isNight: boolean;
  isSundayOrHoliday: boolean;
};
const benefits = [{
  icon: Zap,
  title: "Rapidité garantie",
  description: "Livraison express en moins de 2h en Île-de-France"
}, {
  icon: Lock,
  title: "Sécurité maximale",
  description: "Colis assuré et suivi GPS en temps réel"
}, {
  icon: Eye,
  title: "Suivi en temps réel",
  description: "Tracez votre commande de l'enlèvement à la livraison"
}];
const expertises = [{
  icon: Heart,
  title: "Santé & Médical",
  description: "Transport sécurisé de dispositifs médicaux et échantillons",
  gradient: "from-blue-500 to-purple-600"
}, {
  icon: Eye,
  title: "Optique",
  description: "Livraison rapide de montures et verres correcteurs",
  gradient: "from-green-500 to-emerald-600"
}, {
  icon: FileText,
  title: "Juridique",
  description: "Coursier spécialisé pour documents confidentiels",
  gradient: "from-gray-600 to-gray-800"
}];
const subscriptionPlans = [{
  title: "Standard",
  price: "20 € forfait 0 à 10 km",
  description: "Pour vos livraisons programmées du quotidien",
  features: [{
    label: "20 € pour la tranche 0 à 10 km",
    included: true
  }, {
    label: "1,50 € par kilomètre supplémentaire",
    included: true
  }, {
    label: "Délai maximum de 3 heures",
    included: true
  }, {
    label: "Assurance colis et suivi en temps réel",
    included: true
  }],
  ctaLabel: "Choisir ce plan",
  ctaLink: "/contact"
}, {
  title: "Express",
  price: "26 € forfait 0 à 10 km",
  description: "La solution rapide pour vos urgences professionnelles",
  features: [{
    label: "26 € pour la tranche 0 à 10 km",
    included: true
  }, {
    label: "1,70 € par kilomètre supplémentaire",
    included: true
  }, {
    label: "Délai garanti sous 2 heures",
    included: true
  }, {
    label: "Support prioritaire dédié",
    included: true
  }],
  ctaLabel: "Choisir ce plan",
  ctaLink: "/contact",
  badge: "Populaire",
  featured: true
}, {
  title: "Flash Express",
  price: "32 € forfait 0 à 10 km",
  description: "Notre service le plus rapide pour les livraisons critiques",
  features: [{
    label: "32 € pour la tranche 0 à 10 km",
    included: true
  }, {
    label: "2,00 € par kilomètre supplémentaire",
    included: true
  }, {
    label: "Délai record de 45 minutes",
    included: true
  }, {
    label: "Coursier dédié et suivi premium",
    included: true
  }],
  ctaLabel: "Choisir ce plan",
  ctaLink: "/contact"
}];
const testimonials = [{
  name: "Marie L.",
  company: "Laboratoire Médical",
  quote: "Service impeccable ! Nos échantillons arrivent toujours à temps."
}, {
  name: "Thomas D.",
  company: "Cabinet d'Avocats",
  quote: "Ponctualité et discrétion. Parfait pour nos documents sensibles."
}, {
  name: "Sophie M.",
  company: "Opticien",
  quote: "Des tarifs transparents et un suivi en temps réel. Je recommande !"
}];
const Home = () => {
  const [formValues, setFormValues] = useState({
    pickupAddress: "",
    dropoffAddress: "",
    pickupDate: "",
    pickupTime: "",
    service: "Standard" as ServiceType
  });
  const [manualDistance, setManualDistance] = useState(8);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const computeEstimate = (distanceKm: number, service: ServiceType, pickupDate: string, pickupTime: string): EstimateResult => {
    const pricing = servicePricing[service];
    const extraKm = Math.max(0, distanceKm - PALIER_KM);
    const baseAmount = pricing.base;
    const extraAmount = extraKm * pricing.perKm;
    let runningTotal = baseAmount + extraAmount;
    const majorations: {
      label: string;
      amount: number;
    }[] = [];
    const night = isNightTime(pickupTime);
    const sundayOrHoliday = isSundayOrHoliday(pickupDate);
    if (night) {
      const nightAddition = runningTotal * 0.2;
      majorations.push({
        label: "Majoration nuit (+20%)",
        amount: nightAddition
      });
      runningTotal += nightAddition;
    }
    if (sundayOrHoliday) {
      const holidayAddition = runningTotal * 0.25;
      majorations.push({
        label: "Majoration dimanche ou jour férié (+25%)",
        amount: holidayAddition
      });
      runningTotal += holidayAddition;
    }
    const total = roundToNearestHalf(runningTotal);
    return {
      total,
      totalBeforeRound: runningTotal,
      distance: distanceKm,
      service,
      baseAmount,
      extraAmount,
      extraKm,
      majorations,
      isNight: night,
      isSundayOrHoliday: sundayOrHoliday
    };
  };
  const handleFormChange = (field: keyof typeof formValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleEstimate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCalculating(true);
    setErrorMessage(null);
    try {
      let distanceKm: number | null = null;
      if (hasMapboxToken && formValues.pickupAddress && formValues.dropoffAddress) {
        distanceKm = await getDistanceFromMapbox(formValues.pickupAddress, formValues.dropoffAddress);
      }
      if (!hasMapboxToken) {
        distanceKm = manualDistance;
      }
      if ((distanceKm === null || Number.isNaN(distanceKm)) && !manualDistance) {
        setErrorMessage("Définissez une distance estimée pour calculer le tarif.");
        setEstimate(null);
        return;
      }
      if (distanceKm === null || Number.isNaN(distanceKm)) {
        setErrorMessage("Impossible de récupérer la distance. Vérifiez vos adresses ou ajustez vos informations, puis réessayez.");
        setEstimate(null);
        return;
      }
      const estimation = computeEstimate(distanceKm, formValues.service, formValues.pickupDate, formValues.pickupTime);
      setEstimate(estimation);
    } catch (error) {
      setErrorMessage("Une erreur est survenue lors du calcul de l'estimation. Merci de réessayer.");
      setEstimate(null);
    } finally {
      setIsCalculating(false);
    }
  };
  return <Layout>
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2400&q=80" alt="Vue aérienne de Paris au coucher du soleil" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">One Connexion Express</h1>
          <p className="text-xl md:text-2xl">Livraison urgente et programmée en Île-de-France</p>
          <p className="max-w-2xl text-lg text-white/90">
            Service professionnel 24/7 pour vos colis urgents. Tarifs transparents, suivi en temps réel et prise en charge immédiate par nos coursiers dédiés.
          </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/tarifs" className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-blue-700">
                Voir nos tarifs
              </Link>
            <Link to="/commande-sans-compte" className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition duration-300 hover:bg-white hover:text-blue-600">
              Commander maintenant
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map(benefit => <Card key={benefit.title} className="rounded-2xl border-none bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-4xl font-bold">Nos expertises sectorielles</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-xl text-gray-600">
            Des solutions de transport adaptées à chaque secteur professionnel
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {expertises.map(expertise => <article key={expertise.title} className="group overflow-hidden rounded-2xl shadow-lg transition duration-500 hover:-translate-y-1 hover:shadow-2xl">
                <div className={`flex h-48 items-center justify-center bg-gradient-to-br ${expertise.gradient}`}>
                  <expertise.icon className="h-12 w-12 text-white" />
                </div>
                <div className="space-y-4 bg-white p-6">
                  <h3 className="text-xl font-bold">{expertise.title}</h3>
                  <p className="text-gray-600">{expertise.description}</p>
                  <Link to="/expertises" className="inline-flex items-center font-semibold text-blue-600 transition hover:text-blue-700">
                    En savoir plus
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>)}
          </div>
        </div>
      </section>

      <section className="bg-muted py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold text-foreground md:text-5xl">Des formules adaptées à chaque étape</h2>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Choisissez le plan qui correspond à vos besoins et bénéficiez d’un accompagnement premium sur vos livraisons.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subscriptionPlans.map(plan => <Card
                key={plan.title}
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-8 text-left shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-medium focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background",
                  plan.featured
                    ? "border-transparent bg-gradient-to-br from-primary to-primary-dark text-primary-foreground shadow-large hover:shadow-large focus-within:ring-cta/70"
                    : "focus-within:ring-ring"
                )}
              >
                {plan.badge && <Badge
                    className={cn(
                      "absolute right-6 top-6 rounded-full border-transparent px-4 py-1 text-xs font-semibold uppercase tracking-wide shadow-medium",
                      plan.featured ? "bg-cta text-cta-foreground" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {plan.badge}
                  </Badge>}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={cn("text-2xl font-semibold text-foreground", plan.featured && "text-primary-foreground")}>{plan.title}</h3>
                    <span className={cn("text-sm font-semibold text-muted-foreground", plan.featured && "text-primary-foreground/80")}>{plan.price}</span>
                  </div>
                  <p className={cn("mt-4 text-sm text-muted-foreground", plan.featured && "text-primary-foreground/90")}>{plan.description}</p>
                  <ul className="mt-8 flex flex-col gap-4 text-sm">
                    {plan.features.map(feature => <li key={feature.label} className="flex items-start gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary",
                            plan.featured && "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                          )}
                        >
                          {feature.included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                        <span className={cn("flex-1 text-sm font-medium text-foreground/80", plan.featured && "text-primary-foreground/90")}>{feature.label}</span>
                      </li>)}
                  </ul>
                  <div className="mt-10">
                    <Button
                      asChild
                      size="lg"
                      variant={plan.featured ? "cta" : "outline"}
                      className={cn("w-full", plan.featured ? "text-cta-foreground" : "")}
                    >
                      <Link to={plan.ctaLink}>{plan.ctaLabel}</Link>
                    </Button>
                  </div>
                </div>
              </Card>)}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-4xl font-bold">Estimez votre tarif en quelques clics</h2>
            <p className="mt-4 text-lg text-gray-600">
              Renseignez votre trajet et obtenez une estimation instantanée basée sur notre grille tarifaire officielle.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="order-2 rounded-3xl border-transparent bg-white shadow-xl lg:order-1">
              <CardHeader className="border-b border-slate-100 pb-6">
                <CardTitle className="text-2xl font-semibold text-slate-900">Récapitulatif de votre course</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {estimate ? <div className="space-y-6">
                    <div className="rounded-2xl bg-blue-50 p-6 text-center">
                      <p className="text-sm font-medium uppercase text-blue-600">Estimation TTC</p>
                      <p className="mt-2 text-4xl font-bold text-slate-900">{formatCurrency(estimate.total)}</p>
                      <p className="mt-1 text-sm text-slate-500">(Arrondi au 0,50 € le plus proche)</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Distance estimée</p>
                          <p className="text-lg font-semibold text-slate-900">{estimate.distance.toFixed(1)} km</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Check className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Service choisi</p>
                          <p className="text-lg font-semibold text-slate-900">{estimate.service}</p>
                          <p className="text-sm text-slate-500">Délai estimé : {servicePricing[estimate.service].delay}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-6">
                      <h3 className="text-lg font-semibold text-slate-900">Détails du calcul</h3>
                      <ul className="mt-4 space-y-3 text-sm text-slate-600">
                        <li className="flex items-center justify-between">
                          <span>Base forfaitaire ({PALIER_KM} km inclus)</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(estimate.baseAmount)}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>
                            Kilomètres supplémentaires ({estimate.extraKm.toFixed(1)} km × {formatCurrency(servicePricing[estimate.service].perKm)} / km)
                          </span>
                          <span className="font-semibold text-slate-900">{formatCurrency(estimate.extraAmount)}</span>
                        </li>
                        {estimate.majorations.map(majoration => <li key={majoration.label} className="flex items-center justify-between">
                            <span>{majoration.label}</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(majoration.amount)}</span>
                          </li>)}
                        <li className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                          <span>Total avant arrondi</span>
                          <span>{formatCurrency(estimate.totalBeforeRound)}</span>
                        </li>
                        <li className="flex items-center justify-between text-base font-semibold text-blue-600">
                          <span>Total TTC</span>
                          <span>{formatCurrency(estimate.total)}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button className="flex-1" asChild>
                        <Link to="/commande-sans-compte">Commander cette course</Link>
                      </Button>
                      <Button className="flex-1" variant="outline" asChild>
                        <Link to="/contact">Parler à un conseiller</Link>
                      </Button>
                    </div>
                  </div> : <div className="space-y-6">
                    <div className="rounded-2xl bg-slate-100 p-6 text-center text-slate-600">
                      <p className="text-lg font-semibold text-slate-700">Préparez votre estimation</p>
                      <p className="mt-2 text-sm">
                        Complétez le formulaire pour afficher une estimation personnalisée selon votre itinéraire et le service choisi.
                      </p>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-600" />
                        Base forfaitaire incluse sur les 10 premiers kilomètres.
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-600" />
                        Majoration automatique selon l'heure et les jours fériés.
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-blue-600" />
                        Délai estimé en fonction du service sélectionné.
                      </li>
                    </ul>
                  </div>}
              </CardContent>
            </Card>

            <Card className="order-1 rounded-3xl border-transparent bg-white shadow-xl lg:order-2">
              <CardHeader className="border-b border-slate-100 pb-6">
                <CardTitle className="text-2xl font-semibold text-slate-900">Renseignez votre trajet</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form className="space-y-6" onSubmit={handleEstimate}>
                  <div className="space-y-2">
                    <Label htmlFor="pickup-address" className="text-sm font-semibold text-slate-700">
                      Adresse d’enlèvement
                    </Label>
                    <Input id="pickup-address" placeholder="Ex. 10 rue de Rivoli, Paris" autoComplete="street-address" value={formValues.pickupAddress} onChange={handleFormChange("pickupAddress")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoff-address" className="text-sm font-semibold text-slate-700">
                      Adresse de destination
                    </Label>
                    <Input id="dropoff-address" placeholder="Ex. 25 avenue Victor Hugo, Paris" autoComplete="street-address" value={formValues.dropoffAddress} onChange={handleFormChange("dropoffAddress")} required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pickup-date" className="text-sm font-semibold text-slate-700">
                        Date d’enlèvement
                      </Label>
                      <Input id="pickup-date" type="date" value={formValues.pickupDate} onChange={handleFormChange("pickupDate")} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickup-time" className="text-sm font-semibold text-slate-700">
                        Heure souhaitée
                      </Label>
                      <Input id="pickup-time" type="time" value={formValues.pickupTime} onChange={handleFormChange("pickupTime")} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Type de service</Label>
                    <Select value={formValues.service} onValueChange={value => setFormValues(prev => ({
                    ...prev,
                    service: value as ServiceType
                  }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Flash Express">Flash Express</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {!hasMapboxToken}

                  {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}

                  <Button className="w-full" size="lg" type="submit" disabled={isCalculating}>
                    {isCalculating ? "Calcul en cours..." : "Estimer le tarif"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Estimation indicative, calculée à partir des informations saisies.
          </p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">Ils nous font confiance</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map(testimonial => <Card key={testimonial.name} className="rounded-2xl border-none bg-gray-50 p-8 shadow-sm">
                <div className="mb-4 text-yellow-400">
                  {[...Array(5)].map((_, index) => <Star key={index} className="inline h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="mb-6 italic text-gray-600">"{testimonial.quote}"</p>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.company}</div>
              </Card>)}
          </div>
        </div>
      </section>

      <section id="commander" className="bg-gradient-to-br from-gray-900 to-blue-900 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold">Prêt à commander ?</h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-white/90">
            Commencez dès maintenant ou créez un compte pour gérer toutes vos livraisons
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/commande-sans-compte" className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-blue-700">
              Commander maintenant
            </Link>
            <Link to="/inscription" className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition duration-300 hover:bg-white hover:text-blue-600">
              Créer un compte
            </Link>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Home;