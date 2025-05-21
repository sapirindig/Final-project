const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchSuggestions(token: string) {
  const res = await fetch(`${API_URL}/ai/suggestions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
}

export async function refreshSuggestion(suggestionId: string, token: string) {
  const res = await fetch(`${API_URL}/ai/suggestions/${suggestionId}/refresh`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to refresh suggestion");
  return res.json();
}
