export async function sendClientErrorReport(params: {
  endpoint?: string;
  payload: unknown;
}): Promise<void> {
  const { endpoint = "/api/errors", payload } = params;

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently fail for error reporting
  }
}
