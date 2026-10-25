import axiosInstance from "./axiosInstance";

// Return DTOs, not Axios responses. Every request accepts an AbortSignal.
export async function getWeeklyAnalytics(year, week, signal) {
  const { data } = await axiosInstance.get("/ai/analytics/weekly", {
    params: { year, week }, signal,
  });
  return data;
}

export async function getMonthlyAnalytics(year, month, signal) {
  const { data } = await axiosInstance.get("/ai/analytics/monthly", {
    params: { year, month }, signal,
  });
  return data;
}

export async function getSuggestions(signal) {
  const { data } = await axiosInstance.get("/ai/suggestions", {
    params: { limit: 5 }, signal,
  });
  if (!Array.isArray(data)) throw new Error("Invalid suggestions response.");
  return data;
}

export async function generateSuggestion(signal) {
  const { data } = await axiosInstance.post("/ai/suggestions/generate", null, { signal });
  return data;
}

export async function markSuggestionRead(suggestionId, signal) {
  const { data } = await axiosInstance.patch(
    `/ai/suggestions/${encodeURIComponent(suggestionId)}/read`, null, { signal },
  );
  return data;
}

export async function syncTaskAnalytics(signal) {
  // 202 Accepted has an empty body: acceptance is not completed synchronization.
  await axiosInstance.post("/tasks/analytics/sync", null, { signal });
}