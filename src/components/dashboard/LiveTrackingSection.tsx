import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigation } from "lucide-react";

import TrackingCard, { LiveOrder } from "./TrackingCard";
import TrackingDetailsBar from "./TrackingDetailsBar";
import TrackingMap from "./TrackingMap";

const SECTION_BACKGROUND = "bg-[#F8FAFC]";

type Coordinate = {
  lat: number;
  lng: number;
};

type LiveTrackingOrder = LiveOrder & {
  driverPosition: Coordinate;
  clientPosition: Coordinate;
  route: Coordinate[];
  totalDistanceKm: number;
  lastUpdatedAt: number;
};

const MOCK_ORDERS: LiveTrackingOrder[] = [
  {
    id: "order-1",
    orderNumber: "CMD-2025-483",
    driver: { name: "Amadou Diallo", avatar: "🚚", vehicle: "Renault Master • AZ-458-KL" },
    eta: "16h10",
    status: "in_transit",
    progress: 52,
    distanceRemainingKm: 12.4,
    route: [
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8666, lng: 2.3822 },
      { lat: 48.8766, lng: 2.4022 },
      { lat: 48.8866, lng: 2.4222 },
    ],
    driverPosition: { lat: 48.8666, lng: 2.3822 },
    clientPosition: { lat: 48.8966, lng: 2.4522 },
    totalDistanceKm: 0,
    lastUpdatedAt: Date.now(),
  },
  {
    id: "order-2",
    orderNumber: "CMD-2025-517",
    driver: { name: "Clémence Morel", avatar: "🚛", vehicle: "Mercedes eSprinter • BY-912-FS" },
    eta: "16h35",
    status: "in_transit",
    progress: 34,
    distanceRemainingKm: 26.1,
    route: [
      { lat: 48.853, lng: 2.29 },
      { lat: 48.863, lng: 2.33 },
      { lat: 48.873, lng: 2.36 },
      { lat: 48.883, lng: 2.39 },
    ],
    driverPosition: { lat: 48.863, lng: 2.33 },
    clientPosition: { lat: 48.893, lng: 2.43 },
    totalDistanceKm: 0,
    lastUpdatedAt: Date.now(),
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
  return route.slice(0, -1).reduce((distance, currentPoint, index) => {
    const nextPoint = route[index + 1];
    return distance + haversineKm(currentPoint, nextPoint);
  }, 0);
};

const interpolateRoutePosition = (route: Coordinate[], progress: number) => {
  if (route.length === 0) {
    return route[0] ?? { lat: 0, lng: 0 };
  }

  const totalDistance = computeRouteDistance(route);
  if (totalDistance === 0) {
    return route[route.length - 1];
  }

  const targetDistance = (Math.min(progress, 100) / 100) * totalDistance;

  let cumulative = 0;
  for (let index = 0; index < route.length - 1; index += 1) {
    const start = route[index];
    const end = route[index + 1];
    const segmentDistance = haversineKm(start, end);

    if (cumulative + segmentDistance >= targetDistance) {
      const ratio = (targetDistance - cumulative) / segmentDistance || 0;
      return {
        lat: start.lat + (end.lat - start.lat) * ratio,
        lng: start.lng + (end.lng - start.lng) * ratio,
      };
    }

    cumulative += segmentDistance;
  }

  return route[route.length - 1];
};

