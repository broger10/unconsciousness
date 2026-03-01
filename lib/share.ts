import { toPng } from "html-to-image";

/**
 * Renders a DOM node as a PNG blob, then shares via Web Share API (mobile)
 * or downloads the file (desktop fallback).
 */
export async function shareCardAsImage(
  node: HTMLElement,
  filename: string = "unconsciousness.png"
): Promise<void> {
  // Generate PNG at 2x quality then downscale for crisp output
  const dataUrl = await toPng(node, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    backgroundColor: "#0A1A0F",
  });

  // Convert data URL to blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: "image/png" });

  // Try Web Share API (mobile)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
    });
    return;
  }

  // Desktop fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
