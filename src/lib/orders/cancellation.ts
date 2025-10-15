export type CancelOrderReason = "CHANGED_MIND" | "WRONG_DETAILS" | "DELAY" | "OTHER";

export const ORDER_CANCELLATION_REASON_LABELS: Record<CancelOrderReason, string> = {
  CHANGED_MIND: "Je n’ai plus besoin",
  WRONG_DETAILS: "Informations erronées",
  DELAY: "Délai trop long",
  OTHER: "Autre",
};

export const ORDER_CANCELLATION_REASON_OPTIONS = (
  Object.entries(ORDER_CANCELLATION_REASON_LABELS) as Array<[
    CancelOrderReason,
    string,
  ]>
).map(([value, label]) => ({ value, label }));

export const doesCancelReasonRequireDetails = (reason: CancelOrderReason | null | undefined) =>
  reason === "OTHER";
