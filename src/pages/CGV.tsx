import Layout from "@/components/layout/Layout";

const CGV = () => (
  <Layout>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="mb-8">Conditions Générales de Vente</h1>
        <div className="prose prose-slate max-w-none space-y-6">
          <h2>Article 1 - Objet</h2>
          <p>Les présentes CGV régissent les relations entre One Connexion et ses clients professionnels.</p>

          <h2>Article 2 - Tarifs</h2>
          <p>Les tarifs sont ceux en vigueur au moment de la commande. Ils sont indiqués TTC.</p>

          <h2>Article 3 - Responsabilité</h2>
          <p>One Connexion souscrit une assurance couvrant les dommages jusqu'à 500€ par colis.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default CGV;
