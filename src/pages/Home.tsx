import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Lock, Eye, Heart, FileText, ArrowRight, Check, Star } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Rapidité garantie",
    description: "Livraison express en moins de 2h en Île-de-France"
  },
  {
    icon: Lock,
    title: "Sécurité maximale",
    description: "Colis assuré et suivi GPS en temps réel"
  },
  {
    icon: Eye,
    title: "Suivi en temps réel",
    description: "Tracez votre commande de l'enlèvement à la livraison"
  }
];

const expertises = [
  {
    icon: Heart,
    title: "Santé & Médical",
    description: "Transport sécurisé de dispositifs médicaux et échantillons",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: Eye,
    title: "Optique",
    description: "Livraison rapide de montures et verres correcteurs",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    icon: FileText,
    title: "Juridique",
    description: "Coursier spécialisé pour documents confidentiels",
    gradient: "from-gray-600 to-gray-800"
  }
];

const pricing = [
  {
    title: "Standard",
    description: "Pour vos livraisons programmées du quotidien.",
    price: "€20 forfait 0 à 10 km",
    features: [
      "20 € pour la tranche 0 à 10 km",
      "1,50 € par kilomètre supplémentaire",
      "Délai maximum de 3 heures",
      "Assurance colis et suivi en temps réel"
    ],
    link: "/commande-sans-compte"
  },
  {
    title: "Express",
    description: "La solution rapide pour vos urgences professionnelles.",
    badge: "Populaire",
    price: "€26 forfait 0 à 10 km",
    intro: "Idéal quand chaque minute compte :",
    features: [
      "26 € pour la tranche 0 à 10 km",
      "1,70 € par kilomètre supplémentaire",
      "Délai garanti sous 2 heures",
      "Support prioritaire dédié"
    ],
    link: "/commande-sans-compte"
  },
  {
    title: "Flash Express",
    description: "Notre service le plus rapide pour les livraisons critiques.",
    price: "€32 forfait 0 à 10 km",
    intro: "Performance maximale :",
    features: [
      "32 € pour la tranche 0 à 10 km",
      "2,00 € par kilomètre supplémentaire",
      "Délai record de 45 minutes",
      "Coursier dédié et suivi premium"
    ],
    link: "/commande-sans-compte"
  }
];

const testimonials = [
  {
    name: "Marie L.",
    company: "Laboratoire Médical",
    quote: "Service impeccable ! Nos échantillons arrivent toujours à temps."
  },
  {
    name: "Thomas D.",
    company: "Cabinet d'Avocats",
    quote: "Ponctualité et discrétion. Parfait pour nos documents sensibles."
  },
  {
    name: "Sophie M.",
    company: "Opticien",
    quote: "Des tarifs transparents et un suivi en temps réel. Je recommande !"
  }
];

const Home = () => {
  return (
    <Layout>
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2400&q=80"
            alt="Vue aérienne de Paris au coucher du soleil"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">One Connexion Express</h1>
          <p className="text-xl md:text-2xl">Livraison urgente et programmée en Île-de-France</p>
          <p className="max-w-2xl text-lg text-white/90">
            Service professionnel 24/7 pour vos colis urgents. Tarifs transparents, suivi en temps réel et prise en charge immédiate par nos coursiers dédiés.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#tarifs"
              className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-blue-700"
            >
              Voir nos tarifs
            </a>
            <Link
              to="/commande-sans-compte"
              className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition duration-300 hover:bg-white hover:text-blue-600"
            >
              Commander maintenant
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="rounded-2xl border-none bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-4xl font-bold">Nos expertises sectorielles</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-xl text-gray-600">
            Des solutions de transport adaptées à chaque secteur professionnel
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {expertises.map((expertise) => (
              <article
                key={expertise.title}
                className="group overflow-hidden rounded-2xl shadow-lg transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className={`flex h-48 items-center justify-center bg-gradient-to-br ${expertise.gradient}`}>
                  <expertise.icon className="h-12 w-12 text-white" />
                </div>
                <div className="space-y-4 bg-white p-6">
                  <h3 className="text-xl font-bold">{expertise.title}</h3>
                  <p className="text-gray-600">{expertise.description}</p>
                  <Link
                    to="/expertises"
                    className="inline-flex items-center font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    En savoir plus
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-4xl font-bold">Des tarifs clairs, sans devis obligatoire</h2>
          <p className="mx-auto mb-16 max-w-3xl text-center text-xl text-gray-600">
            Tarification transparente basée sur la zone de livraison
          </p>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.title}
                className={`relative rounded-2xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  plan.badge ? "border-2 border-blue-500 shadow-xl" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute right-0 top-0 rounded-bl-2xl rounded-tr-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.title}</h3>
                <p className="mb-6 text-gray-600">{plan.description}</p>
                <div className="mb-6 text-3xl font-bold text-blue-600">{plan.price}</div>
                {plan.intro && <p className="mb-4 text-gray-600">{plan.intro}</p>}
                <ul className="mb-8 space-y-2 text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.link}
                  className={`block rounded-lg px-6 py-3 text-center font-semibold transition ${
                    plan.badge
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-700 text-white hover:bg-gray-800"
                  }`}
                >
                  Choisir ce plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">Estimez votre tarif en quelques clics</h2>
          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-gray-800 shadow-2xl">
            <form className="space-y-6">
              <div>
                <label className="mb-3 block font-semibold text-gray-700">Type de transport</label>
                <select className="w-full rounded-lg border border-gray-300 p-3 text-gray-700">
                  <option>Standard</option>
                  <option>Express</option>
                  <option>Flash Express</option>
                </select>
              </div>
              <div>
                <label className="mb-3 block font-semibold text-gray-700">Zone</label>
                <select className="w-full rounded-lg border border-gray-300 p-3 text-gray-700">
                  <option>Paris Intra-muros</option>
                  <option>Petite Couronne</option>
                  <option>Grande Couronne</option>
                </select>
              </div>
              <label className="flex items-center text-gray-700">
                <input type="checkbox" className="mr-3 rounded" />
                Livraison express (+30%)
              </label>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" type="button">
                Calculer le tarif
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">Ils nous font confiance</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-2xl border-none bg-gray-50 p-8 shadow-sm">
                <div className="mb-4 text-yellow-400">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="inline h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 italic text-gray-600">"{testimonial.quote}"</p>
                <div className="font-semibold text-gray-800">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.company}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="commander" className="bg-gradient-to-br from-gray-900 to-blue-900 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold">Prêt à commander ?</h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-white/90">
            Commencez dès maintenant ou créez un compte pour gérer toutes vos livraisons
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/commande-sans-compte"
              className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-blue-700"
            >
              Commander maintenant
            </Link>
            <Link
              to="/inscription"
              className="rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition duration-300 hover:bg-white hover:text-blue-600"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
