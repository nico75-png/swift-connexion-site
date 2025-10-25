import Layout from "@/components/layout/Layout";

const Cookies = () => (
  <Layout>
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="mb-8">Politique de cookies</h1>
        <div className="prose prose-slate max-w-none space-y-6">
          <h2>Qu'est-ce qu'un cookie ?</h2>
          <p>Les cookies sont de petits fichiers texte stockés sur votre appareil lors de la navigation.</p>

          <h2>Cookies utilisés</h2>
          <p>Nous utilisons uniquement des cookies essentiels au fonctionnement du site et à la gestion de votre session.</p>

          <h2>Gérer vos préférences</h2>
          <p>Vous pouvez configurer votre navigateur pour refuser les cookies.</p>
        </div>
      </div>
    </section>
  </Layout>
);

export default Cookies;
