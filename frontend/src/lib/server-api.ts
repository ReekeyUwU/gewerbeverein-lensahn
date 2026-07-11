const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export interface Member {
  id: string;
  companyName: string;
  slug: string;
  category: string;
  description: string | null;
  logoUrl: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isPremium: boolean;
  images: { id: string; url: string; altText: string | null }[];
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string | null;
  imageUrl: string | null;
  maxParticipants: number | null;
  _count?: { registrations: number };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  category: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  seoTitle: string | null;
}

export interface BoardMemberEntry {
  id: string;
  name: string;
  position: string;
  portraitUrl: string | null;
  email: string | null;
  phone: string | null;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  tier: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  category: string | null;
  fileUrl: string;
  fileType: string | null;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  images: { id: string; url: string; type: string }[];
}

export async function getMembers(params?: { category?: string; search?: string; pageSize?: string }) {
  const entries = Object.entries(params ?? {}).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0,
  );
  const query = new URLSearchParams(entries).toString();
  return safeFetch<{ members: Member[]; total: number }>(
    `/api/members${query ? `?${query}` : ""}`,
    { members: [], total: 0 },
  );
}

export async function getMember(slug: string) {
  return safeFetch<Member | null>(`/api/members/${slug}`, null);
}

export async function getEvents(upcoming = false) {
  return safeFetch<EventItem[]>(`/api/events${upcoming ? "?upcoming=1" : ""}`, []);
}

export async function getEvent(slug: string) {
  return safeFetch<EventItem | null>(`/api/events/${slug}`, null);
}

export async function getPosts(pageSize = 50) {
  return safeFetch<{ posts: Post[]; total: number }>(`/api/posts?pageSize=${pageSize}`, { posts: [], total: 0 });
}

export async function getPost(slug: string) {
  return safeFetch<Post | null>(`/api/posts/${slug}`, null);
}

export async function getBoardMembers() {
  return safeFetch<BoardMemberEntry[]>(`/api/board`, []);
}

export async function getSponsors() {
  return safeFetch<Sponsor[]>(`/api/sponsors`, []);
}

export async function getDownloads() {
  return safeFetch<DownloadItem[]>(`/api/downloads`, []);
}

export async function getGalleryAlbums() {
  return safeFetch<GalleryAlbum[]>(`/api/gallery`, []);
}
