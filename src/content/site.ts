/**
 * Every piece of copy, contact detail and marketing claim on the site lives
 * here. Edit this file to rebrand or correct the site — no component changes
 * required. Prices and the catalog live in `src/content/catalog.ts`.
 */

export const site = {
  name: "3D Spool House",
  shortName: "Spool House",
  tagline: "Custom 3D printing, made simple",
  description:
    "Upload a model or describe an idea and we print it in PLA, PETG, TPU or resin. Fast turnarounds, honest pricing and parts that actually fit.",
  url: "https://3dspoolhouse.com",
  locale: "en_IN",

  contact: {
    email: "samkitkothari0@gmail.com",
    phone: "+91 74832 91876",
    // Digits only, international format — used to build the wa.me link.
    whatsapp: "917483291876",
    instagram: "https://www.instagram.com/3dspoolhouse/",
    address: "Sheshadripuram, Bengaluru, Karnataka, India",
    hours: "Mon–Sat, 10:00–19:00 IST",
  },

  /** Formatting for every price on the site. */
  currency: {
    code: "INR",
    locale: "en-IN",
  },
} as const;

export const nav = [
  { label: "Services", href: "/#services" },
  { label: "Materials", href: "/#materials" },
  { label: "How it works", href: "/#process" },
  { label: "Shop", href: "/shop" },
  { label: "FAQ", href: "/#faq" },
] as const;

export const hero = {
  badge: "Now printing in 12 materials",
  headline: "Your idea, printed and in your hands this week",
  headlineAccent: "in your hands this week",
  subhead:
    "3D Spool House turns sketches, STLs and half-formed ideas into finished parts. Prototypes, replacement parts, props and small batch production — printed in-house and shipped across India.",
  primaryCta: { label: "Browse services", href: "/shop" },
  secondaryCta: { label: "Get a custom quote", href: "/contact" },
  trustLine: "No minimum order · Free design check on every file · Ships in 2–5 days",
} as const;

export const stats = [
  { value: "12,000+", label: "Parts printed" },
  { value: "48 hrs", label: "Typical turnaround" },
  { value: "0.05 mm", label: "Finest layer height" },
  { value: "4.9/5", label: "Customer rating" },
] as const;

export const services = [
  {
    icon: "Box",
    title: "Rapid prototyping",
    body: "Iterate on a design without waiting weeks for a machine shop. Send a file in the morning, hold the part the next day.",
  },
  {
    icon: "Wrench",
    title: "Functional & replacement parts",
    body: "Brackets, jigs, housings and the discontinued plastic bit that broke on your appliance. Printed in materials that take real load.",
  },
  {
    icon: "Sparkles",
    title: "High-detail resin prints",
    body: "Miniatures, jewellery masters and detailed models at 0.05 mm layers, cleaned and cured before they ship.",
  },
  {
    icon: "Layers",
    title: "Small batch production",
    body: "Runs of 10 to 500 identical parts with consistent tolerances and per-unit pricing that drops as volume rises.",
  },
  {
    icon: "PenTool",
    title: "CAD & model design",
    body: "No file? Describe or sketch the part and our team models it for you, then prints it once you approve the render.",
  },
  {
    icon: "ScanLine",
    title: "3D scanning & repair",
    body: "Bring us a physical object and we scan, clean up the mesh and reproduce it — including fixing broken STLs you already have.",
  },
] as const;

