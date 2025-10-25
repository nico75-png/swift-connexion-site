import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthProfile } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Heart, Eye, FileText, Calendar } from "lucide-react";

type Expertise = "optique" | "juridique" | "medical" | "evenementiel";

const EXPERTISES: Array<{
  value: Expertise;
  label: string;
  description: string;
  icon: typeof Heart;
  gradient: string;
}> = [
  {
    value: "medical",
    label: "Santé & Médical",
    description: "Transport sécurisé de dispositifs médicaux et échantillons",
    icon: Heart,
    gradient: "from-blue-500 to-purple-600",
  },
  {
    value: "optique",
    label: "Optique",
    description: "Livraison rapide de montures et verres correcteurs",
    icon: Eye,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    value: "juridique",
    label: "Juridique",
    description: "Coursier spécialisé pour documents confidentiels",
    icon: FileText,
    gradient: "from-gray-600 to-gray-800",
  },
  {
    value: "evenementiel",
    label: "Événementiel",
    description: "Livraison pour vos événements et manifestations",
    icon: Calendar,
    gradient: "from-orange-500 to-red-600",
  },
];

export default function Expertise() {
  const navigate = useNavigate();
  const { session, profile, refreshProfile } = useAuthProfile();
  const [selectedExpertise, setSelectedExpertise] = useState<Expertise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
    navigate("/auth");
      return;
    }

    // Si l'expertise est déjà sélectionnée, pré-remplir
    if (profile?.expertise) {
      setSelectedExpertise(profile.expertise as Expertise);
    }
  }, [session, profile, navigate]);

  const handleExpertiseSelect = (expertise: Expertise) => {
    setSelectedExpertise(expertise);
  };

  const handleSubmit = async () => {
    if (!selectedExpertise || !session?.user?.id) return;

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          expertise: selectedExpertise,
          onboarding_step: "expertise_selected",
        })
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // Analytics event
      console.log("onboarding_expertise_selected", { expertise: selectedExpertise });

      await refreshProfile();

      // Redirection vers l'étape suivante
      navigate("/onboarding/delivery-objects");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre expertise. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Quelle est votre expertise ?
          </h1>
          <p className="text-base text-muted-foreground">
            Sélectionnez votre domaine d'activité principal.
          </p>
        </div>

        {/* Expertises grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {EXPERTISES.map((expertise) => {
            const Icon = expertise.icon;
            const isSelected = selectedExpertise === expertise.value;

            return (
              <Card
                key={expertise.value}
                className={`group cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg ${
                  isSelected ? "border-primary bg-primary/5 shadow-lg" : "border-border"
                }`}
                onClick={() => handleExpertiseSelect(expertise.value)}
              >
                <div className="p-6">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${expertise.gradient}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{expertise.label}</h3>
                  <p className="text-sm text-muted-foreground">{expertise.description}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action */}
        <div className="flex justify-center">
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedExpertise || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Enregistrement..." : "Continuer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
