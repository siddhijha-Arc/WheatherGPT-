import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function formatTime(dateStr) {
  const d = dateStr ? new Date(dateStr) : /* @__PURE__ */ new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : /* @__PURE__ */ new Date();
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
