import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const CommandeSansCompte = () => {
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const handleEstimate = () => {
    // Calcul simple basé sur zone
    const basePrice = 35;
    const expressMultiplier = 1.3;
    const total = basePrice * expressMultiplier;
    setEstimatedPrice(Math.round(total * 100) / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitted(true);
    toast.success("Demande envoyée ! Nous vous recontacterons sous 30 minutes.");
  };

  if (orderSubmitted) {
    return (
      <Layout>
        <section className="py-16 bg-muted/30 min-h-[80vh] flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="border-none shadow-large">
                <CardContent className="p-12">
                  <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h1 className="mb-4">Demande enregistrée !</h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Votre demande de course a bien été reçue. Notre équipe vous contactera 
                    dans les 30 minutes pour confirmer les détails et organiser l'enlèvement.
                  </p>
                  <div className="p-6 bg-muted/50 rounded-xl mb-8">
                    <h3 className="text-xl font-semibold mb-4">Prochaines étapes</h3>
                    <ol className="text-left space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          1
                        </div>
                        <span className="text-muted-foreground">
                          Vous recevrez un email de confirmation avec votre numéro de dossier
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          2
                        </div>
                        <span className="text-muted-foreground">
                          Un conseiller vous appellera pour finaliser les détails
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          3
                        </div>
                        <span className="text-muted-foreground">
                          Le coursier viendra enlever votre colis à l'heure convenue
                        </span>
                      </li>
                    </ol>
                  </div>
                  <div className="p-4 bg-info/10 rounded-lg border border-info/20 mb-6">
                    <p className="text-sm text-muted-foreground">
                      <strong>Créez un compte</strong> pour suivre vos commandes en temps réel 
                      et accéder à l'historique de vos livraisons
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="cta" size="lg" asChild>
                      <Link to="/inscription">Créer mon compte</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/">Retour à l'accueil</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <img
            src="/images/commande-sans-compte-banner.svg"
            alt="Commander une course - remplissez ce formulaire ci-dessous pour obtenir une estimation immédiate"
            className="w-full max-w-5xl mx-auto h-auto rounded-2xl shadow-soft"
          />
        </div>
      </section>

      {/* Info Banner */}
      <div className="bg-cta/10 border-b border-cta/20 py-3">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            <Link to="/inscription" className="font-semibold text-primary hover:underline">
              Créez un compte gratuit
            </Link>{" "}
            pour suivre vos commandes en temps réel et gérer votre historique
          </p>
        </div>
      </div>

      {/* Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identité */}
              <Card className="border-none shadow-soft">
                <CardContent className="p-8">
                  <h2 className="mb-6">Vos informations</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom complet *</label>
                      <input
                        type="text"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Entreprise</label>
                      <input
                        type="text"
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="email@exemple.fr"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transport */}
              <Card className="border-none shadow-soft">
                <CardContent className="p-8">
                  <h2 className="mb-6">Détails du transport</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Type de colis *</label>
                        <select required className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                          <option value="">Sélectionnez</option>
                          <option>Document (enveloppe)</option>
                          <option>Colis léger (&lt;5kg)</option>
                          <option>Colis moyen (5-20kg)</option>
                          <option>Colis volumineux (&gt;20kg)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Secteur</label>
                        <select className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                          <option>Général</option>
                          <option>Médical / Santé</option>
                          <option>Optique</option>
                          <option>Juridique</option>
                          <option>Événementiel</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Adresse de départ *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="123 Rue de Paris, 75001 Paris"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Adresse d'arrivée *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="45 Avenue Victor Hugo, 92100 Boulogne"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Poids (kg)</label>
                        <input
                          type="number"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Volume (LxlxH cm)</label>
                        <input
                          type="text"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="30x30x30"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Date souhaitée *</label>
                        <input
                          type="date"
                          required
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium block">Options</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="express-cmd"
                          className="h-4 w-4"
                          onChange={handleEstimate}
                        />
                        <label htmlFor="express-cmd" className="text-sm">
                          Livraison express sous 1h (+30%)
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="fragile-cmd" className="h-4 w-4" />
                        <label htmlFor="fragile-cmd" className="text-sm">
                          Colis fragile (+15%)
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Instructions spéciales</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background resize-none"
                        placeholder="Ex: Livraison en main propre, étage sans ascenseur, code porte..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estimation & Submit */}
              {estimatedPrice && (
                <div className="p-6 bg-primary/5 rounded-xl border-2 border-primary/20 animate-scale-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">Tarif estimé :</span>
                    <span className="text-3xl font-bold text-primary">{estimatedPrice}€</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Tarif indicatif. Le prix final sera confirmé par notre équipe.</span>
                  </div>
                </div>
              )}

              <Button type="submit" variant="cta" size="lg" className="w-full">
                Valider ma demande
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En soumettant ce formulaire, vous acceptez que nous vous contactions pour organiser votre livraison.
              </p>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CommandeSansCompte;