const formatRelativeTime = (timestamp: number) => {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 5) return "À l'instant";
  if (seconds < 60) return `Il y a ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  return `Il y a ${minutes} min`;
};

const LiveTrackingSection = () => {
  const [orders, setOrders] = useState<LiveTrackingOrder[]>(() =>
    MOCK_ORDERS.map((order) => {
      const path = [...order.route, order.clientPosition];
      const totalDistanceKm = computeRouteDistance(path);
      const sanitizedProgress = Math.min(order.progress, 100);
      const driverPosition = interpolateRoutePosition(path, sanitizedProgress);
      const distanceTravelled = (sanitizedProgress / 100) * totalDistanceKm;
      const distanceRemainingKm = Math.max(totalDistanceKm - distanceTravelled, 0);

      return {
        ...order,
        progress: sanitizedProgress,
        driverPosition,
        totalDistanceKm,
        distanceRemainingKm,
      };
    }),
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => orders[0]?.id ?? null);
  const [lastUpdateAt, setLastUpdateAt] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    const interval = window.setInterval(() => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.progress >= 100) {
            return order;
          }

          if (order.progress >= 99.5) {
            return {
              ...order,
              progress: 100,
              driverPosition: order.clientPosition,
              distanceRemainingKm: 0,
              lastUpdatedAt: Date.now(),
            };
          }

          const increment = Math.random() * 7 + 3;
          const nextProgress = Math.min(100, order.progress + increment);
          const nextPosition = interpolateRoutePosition([...order.route, order.clientPosition], nextProgress);
          const targetDistance = (nextProgress / 100) * order.totalDistanceKm;
          const distanceRemainingKm = Math.max(order.totalDistanceKm - targetDistance, 0);

          return {
            ...order,
            progress: nextProgress,
            driverPosition: nextPosition,
            distanceRemainingKm,
            lastUpdatedAt: Date.now(),
          };
        }),
      );
      setLastUpdateAt(Date.now());
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const activeOrders = useMemo(() => orders.filter((order) => order.progress < 100), [orders]);
  const selectedOrder = activeOrders.find((order) => order.id === selectedOrderId) ?? activeOrders[0] ?? null;
  const lastUpdateLabel = useMemo(() => {
    const timestamp = selectedOrder?.lastUpdatedAt ?? lastUpdateAt;
    return formatRelativeTime(timestamp);
  }, [selectedOrder, lastUpdateAt]);

  useEffect(() => {
    if (!selectedOrder && activeOrders.length > 0) {
      setSelectedOrderId(activeOrders[0].id);
    }
  }, [activeOrders, selectedOrder]);

  return (
    <section className={`space-y-6 rounded-3xl ${SECTION_BACKGROUND} p-6`} aria-live="polite">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-600">
          <Navigation className="h-5 w-5 text-blue-600" aria-hidden />
          <p className="text-xs font-medium uppercase tracking-wide">Logistique temps réel</p>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Suivi en direct</h1>
          <p className="mt-1 text-sm text-slate-600">Suivez vos chauffeurs et vos livraisons en temps réel.</p>
        </div>
      </header>

      {activeOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">🚚</span>
          </motion.div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-slate-900">Aucune livraison en cours pour le moment.</p>
            <p className="text-sm text-slate-500">
              Dès qu'une nouvelle commande est prise en charge, elle apparaîtra instantanément dans cet espace.
            </p>
          </div>
          <button className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2">
            Voir mes commandes passées
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
            <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2 lg:block lg:overflow-visible">
              <div className="hidden lg:flex flex-col gap-4">
                {activeOrders.map((order) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <TrackingCard
                      order={order}
                      isActive={selectedOrder?.id === order.id}
                      onSelect={(orderId) => setSelectedOrderId(orderId)}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="flex w-full gap-4 lg:hidden">
                {activeOrders.map((order) => (
                  <motion.div key={order.id} className="min-w-[260px] flex-1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <TrackingCard
                      order={order}
                      isActive={selectedOrder?.id === order.id}
                      onSelect={(orderId) => setSelectedOrderId(orderId)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              key={selectedOrder?.id ?? "map"}
              className="flex h-full min-h-[320px] flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Carte de suivi</p>
                  <p className="text-xs text-slate-500">Zoom automatique sur la commande sélectionnée</p>
                </div>
                <span className="text-xs text-slate-500" title={`Dernière synchronisation ${lastUpdateLabel}`}>
                  Mise à jour {lastUpdateLabel}
                </span>
              </div>
              <div className="relative h-[280px] w-full flex-1 overflow-hidden rounded-2xl bg-slate-100">
                <TrackingMap order={selectedOrder} />
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedOrder?.id ?? "details"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TrackingDetailsBar order={selectedOrder ?? null} />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};

export default LiveTrackingSection;
