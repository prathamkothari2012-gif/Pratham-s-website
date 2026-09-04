/**
 * The shop catalog. Prices are the *starting* rate for each service, in the
 * minor-unit-free form of the currency configured in `site.ts` (whole rupees).
 * Add, remove or reprice entries here and the shop, product pages, cart and
 * checkout all follow.
 */

export type ProductOption = {
  /** Stable key stored on the cart line. */
  id: string;
  label: string;
  /** Added to the base price when selected. */
  priceDelta: number;
};

export type ProductOptionGroup = {
  id: string;
  label: string;
  /** Short helper text shown under the group label. */
  hint?: string;
  options: ProductOption[];
};

export type Product = {
  slug: string;
  name: string;
  category: Category;
  /** One-line summary used on catalog cards. */
  summary: string;
  /** Full description on the product page. */
  description: string;
  /** Starting price before options. */
  basePrice: number;
  /** Wording for what the base price buys, e.g. "per part". */
  unit: string;
  turnaround: string;
  /** Bullet points on the product page. */
  highlights: string[];
  optionGroups: ProductOptionGroup[];
  /** Decorative gradient pair for the placeholder artwork. Kept within the
   *  brand's blue family so the shop grid reads as one set. */
  accent: [string, string];
  featured?: boolean;
};

export type Category =
  | "Prototyping"
  | "Functional parts"
  | "Resin"
  | "Production"
  | "Design services";

export const categories: Category[] = [
  "Prototyping",
  "Functional parts",
  "Resin",
  "Production",
  "Design services",
];

/** Reusable option groups, since most print services share them. */
const layerHeight: ProductOptionGroup = {
  id: "layer",
  label: "Layer height",
  hint: "Finer layers mean a smoother surface and a longer print.",
  options: [
    { id: "0.28", label: "0.28 mm — draft", priceDelta: -100 },
    { id: "0.20", label: "0.20 mm — standard", priceDelta: 0 },
    { id: "0.12", label: "0.12 mm — fine", priceDelta: 250 },
  ],
};

const infill: ProductOptionGroup = {
  id: "infill",
  label: "Infill",
  hint: "Higher infill adds strength and weight.",
  options: [
    { id: "15", label: "15% — display piece", priceDelta: 0 },
    { id: "40", label: "40% — general use", priceDelta: 180 },
    { id: "80", label: "80% — load bearing", priceDelta: 420 },
  ],
};

const finishing: ProductOptionGroup = {
  id: "finishing",
  label: "Finishing",
  options: [
    { id: "standard", label: "Supports removed", priceDelta: 0 },
    { id: "sanded", label: "Sanded smooth", priceDelta: 350 },
    { id: "painted", label: "Sanded & primed for paint", priceDelta: 700 },
  ],
};

