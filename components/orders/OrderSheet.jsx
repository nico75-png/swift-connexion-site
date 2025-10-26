import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import OrderActionsBar from "./OrderActionsBar";
import DeliveryInfoCard from "./OrderSections/DeliveryInfoCard";
import DriverInfoCard from "./OrderSections/DriverInfoCard";
import ProductsTable from "./OrderSections/ProductsTable";
import PaymentDetails from "./OrderSections/PaymentDetails";
import HistoryTimeline from "./OrderSections/HistoryTimeline";
import OrderFooter from "./OrderSections/OrderFooter";
import { buildOrderPdfBlob } from "./OrderBonDeCommande";

const FALLBACK_ORDER = {
  id: "demo-order",
  number: "CMD-2025-314",
  status: "En transit",
  createdAt: "12 janv. 2025 - 09:12",
  updatedAt: "18 janv. 2025 - 14:45",
  expectedDelivery: "20 janv. 2025 - 16:30",
  delivery: {
    address: "45 rue des Entrepreneurs",
    city: "Paris",
    postalCode: "75015",
    expectedDelivery: "20 janv. 2025 - 16:30",
    status: "En cours",
    instructions: "Livraison à l'accueil, badge obligatoire.",
  },
  driver: {
    name: "Julien Moreau",
    phone: "+33 6 12 34 56 78",
    vehicle: "Iveco Daily",
    vehicleType: "Camion 20m³",
  },
  products: {
    lines: [
      { name: "Palette Europe", quantity: 6, unitPrice: 120.5, sku: "PAL-001" },
      { name: "Cartons fragiles", quantity: 12, unitPrice: 35.9, sku: "BOX-784" },
      { name: "Équipements électroniques", quantity: 3, unitPrice: 240.0, sku: "ELEC-992" },
    ],
    fees: 45.6,
  },
  payment: {
    method: "Virement bancaire 💶",
    amount: 1420.4,
    status: "Payé",
    reference: "VRMT-98231",
  },
  history: [
    {
      title: "Commande créée",
      description: "Bon de commande généré et confirmé par le client.",
      timestamp: "12 janv. 2025 - 09:12",
      position: "past",
    },
    {
      title: "Prise en charge chauffeur",
      description: "Julien Moreau a confirmé la prise en charge.",
      timestamp: "18 janv. 2025 - 08:45",
      position: "past",
    },
    {
      title: "En transit",
      description: "Colis en route vers le site de livraison.",
      timestamp: "20 janv. 2025 - 10:20",
      position: "current",
    },
    {
      title: "Livraison prévue",
      description: "Arrivée estimée en fin de journée.",
      timestamp: "20 janv. 2025 - 16:30",
      position: "future",
    },
  ],
  meta: {
    company: {
      name: "One Connexion",
      industry: "Logistique",
      address: "18 avenue des Transports, 75010 Paris",
      siret: "902 112 334 00045",
      phone: "+33 1 45 78 90 12",
      email: "support@one-connexion.com",
    },
    parcel: {
      type: "Palette",
      description: "Équipements de réseau protégés",
      weight: "450",
      dimensions: "120 x 80 x 150",
    },
    pickup: {
      name: "One Connexion - Hub Est",
      fullAddress: "Zone Industrielle, 12 rue des Frères Lumière, 54000 Nancy",
      datetime: "19 janv. 2025 - 07:30",
    },
    delivery: {
      name: "DataCenter Île-de-France",
      fullAddress: "45 rue des Entrepreneurs, 75015 Paris",
      datetime: "20 janv. 2025 - 16:30",
    },
    logistics: {
      driverName: "Julien Moreau",
      carrier: "One Connexion Transport",
    },
    plan: "Express",
    createdAt: "12 janv. 2025",
  },
};

const STATUS_BADGES = {
  transit: "bg-sky-100 text-sky-700 border border-sky-200",
  delivered: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border border-rose-200",
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
};

