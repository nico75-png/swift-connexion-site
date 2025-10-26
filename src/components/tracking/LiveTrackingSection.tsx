import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

import ActiveOrderPanel from "./ActiveOrderPanel";
import ActiveOrdersList from "./ActiveOrdersList";
import ActiveSummaryBar, { type SummaryCounts } from "./ActiveSummaryBar";
import OrderDetailsSlideOver from "./OrderDetailsSlideOver";
import TrackingMap from "./TrackingMap";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type TrackingStatus = "En transit" | "En attente" | "Livrée";

export type Coordinate = {
  lat: number;
  lng: number;
};

type DriverInfo = {
  name: string;
  avatar: string;
  vehicle: string;
  licensePlate: string;
  phone: string;
};

export type TrackingMessage = {
  id: string;
  author: "client" | "driver";
  content: string;
  timestamp: string;
};

type ContactInfo = {
  email: string;
  phone: string;
};

export type TrackingOrder = {
  id: string;
  code: string;
  status: TrackingStatus;
  driver: DriverInfo;
  eta: string;
  origin: string;
  destination: string;
  packages: string;
  color: string;
  route: Coordinate[];
  driverPosition: Coordinate;
  clientPosition: Coordinate;
  progress: number;
  totalDistanceKm: number;
  distanceRemainingKm: number;
  lastUpdateAt: number;
  contact: ContactInfo;
  messages: TrackingMessage[];
};

type RawOrder = Omit<TrackingOrder, "totalDistanceKm" | "distanceRemainingKm" | "driverPosition" | "progress" | "lastUpdateAt"> & {
  progress: number;
  driverPosition?: Coordinate;
  lastUpdateAt?: number;
};

const INITIAL_ORDERS: RawOrder[] = [
  {
    id: "order-1",
    code: "CMD-2025-483",
    status: "En transit",
    driver: {
      name: "Amadou Diallo",
      avatar: "🚚",
      vehicle: "Renault Master E-Tech",
      licensePlate: "AZ-458-KL",
      phone: "+33 6 45 89 77 21",
    },
    eta: "16h10",
    origin: "HUB Paris Nord",
    destination: "Pharmacie Lafayette, 10 Rue Oberkampf",
    packages: "22 colis médicaux, signature requise",
    color: "#2563EB",
    route: [
      { lat: 48.8675, lng: 2.3332 },
      { lat: 48.8701, lng: 2.3498 },
      { lat: 48.8725, lng: 2.3631 },
      { lat: 48.8752, lng: 2.3786 },
    ],
    driverPosition: { lat: 48.8701, lng: 2.3498 },
    clientPosition: { lat: 48.8621, lng: 2.3795 },
    progress: 52,
    lastUpdateAt: Date.now() - 60_000,
    contact: {
      email: "logistique@swift.fr",
      phone: "+33 1 45 22 33 90",
    },
    messages: [
      {
        id: "m-1",
        author: "driver",
        content: "Chargement terminé, départ dans 2 minutes.",
        timestamp: "15:32",
      },
      {
        id: "m-2",
        author: "client",
        content: "Merci, n'hésitez pas à prévenir 10 min avant l'arrivée.",
        timestamp: "15:34",
      },
    ],
  },
  {
    id: "order-2",
    code: "CMD-2025-517",
    status: "En transit",
    driver: {
      name: "Clémence Morel",
      avatar: "🚛",
      vehicle: "Mercedes eSprinter",
      licensePlate: "BY-912-FS",
      phone: "+33 6 18 92 11 05",
    },
    eta: "16h35",
    origin: "Centre de tri Montreuil",
    destination: "Boutique UrbanMode, 22 Rue du Faubourg",
    packages: "8 cartons textiles, fragile",
    color: "#7C3AED",
    route: [
      { lat: 48.853, lng: 2.29 },
      { lat: 48.861, lng: 2.312 },
      { lat: 48.866, lng: 2.337 },
      { lat: 48.872, lng: 2.364 },
    ],
    driverPosition: { lat: 48.861, lng: 2.312 },
    clientPosition: { lat: 48.878, lng: 2.381 },
    progress: 34,
    lastUpdateAt: Date.now() - 120_000,
    contact: {
      email: "commandes@swift.fr",
      phone: "+33 1 88 20 55 80",
    },
    messages: [
      {
        id: "m-3",
        author: "driver",
        content: "Trafic dense sur le périphérique, j'emprunte une déviation.",
        timestamp: "15:28",
      },
    ],
  },
  {
    id: "order-3",
    code: "CMD-2025-562",
    status: "En attente",
    driver: {
      name: "Julien Charrier",
      avatar: "🚚",
      vehicle: "Peugeot e-Expert",
      licensePlate: "GD-701-LM",
      phone: "+33 6 55 11 21 65",
    },
    eta: "17h05",
    origin: "Entrepôt Vitry-sur-Seine",
    destination: "Clinique du Parc, Villejuif",
    packages: "12 colis pharmaceutiques",
    color: "#F97316",
    route: [
      { lat: 48.804, lng: 2.4 },
      { lat: 48.814, lng: 2.43 },
      { lat: 48.823, lng: 2.45 },
    ],
    driverPosition: { lat: 48.804, lng: 2.4 },
    clientPosition: { lat: 48.812, lng: 2.36 },
    progress: 0,
    lastUpdateAt: Date.now() - 1_800_000,
    contact: {
      email: "dispatch@swift.fr",
      phone: "+33 1 76 30 42 12",
    },
    messages: [],
  },
  {
    id: "order-4",
    code: "CMD-2025-421",
    status: "Livrée",
    driver: {
      name: "Samira Boumediene",
      avatar: "🚚",
      vehicle: "Nissan Townstar",
      licensePlate: "FB-119-DQ",
      phone: "+33 6 42 92 75 09",
    },
    eta: "14h20",
    origin: "HUB Paris Est",
    destination: "Atelier Artisan, Vincennes",
    packages: "5 caisses matériaux",
    color: "#0EA5E9",
    route: [
      { lat: 48.8584, lng: 2.3376 },
      { lat: 48.852, lng: 2.369 },
    ],
    driverPosition: { lat: 48.852, lng: 2.369 },
    clientPosition: { lat: 48.845, lng: 2.425 },
    progress: 100,
    lastUpdateAt: Date.now() - 7_200_000,
    contact: {
      email: "support@swift.fr",
      phone: "+33 1 74 11 62 03",
    },
    messages: [],
  },
];

