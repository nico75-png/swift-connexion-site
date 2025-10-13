import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const Inscription = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [acceptedCGU, setAcceptedCGU] = useState(false);

  const passwordRequirements = [
    { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
    { label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Une lettre minuscule", test: (p: string) => /[a-z]/.test(p) },
    { label: "Un chiffre", test: (p: string) => /\d/.test(p) },
    { label: "Un caractère spécial", test: (p: string) => /[!@#$%^&*]/.test(p) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedCGU) {
      toast.error("Veuillez accepter les CGU pour continuer");
      return;
    }

    const allRequirementsMet = passwordRequirements.every(req => req.test(password));
    if (!allRequirementsMet) {
      toast.error("Le mot de passe ne respecte pas tous les critères");
      return;
    }

    toast.success("Compte créé avec succès ! Bienvenue chez One Connexion");
    setTimeout(() => navigate("/espace-client"), 1000);
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
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="Dupont"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Prénom *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="Jean"
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
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="14 chiffres"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Secteur d'activité *</label>
                          <select required className="w-full h-11 px-4 rounded-lg border border-input bg-background">
                            <option value="">Sélectionnez</option>
                            <option>Santé / Médical</option>
                            <option>Optique</option>
                            <option>Juridique</option>
                            <option>B2B / Industrie</option>
                            <option>Événementiel</option>
                            <option>Autre</option>
                          </select>
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
                            className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                            placeholder="email@entreprise.fr"
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

                      <div>
                        <label className="text-sm font-medium mb-2 block">Mot de passe *</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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

                  <Button type="submit" variant="cta" size="lg" className="w-full">
                    Créer mon compte
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
