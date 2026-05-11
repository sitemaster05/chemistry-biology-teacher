export async function loadSiteDataFromApi() {
  const response = await fetch(`/api/site-data?t=${Date.now()}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Не удалось загрузить данные сайта.");
  }

  return data;
}