import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

import ActiveOrderPanel from "./ActiveOrderPanel";
import ActiveOrdersList from "./ActiveOrdersList";
import ActiveSummaryBar, { type SummaryCounts } from "./ActiveSummaryBar";
import ContactDriverDrawer from "./ContactDriverDrawer";
import OrderDetailsSlideOver from "./OrderDetailsSlideOver";
import TrackingMap from "./TrackingMap";

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
      email: "logistique@one-connexion.com",
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
      email: "commandes@one-connexion.com",
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
      email: "dispatch@one-connexion.com",
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
      email: "support@one-connexion.com",
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
  const [contactOrder, setContactOrder] = useState<TrackingOrder | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<TrackingOrder | null>(null);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const isContactOpen = Boolean(contactOrder);

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

  const lastUpdateLabel = useMemo(() => {
    const reference = selectedOrder?.lastUpdateAt ?? lastRefreshAt;
    return formatRelativeTime(reference);
  }, [lastRefreshAt, selectedOrder]);

  const isDetailsOpen = Boolean(detailsOrder);

  const handleContact = useCallback(
    (order: TrackingOrder, mode?: "call" | "chat" | "message") => {
      if (mode === "call" && typeof window !== "undefined") {
        const phone = order.driver.phone.replace(/\s+/g, "");
        window.location.href = `tel:${phone}`;
        return;
      }
      setContactOrder(order);
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const evaluateViewport = () => {
      setIsCompactMode(window.innerHeight < 850);
    };

    evaluateViewport();
    window.addEventListener("resize", evaluateViewport);

    return () => {
      window.removeEventListener("resize", evaluateViewport);
    };
  }, []);

  return (
    <section
      className={cn(
        "flex min-h-[calc(100vh-100px)] flex-col gap-6 rounded-3xl bg-[#F9FAFB] shadow-sm transition-[padding] duration-200",
        isCompactMode ? "p-4" : "p-6",
      )}
    >
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
          className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"
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
        <div className="flex flex-1 flex-col gap-6 overflow-hidden">
          <div className="grid flex-1 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(340px,380px)_1fr]">
            <ActiveOrdersList
              orders={activeOrders}
              selectedOrderId={selectedOrder?.id ?? null}
              onSelect={setSelectedOrderId}
              onViewDetails={(order) => setDetailsOrder(order)}
              className="scroll-smooth bg-white/80"
            />
            <motion.div
              key={selectedOrder?.id ?? "map"}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex h-full min-h-[360px] flex-col gap-4"
            >
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900">Carte de suivi</h2>
                <p className="text-xs text-slate-500">Zoom et drag disponibles pour explorer le trajet sélectionné.</p>
              </div>
              <div
                className={cn(
                  "relative flex-1 w-full overflow-hidden",
                  isCompactMode
                    ? "min-h-[360px] max-h-[calc(100vh-260px)]"
                    : "min-h-[400px] max-h-[calc(100vh-250px)]",
                )}
              >
                <TrackingMap
                  order={selectedOrder ?? null}
                  lastUpdateLabel={lastUpdateLabel}
                  disableInteractions={isDetailsOpen || isContactOpen}
                  className={cn(
                    "h-full w-full object-cover transition-all duration-300",
                    (isDetailsOpen || isContactOpen) && "scale-[0.995]",
                    isDetailsOpen && "blur-[1.5px] brightness-[0.92]",
                    isContactOpen && "pointer-events-none opacity-50 [filter:blur(4px)_saturate(0.8)]",
                    isCompactMode ? "min-h-[360px]" : "min-h-[400px]",
                  )}
                />
                <AnimatePresence>
                  {isDetailsOpen ? (
                    <motion.div
                      key="tracking-map-overlay"
                      className="pointer-events-none absolute inset-0 rounded-[14px] border border-slate-200/60 bg-white/40 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  ) : null}
                </AnimatePresence>
                <ContactDriverDrawer
                  order={contactOrder}
                  open={isContactOpen}
                  onOpenChange={(open) => {
                    if (!open) setContactOrder(null);
                  }}
                  onSendMessage={(orderId, content) => {
                    appendMessage(orderId, content);
                  }}
                />
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedOrder?.id ?? "panel"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ActiveOrderPanel
                orders={activeOrders}
                onContact={handleContact}
                onViewDetails={(order) => setDetailsOrder(order)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <OrderDetailsSlideOver
        order={detailsOrder}
        open={Boolean(detailsOrder)}
        onOpenChange={(open) => {
          if (!open) setDetailsOrder(null);
        }}
      />
    </section>
  );
};

export default LiveTrackingSection;
