"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Receipt,
  MessageSquare,
  Settings,
  HelpCircle,
  User,
  Search,
  Bell,
  Menu,
  X,
  Package,
  Truck,
  Clock,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Download,
  CreditCard,
  Plus,
  Eye,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Section =
  | "dashboard"
  | "commandes"
  | "suivi"
  | "factures"
  | "messages"
  | "parametres"
  | "aide";

const NAVIGATION_ITEMS = [
  { label: "Tableau de bord", icon: LayoutDashboard, value: "dashboard" as Section },
  { label: "Commandes", icon: ShoppingBag, value: "commandes" as Section },
  { label: "Suivi", icon: MapPin, value: "suivi" as Section },
  { label: "Factures", icon: Receipt, value: "factures" as Section },
  { label: "Messages", icon: MessageSquare, value: "messages" as Section },
  { label: "Paramètres", icon: Settings, value: "parametres" as Section },
  { label: "Aide", icon: HelpCircle, value: "aide" as Section },
];

const DashboardClient = () => {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50">
      {/* Sidebar sombre */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-neutral-900 transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
            <h1 className="text-xl font-bold text-gray-100">Swift Connexion</h1>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Profil client */}
          <div className="border-b border-neutral-800 px-6 py-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-neutral-700">
                <AvatarImage src="" alt="Client" />
                <AvatarFallback className="bg-neutral-700 text-gray-100">CL</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-100">Client Swift</p>
                <p className="text-xs text-gray-400">client@swift.com</p>
                <Badge className="mt-1 bg-green-600 text-xs text-white hover:bg-green-700">
                  Connecté
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {NAVIGATION_ITEMS.map(({ label, icon: Icon, value }) => {
                const isActive = activeSection === value;
                return (
                  <button
                    key={value}
                    onClick={() => {
                      setActiveSection(value);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-neutral-800 hover:text-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer sidebar */}
          <div className="border-t border-neutral-800 px-6 py-4">
            <p className="text-xs text-gray-500">© 2025 Swift Connexion</p>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 border-b border-neutral-200 bg-white px-4 py-3 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Rechercher une commande, un trajet..."
              className="w-full rounded-2xl border-neutral-300 bg-neutral-50 pl-10 pr-4"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative text-neutral-700">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <Avatar className="h-9 w-9 border border-neutral-300">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-neutral-200 text-neutral-700">CL</AvatarFallback>
          </Avatar>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === "dashboard" && <DashboardSection />}
              {activeSection === "commandes" && <CommandesSection />}
              {activeSection === "suivi" && <SuiviSection />}
              {activeSection === "factures" && <FacturesSection />}
              {activeSection === "messages" && <MessagesSection />}
              {activeSection === "parametres" && <ParametresSection />}
              {activeSection === "aide" && <AideSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// 🟣 Tableau de bord Section
const DashboardSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Tableau de bord</h1>
      <p className="mt-1 text-sm text-neutral-600">Vue d'ensemble de votre activité</p>
    </div>

    {/* Alert profil incomplet */}
    <Alert className="border-amber-300 bg-amber-50">
      <AlertTitle className="text-amber-800">Profil incomplet</AlertTitle>
      <AlertDescription className="text-amber-700">
        Complétez votre profil pour bénéficier de toutes les fonctionnalités.
      </AlertDescription>
    </Alert>

    {/* Stats cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600">Commandes</CardTitle>
          <Package className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-800">24</div>
          <p className="text-xs text-neutral-500">+12% ce mois</p>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600">Taux de livraison</CardTitle>
          <Truck className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-800">98.5%</div>
          <p className="text-xs text-neutral-500">+2% ce mois</p>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600">Montant consommé</CardTitle>
          <DollarSign className="h-5 w-5 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-800">2,450€</div>
          <p className="text-xs text-neutral-500">Ce mois</p>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-neutral-600">Délai moyen</CardTitle>
          <Clock className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-800">45 min</div>
          <p className="text-xs text-neutral-500">-5 min ce mois</p>
        </CardContent>
      </Card>
    </div>

    {/* Graphique d'activité */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Activité mensuelle</CardTitle>
        <CardDescription>Évolution de vos commandes</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-xl" />
      </CardContent>
    </Card>

    {/* Actions rapides */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Button className="h-auto flex-col gap-2 rounded-2xl bg-blue-600 py-6 hover:bg-blue-700">
            <MapPin className="h-6 w-6" />
            <span>Suivi en direct</span>
          </Button>
          <Button className="h-auto flex-col gap-2 rounded-2xl bg-green-600 py-6 hover:bg-green-700">
            <Receipt className="h-6 w-6" />
            <span>Mes factures</span>
          </Button>
          <Button className="h-auto flex-col gap-2 rounded-2xl bg-purple-600 py-6 hover:bg-purple-700">
            <MessageSquare className="h-6 w-6" />
            <span>Messagerie</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// 🔵 Commandes Section
const CommandesSection = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800">Commandes</h1>
        <p className="mt-1 text-sm text-neutral-600">Gérez vos livraisons</p>
      </div>
      <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" />
        Créer une commande
      </Button>
    </div>

    {/* Filtres */}
    <Card className="border-neutral-200 bg-white">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="rounded-2xl bg-neutral-100">
              <TabsTrigger value="all" className="rounded-xl">Toutes</TabsTrigger>
              <TabsTrigger value="progress" className="rounded-xl">En cours</TabsTrigger>
              <TabsTrigger value="delivered" className="rounded-xl">Livrées</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-xl">En attente</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Rechercher par numéro, trajet..."
              className="rounded-2xl border-neutral-300 pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Tableau de commandes */}
    <Card className="border-neutral-200 bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-200">
              <TableHead>N°</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="border-neutral-200">
                <TableCell className="font-medium">#CMD{1000 + i}</TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">Express</Badge>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Badge className="rounded-full bg-green-100 text-green-700">En cours</Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 rounded-xl">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 rounded-xl">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

// 🟢 Suivi Section
const SuiviSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Suivi en temps réel</h1>
      <p className="mt-1 text-sm text-neutral-600">Suivez vos livraisons en direct</p>
    </div>

    {/* Carte GPS */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Position actuelle</CardTitle>
        <CardDescription>Localisation GPS du chauffeur</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </CardContent>
    </Card>

    {/* Timeline */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Chronologie de livraison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <ChevronRight className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// 🟠 Factures Section
const FacturesSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Factures</h1>
      <p className="mt-1 text-sm text-neutral-600">Consultez et téléchargez vos factures</p>
    </div>

    <Card className="border-neutral-200 bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-200">
              <TableHead>N° Facture</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i} className="border-neutral-200">
                <TableCell className="font-medium">#FAC{2000 + i}</TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="font-semibold">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Badge className="rounded-full bg-green-100 text-green-700">Payée</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Alert className="border-blue-300 bg-blue-50">
      <AlertDescription className="text-blue-800">
        Aucune facture en attente de paiement.
      </AlertDescription>
    </Alert>
  </div>
);

// 🔴 Messages Section
const MessagesSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Messages</h1>
      <p className="mt-1 text-sm text-neutral-600">Communiquez avec nos équipes</p>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {/* Liste conversations */}
      <Card className="border-neutral-200 bg-white lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-neutral-800">Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-neutral-200">S{i}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zone de chat */}
      <Card className="border-neutral-200 bg-white lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-neutral-800">Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl bg-neutral-200 px-4 py-3">
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-xs rounded-2xl bg-blue-600 px-4 py-3">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl bg-neutral-200 px-4 py-3">
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Input
              placeholder="Écrire un message..."
              className="rounded-2xl border-neutral-300"
              disabled
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// ⚙️ Paramètres Section
const ParametresSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Paramètres</h1>
      <p className="mt-1 text-sm text-neutral-600">Gérez votre compte et vos préférences</p>
    </div>

    {/* Profil */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" placeholder="Jean Dupont" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jean@example.com" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" placeholder="+33 6 12 34 56 78" className="rounded-xl" />
          </div>
        </div>
        <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700">
          Modifier le profil
        </Button>
      </CardContent>
    </Card>

    {/* Préférences */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Préférences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-800">Notifications email</p>
            <p className="text-sm text-neutral-500">Recevoir les mises à jour par email</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-800">Notifications SMS</p>
            <p className="text-sm text-neutral-500">Recevoir les alertes par SMS</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-800">Mode sombre</p>
            <p className="text-sm text-neutral-500">Activer le thème sombre</p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  </div>
);

// 🧰 Aide Section
const AideSection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-neutral-800">Aide & Support</h1>
      <p className="mt-1 text-sm text-neutral-600">Besoin d'assistance ? Nous sommes là pour vous aider</p>
    </div>

    {/* Contact support */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Contacter le support</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Button className="h-auto flex-col gap-3 rounded-2xl bg-blue-600 py-8 hover:bg-blue-700">
            <Phone className="h-8 w-8" />
            <div>
              <p className="font-semibold">Par téléphone</p>
              <p className="text-sm">01 23 45 67 89</p>
            </div>
          </Button>
          <Button className="h-auto flex-col gap-3 rounded-2xl bg-green-600 py-8 hover:bg-green-700">
            <Mail className="h-8 w-8" />
            <div>
              <p className="font-semibold">Par email</p>
              <p className="text-sm">support@swift.com</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* FAQ */}
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-800">Questions fréquentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-neutral-200 p-4">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default DashboardClient;