const normalizeStatusKey = (status = "") => {
  const normalized = status.toLowerCase();
  if (normalized.includes("livr")) return "delivered";
  if (normalized.includes("transit") || normalized.includes("cours")) return "transit";
  if (normalized.includes("annul")) return "cancelled";
  if (normalized.includes("attente") || normalized.includes("préparation")) return "pending";
  return normalized;
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return format(new Date(value), "dd MMM yyyy - HH:mm", { locale: fr });
  } catch (error) {
    return value;
  }
};

const normalizeOrder = (payload) => {
  if (!payload) return FALLBACK_ORDER;
  const deliveryAddress = payload.delivery_address ?? payload.deliveryAddress ?? {};
  const pickupAddress = payload.pickup_address ?? payload.pickupAddress ?? {};
  const driver = payload.driver ?? payload.chauffeur ?? {};
  const company = payload.company ?? payload.customer ?? {};
  const products = payload.products ?? payload.items ?? [];
  const history = payload.history ?? payload.timeline ?? [];
  const parcel = payload.parcel ?? payload.package ?? {};

  const pickupFullAddressCandidate =
    pickupAddress.fullAddress ??
    [pickupAddress.street, pickupAddress.city, pickupAddress.postal_code].filter(Boolean).join(", ");

  const deliveryFullAddressCandidate =
    deliveryAddress.fullAddress ??
    [deliveryAddress.street, deliveryAddress.city, deliveryAddress.postal_code].filter(Boolean).join(", ");

  return {
    id: payload.id ?? payload.order_id ?? FALLBACK_ORDER.id,
    number: payload.number ?? payload.order_number ?? FALLBACK_ORDER.number,
    status: payload.status ?? FALLBACK_ORDER.status,
    createdAt: formatDate(payload.created_at ?? payload.createdAt) ?? FALLBACK_ORDER.createdAt,
    updatedAt: formatDate(payload.updated_at ?? payload.updatedAt) ?? FALLBACK_ORDER.updatedAt,
    expectedDelivery:
      formatDate(payload.expected_delivery_at ?? payload.expectedDelivery) ??
      FALLBACK_ORDER.expectedDelivery,
    delivery: {
      address: deliveryAddress.street ?? deliveryAddress.address ?? FALLBACK_ORDER.delivery.address,
      city: deliveryAddress.city ?? FALLBACK_ORDER.delivery.city,
      postalCode: deliveryAddress.postal_code ?? deliveryAddress.postalCode ?? FALLBACK_ORDER.delivery.postalCode,
      expectedDelivery:
        formatDate(deliveryAddress.datetime ?? deliveryAddress.expected_at) ??
        FALLBACK_ORDER.delivery.expectedDelivery,
      status: payload.delivery_status ?? payload.deliveryStatus ?? FALLBACK_ORDER.delivery.status,
      instructions: deliveryAddress.instructions ?? FALLBACK_ORDER.delivery.instructions,
    },
    driver: {
      name: driver.name ?? FALLBACK_ORDER.driver.name,
      phone: driver.phone ?? driver.phone_number ?? FALLBACK_ORDER.driver.phone,
      vehicle: driver.vehicle ?? driver.vehicle_name ?? FALLBACK_ORDER.driver.vehicle,
      vehicleType: driver.vehicleType ?? driver.vehicle_type ?? FALLBACK_ORDER.driver.vehicleType,
    },
    products: {
      lines: Array.isArray(products)
        ? products.map((item) => ({
            name: item.name ?? item.label,
            quantity: item.quantity ?? item.qty ?? 0,
            unitPrice: item.unitPrice ?? item.price ?? 0,
            sku: item.sku ?? item.id,
          }))
        : FALLBACK_ORDER.products.lines,
      fees: payload.fees ?? payload.additional_fees ?? FALLBACK_ORDER.products.fees,
    },
    payment: {
      method: payload.payment_method ?? payload.payment?.method ?? FALLBACK_ORDER.payment.method,
      amount: payload.payment_amount ?? payload.payment?.amount ?? FALLBACK_ORDER.payment.amount,
      status: payload.payment_status ?? payload.payment?.status ?? FALLBACK_ORDER.payment.status,
      reference: payload.payment_reference ?? payload.payment?.reference ?? FALLBACK_ORDER.payment.reference,
    },
    history: Array.isArray(history)
      ? history.map((step, index) => ({
          title: step.title ?? step.status ?? `Étape ${index + 1}`,
          description: step.description ?? step.details ?? "",
          timestamp: step.timestamp ?? formatDate(step.date ?? step.datetime),
          position:
            step.position ??
            (step.state ?? (index === 0 ? "current" : index < history.length - 1 ? "past" : "future")),
        }))
      : FALLBACK_ORDER.history,
    meta: {
      company: {
        name: company.name ?? FALLBACK_ORDER.meta.company.name,
        industry: company.industry ?? FALLBACK_ORDER.meta.company.industry,
        address: company.address ?? FALLBACK_ORDER.meta.company.address,
        siret: company.siret ?? FALLBACK_ORDER.meta.company.siret,
        phone: company.phone ?? FALLBACK_ORDER.meta.company.phone,
        email: company.email ?? FALLBACK_ORDER.meta.company.email,
      },
      parcel: {
        type: parcel.type ?? FALLBACK_ORDER.meta.parcel.type,
        description: parcel.description ?? FALLBACK_ORDER.meta.parcel.description,
        weight: parcel.weight ?? FALLBACK_ORDER.meta.parcel.weight,
        dimensions: parcel.dimensions ??
          [parcel.length, parcel.width, parcel.height].filter(Boolean).join(" x ") ||
          FALLBACK_ORDER.meta.parcel.dimensions,
      },
      pickup: {
        name: pickupAddress.name ?? FALLBACK_ORDER.meta.pickup.name,
        fullAddress: pickupFullAddressCandidate || FALLBACK_ORDER.meta.pickup.fullAddress,
        datetime:
          formatDate(pickupAddress.datetime ?? pickupAddress.pickup_at) ||
          FALLBACK_ORDER.meta.pickup.datetime,
      },
      delivery: {
        name: deliveryAddress.name ?? FALLBACK_ORDER.meta.delivery.name,
        fullAddress: deliveryFullAddressCandidate || FALLBACK_ORDER.meta.delivery.fullAddress,
        datetime:
          formatDate(deliveryAddress.datetime ?? deliveryAddress.expected_at) ||
          FALLBACK_ORDER.meta.delivery.datetime,
      },
      logistics: {
        driverName: driver.name ?? FALLBACK_ORDER.meta.logistics.driverName,
        carrier: payload.carrier ?? payload.transport_company ?? FALLBACK_ORDER.meta.logistics.carrier,
      },
      plan: payload.plan ?? payload.service_plan ?? FALLBACK_ORDER.meta.plan,
      createdAt:
        formatDate(payload.created_at ?? payload.createdAt) ?? FALLBACK_ORDER.meta.createdAt,
    },
  };
};