const haversineKm = (a: Coordinate, b: Coordinate) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const aa = sinLat * sinLat + sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));

  return R * c;
};

const computeRouteDistance = (route: Coordinate[]) => {
  if (route.length < 2) return 0;
  return route.slice(0, -1).reduce((distance, point, index) => {
    const next = route[index + 1];
    return distance + haversineKm(point, next);
  }, 0);
};

const interpolateRoutePosition = (route: Coordinate[], progress: number) => {
  if (route.length === 0) return { lat: 0, lng: 0 };

  const cappedProgress = Math.min(Math.max(progress, 0), 100);
  const total = computeRouteDistance(route);
  if (total === 0) return route[route.length - 1];

  const targetDistance = (cappedProgress / 100) * total;
  let cumulative = 0;

  for (let index = 0; index < route.length - 1; index += 1) {
    const start = route[index];
    const end = route[index + 1];
    const segmentDistance = haversineKm(start, end);

    if (cumulative + segmentDistance >= targetDistance) {
      const ratio = (targetDistance - cumulative) / segmentDistance;
      return {
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio,
      };
    }

    cumulative += segmentDistance;
  }

  return route[route.length - 1];
};

const computeProgressFromPosition = (route: Coordinate[], position: Coordinate) => {
  if (route.length === 0) return 0;

  let cumulative = 0;
  let travelled = 0;
  for (let index = 0; index < route.length - 1; index += 1) {
    const start = route[index];
    const end = route[index + 1];
    const segmentDistance = haversineKm(start, end);

    const segmentVector = { lat: end.lat - start.lat, lng: end.lng - start.lng };
    const positionVector = { lat: position.lat - start.lat, lng: position.lng - start.lng };
    const segmentLengthSquared = segmentVector.lat ** 2 + segmentVector.lng ** 2;
    const projection = segmentLengthSquared === 0 ? 0 :
      ((positionVector.lat * segmentVector.lat + positionVector.lng * segmentVector.lng) / segmentLengthSquared);
    const clampedProjection = Math.min(Math.max(projection, 0), 1);

    const projectedPoint: Coordinate = {
      lat: start.lat + segmentVector.lat * clampedProjection,
      lng: start.lng + segmentVector.lng * clampedProjection,
    };

    const distanceToProjection = haversineKm(start, projectedPoint);
    travelled = cumulative + distanceToProjection;

    if (projection >= 0 && projection <= 1) {
      break;
    }

    cumulative += segmentDistance;
  }

  const totalDistance = computeRouteDistance(route);
  if (totalDistance === 0) return 0;
  return Math.min(100, Math.max(0, (travelled / totalDistance) * 100));
};

