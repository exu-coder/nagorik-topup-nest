import likesBanner from "@/assets/banner-freefire-likes.webp.asset.json";
import gloryImg from "@/assets/banner-guild-glory.jpg";
import tcpBanner from "@/assets/banner-tcp-bot.webp.asset.json";

export type CategorySlug = "freefire-likes" | "guild-glory" | "tcp-bot";

export interface CatalogPackage {
  id: string;
  title: string;
  /** Short line under the title, e.g. "Instant" or "8 days". */
  detail: string;
  price: number;
}

export interface CustomQuantity {
  unitLabel: string;
  /** Price charged for each block of `step` units. */
  pricePerStep: number;
  step: number;
  min: number;
  max: number;
  presets: number[];
}

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
  /** What the buyer types in: a player UID or a guild ID. */
  targetLabel: string;
  targetPlaceholder: string;
  packages: CatalogPackage[];
  custom?: CustomQuantity;
  faqs: { q: string; a: string }[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "freefire-likes",
    name: "Free Fire Likes",
    tagline: "প্রতিদিন ২০০ লাইক",
    description: "Free Fire আইডির লাইক কিনুন — শুধু UID দিন, পেমেন্ট করুন, লাইক চলে যাবে।",
    image: likesBanner.url,
    targetLabel: "Player UID",
    targetPlaceholder: "e.g. 8173310382",
    packages: [
      { id: "likes-200", title: "200 likes", detail: "Instant", price: 4 },
      { id: "likes-1600", title: "1600 likes", detail: "8 days", price: 32 },
      { id: "likes-3000", title: "3000 likes", detail: "15 days", price: 60 },
      { id: "likes-6000", title: "6000 likes", detail: "30 days", price: 120 },
    ],
    custom: {
      unitLabel: "likes",
      pricePerStep: 4,
      step: 200,
      min: 1600,
      max: 50000,
      presets: [1600, 3000, 6000, 12000, 20000, 50000],
    },
    faqs: [
      {
        q: "দিনে সর্বোচ্চ কত লাইক পাওয়া যায়?",
        a: "প্রতিটি UID দিনে সর্বোচ্চ ২০০টি লাইক পায়। বড় প্যাকেজ প্রতিদিন ভাগে ভাগে পাঠানো হয়।",
      },
      {
        q: "লাইক কত দামে পাওয়া যায়?",
        a: "প্রতি ২০০ লাইক ৳4। কাস্টম অর্ডার সর্বনিম্ন ১৬০০ লাইক এবং ২০০-এর গুণিতকে হয়।",
      },
      {
        q: "পাসওয়ার্ড বা লগইন দিতে হবে?",
        a: "না। শুধু আপনার Free Fire UID লাগবে। কখনো কাউকে গেমের পাসওয়ার্ড দেবেন না।",
      },
    ],
  },
  {
    slug: "guild-glory",
    name: "Guild Glory",
    tagline: "গিল্ডের র‍্যাঙ্ক বাড়ান",
    description: "আপনার গিল্ডে Glory যোগ করুন — শুধু Guild ID দিন।",
    image: gloryImg,
    targetLabel: "Guild ID",
    targetPlaceholder: "e.g. 3029482910",
    packages: [
      { id: "glory-5k", title: "5,000 Glory", detail: "1–2 days", price: 50 },
      { id: "glory-10k", title: "10,000 Glory", detail: "2–3 days", price: 95 },
      { id: "glory-25k", title: "25,000 Glory", detail: "5 days", price: 220 },
      { id: "glory-50k", title: "50,000 Glory", detail: "7 days", price: 420 },
    ],
    faqs: [
      {
        q: "Glory কীভাবে পাঠানো হয়?",
        a: "পেমেন্টের পর আপনার Guild ID-তে নির্ধারিত সময়ের মধ্যে Glory যোগ হয়।",
      },
      {
        q: "গিল্ড লিডারের পাসওয়ার্ড লাগবে?",
        a: "না। শুধু Guild ID লাগবে।",
      },
    ],
  },
  {
    slug: "tcp-bot",
    name: "TCP Bot",
    tagline: "৭, ১৫ ও ৩০ দিন",
    description: "নাম, গিল্ড ও ফ্রেন্ড অ্যাড সহ TCP Bot — আপনার UID-তে চালু হবে।",
    image: tcpBanner.url,
    targetLabel: "Player UID",
    targetPlaceholder: "e.g. 8173310382",
    packages: [
      { id: "tcp-7", title: "TCP Bot", detail: "7 days", price: 99 },
      { id: "tcp-15", title: "TCP Bot", detail: "15 days", price: 179 },
      { id: "tcp-30", title: "TCP Bot", detail: "30 days", price: 299 },
    ],
    faqs: [
      {
        q: "TCP Bot কতক্ষণে চালু হয়?",
        a: "পেমেন্ট কনফার্ম হওয়ার পর সাধারণত কিছুক্ষণের মধ্যেই চালু হয়।",
      },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export type Selection =
  | { kind: "package"; packageId: string }
  | { kind: "custom"; quantity: number };

export interface Quote {
  amount: number;
  label: string;
}

/**
 * Single source of truth for what a buyer pays. The server calls this before
 * creating a payment, so the browser can never choose its own price.
 */
export function quote(slug: string, selection: Selection): Quote {
  const category = getCategory(slug);
  if (!category) throw new Error("Unknown category");

  if (selection.kind === "package") {
    const pkg = category.packages.find((p) => p.id === selection.packageId);
    if (!pkg) throw new Error("Unknown package");
    return { amount: pkg.price, label: `${category.name} — ${pkg.title} (${pkg.detail})` };
  }

  const custom = category.custom;
  if (!custom) throw new Error("Custom amounts are not available here");
  const q = selection.quantity;
  if (!Number.isInteger(q) || q < custom.min || q > custom.max || q % custom.step !== 0) {
    throw new Error(
      `Choose between ${custom.min} and ${custom.max} ${custom.unitLabel}, in steps of ${custom.step}`,
    );
  }
  return {
    amount: (q / custom.step) * custom.pricePerStep,
    label: `${category.name} — ${q.toLocaleString("en-US")} ${custom.unitLabel} (custom)`,
  };
}

export function formatTaka(n: number) {
  return `৳${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
