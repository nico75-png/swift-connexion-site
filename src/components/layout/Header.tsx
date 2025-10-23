import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthProfile } from "@/providers/AuthProvider";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shouldShowStickyCTA, setShouldShowStickyCTA] = useState(false);
  const { session } = useAuthProfile();
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const evaluateStickyVisibility = () => {
      setShouldShowStickyCTA(window.innerHeight > 600);
    };

    evaluateStickyVisibility();
    window.addEventListener("resize", evaluateStickyVisibility);

    return () => window.removeEventListener("resize", evaluateStickyVisibility);
  }, []);

  const userState = session ? "logged" : "guest";

  const navLinks = useMemo(
    () => [
      { label: "Accueil", href: "/" },
      { label: "Mon espace", href: "/espace-client" },
      { label: "Expertises", href: "/expertises" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
    [],
  );

  const isActive = (href: string) => location.pathname === href;

  const handleCommanderClick = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("analytics:cta_commander_header", {
        detail: {
          page: location.pathname,
          timestamp: new Date().toISOString(),
          user_state: userState,
        },
      }),
    );
  }, [location.pathname, userState]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">One Connexion</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-smooth hover:text-primary",
                  isActive(link.href) ? "text-primary" : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Button variant="outline" size="default" asChild>
                <Link to="/espace-client">Mon espace</Link>
              </Button>
            ) : (
              <Button variant="outline" size="default" asChild>
                <Link to="/connexion">Se connecter</Link>
              </Button>
            )}
            <Button
              variant="default"
              size="default"
              asChild
            >
              <Link
                to="/commande-sans-compte"
                data-analytics-id="cta_commander_header"
                data-analytics-page={location.pathname}
                data-analytics-user-state={userState}
                onClick={handleCommanderClick}
              >
                Commander une course
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-lg p-2 hover:bg-muted transition-smooth"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-3 mb-4">
              <Link
                to="/commande-sans-compte"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCommanderClick();
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground bg-primary shadow-soft hover:bg-primary/90 transition-smooth"
                data-analytics-id="cta_commander_header"
                data-analytics-page={location.pathname}
                data-analytics-user-state={userState}
              >
                Commander une course
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-smooth",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground/80"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 px-4">
              {session ? (
                <Button variant="outline" size="default" className="w-full" asChild>
                  <Link to="/espace-client" onClick={() => setMobileMenuOpen(false)}>
                    Mon espace
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="default" className="w-full" asChild>
                  <Link to="/connexion" onClick={() => setMobileMenuOpen(false)}>
                    Se connecter
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      {shouldShowStickyCTA && location.pathname !== "/commande-sans-compte" && (
        <div className="md:hidden fixed inset-x-4 bottom-4 z-40">
          <Button
            variant="default"
            size="default"
            className="w-full shadow-large"
            asChild
          >
            <Link
              to="/commande-sans-compte"
              data-analytics-id="cta_commander_header"
              data-analytics-page={location.pathname}
              data-analytics-user-state={userState}
              onClick={handleCommanderClick}
            >
              Commander une course
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
