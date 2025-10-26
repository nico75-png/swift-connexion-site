import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import type { TrackingOrder } from "./LiveTrackingSection";

type LeafletModule = typeof import("leaflet");

type TrackingMapProps = {
  order: TrackingOrder | null;
  lastUpdateLabel: string;
  className?: string;
  disableInteractions?: boolean;
};

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_MODULE_URL = "https://esm.sh/leaflet@1.9.4";

const ensureLeafletStyles = () => {
  if (typeof document === "undefined") return;
  const existing = document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`);
  if (!existing) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_URL;
    document.head.appendChild(link);
  }
};

const useLeaflet = () => {
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    ensureLeafletStyles();
    const load = async () => {
      try {
        const module = await import(/* @vite-ignore */ LEAFLET_MODULE_URL);
        if (!isActive) return;
        const instance = (module.default ?? module) as LeafletModule;
        if (!instance?.map) {
          throw new Error("Leaflet non disponible");
        }
        setLeaflet(instance);
      } catch (exception) {
        console.error("Leaflet load error", exception);
        if (isActive) {
          setError("Carte temporairement indisponible");
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, []);

  return { leaflet, error, setError } as const;
};

const createDriverIcon = (leaflet: LeafletModule, order: TrackingOrder) =>
  leaflet.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="display:flex;flex-direction:column;align-items:center;padding:6px 10px;border-radius:9999px;background:${order.color};color:#fff;box-shadow:0 6px 16px rgba(37,99,235,0.25);font-weight:600;font-size:11px;">
          <span>${order.driver.name}</span>
          <span style="font-weight:400;font-size:10px;opacity:0.85;">${order.distanceRemainingKm.toFixed(1)} km</span>
        </div>
        <div style="height:44px;width:44px;display:flex;align-items:center;justify-content:center;border-radius:9999px;border:4px solid #fff;background:${order.color};font-size:20px;box-shadow:0 6px 16px rgba(15,23,42,0.25);">
          ${order.driver.avatar}
        </div>
      </div>
    `,
    className: "driver-marker",
    iconSize: [120, 120],
    iconAnchor: [22, 58],
  });

const createClientIcon = (leaflet: LeafletModule) =>
  leaflet.divIcon({
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <span style="padding:4px 10px;border-radius:9999px;background:#fff;color:#1f2937;font-size:11px;font-weight:600;box-shadow:0 6px 12px rgba(15,23,42,0.15);">Client</span>
        <div style="height:34px;width:34px;display:flex;align-items:center;justify-content:center;border-radius:9999px;border:4px solid #fff;background:#111827;color:#fff;font-size:16px;box-shadow:0 6px 16px rgba(15,23,42,0.25);">
          📍
        </div>
      </div>
    `,
    className: "client-marker",
    iconSize: [90, 90],
    iconAnchor: [17, 50],
  });

const TrackingMap = ({ order, lastUpdateLabel, className, disableInteractions }: TrackingMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const routeRef = useRef<import("leaflet").Polyline | null>(null);
  const driverRef = useRef<import("leaflet").Marker | null>(null);
  const clientRef = useRef<import("leaflet").Marker | null>(null);
  const { leaflet, error, setError } = useLeaflet();

  useEffect(() => {
    if (!leaflet || mapRef.current || !containerRef.current) {
      return;
    }

    try {
      const map = leaflet.map(containerRef.current, {
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
      });
      mapRef.current = map;

      const tileLayer = leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      });
      tileLayer.addTo(map);
      if (typeof tileLayer.on === "function") {
        tileLayer.on("tileerror", () => setError("Carte temporairement indisponible"));
      }
    } catch (exception) {
      console.error("Map init error", exception);
      setError("Carte temporairement indisponible");
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      routeRef.current = null;
      driverRef.current = null;
      clientRef.current = null;
    };
  }, [leaflet, setError]);

  useEffect(() => {
    if (!leaflet || !mapRef.current || !order) {
      return;
    }

    const routePoints = [...order.route, order.clientPosition];
    const latLngs = routePoints.map((point) => [point.lat, point.lng] as [number, number]);
    const driverLatLng: [number, number] = [order.driverPosition.lat, order.driverPosition.lng];
    const clientLatLng: [number, number] = [order.clientPosition.lat, order.clientPosition.lng];

    if (!routeRef.current) {
      routeRef.current = leaflet.polyline(latLngs, {
        color: order.color,
        weight: 5,
        opacity: 0.85,
        lineJoin: "round",
        lineCap: "round",
      });
      routeRef.current.addTo(mapRef.current);
    } else {
      routeRef.current.setLatLngs(latLngs);
    }

    const routeElement = routeRef.current.getElement?.();
    if (routeElement?.animate) {
      routeElement.animate(
        [{ strokeDashoffset: 12 }, { strokeDashoffset: 0 }],
        { duration: 800, easing: "ease-out" },
      );
    }

    if (!driverRef.current) {
      driverRef.current = leaflet.marker(driverLatLng, {
        icon: createDriverIcon(leaflet, order),
        interactive: true,
      });
      driverRef.current.addTo(mapRef.current);
    } else {
      driverRef.current.setLatLng(driverLatLng);
      driverRef.current.setIcon(createDriverIcon(leaflet, order));
    }
    if (typeof driverRef.current.bindTooltip === "function") {
      driverRef.current.bindTooltip(
        `${order.driver.name} – ${order.distanceRemainingKm.toFixed(1)} km restants`,
        { direction: "top", permanent: false },
      );
    }

    if (!clientRef.current) {
      clientRef.current = leaflet.marker(clientLatLng, {
        icon: createClientIcon(leaflet),
        interactive: false,
      });
      clientRef.current.addTo(mapRef.current);
    } else {
      clientRef.current.setLatLng(clientLatLng);
    }

    const bounds = leaflet.latLngBounds([...latLngs, driverLatLng]);
    const padded = bounds.pad(0.35);
    if (typeof mapRef.current.fitBounds === "function") {
      try {
        mapRef.current.fitBounds(padded as unknown as any, { padding: [48, 48] } as any);
      } catch (exception) {
        console.warn("fitBounds fallback", exception);
        const center = padded.getCenter() as unknown as [number, number];
        mapRef.current.setView(center, mapRef.current.getZoom() ?? 12, { animate: true } as any);
      }
    }
  }, [leaflet, order]);

  const content = useMemo(() => {
    if (!order) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">📍</span>
          <p className="text-sm text-slate-500">Sélectionnez une commande pour afficher la carte.</p>
        </div>
      );
    }

    return <div ref={containerRef} className="h-full w-full rounded-[14px]" role="presentation" />;
  }, [order]);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
        disableInteractions && "pointer-events-none",
        className,
      )}
    >
      <div className="absolute inset-0">
        {content}
        {error ? (
          <div className="absolute inset-x-4 top-4 rounded-lg border border-amber-300 bg-[#FEF3C7] px-4 py-3 text-sm font-medium text-amber-900 shadow">
            {error}
          </div>
        ) : null}
      </div>
      <motion.div
        className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 backdrop-blur"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        aria-live="polite"
      >
        <span role="img" aria-hidden>
          🔄
        </span>
        Dernière mise à jour {lastUpdateLabel}
      </motion.div>
    </div>
  );
};

export default TrackingMap;
