const normalizeStatusKey = (status: string) =>
  status
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

const statusAliases: Record<string, string> = {
  EN_ATTENTE: "EN_ATTENTE_AFFECTATION",
  EN_ATTENTE_AFFECTATION: "EN_ATTENTE_AFFECTATION",
  EN_COURS: "EN_COURS",
  ENLEVE: "EN_ATTENTE_ENLEVEMENT",
  EN_ATTENTE_ENLEVEMENT: "EN_ATTENTE_ENLEVEMENT",
  LIVRE: "LIVREE",
  LIVREE: "LIVREE",
  ANNULE: "ANNULEE",
  ANNULEE: "ANNULEE",
};

export const resolveOrderStatus = (status: string): string => {
  if (!status) {
    return "";
  }
  const normalized = normalizeStatusKey(status);
  return statusAliases[normalized] ?? normalized;
};

const CANCELABLE_STATUSES = new Set(["EN_ATTENTE_AFFECTATION", "EN_ATTENTE_ENLEVEMENT"]);
const CANCELLATION_FORBIDDEN_STATUSES = new Set(["LIVREE", "ANNULEE"]);

export const isOrderCancelableStatus = (status: string): boolean =>
  CANCELABLE_STATUSES.has(resolveOrderStatus(status));

export const isOrderCancellationForbiddenStatus = (status: string): boolean =>
  CANCELLATION_FORBIDDEN_STATUSES.has(resolveOrderStatus(status));

export const getOrderStatusDisplayLabel = (status: string): string => {
  if (!status) return "Statut inconnu";
  const normalized = resolveOrderStatus(status);
  switch (normalized) {
    case "EN_ATTENTE_AFFECTATION":
      return "En attente d’affectation";
    case "EN_ATTENTE_ENLEVEMENT":
      return "En attente d’enlèvement";
    case "EN_COURS":
      return "En cours";
    case "LIVREE":
      return "Livrée";
    case "ANNULEE":
      return "Annulée";
    default:
      return status;
  }
};