export const materials = [
  {
    name: "PLA",
    blurb: "Crisp detail, huge colour range, great for display pieces and prototypes.",
    specs: ["Easy to print", "Not heat resistant", "Biodegradable"],
    tone: "brand",
  },
  {
    name: "PETG",
    blurb: "Tougher and weather-resistant. The default for parts that have a job to do.",
    specs: ["Impact resistant", "Food safe options", "Outdoor friendly"],
    tone: "emerald",
  },
  {
    name: "ABS / ASA",
    blurb: "Heat and UV tolerant, suited to automotive and enclosure parts.",
    specs: ["Heat resistant", "UV stable", "Post-machinable"],
    tone: "amber",
  },
  {
    name: "TPU",
    blurb: "Genuinely flexible. Gaskets, grips, phone cases and shock absorbers.",
    specs: ["Rubber-like", "Abrasion resistant", "Shore 95A"],
    tone: "sky",
  },
  {
    name: "Resin",
    blurb: "The finest surface finish we offer, for detail that FDM can't reach.",
    specs: ["0.05 mm layers", "Smooth finish", "Paint ready"],
    tone: "violet",
  },
  {
    name: "Carbon-filled nylon",
    blurb: "Stiff, light and strong — for brackets and fixtures under real stress.",
    specs: ["High stiffness", "Low warp", "Engineering grade"],
    tone: "rose",
  },
] as const;

export const process = [
  {
    step: "01",
    title: "Send your file or idea",
    body: "Upload an STL, STEP or 3MF — or just describe what you need and share a photo. We accept napkin sketches.",
  },
  {
    step: "02",
    title: "We quote and check the file",
    body: "You get a fixed price within a few hours, plus a free printability check flagging thin walls and weak spots before anything is printed.",
  },
  {
    step: "03",
    title: "We print, finish and ship",
    body: "Approve the quote and we print, clean up supports, quality check every part and ship it to your door with tracking.",
  },
] as const;

export const testimonials = [
  {
    quote:
      "We had a housing prototype in hand two days after sending the file. The printability notes caught a wall thickness problem our own engineer had missed.",
    name: "Ananya Rao",
    role: "Hardware lead, Kestrel Robotics",
  },
  {
    quote:
      "A discontinued knob on our espresso machine snapped. They scanned the broken piece and printed four replacements. It has outlasted the original.",
    name: "Vikram Shetty",
    role: "Owner, Third Wave Coffee Bar",
  },
  {
    quote:
      "I order miniature batches every month for my tabletop store. The resin detail is consistently sharper than anything I was getting before.",
    name: "Meera Joshi",
    role: "Founder, Dice & Dragons",
  },
] as const;

export const faqs = [
  {
    q: "What file formats do you accept?",
    a: "STL, OBJ, 3MF and STEP cover almost everything. If you have a native CAD file (SolidWorks, Fusion 360, Blender) send it across and we will handle the conversion.",
  },
  {
    q: "I don't have a 3D model. Can you still help?",
    a: "Yes. Our CAD and model design service turns a sketch, photo or written description into a printable model. You approve a render before we print anything.",
  },
  {
    q: "How long does an order take?",
    a: "Most single parts ship in 2–3 working days. Larger batches and design work take 5–10 days. If you are against a deadline, tell us and we will confirm the date before you pay.",
  },
  {
    q: "How big can you print?",
    a: "Our FDM machines handle parts up to 300 × 300 × 400 mm in a single piece. Larger objects are printed in sections and bonded, which we will flag in your quote.",
  },
  {
    q: "How is pricing calculated?",
    a: "By material used, print time and any finishing work. The prices listed in the shop are our starting rates; a custom part is quoted on the actual model so you always know the total before you commit.",
  },
  {
    q: "Do you ship outside India?",
    a: "Domestic shipping is standard on every order. International shipping is available on request — get in touch with your destination and we will quote the freight.",
  },
  {
    q: "Is my design kept confidential?",
    a: "Always. We never share, resell or publish customer files, and we are happy to sign an NDA before you send anything across.",
  },
] as const;

export const footerLinks = [
  {
    heading: "Services",
    links: [
      { label: "Rapid prototyping", href: "/shop" },
      { label: "Functional parts", href: "/shop" },
      { label: "Resin printing", href: "/shop" },
      { label: "Batch production", href: "/shop" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "How it works", href: "/#process" },
      { label: "Materials", href: "/#materials" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;
