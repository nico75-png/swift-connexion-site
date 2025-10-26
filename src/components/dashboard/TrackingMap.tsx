import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import type { LiveOrder } from "./TrackingCard";

type Coordinate = {
  lat: number;
  lng: number;
};

type TrackingMapOrder = LiveOrder & {
  driverPosition: Coordinate;
  clientPosition: Coordinate;
  route: Coordinate[];
};

type TrackingMapProps = {
  order: TrackingMapOrder | null;
};

type ProjectedPoint = {
  x: number;
  y: number;
};

const projectPoints = (points: Coordinate[]): ((point: Coordinate) => ProjectedPoint) => {
  if (points.length === 0) {
    return () => ({ x: 50, y: 50 });
  }

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = Math.max(maxLat - minLat, 0.01);
  const lngRange = Math.max(maxLng - minLng, 0.01);

  return (point: Coordinate) => ({
    x: ((point.lng - minLng) / lngRange) * 100,
    y: 100 - ((point.lat - minLat) / latRange) * 100,
  });
};

const TrackingMap = ({ order }: TrackingMapProps) => {
  const projected = useMemo(() => {
    if (!order) {
      return null;
    }

    const points: Coordinate[] = [...order.route, order.clientPosition];
    if (!points.find((point) => point.lat === order.driverPosition.lat && point.lng === order.driverPosition.lng)) {
      points.push(order.driverPosition);
    }
    const project = projectPoints(points);

    return {
      route: order.route.map(project),
      client: project(order.clientPosition),
      driver: project(order.driverPosition),
    };
  }, [order]);

  if (!order || !projected) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 via-white to-slate-200">
        <MapPin className="h-6 w-6 text-slate-400" />
        <p className="text-sm text-slate-500">Sélectionnez une commande pour afficher le suivi.</p>
      </div>
    );
  }

  const polylinePoints = projected.route
    .map((point) => `${point.x} ${point.y}`)
    .concat([[projected.client.x, projected.client.y].join(" ")])
    .join(",");

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-slate-50 to-blue-100" />
      <div className="absolute inset-0 opacity-60">
        <svg className="h-full w-full" role="img" aria-hidden viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" />
            </pattern>
            <linearGradient id="route" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="url(#route)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
          <line
            x1={projected.driver.x}
            y1={projected.driver.y}
            x2={projected.client.x}
            y2={projected.client.y}
            stroke="rgba(59, 130, 246, 0.55)"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <motion.div
        className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
        style={{ left: `${projected.driver.x}%`, top: `${projected.driver.y}%` }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, y: [0, -2, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
      >
        <motion.div className="flex flex-col items-center gap-0.5 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-lg">
          <span>{order.driver.name}</span>
          <span className="text-[10px] font-normal text-blue-100">{order.distanceRemainingKm.toFixed(1)} km</span>
        </motion.div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-500 text-lg shadow-lg">
          🚚
        </div>
      </motion.div>

      <div
        className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
        style={{ left: `${projected.client.x}%`, top: `${projected.client.y}%` }}
      >
        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 shadow">Client</span>
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-slate-800 text-lg text-white shadow-lg">
          📍
        </div>
      </div>

      <motion.div
        className="absolute -bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-600 shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Distance restante : {order.distanceRemainingKm.toFixed(1)} km
      </motion.div>
    </div>
  );
};

export default TrackingMap;
