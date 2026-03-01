import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Decode HTML entities in text (both numeric &#NNN; and named entities).
 * Used to sanitize AI-generated text that may contain HTML entities.
 * Works on both server and client.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  if (typeof window === "undefined") {
    return text
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&rarr;/g, "\u2192")
      .replace(/&ldquo;/g, "\u201C")
      .replace(/&rdquo;/g, "\u201D")
      .replace(/&lsquo;/g, "\u2018")
      .replace(/&rsquo;/g, "\u2019")
      .replace(/&mdash;/g, "\u2014")
      .replace(/&ndash;/g, "\u2013")
      .replace(/&hellip;/g, "\u2026");
  }
  const txt = document.createElement("textarea");
  txt.innerHTML = text;
  return txt.value;
}