const enrichOrder = (order: RawOrder): TrackingOrder => {
  const path = [...order.route, order.clientPosition];
  const totalDistanceKm = computeRouteDistance(path);
  const sanitizedProgress = Math.min(Math.max(order.progress, 0), 100);
  const driverPosition = order.driverPosition ?? interpolateRoutePosition(path, sanitizedProgress);
  const progress = sanitizedProgress;
  const distanceTravelled = (progress / 100) * totalDistanceKm;
  const distanceRemainingKm = Math.max(totalDistanceKm - distanceTravelled, 0);

  return {
    ...order,
    driverPosition,
    totalDistanceKm,
    distanceRemainingKm,
    progress,
    lastUpdateAt: order.lastUpdateAt ?? Date.now(),
  };
};

const formatRelativeTime = (timestamp: number) => {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 5) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `il y a ${hours} h`;
};

export type OnPositionUpdate = (orderId: string, coordinates: Coordinate) => void;

export const useLiveTrackingStore = () => {
  const [orders, setOrders] = useState<TrackingOrder[]>(() => INITIAL_ORDERS.map(enrichOrder));
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => {
    const firstActive = INITIAL_ORDERS.find((order) => order.status === "En transit");
    return firstActive?.id ?? null;
  });
  const [lastRefreshAt, setLastRefreshAt] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const summary: SummaryCounts = useMemo(
    () => ({
      inTransit: orders.filter((order) => order.status === "En transit").length,
      waiting: orders.filter((order) => order.status === "En attente").length,
      deliveredToday: orders.filter((order) => order.status === "Livrée").length,
    }),
    [orders],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = window.setInterval(() => {
      setOrders((previous) =>
        previous.map((order) => {
          if (order.status !== "En transit") {
            return order;
          }

          if (order.progress >= 99.5) {
            return {
              ...order,
              progress: 100,
              distanceRemainingKm: 0,
              status: "Livrée",
              driverPosition: order.clientPosition,
              lastUpdateAt: Date.now(),
            };
          }

          const increment = Math.random() * 5 + 2.5;
          const nextProgress = Math.min(100, order.progress + increment);
          const path = [...order.route, order.clientPosition];
          const nextPosition = interpolateRoutePosition(path, nextProgress);
          const travelled = (nextProgress / 100) * order.totalDistanceKm;
          const distanceRemainingKm = Math.max(order.totalDistanceKm - travelled, 0);

          return {
            ...order,
            progress: nextProgress,
            driverPosition: nextPosition,
            distanceRemainingKm,
            lastUpdateAt: Date.now(),
          };
        }),
      );
      setLastRefreshAt(Date.now());
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const onPositionUpdate: OnPositionUpdate = useCallback((orderId, coordinates) => {
    setOrders((previous) =>
      previous.map((order) => {
        if (order.id !== orderId) return order;
        const path = [...order.route, order.clientPosition];
        const nextProgress = computeProgressFromPosition(path, coordinates);
        const travelled = (nextProgress / 100) * order.totalDistanceKm;
        const distanceRemainingKm = Math.max(order.totalDistanceKm - travelled, 0);

        return {
          ...order,
          driverPosition: coordinates,
          progress: nextProgress,
          distanceRemainingKm,
          lastUpdateAt: Date.now(),
        };
      }),
    );
    setLastRefreshAt(Date.now());
  }, []);

  const appendMessage = useCallback((orderId: string, content: string) => {
    const timestamp = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setOrders((previous) =>
      previous.map((order) => {
        if (order.id !== orderId) return order;
        const message: TrackingMessage = {
          id: `${orderId}-${order.messages.length + 1}-${Date.now()}`,
          author: "client",
          content,
          timestamp,
        };
        return {
          ...order,
          messages: [...order.messages, message],
        };
      }),
    );
  }, []);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshAt(Date.now());
      setIsRefreshing(false);
    }, 600);
  }, []);

  return {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    summary,
    lastRefreshAt,
    onPositionUpdate,
    refresh,
    isRefreshing,
    appendMessage,
  };
};

