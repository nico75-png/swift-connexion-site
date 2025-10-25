/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  async redirects() {
    return [
      { source: "/public", destination: "/", permanent: true },
      { source: "/public/", destination: "/", permanent: true },
      { source: "/public/expertises", destination: "/expertises", permanent: true },
      { source: "/public/Tarifs", destination: "/tarifs", permanent: true },
      { source: "/public/tarifs", destination: "/tarifs", permanent: true },
      { source: "/public/FAQ", destination: "/faq", permanent: true },
      { source: "/public/faq", destination: "/faq", permanent: true },
      { source: "/public/Contact", destination: "/contact", permanent: true },
      { source: "/public/contact", destination: "/contact", permanent: true },
      { source: "/public/CommandeSansCompte", destination: "/commande-sans-compte", permanent: true },
      { source: "/public/Login", destination: "/login", permanent: true },
      { source: "/public/login", destination: "/login", permanent: true },
      { source: "/public/Register", destination: "/register", permanent: true },
      { source: "/public/register", destination: "/register", permanent: true },
      { source: "/public/ForgotPassword", destination: "/forgot-password", permanent: true },
      { source: "/public/forgot-password", destination: "/forgot-password", permanent: true },
      { source: "/public/MentionsLegales", destination: "/mentions-legales", permanent: true },
      { source: "/public/Mentions-legales", destination: "/mentions-legales", permanent: true },
      { source: "/public/mentions-legales", destination: "/mentions-legales", permanent: true },
      { source: "/public/CGV", destination: "/cgv", permanent: true },
      { source: "/public/cgv", destination: "/cgv", permanent: true },
      { source: "/public/Cookies", destination: "/cookies", permanent: true },
      { source: "/public/cookies", destination: "/cookies", permanent: true },
      { source: "/public/NotFound", destination: "/404", permanent: true },
      { source: "/public/not-found", destination: "/404", permanent: true },
      { source: "/public/PageVierge", destination: "/dashboard-client", permanent: true },
      { source: "/se-connecter", destination: "/login", permanent: true },
      { source: "/registre", destination: "/register", permanent: true },
      { source: "/mot-de-passe-oublie", destination: "/forgot-password", permanent: true },
      { source: "/admin", destination: "/dashboard-admin", permanent: true },
    ];
  },
};

module.exports = nextConfig;
