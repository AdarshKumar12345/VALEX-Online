export const CATEGORIES = [
  {
    name: "Mobiles",
    slug: "mobiles",
    description: "Phones, tablets & smartwatches",
  },
  {
    name: "Laptops",
    slug: "laptops",
    description: "Laptops, computers & accessories",
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "TVs, audio, cameras & appliances",
  },
  {
    name: "Vehicles",
    slug: "vehicles",
    description: "Cars, motorbikes, scooters & cycles",
  },
  {
    name: "Furniture",
    slug: "furniture",
    description: "Sofas, tables, beds & home decor",
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, shoes & luxury accessories",
  },
  {
    name: "Books",
    slug: "books",
    description: "Novels, textbooks & study materials",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Fitness, gym equipment & outdoor gear",
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Kitchenware, tools & plants",
  },
  {
    name: "Other",
    slug: "other",
    description: "Collectibles, instruments & miscellaneous",
  },
] as const;

export const CONDITIONS = [
  "New",
  "Like New",
  "Good",
  "Fair",
] as const;

export const SORT_OPTIONS = [
  { label: "Recently listed", value: "latest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Oldest first", value: "oldest" },
] as const;

export const REPORT_REASONS = [
  "Fraud or scam",
  "Spam or misleading listing",
  "Prohibited or illegal item",
  "Incorrect category or price",
  "Duplicate listing",
  "Offensive content",
  "Other",
] as const;
