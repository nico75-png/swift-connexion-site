import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthProfile } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Check } from "lucide-react";

type Expertise = "optique" | "juridique" | "medical" | "evenementiel";

const EXPERTISE_OBJECTS: Record<Expertise, string[]> = {
  optique: [
    "Lunettes montées",
    "Verres correcteurs",
    "Lentilles de contact",
    "Montures",
    "Pièces détachées / outillage",
    "Autre (à préciser)",
  ],
  juridique: [
    "Dossiers / pièces juridiques",
    "Actes (tribunal, huissier, avocat)",
    "Contrats à signer",
    "Clés, USB, scellés",
    "Courriers / plis confidentiels",
    "Autre (à préciser)",
  ],
  medical: [
    "Analyses / échantillons",
    "Dispositifs médicaux / matériel",
    "Médicaments / traitements",
    "Ordonnances / dossiers patients",
    "Matériel bloc / labo",
    "Autre (à préciser)",
  ],
  evenementiel: [
    "PLV / signalétique",
    "Matériel technique",
    "Goodies / welcome packs",
    "Badges / flyers / documents",
    "Petits accessoires logistiques",
    "Autre (à préciser)",
  ],
};

const EXPERTISE_LABELS: Record<Expertise, string> = {
  optique: "Optique",
  juridique: "Juridique",
  medical: "Santé & Médical",
  evenementiel: "Événementiel",
};

export default function DeliveryObjects() {
  const navigate = useNavigate();
  const { session, profile, refreshProfile } = useAuthProfile();
  const [expertise, setExpertise] = useState<Expertise | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [isOtherChecked, setIsOtherChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate("/connexion");
      return;
    }

    if (profile?.expertise) {
      setExpertise(profile.expertise as Expertise);
      // Analytics event
      console.log("onboarding_expertise_selected", { expertise: profile.expertise });
    } else {
      // Pas d'expertise sélectionnée, rediriger vers la page de sélection
      navigate("/onboarding/expertise");
    }
  }, [session, profile, navigate]);

  const handleObjectToggle = (object: string) => {
    const isOther = object === "Autre (à préciser)";
    
    if (isOther) {
      setIsOtherChecked(!isOtherChecked);
      if (!isOtherChecked) {
        // Ajout de "Autre"
        setSelectedObjects([...selectedObjects, object]);
      } else {
        // Retrait de "Autre"
        setSelectedObjects(selectedObjects.filter((o) => o !== object));
        setOtherText("");
      }
    } else {
      if (selectedObjects.includes(object)) {
        setSelectedObjects(selectedObjects.filter((o) => o !== object));
      } else {
        setSelectedObjects([...selectedObjects, object]);
      }
    }
    setError(null);
  };

  const handleOtherTextChange = (value: string) => {
    // Limiter à 50 caractères
    const truncated = value.slice(0, 50);
    setOtherText(truncated);
    setError(null);
  };

  const validateForm = (): boolean => {
    setError(null);

    // Cas 1: Aucune sélection
    if (selectedObjects.length === 0) {
      setError("Veuillez sélectionner au moins un élément ou préciser 'Autre'.");
      return false;
    }

    // Cas 2: "Autre" coché mais texte invalide
    if (isOtherChecked) {
      const trimmed = otherText.trim();
      if (trimmed.length < 3) {
        setError("Texte 'Autre' requis (3–50 caractères).");
        return false;
      }
      if (trimmed.length > 50) {
        setError("Texte 'Autre' requis (3–50 caractères).");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!session?.user?.id) return;

    setIsSubmitting(true);

    try {
      const trimmedOther = otherText.trim();
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          delivery_objects: selectedObjects,
          delivery_other_note: isOtherChecked ? trimmedOther : null,
          onboarding_step: "expertise_objects_completed",
        })
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // Analytics events
      console.log("onboarding_objects_submitted", {
        expertise,
        count: selectedObjects.length,
        has_other: isOtherChecked,
      });
      console.log("onboarding_completed_step", "expertise_objects");

      await refreshProfile();

      toast({
        title: "Préférences enregistrées",
        description: "Vos objets de livraison ont été sauvegardés.",
      });

      // Redirection vers l'étape suivante
      navigate("/onboarding/address");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer vos préférences. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/onboarding/expertise");
  };

  if (!expertise) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const objects = EXPERTISE_OBJECTS[expertise];
  const isValid = validateForm();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {EXPERTISE_LABELS[expertise]}
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Que souhaitez-vous faire livrer ?
          </h1>
          <p className="text-base text-muted-foreground">
            Sélectionnez un ou plusieurs éléments liés à votre activité.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Objects list */}
        <div className="mb-8 space-y-3">
          {objects.map((object) => {
            const isOther = object === "Autre (à préciser)";
            const isSelected = selectedObjects.includes(object);

            return (
              <div key={object}>
                <Card
                  className={`cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => handleObjectToggle(object)}
                >
                  <div className="flex items-start gap-4 p-4">
                    <Checkbox
                      id={object}
                      checked={isSelected}
                      onCheckedChange={() => handleObjectToggle(object)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={object}
                      className="flex-1 cursor-pointer text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {object}
                      {isSelected && !isOther && (
                        <Check className="ml-2 inline-block h-4 w-4 text-primary" />
                      )}
                    </Label>
                  </div>
                </Card>

                {/* Autre input */}
                {isOther && isOtherChecked && (
                  <div className="mt-3 ml-8 space-y-2">
                    <Label htmlFor="other-text" className="text-sm text-muted-foreground">
                      Précisez ce que vous souhaitez faire livrer
                    </Label>
                    <div className="relative">
                      <Input
                        id="other-text"
                        type="text"
                        placeholder="Ex: clé de local, badge, boîtier…"
                        value={otherText}
                        onChange={(e) => handleOtherTextChange(e.target.value)}
                        maxLength={50}
                        className="pr-16"
                        autoFocus
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {otherText.length}/50
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Enregistrement..." : "Continuer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
