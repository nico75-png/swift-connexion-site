import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CreateOrderButtonProps {
  className?: string;
}

const CreateOrderButton = ({ className }: CreateOrderButtonProps) => {
  return (
    <Link
      to="/espace-client/creer-commande"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#FFB800] px-5 py-3 text-sm font-semibold text-black transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB800] focus-visible:ring-offset-2", 
        "shadow-sm",
        className
      )}
    >
      <span aria-hidden>➕</span>
      Créer une commande
    </Link>
  );
};

export default CreateOrderButton;
