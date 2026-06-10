import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Morocco Next Move",
    short_name: "Next Move",
    description:
      "Know your best next move in Morocco — honest, confidence-rated routes, fares, and arrival guidance, online or offline.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#0e5a4e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
