import { getValidAccessToken } from "./tokens";

const BASE = "https://api.prod.whoop.com/developer/v2";

export async function whoopFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);

  for (let attempt = 0; attempt < 3; attempt++) {
    const token = await getValidAccessToken();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 429) {
      const wait = Number(res.headers.get("Retry-After") ?? 10) * 1000;
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`Whoop API ${path} failed: ${res.status} ${await res.text()}`);
    return res.json();
  }
  throw new Error(`Whoop API ${path}: rate-limited after retries`);
}

interface Paginated<T> {
  records: T[];
  next_token?: string | null;
}

export async function* paginate<T>(
  path: string,
  params: Record<string, string> = {},
): AsyncGenerator<T> {
  let nextToken: string | undefined;
  do {
    const page = await whoopFetch<Paginated<T>>(path, {
      ...params,
      limit: "25",
      ...(nextToken ? { nextToken } : {}),
    });
    for (const record of page.records) yield record;
    nextToken = page.next_token ?? undefined;
    if (nextToken) await new Promise((r) => setTimeout(r, 100));
  } while (nextToken);
}
