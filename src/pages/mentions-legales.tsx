import Layout from "@/components/layout/Layout";

const MentionsLegales = () => (
  <Layout>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="mb-8">Mentions légales</h1>
        <div className="prose prose-slate max-w-none space-y-6">
          <h2>Éditeur du site</h2>
          <p>
            One Connexion SAS - Capital social : 50 000€<br />
            SIRET : 902 112 334 00045<br />
            18 avenue des Transports, 75010 Paris, France<br />
            Contact : <a href="mailto:contact@one-connexion.com">contact@one-connexion.com</a><br />
            Tél : 01 23 45 67 89
          </p>

          <h2>Hébergement</h2>
          <p>Ce site est hébergé en France par un prestataire certifié.</p>

          <h2>Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de ce site est protégé par le droit d'auteur.</p>
          <p>© 2025 Une Connexion. Tous droits réservés.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default MentionsLegales;
