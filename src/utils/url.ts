import type { QueryParams } from "../core/client/types";

export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Handle arrays
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
      return;
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return;
    }

    // Handle objects (convert to JSON string)
    if (typeof value === "object") {
      searchParams.append(key, JSON.stringify(value));
      return;
    }

    // Handle primitive values
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function resolveUrl(
  baseURL: string | undefined,
  requestUrl: string,
  params?: QueryParams
): string {
  let url: string;

  try {
    // Check if requestUrl is absolute
    new URL(requestUrl);
    url = requestUrl;
  } catch {
    // Combine baseURL and requestUrl for relative URLs
    const base = baseURL || "";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const cleanPath = requestUrl.startsWith("/")
      ? requestUrl.slice(1)
      : requestUrl;
    url = `${cleanBase}/${cleanPath}`;
  }

  // If there are params, add them to existing URL
  if (params && Object.keys(params).length > 0) {
    const existingQuery = url.split("?")[1];
    const newQuery = buildQueryString(params).slice(1); // remove leading '?'

    if (existingQuery) {
      return `${url}&${newQuery}`;
    }

    return `${url}?${newQuery}`;
  }

  return url;
}
