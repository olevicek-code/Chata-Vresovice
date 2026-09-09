import type { MetadataRoute } from "next";

const BASE_URL = "https://www.chatavresovice.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/rezervace`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
