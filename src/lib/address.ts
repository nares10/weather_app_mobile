// Build the address line shown under a place's name.
// "Jaipur" + ["Jaipur district", "Rajasthan", "India"] -> "Rajasthan, India".
// Skips blank parts, parts that just repeat the name, and duplicates.
export function formatAddress(name: string, parts: (string | null | undefined)[]): string {
  return parts
    .filter(
      (part, i, all): part is string => !!part && !part.includes(name) && all.indexOf(part) === i,
    )
    .join(", ");
}
