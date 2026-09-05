import type { ProductOptionGroup } from "@/content/catalog";

/**
 * Renders option groups into the textarea format the product form accepts:
 * a group header (with an optional `| hint`), then one `Label = priceDelta`
 * row per option, with a blank line between groups.
 */
export function formatOptionGroups(groups: ProductOptionGroup[]): string {
  return groups
    .map((group) => {
      const header = group.hint ? `${group.label} | ${group.hint}` : group.label;
      const rows = group.options.map((o) => `${o.label} = ${o.priceDelta}`);
      return [header, ...rows].join("\n");
    })
    .join("\n\n");
}
