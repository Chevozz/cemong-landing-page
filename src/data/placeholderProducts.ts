import type { ProductWithRelations } from "@/types/database";

const now = new Date().toISOString();

export const placeholderProducts: ProductWithRelations[] = [
  {
    id: "1",
    category_id: "1",
    name: "Keripik Talas Gurih",
    slug: "keripik-talas-gurih",
    description: "Keripik ubi talas yang diiris tipis dan digoreng renyah dengan rasa gurih yang pas untuk teman ngemil.",
    price: 25000,
    pcs: 10,
    is_available: true,
    images: [
      {
        id: "img1",
        product_id: "1",
        image_url: "/placeholder-photo.svg",
        is_primary: true,
        sort_order: 0,
        created_at: now,
      },
    ],
    category: { id: "1", name: "Keripik", slug: "keripik", created_at: now },
    created_at: now,
    updated_at: now,
  },
  {
    id: "2",
    category_id: "1",
    name: "Keripik Talas Pedas",
    slug: "keripik-talas-pedas",
    description: "Keripik ubi talas renyah dengan rasa pedas gurih yang pas.",
    price: 27000,
    pcs: 10,
    is_available: true,
    images: [
      {
        id: "img2",
        product_id: "2",
        image_url: "/placeholder-photo.svg",
        is_primary: true,
        sort_order: 0,
        created_at: now,
      },
    ],
    category: { id: "1", name: "Keripik", slug: "keripik", created_at: now },
    created_at: now,
    updated_at: now,
  },
  {
    id: "3",
    category_id: "2",
    name: "Rengginang Original",
    slug: "rengginang-original",
    description: "Rengginang ketan goreng dengan tekstur renyah dan rasa gurih alami.",
    price: 22000,
    pcs: 10,
    is_available: true,
    images: [
      {
        id: "img3",
        product_id: "3",
        image_url: "/placeholder-photo.svg",
        is_primary: true,
        sort_order: 0,
        created_at: now,
      },
    ],
    category: { id: "2", name: "Rengginang", slug: "rengginang", created_at: now },
    created_at: now,
    updated_at: now,
  },
];
