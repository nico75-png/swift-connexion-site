import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const Connexion = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulation: admin si email contient "admin", sinon client
    if (email.toLowerCase().includes("admin")) {
      toast.success("Connexion réussie ! Redirection vers l'espace admin...");
      setTimeout(() => navigate("/admin"), 1000);
    } else {
      toast.success("Connexion réussie ! Redirection vers votre espace...");
      setTimeout(() => navigate("/espace-client"), 1000);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Un email de réinitialisation a été envoyé !");
    setShowForgotPassword(false);
  };

  return (
    <Layout>
      <section className="py-16 bg-muted/30 min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="mb-4">Connexion</h1>
              <p className="text-lg text-muted-foreground">
                Accédez à votre espace personnel
              </p>
            </div>

            <Card className="border-none shadow-large">
              <CardContent className="p-8">
                {showForgotPassword ? (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-semibold mb-2">Mot de passe oublié</h2>
                      <p className="text-sm text-muted-foreground">
                        Entrez votre email pour recevoir un lien de réinitialisation
                      </p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <input
                          type="email"
                          required
                          className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                          placeholder="email@entreprise.fr"
                        />
                      </div>
                      <Button type="submit" variant="cta" size="lg" className="w-full">
                        Envoyer le lien
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        Retour à la connexion
                      </Button>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="email@entreprise.fr"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Mot de passe</label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-input bg-background"
                        placeholder="••••••••"
                      />
                    </div>

                    <Button type="submit" variant="cta" size="lg" className="w-full">
                      Se connecter
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Pas encore de compte ?
                      </p>
                      <Button variant="outline" size="lg" className="w-full" asChild>
                        <Link to="/inscription">Créer un compte</Link>
                      </Button>
                      <Button variant="secondary" size="lg" className="w-full" asChild>
                        <Link to="/commande-sans-compte">Commander sans compte</Link>
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
              <p className="text-sm text-center text-muted-foreground">
                <strong>Démo :</strong> Utilisez "admin@test.fr" pour accéder à l'espace admin, 
                ou tout autre email pour l'espace client
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Connexion;
