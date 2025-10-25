import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthProfile } from "@/providers/AuthProvider";

export default function Address() {
  const navigate = useNavigate();
  const { session } = useAuthProfile();

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }

    // Pour l'instant, redirection directe vers le dashboard
    // Cette page sera implémentée plus tard si nécessaire
    navigate("/dashboard");
  }, [session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirection...</p>
    </div>
  );
}
