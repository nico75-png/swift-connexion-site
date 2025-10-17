export const formatError = (error: unknown, fallback = "Une erreur est survenue") => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message || fallback;
  }

  try {
    return JSON.stringify(error);
  } catch (serializationError) {
    console.warn("Unable to serialize error", serializationError);
    return fallback;
  }
};
