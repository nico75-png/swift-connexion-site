import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Package,
  PhoneCall,
  Mail,
  Clock8,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Expertises", href: "/expertises" },
    { label: "Tarifs", href: "/tarifs" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="hidden border-b border-primary/15 bg-primary text-primary-foreground/90 md:block">
        <div className="container mx-auto flex h-10 items-center justify-between px-4 text-xs font-medium">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <Clock8 className="h-3.5 w-3.5" />
              24/7 pour vos urgences professionnelles
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <a href="mailto:contact@oneconnexion.fr" className="hover:text-white transition-smooth">
                contact@oneconnexion.fr
              </a>
            </span>
          </div>
          <a href="tel:+33123456789" className="inline-flex items-center gap-2 hover:text-white transition-smooth">
            <PhoneCall className="h-3.5 w-3.5" /> 01 23 45 67 89
          </a>
        </div>
      </div>
      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-1 transition-smooth hover:bg-muted/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-medium">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-primary">One Connexion</span>
                <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
                  Express Logistics
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-2 rounded-full border border-border/80 bg-white/70 px-1 py-1 shadow-soft backdrop-blur md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-smooth",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="default" asChild className="rounded-full px-5">
                <Link to="/tarifs" className="inline-flex items-center gap-1">
                  Nos tarifs
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="cta" size="default" asChild className="rounded-full px-6">
                <Link to="/commande-sans-compte">Commander une course</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden rounded-xl border border-border/60 p-2 text-primary transition-smooth hover:border-primary hover:bg-primary/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-6">
              <nav className="mb-4 mt-2 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-sm font-semibold transition-smooth",
                      isActive(link.href)
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-transparent bg-white/80 text-foreground/80 shadow-soft hover:border-primary/15 hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3">
                <Button variant="cta" size="default" className="w-full rounded-xl" asChild>
                  <Link to="/commande-sans-compte" onClick={() => setMobileMenuOpen(false)}>
                    Commander une course
                  </Link>
                </Button>
                <Button variant="ghost" size="default" className="w-full rounded-xl border border-border/70" asChild>
                  <Link to="/connexion" onClick={() => setMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
