import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, PhoneCall, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Services", href: "/#services" },
    { label: "Tarifs", href: "/#tarifs" },
    { label: "Zones", href: "/#zones" },
    { label: "Entreprise (API)", href: "/#entreprise" },
    { label: "Avis", href: "/#avis" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact" }
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      const targetHash = `#${href.split("#")[1]}`;
      return location.hash === targetHash;
    }
    return location.pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="border-b border-border/60 bg-muted/90 px-4 text-xs font-medium text-muted-foreground/90">
        <div className="container mx-auto flex h-9 items-center justify-center gap-2 text-center">
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          <span className="flex flex-wrap items-center justify-center gap-2">
            Besoin maintenant ?
            <a
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
              href="tel:{{Phone}}"
              data-event="phone_click"
            >
              Appelez {{Phone}}
            </a>
            ou
            <a
              className="inline-flex items-center gap-1 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              href="https://wa.me/{{WhatsApp}}"
              data-event="whatsapp_click"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp {{WhatsApp}}
            </a>
          </span>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-semibold text-foreground transition-opacity hover:opacity-80">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              IDF
            </span>
            <span className="hidden text-base font-semibold tracking-wide text-foreground/90 sm:inline">Livraison express Île-de-France</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  isActive(link.href) ? "text-primary" : "text-foreground/70"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="cta"
              size="default"
              asChild
              data-event="hero_cta_click"
            >
              <a href="/#simulateur">Commander une course</a>
            </Button>
          </div>

          <button
            className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="pb-4 md:hidden">
            <nav className="flex flex-col gap-2 py-2">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <Button
              variant="cta"
              size="default"
              className="w-full"
              asChild
              data-event="hero_cta_click"
            >
              <a href="/#simulateur">Commander une course</a>
            </Button>
            <div className="mt-3 flex flex-col gap-2 rounded-lg bg-muted/60 p-3 text-sm">
              <a
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                href="tel:{{Phone}}"
                data-event="phone_click"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                {{Phone}}
              </a>
              <a
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                href="https://wa.me/{{WhatsApp}}"
                data-event="whatsapp_click"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp {{WhatsApp}}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