const buildPdfPayload = (order) => {
  const meta = order?.meta ?? FALLBACK_ORDER.meta;

  return {
    company: {
      name: meta.company.name,
      address: meta.company.address,
      industry: meta.company.industry,
      siret: meta.company.siret,
      phone: meta.company.phone,
      email: meta.company.email,
    },
    orderInfo: {
      number: order?.number ?? FALLBACK_ORDER.number,
      createdAt: meta.createdAt,
      deliveryDate: order?.expectedDelivery ?? FALLBACK_ORDER.expectedDelivery,
      status: order?.status ?? FALLBACK_ORDER.status,
      plan: meta.plan,
    },
    parcel: {
      type: meta.parcel.type,
      description: meta.parcel.description,
      weight: meta.parcel.weight,
      dimensions: meta.parcel.dimensions,
    },
    pickupAddress: {
      name: meta.pickup.name,
      fullAddress: meta.pickup.fullAddress,
      datetime: meta.pickup.datetime,
    },
    deliveryAddress: {
      name: meta.delivery.name,
      fullAddress: meta.delivery.fullAddress,
      datetime: meta.delivery.datetime,
    },
    logistics: {
      driverName: meta.logistics.driverName,
      carrier: meta.logistics.carrier,
    },
  };
};

const OrderSheet = ({ orderId, initialData, onClose = () => {}, onOpenMap = () => {} }) => {
  const [order, setOrder] = useState(() => normalizeOrder(initialData) ?? FALLBACK_ORDER);
  const [isLoading, setIsLoading] = useState(Boolean(orderId) && !initialData);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setOrder(normalizeOrder(initialData));
  }, [initialData]);

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const baseQuery = supabase
          .from("orders_view")
          .select("*")
          .eq("id", orderId)
          .limit(1);

        const { data, error } = typeof baseQuery.maybeSingle === "function"
          ? await baseQuery.maybeSingle()
          : await baseQuery.single();

        if (error) {
          console.warn("Supabase order fetch failed", error.message);
          return;
        }

        if (data && active) {
          setOrder(normalizeOrder(data));
        }
      } catch (error) {
        console.error("Unable to fetch order", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  const statusKey = normalizeStatusKey(order.status);
  const statusBadge = STATUS_BADGES[statusKey] ?? STATUS_BADGES.transit;
  const pdfPayload = useMemo(() => buildPdfPayload(order), [order]);

  const handleDownloadPdf = async () => {
    if (typeof window === "undefined") return;
    try {
      setIsDownloading(true);
      const blob = await buildOrderPdfBlob(pdfPayload);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bon-commande-${order.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCallDriver = () => {
    if (!order.driver.phone || typeof window === "undefined") return;
    window.open(`tel:${order.driver.phone}`);
  };

  return (
    <div className="w-full bg-[#F3F4F6] py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 md:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex flex-col">
                <h1 className="text-[22px] font-semibold text-slate-900">
                  Commande #{order.number}
                </h1>
                <p className="text-sm text-slate-500">Vue client — suivi détaillé</p>
              </div>
            </div>
            <Badge className={`flex items-center gap-2 text-sm ${statusBadge}`}>
              <Truck className="h-4 w-4" aria-hidden />
              {order.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#F9FAFB] p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Créée le {order.createdAt}</span>
            <Separator orientation="vertical" className="hidden h-6 bg-slate-300 sm:block" />
            <span className="font-semibold text-slate-800">MAJ le {order.updatedAt}</span>
            <Separator orientation="vertical" className="hidden h-6 bg-slate-300 sm:block" />
            <span className="font-semibold text-slate-800">
              Livraison prévue le {order.expectedDelivery}
            </span>
          </div>
        </motion.header>

        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
          >
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            Actualisation des données de commande...
          </motion.div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div className="flex flex-col gap-6">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
              className="grid gap-4 md:grid-cols-2"
            >
              <DeliveryInfoCard delivery={order.delivery} />
              <DriverInfoCard driver={order.driver} onCallDriver={handleCallDriver} />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Produits</h2>
                <p className="text-sm text-slate-500">Détails des articles expédiés</p>
              </div>
              <ProductsTable lines={order.products.lines} fees={order.products.fees} />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
            >
              <PaymentDetails payment={order.payment} />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
            >
              <HistoryTimeline
                history={order.history}
                onDownloadPdf={handleDownloadPdf}
                isDownloading={isDownloading}
              />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
            >
              <OrderFooter lastUpdated={order.updatedAt} onClose={onClose} />
            </motion.section>
          </div>

          <OrderActionsBar
            status={order.status}
            onOpenMap={onOpenMap}
            onCallDriver={handleCallDriver}
            onDownloadPdf={handleDownloadPdf}
            isDownloading={isDownloading}
            driverPhone={order.driver.phone}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderSheet;
