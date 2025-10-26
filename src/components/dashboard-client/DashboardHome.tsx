import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, FileText, MessageCircle } from "lucide-react";
import AnimatedSection from "@/components/dashboard-client/AnimatedSection";
import ClientActivityChart from "./ClientActivityChart";
import AnimatedCounter from "./AnimatedCounter";

const indicatorContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.12,
    },
  },
};

const indicatorItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const staggeredListVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, Clara Dupont 👋
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Suivez vos commandes, les livraisons réussies et vos délais moyens en toute clarté.
        </p>
      </AnimatedSection>

      {/* Vos indicateurs du mois */}
      <AnimatedSection delay={0.08} className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Vos indicateurs du mois</h2>
            <p className="text-sm text-slate-600">
              Visualisez l'avancement de vos commandes et livraisons pour le mois en cours.
            </p>
          </div>
          <span className="text-xs text-blue-600">Mise à jour à16:24</span>
        </div>

        {/* Apparition en cascade des indicateurs principaux */}
        <AnimatedSection
          delay={0.12}
          className="grid gap-4 md:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={indicatorContainerVariants}
        >
          {/* Vos commandes du mois */}
          <motion.div
            /* Soulève la carte au survol pour un feedback tangible */
            variants={indicatorItemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <Card className="h-full border-none bg-white/90 shadow-[0_18px_35px_-30px_rgba(30,41,59,0.45)] transition-all duration-300 ease-out">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Vos commandes du mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <AnimatedCounter
                      value={117}
                      className="text-4xl font-bold text-slate-900"
                      delay={0.1}
                    />
                    <span className="text-sm text-slate-500">/ 122 objectif</span>
                  </div>
                  <p className="text-sm text-green-600">+12 % vs. mois dernier</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Commandes livrées avec succès */}
          <motion.div
            /* Soulève la carte au survol pour un feedback tangible */
            variants={indicatorItemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <Card className="h-full border-none bg-white/90 shadow-[0_18px_35px_-30px_rgba(30,41,59,0.45)] transition-all duration-300 ease-out">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Commandes livrées avec succès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={87} className="h-2" />
                  <p className="text-sm text-slate-600">
                    87 % atteints · cible 95 %
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Temps moyen de livraison */}
          <motion.div
            /* Soulève la carte au survol pour un feedback tangible */
            variants={indicatorItemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <Card className="h-full border-none bg-white/90 shadow-[0_18px_35px_-30px_rgba(30,41,59,0.45)] transition-all duration-300 ease-out">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Temps moyen de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">30,1</span>
                    <span className="text-sm text-slate-500">min</span>
                  </div>
                  <p className="text-sm text-blue-600">3,3 min vs. mois dernier</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatedSection>
      </AnimatedSection>

      {/* Activité mensuelle & Livrées vs En attente */}
      <AnimatedSection delay={0.16} className="grid gap-4 lg:grid-cols-3">
        {/* Activité mensuelle */}
        <ClientActivityChart />

        {/* Livrées vs En attente */}
        <AnimatedSection delay={0.22} className="h-full">
          <Card className="h-full border-none bg-white/95 shadow-[0_18px_35px_-30px_rgba(30,41,59,0.45)] transition-all duration-300 ease-out">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Livrées vs En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="relative h-48 w-48">
                  <svg viewBox="0 0 100 100" className="-rotate-90 transform">
                    {/* Dessine progressivement le donut pour matérialiser la répartition */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 25.12 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="12"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 215.52 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.18 }}
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm text-slate-600">Livrées</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-600">En attente</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">55</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </AnimatedSection>

      {/* Actions rapides & Activités récentes */}
      <AnimatedSection delay={0.24} className="grid gap-4 lg:grid-cols-2">
        {/* Actions rapides */}
        <AnimatedSection delay={0.28} className="h-full">
          <Card className="h-full border-none bg-white/95 shadow-[0_18px_35px_-30px_rgba(30,41,59,0.45)] transition-all duration-300 ease-out">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Actions rapides
              </CardTitle>
              <p className="text-sm text-slate-600">
                Accédez immédiatement aux fonctionnalités clés pour suivre, facturer et échanger avec vos clients.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Pulsation subtile sur les actions clés pour inviter au clic */}
                {[{
                  icon: <MapPin className="h-5 w-5" />, label: "Suivi", className: "bg-blue-600 hover:bg-blue-700"
                }, {
                  icon: <FileText className="h-5 w-5" />, label: "Factures", className: "bg-green-600 hover:bg-green-700"
                }, {
                  icon: <MessageCircle className="h-5 w-5" />, label: "Messagerie", className: "bg-purple-600 hover:bg-purple-700"
                }].map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.06, duration: 0.35, ease: "easeOut" }}
                    whileHover={{ scale: 1.04, translateY: -3 }}
                    whileTap={{ scale: 0.96 }}
                    className="h-full"
                  >
                    <Button className={`h-24 flex-col gap-2 transition-all duration-300 ease-out ${action.className}`}>
                      {action.icon}
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Activités récentes */}
        <AnimatedSection delay={0.3} className="h-full">
          <Card className="h-full border-none bg-white/95 shadow-[0_18px_35px_-30px_rgba(30,41,59,0.45)] transition-all duration-300 ease-out">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Activités récentes
                </CardTitle>
                <Button variant="link" className="text-xs text-blue-600 transition-all duration-300 ease-out">
                  Mis à jour en direct
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                Un aperçu instantané des dernières interactions.
              </p>
            </CardHeader>
            <CardContent>
              {/* Liste d'activités animée pour souligner la temporalité des événements */}
              <AnimatedSection
                delay={0.02}
                className="space-y-3"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 },
                  },
                }}
              >
                {[{
                  title: "Commande #SC-2048",
                  description: "Livrée à temps avec signature électronique confirmée.",
                }, {
                  title: "Nouvelle facture disponible",
                  description: "Facture de mars générée et envoyée par email.",
                }, {
                  title: "Message de Laura Martin",
                  description: "Question concernant la prise en charge express.",
                }].map((item) => (
                  <motion.div
                    key={item.title}
                    variants={staggeredListVariants}
                    whileHover={{ translateY: -2, scale: 1.01 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="rounded-lg border border-slate-200 bg-white/95 p-3 transition-all duration-300 ease-out hover:shadow-[0_12px_25px_-20px_rgba(30,41,59,0.4)]"
                  >
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </motion.div>
                ))}
              </AnimatedSection>
              <Button variant="link" className="mt-3 w-full text-xs text-blue-600">
                Voir plus
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      </AnimatedSection>
    </div>
  );
};

export default DashboardHome;
