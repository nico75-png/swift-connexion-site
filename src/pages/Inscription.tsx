import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { SECTOR_LABELS, type Sector } from "@/lib/packageTaxonomy";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { upsertProfile } from "@/lib/api/profiles";
import { useAuthProfile } from "@/providers/AuthProvider";

const Inscription = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState<Sector | "">("");
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshProfile } = useAuthProfile();

  const passwordRequirements = [
    { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
    { label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Une lettre minuscule", test: (p: string) => /[a-z]/.test(p) },
    { label: "Un chiffre", test: (p: string) => /\d/.test(p) },
    { label: "Un caractère spécial", test: (p: string) => /[!@#$%^&*]/.test(p) },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sector) {
      toast.error("Veuillez sélectionner votre secteur d'activité");
      return;
    }
    
    if (!acceptedCGU) {
      toast.error("Veuillez accepter les CGU pour continuer");
      return;
    }

    const allRequirementsMet = passwordRequirements.every(req => req.test(password));
    if (!allRequirementsMet) {
      toast.error("Le mot de passe ne respecte pas tous les critères");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("first_name") ?? "").trim();
    const lastName = String(formData.get("last_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const siret = String(formData.get("siret") ?? "").trim();

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            company,
            siret,
            sector,
          },
        },
      });

      if (error) {
        throw error;
      }

      const user = data.user;

      if (user) {
        try {
          await upsertProfile({
            userId: user.id,
            firstName,
            lastName,
          });
          await refreshProfile();
        } catch (profileError) {
          console.error("Failed to persist profile", profileError);
        }
      }

      toast.success("Compte créé avec succès ! Bienvenue chez One Connexion");
      navigate("/espace-client");
    } catch (error) {
      const message = error instanceof Error ? error.message : "La création du compte a échoué.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="mb-4">Créer un compte professionnel</h1>
              <p className="text-lg text-muted-foreground">
                Gérez toutes vos livraisons depuis un seul espace
              </p>
            </div>

            <Card className="border-none shadow-large">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Nom *</label>
                        <input
                          type="text"
                          required
                          name="last_name"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="Nom"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Prénom *</label>
                        <input
                          type="text"
                          required
                          name="first_name"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="Prénom"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informations entreprise */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Informations entreprise</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Entreprise *</label>
                        <input
                          type="text"
                          required
                          name="company"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="Nom de l'entreprise"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">SIRET *</label>
                          <input
                            type="text"
                            required
                            pattern="[0-9]{14}"
                            name="siret"
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="14 chiffres"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Secteur d'activité *</label>
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                              Ce choix personnalise définitivement vos types de transport.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {Object.entries(SECTOR_LABELS).map(([key, label]) => {
                                const value = key as Sector;
                                const isSelected = sector === value;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSector(value)}
                                    className={cn(
                                      "w-full rounded-xl border px-4 py-3 text-left transition",
                                      "hover:border-primary/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                      isSelected
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-background"
                                    )}
                                  >
                                    <span className="block text-sm font-semibold">{label}</span>
                                    <span className="mt-1 block text-xs text-muted-foreground">
                                      Sélection unique — contactez notre support pour changer.
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <input type="hidden" name="sector" value={sector} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Contact et connexion</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Email *</label>
                          <input
                            type="email"
                            required
                            name="email"
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="email@entreprise.fr"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Téléphone *</label>
                          <input
                            type="tel"
                            required
                            name="phone"
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="01 23 45 67 89"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Mot de passe *</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          name="password"
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="••••••••"
                        />
                        
                        {/* Password Requirements */}
                        {password && (
                          <div className="mt-3 p-4 bg-muted/50 rounded-lg space-y-2">
                            <p className="text-sm font-medium mb-2">Critères du mot de passe :</p>
                            {passwordRequirements.map((req, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                {req.test(password) ? (
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                ) : (
                                  <X className="h-4 w-4 text-destructive" />
                                )}
                                <span className={req.test(password) ? "text-success" : "text-muted-foreground"}>
                                  {req.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CGU */}
                  <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <input
                      type="checkbox"
                      id="cgu"
                      checked={acceptedCGU}
                      onChange={(e) => setAcceptedCGU(e.target.checked)}
                      className="h-4 w-4 mt-0.5"
                      required
                    />
                    <label htmlFor="cgu" className="text-sm text-muted-foreground">
                      J'ai lu et j'accepte les{" "}
                      <Link to="/cgv" className="text-primary hover:underline">
                        Conditions Générales de Vente
                      </Link>{" "}
                      et les{" "}
                      <Link to="/mentions-legales" className="text-primary hover:underline">
                        Mentions Légales
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Création en cours…" : "Créer mon compte"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Vous avez déjà un compte ?{" "}
                    <Link to="/connexion" className="text-primary font-semibold hover:underline">
                      Se connecter
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Inscription;
