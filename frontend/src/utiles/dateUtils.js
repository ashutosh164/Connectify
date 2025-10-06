export function formatDate(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}