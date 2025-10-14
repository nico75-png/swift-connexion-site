import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientSidebar from "@/components/dashboard/ClientSidebar";
import Topbar from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

/**
 * Formulaire de création de commande multi-étapes
 * Avec estimation tarifaire dynamique
 */
const CreateOrder = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    from: "",
    to: "",
    date: "",
    time: "",
    weight: "",
    express: false,
    fragile: false,
  });

  const [estimation, setEstimation] = useState<number | null>(null);

  const calculateEstimation = () => {
    const base = 25;
    const distance = 15.5; // Simulé
    let options = 0;
    
    if (formData.express) options += base * 0.3;
    if (formData.fragile) options += base * 0.15;
    
    const total = base + distance + options;
    setEstimation(total);
  };

  const handleSubmit = () => {
    toast.success("Commande créée avec succès !", {
      description: "Vous recevrez une confirmation par email."
    });
  };

  return (
    <DashboardLayout
      sidebar={<ClientSidebar />}
      topbar={<Topbar userName="Jean Dupont" />}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Créer une commande</h1>
          <p className="text-muted-foreground">Remplissez les informations de livraison</p>
        </div>

        {/* Progression */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-20 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Étape 1 : Type de transport"}
              {step === 2 && "Étape 2 : Adresses"}
              {step === 3 && "Étape 3 : Options et validation"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Étape 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Type de transport</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Médical</SelectItem>
                      <SelectItem value="juridique">Juridique</SelectItem>
                      <SelectItem value="optique">Optique</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Adresse de départ</Label>
                  <Input
                    placeholder="123 Avenue de Paris, 75001 Paris"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Adresse d'arrivée</Label>
                  <Input
                    placeholder="45 Rue du Commerce, 92100 Boulogne"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Heure</Label>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Poids estimé (kg)</Label>
                  <Input
                    type="number"
                    placeholder="0.5"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.express}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, express: checked as boolean });
                        setEstimation(null);
                      }}
                    />
                    <Label>Livraison Express (+30%)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.fragile}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, fragile: checked as boolean });
                        setEstimation(null);
                      }}
                    />
                    <Label>Colis fragile (+15%)</Label>
                  </div>
                </div>

                {/* Estimation */}
                {estimation === null && (
                  <Button variant="outline" onClick={calculateEstimation} className="w-full">
                    Calculer l'estimation
                  </Button>
                )}
                {estimation !== null && (
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Estimation tarifaire</p>
                      <p className="text-3xl font-bold text-primary">{estimation.toFixed(2)}€</p>
                      <p className="text-xs text-muted-foreground mt-2">Tarif indicatif, sujet à modification</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Précédent
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Suivant
                </Button>
              ) : (
                <Button variant="cta" onClick={handleSubmit}>
                  Valider la commande
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOrder;
