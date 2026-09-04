/** Small hand-rolled validators — enough for these two forms without pulling
 *  in a schema library. Every rule here runs on the server; the client reuses
 *  them only to show friendlier errors sooner. */

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Permissive on purpose: spaces, dashes, brackets and a leading + are all fine.
const PHONE = /^\+?[\d\s()-]{7,20}$/;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type OrderCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  fileUrl: string;
  notes: string;
};

export function validateCustomer(input: unknown): {
  errors: FieldErrors;
  value: OrderCustomer;
} {
  const data = isRecord(input) ? input : {};
  const value: OrderCustomer = {
    name: str(data.name),
    email: str(data.email),
    phone: str(data.phone),
    address: str(data.address),
    city: str(data.city),
    postcode: str(data.postcode),
    fileUrl: str(data.fileUrl),
    notes: str(data.notes),
  };

  const errors: FieldErrors = {};
  if (value.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL.test(value.email)) errors.email = "Please enter a valid email address.";
  if (!PHONE.test(value.phone)) errors.phone = "Please enter a valid phone number.";
  if (value.address.length < 5) errors.address = "Please enter your delivery address.";
  if (value.city.length < 2) errors.city = "Please enter your city.";
  if (!/^\d{4,10}$/.test(value.postcode)) errors.postcode = "Please enter a valid PIN code.";
  if (value.notes.length > 2000) errors.notes = "Please keep notes under 2000 characters.";
  if (value.fileUrl && !/^https?:\/\/\S+$/i.test(value.fileUrl)) {
    errors.fileUrl = "Enter a full link starting with https://";
  }

  return { errors, value };
}

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

export function validateContact(input: unknown): {
  errors: FieldErrors;
  value: ContactMessage;
} {
  const data = isRecord(input) ? input : {};
  const value: ContactMessage = {
    name: str(data.name),
    email: str(data.email),
    message: str(data.message),
  };

  const errors: FieldErrors = {};
  if (value.name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL.test(value.email)) errors.email = "Please enter a valid email address.";
  if (value.message.length < 10) errors.message = "Tell us a little more — at least 10 characters.";
  if (value.message.length > 4000) errors.message = "Please keep it under 4000 characters.";

  return { errors, value };
}

/** Cart lines as they arrive from the browser. Prices are deliberately absent:
 *  the server re-prices every line from the catalog. */
export type IncomingLine = { slug: string; quantity: number; options: Record<string, string> };

export function parseLines(input: unknown): IncomingLine[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const slug = str(raw.slug);
    const quantity = Number(raw.quantity);
    if (!slug || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      return [];
    }
    const options: Record<string, string> = {};
    if (isRecord(raw.options)) {
      for (const [k, v] of Object.entries(raw.options)) {
        if (typeof v === "string") options[k] = v;
      }
    }
    return [{ slug, quantity, options }];
  });
}