const MessageBubble = ({ message, isOwn }: { message: TrackingMessage; isOwn: boolean }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.18 }}
    className={cn(
      "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm",
      isOwn ? "ml-auto bg-[#2563EB] text-white" : "bg-slate-100 text-slate-700",
    )}
  >
    <p className="text-xs text-slate-400">{message.timestamp}</p>
    <p className="mt-1 text-[13px] leading-relaxed">{message.content}</p>
  </motion.div>
);

type ChatWithDriverPanelProps = {
  order: TrackingOrder | null;
  onClose: () => void;
  onSendMessage: (orderId: string, content: string) => void;
};

const ChatWithDriverPanel = ({ order, onClose, onSendMessage }: ChatWithDriverPanelProps) => {
  const [message, setMessage] = useState("");
  const history = useMemo(() => order?.messages ?? [], [order]);
  const isDisabled = !order;

  useEffect(() => {
    setMessage("");
  }, [order?.id]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    onSendMessage(order.id, trimmed);
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-xl">
            {order?.driver.avatar ?? "🚚"}
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              {order ? `Conversation avec ${order.driver.name}` : "Aucune commande sélectionnée"}
            </h2>
            <p className="text-xs text-slate-500">
              {order
                ? `${order.driver.vehicle} • ${order.driver.licensePlate}`
                : "Sélectionnez une commande active pour envoyer un message."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="h-10 rounded-lg text-sm text-slate-500 hover:text-slate-700"
        >
          Fermer
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex h-[360px] flex-col gap-3 overflow-y-auto rounded-2xl bg-[#F9FAFB] p-4">
          <AnimatePresence initial={false}>
            {history.length === 0 ? (
              <motion.p
                key="empty-history"
                className="mt-6 text-center text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {order
                  ? "Aucun échange pour le moment. Envoyez votre premier message."
                  : "Choisissez une commande pour démarrer la discussion."}
              </motion.p>
            ) : (
              history.map((item) => <MessageBubble key={item.id} message={item} isOwn={item.author === "client"} />)
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isDisabled}
            placeholder="Écrire un message au chauffeur…"
            className="h-12 flex-1 rounded-lg border-slate-200 bg-white text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
          />
          <Button
            type="submit"
            disabled={isDisabled || message.trim().length === 0}
            className="h-12 min-w-[120px] rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1D4ED8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Envoyer
          </Button>
        </form>
      </div>
    </div>
  );
};

type TrackingMapViewProps = {
  order: TrackingOrder | null;
  onClose: () => void;
  onContact: (order: TrackingOrder) => void;
  lastUpdateLabel: string;
};

const TrackingMapView = ({ order, onClose, onContact, lastUpdateLabel }: TrackingMapViewProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Suivi sur la carte</h2>
          <p className="text-xs text-slate-500">
            {order
              ? `${order.code} • ${order.driver.name} • Dernière mise à jour ${lastUpdateLabel}`
              : "Sélectionnez une commande active pour visualiser son trajet."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => order && onContact(order)}
            disabled={!order}
            className="h-10 rounded-lg border-[#2563EB] bg-white text-sm font-semibold text-[#2563EB] transition-colors duration-150 ease-out hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            Contacter le chauffeur
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-10 rounded-lg text-sm text-slate-500 hover:text-slate-700"
          >
            Fermer
          </Button>
        </div>
      </div>
      <div className="relative h-[420px] w-full">
        {order ? (
          <TrackingMap
            order={order}
            lastUpdateLabel={lastUpdateLabel}
            disableInteractions={false}
            className="h-full w-full rounded-2xl"
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
            Aucune commande sélectionnée
          </div>
        )}
      </div>
    </div>
  );
};

const LiveTrackingSection = () => {
  const {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    summary,
    lastRefreshAt,
    refresh,
    isRefreshing,
    appendMessage,
  } = useLiveTrackingStore();
  const [activeView, setActiveView] = useState<"list" | "map" | "chat">("list");
  const [contactOrderId, setContactOrderId] = useState<string | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<TrackingOrder | null>(null);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status === "En transit"),
    [orders],
  );

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return activeOrders[0] ?? null;
    return activeOrders.find((order) => order.id === selectedOrderId) ?? activeOrders[0] ?? null;
  }, [activeOrders, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrder && activeOrders.length > 0) {
      setSelectedOrderId(activeOrders[0].id);
    }
  }, [activeOrders, selectedOrder, setSelectedOrderId]);

  useEffect(() => {
    if (activeOrders.length === 0) {
      setActiveView("list");
      setContactOrderId(null);
    }
  }, [activeOrders.length]);

  useEffect(() => {
    if (activeView !== "list" && detailsOrder) {
      setDetailsOrder(null);
    }
  }, [activeView, detailsOrder]);

  const chatOrder = useMemo(() => {
    if (!contactOrderId) return null;
    return orders.find((order) => order.id === contactOrderId) ?? null;
  }, [contactOrderId, orders]);

  const lastUpdateLabel = useMemo(() => {
    const reference = selectedOrder?.lastUpdateAt ?? lastRefreshAt;
    return formatRelativeTime(reference);
  }, [lastRefreshAt, selectedOrder]);

  const handleContact = useCallback(
    (order: TrackingOrder, mode?: "call" | "chat" | "message") => {
      if (mode === "call" && typeof window !== "undefined") {
        const phone = order.driver.phone.replace(/\s+/g, "");
        window.location.href = `tel:${phone}`;
        return;
      }
      setContactOrderId(order.id);
      setActiveView("chat");
    },
    [],
  );

  const handleTrackOrder = useCallback(
    (orderId: string) => {
      setSelectedOrderId(orderId);
      setActiveView("map");
    },
    [setSelectedOrderId],
  );

  const handleCloseView = useCallback(() => {
    setActiveView("list");
    setContactOrderId(null);
  }, []);

  return (
    <section className="space-y-6 rounded-3xl bg-[#F9FAFB] p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[#2563EB]">
          <span className="text-xl" aria-hidden>
            📍
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Logistique temps réel
          </span>
        </div>
        <div className="space-y-1">
          <h1 className="text-[22px] font-semibold leading-[30px] text-slate-900">📍 Suivi en direct</h1>
          <p className="text-base text-slate-600">Suivez vos chauffeurs et vos livraisons en temps réel.</p>
        </div>
      </header>

      <ActiveSummaryBar
        summary={summary}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        lastUpdateLabel={formatRelativeTime(lastRefreshAt)}
      />

      {activeOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-3xl">🚚</span>
          </motion.div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">Aucune commande en cours de livraison.</p>
            <p className="text-sm text-slate-500">Dès qu'une nouvelle commande est prise en charge, elle apparaîtra instantanément ici.</p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-150 ease-out hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93C5FD] focus-visible:outline-offset-2"
          >
            Voir les commandes passées
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-6"
          >
            {activeView === "list" ? (
              <div className="space-y-6">
                <ActiveOrdersList
                  orders={activeOrders}
                  selectedOrderId={selectedOrder?.id ?? null}
                  onSelect={setSelectedOrderId}
                  onViewDetails={(order) => setDetailsOrder(order)}
                  onTrack={handleTrackOrder}
                  activeView={activeView}
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`panel-${selectedOrder?.id ?? "none"}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActiveOrderPanel
                      orders={activeOrders}
                      onContact={handleContact}
                      onViewDetails={(order) => setDetailsOrder(order)}
                      activeView={activeView}
                      activeChatOrderId={contactOrderId}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : null}

            {activeView === "map" ? (
              <TrackingMapView
                order={selectedOrder ?? null}
                onClose={handleCloseView}
                onContact={handleContact}
                lastUpdateLabel={lastUpdateLabel}
              />
            ) : null}

            {activeView === "chat" ? (
              <ChatWithDriverPanel
                order={chatOrder}
                onClose={handleCloseView}
                onSendMessage={(orderId, content) => {
                  appendMessage(orderId, content);
                }}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      )}

      {activeView === "list" ? (
        <OrderDetailsSlideOver
          order={detailsOrder}
          open={Boolean(detailsOrder)}
          onOpenChange={(open) => {
            if (!open) setDetailsOrder(null);
          }}
        />
      ) : null}
    </section>
  );
};

export default LiveTrackingSection;
