import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import Layout from "@/components/layout/Layout";

const Contact = () => {
  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-background to-primary/5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/90 p-6 shadow-large backdrop-blur-xl supports-[backdrop-filter]:bg-card/75 sm:p-10">
              <span className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-secondary/20 blur-3xl" />
              <span className="pointer-events-none absolute -bottom-16 right-0 h-56 w-56 translate-x-1/3 rounded-full bg-primary/15 blur-3xl" />
              <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                <ContactInfo />
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
