import { API_URL } from "./config";
import type {
  Brand,
  Category,
  HomeData,
  Paginated,
  Phone,
  ProductDetail,
  ProductSummary,
  StoreInfo,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, path: string) {
    super(`The shop API answered ${status} for ${path}`);
    this.status = status;
  }
}

// Pages are rebuilt in the background at most this often (in seconds), so a busy
// shop never waits on the API for every visitor, and changes show up within a minute.
async function request<T>(path: string, revalidate = 60): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  if (!response.ok) throw new ApiError(response.status, path);
  return (await response.json()) as T;
}

async function requestOrNull<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    return await request<T>(path, revalidate);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const getHome = () => request<HomeData>("/api/home/");

export const getStore = () => request<StoreInfo>("/api/store/", 300);

export const getCategories = () => request<Category[]>("/api/categories/", 300);

export const getBrands = () => request<Brand[]>("/api/brands/", 300);

export const getPhone = (slug: string) =>
  requestOrNull<Phone>(`/api/phones/${encodeURIComponent(slug)}/`, 300);

export const getProduct = (slug: string) =>
  requestOrNull<ProductDetail>(`/api/products/${encodeURIComponent(slug)}/`, 30);

export function getProducts(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  return requestOrNull<Paginated<ProductSummary>>(`/api/products/?${query}`, 30);
}