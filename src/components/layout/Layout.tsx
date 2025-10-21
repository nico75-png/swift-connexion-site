import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <a
        href="https://wa.me/{{WhatsApp}}"
        data-event="whatsapp_click"
        aria-label="Contacter le dispatch sur WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 md:hidden"
      >
        WhatsApp dispatch
      </a>
      <Footer />
    </div>
  );
};

export default Layout;