export const products: Product[] = [
  {
    slug: "custom-pla-print",
    name: "Custom PLA print",
    category: "Prototyping",
    summary: "The everyday option — sharp detail, any colour, quick turnaround.",
    description:
      "Send us a model and we print it in PLA on a calibrated FDM machine. Ideal for concept models, display pieces, tabletop terrain and anything that lives indoors. Every file gets a free printability check before we start.",
    basePrice: 499,
    unit: "per part, up to 100 mm",
    turnaround: "2–3 working days",
    highlights: [
      "Over 30 colours in stock",
      "Free printability check on your file",
      "Parts up to 300 × 300 × 400 mm",
    ],
    optionGroups: [
      layerHeight,
      infill,
      {
        id: "colour",
        label: "Colour",
        options: [
          { id: "black", label: "Black", priceDelta: 0 },
          { id: "white", label: "White", priceDelta: 0 },
          { id: "grey", label: "Grey", priceDelta: 0 },
          { id: "custom", label: "Match a specific colour", priceDelta: 150 },
        ],
      },
      finishing,
    ],
    accent: ["#3282b8", "#8cc6e8"],
    featured: true,
  },
  {
    slug: "petg-functional-part",
    name: "PETG functional part",
    category: "Functional parts",
    summary: "Tough, weather-resistant parts built to be used, not displayed.",
    description:
      "PETG handles impact, moisture and sunlight far better than PLA, which makes it our default for brackets, enclosures, mounts and replacement parts. Printed with generous wall counts so the part survives real use.",
    basePrice: 749,
    unit: "per part, up to 100 mm",
    turnaround: "2–4 working days",
    highlights: [
      "Impact and UV resistant",
      "Suitable for outdoor use",
      "Food-safe filament available on request",
    ],
    optionGroups: [
      layerHeight,
      infill,
      {
        id: "walls",
        label: "Wall strength",
        hint: "More perimeters make the shell significantly stronger.",
        options: [
          { id: "3", label: "3 perimeters — standard", priceDelta: 0 },
          { id: "5", label: "5 perimeters — reinforced", priceDelta: 300 },
        ],
      },
      finishing,
    ],
    accent: ["#0f4c75", "#3282b8"],
    featured: true,
  },
  {
    slug: "tpu-flexible-part",
    name: "TPU flexible part",
    category: "Functional parts",
    summary: "Genuinely rubbery parts — gaskets, grips, cases and bumpers.",
    description:
      "TPU prints soft and springy at Shore 95A. We use it for seals, protective cases, vibration dampers and grips. Flexible material prints slowly, which is reflected in the base price.",
    basePrice: 999,
    unit: "per part, up to 100 mm",
    turnaround: "3–5 working days",
    highlights: ["Shore 95A flexibility", "Excellent abrasion resistance", "Bonds well to itself for repairs"],
    optionGroups: [
      {
        id: "layer",
        label: "Layer height",
        options: [
          { id: "0.20", label: "0.20 mm — standard", priceDelta: 0 },
          { id: "0.16", label: "0.16 mm — fine", priceDelta: 300 },
        ],
      },
      infill,
    ],
    accent: ["#1d7a8c", "#5ec5c5"],
  },
  {
    slug: "resin-detail-print",
    name: "High-detail resin print",
    category: "Resin",
    summary: "0.05 mm layers for miniatures, jewellery masters and fine models.",
    description:
      "Where FDM layer lines would ruin the piece, resin takes over. Prints are washed, UV cured and de-supported by hand before they ship, so they arrive ready to prime and paint.",
    basePrice: 899,
    unit: "per part, up to 60 mm",
    turnaround: "3–5 working days",
    highlights: ["0.05 mm layer height", "Washed and UV cured", "Hand de-supported"],
    optionGroups: [
      {
        id: "resin",
        label: "Resin type",
        options: [
          { id: "standard", label: "Standard grey", priceDelta: 0 },
          { id: "abs-like", label: "ABS-like — tougher", priceDelta: 250 },
          { id: "clear", label: "Clear", priceDelta: 400 },
        ],
      },
      {
        id: "finishing",
        label: "Finishing",
        options: [
          { id: "cured", label: "Washed & cured", priceDelta: 0 },
          { id: "primed", label: "Primed, ready to paint", priceDelta: 500 },
        ],
      },
    ],
    accent: ["#2d5f9e", "#7cb8e8"],
    featured: true,
  },
  {
    slug: "batch-production",
    name: "Small batch production",
    category: "Production",
    summary: "10 to 500 identical parts with per-unit pricing that drops with volume.",
    description:
      "Running multiple machines lets us produce consistent batches without the tooling cost of injection moulding. We hold your calibrated profile so a repeat order comes out identical to the first.",
    basePrice: 4999,
    unit: "per batch of 10",
    turnaround: "5–10 working days",
    highlights: [
      "Consistent tolerances across the run",
      "Profile stored for identical repeat orders",
      "Volume pricing beyond 100 units",
    ],
    optionGroups: [
      {
        id: "material",
        label: "Material",
        options: [
          { id: "pla", label: "PLA", priceDelta: 0 },
          { id: "petg", label: "PETG", priceDelta: 900 },
          { id: "abs", label: "ABS / ASA", priceDelta: 1400 },
          { id: "nylon", label: "Carbon-filled nylon", priceDelta: 3200 },
        ],
      },
      {
        id: "qty",
        label: "Batch size",
        options: [
          { id: "10", label: "10 units", priceDelta: 0 },
          { id: "25", label: "25 units", priceDelta: 9500 },
          { id: "50", label: "50 units", priceDelta: 17500 },
        ],
      },
    ],
    accent: ["#1b262c", "#3282b8"],
  },
  {
    slug: "carbon-nylon-part",
    name: "Carbon-filled nylon part",
    category: "Functional parts",
    summary: "Engineering-grade stiffness for brackets and fixtures under load.",
    description:
      "Carbon fibre reinforced nylon is the stiffest material we run. It is the right call for jigs, drone frames, mounting brackets and anything that would flex or creep in PLA.",
    basePrice: 1899,
    unit: "per part, up to 100 mm",
    turnaround: "4–6 working days",
    highlights: ["High stiffness-to-weight ratio", "Low warp, dimensionally stable", "Matte technical finish"],
    optionGroups: [
      infill,
      {
        id: "walls",
        label: "Wall strength",
        options: [
          { id: "4", label: "4 perimeters — standard", priceDelta: 0 },
          { id: "6", label: "6 perimeters — maximum", priceDelta: 500 },
        ],
      },
    ],
    accent: ["#3d5866", "#7d97a6"],
  },
  {
    slug: "cad-design",
    name: "CAD & model design",
    category: "Design services",
    summary: "No model? Describe the part and we design it for you.",
    description:
      "Our team turns a sketch, photograph or written brief into a printable, dimensionally correct model. You get a render to approve and the source file to keep, whether or not you print with us.",
    basePrice: 2499,
    unit: "per model, includes 2 revisions",
    turnaround: "3–7 working days",
    highlights: ["Two rounds of revisions included", "You keep the source file", "Printability guaranteed"],
    optionGroups: [
      {
        id: "complexity",
        label: "Complexity",
        hint: "Rough guide — we confirm after seeing your brief.",
        options: [
          { id: "simple", label: "Simple — a single part", priceDelta: 0 },
          { id: "moderate", label: "Moderate — a few mating parts", priceDelta: 2000 },
          { id: "complex", label: "Complex — an assembly", priceDelta: 5500 },
        ],
      },
      {
        id: "revisions",
        label: "Extra revisions",
        options: [
          { id: "0", label: "Included 2 revisions", priceDelta: 0 },
          { id: "3", label: "Add 3 more revisions", priceDelta: 1200 },
        ],
      },
    ],
    accent: ["#0f4c75", "#5ec5c5"],
  },
  {
    slug: "scan-and-repair",
    name: "3D scanning & mesh repair",
    category: "Design services",
    summary: "Reproduce a physical object, or fix a broken STL you already have.",
    description:
      "Send us the object and we scan it, clean the mesh and hand back a watertight, printable model. We also repair files that slice badly — non-manifold edges, flipped normals and holes.",
    basePrice: 1799,
    unit: "per object",
    turnaround: "4–7 working days",
    highlights: ["Watertight, printable output", "Works on broken or worn originals", "Repairs supplied files too"],
    optionGroups: [
      {
        id: "service",
        label: "Service",
        options: [
          { id: "repair", label: "Repair my existing file", priceDelta: -900 },
          { id: "scan", label: "Scan a physical object", priceDelta: 0 },
          { id: "scan-cad", label: "Scan and rebuild as clean CAD", priceDelta: 2600 },
        ],
      },
    ],
    accent: ["#216894", "#bbe1fa"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
