export type AssignmentRule = "assign" | "reassign" | "readonly";

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

const resolveNormalizedStatus = (status: string) => {
  const normalized = normalizeStatusKey(status);
  return statusAliases[normalized] ?? normalized;
};

export const getAssignmentRule = (status: string): AssignmentRule => {
  const normalized = resolveNormalizedStatus(status);

  switch (normalized) {
    case "EN_ATTENTE_AFFECTATION":
      return "assign";
    case "EN_COURS":
      return "reassign";
    case "EN_ATTENTE_ENLEVEMENT":
    case "LIVREE":
    case "ANNULEE":
      return "readonly";
    default:
      return "reassign";
  }
};

export const getAssignButtonLabel = (status: string, hasDriver: boolean): string | null => {
  const rule = getAssignmentRule(status);

  if (rule === "readonly") {
    return null;
  }

  if (rule === "reassign") {
    return hasDriver ? "Modifier l’affectation" : "Affecter";
  }

  return "Affecter";
};

export const canUnassignDriver = (status: string): boolean => getAssignmentRule(status) === "reassign";

export const isAssignmentReadOnly = (status: string): boolean => getAssignmentRule(status) === "readonly";
