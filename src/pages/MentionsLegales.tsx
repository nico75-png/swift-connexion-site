import Layout from "@/components/layout/Layout";

const MentionsLegales = () => (
  <Layout>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="mb-8">Mentions légales</h1>
        <div className="prose prose-slate max-w-none space-y-6">
          <h2>Éditeur du site</h2>
          <p>One Connexion SAS - Capital social : 50 000€<br/>
          SIRET : 123 456 789 00012<br/>
          123 Avenue de Paris, 75001 Paris, France<br/>
          Tél : 01 23 45 67 89</p>

          <h2>Hébergement</h2>
          <p>Ce site est hébergé en France par un prestataire certifié.</p>

          <h2>Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de ce site est protégé par le droit d'auteur.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default MentionsLegales;
