import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EatMeFirst",
    short_name: "EatMeFirst",
    description:
      "Your fridge's eat-me-first list — before it rots. 先吃我：按保质期区间排出库存，减少食物浪费。",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf5",
    theme_color: "#2e7d32",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
