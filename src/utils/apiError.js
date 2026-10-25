export function getApiError(error, fallback = "Something went wrong. Please try again.") {
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (!error?.response && (error?.request || error?.code === "ERR_NETWORK")) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "The request timed out. Please try again.";
    }
    return "Unable to reach the server. Check your connection and try again.";
  }
  return fallback;
}