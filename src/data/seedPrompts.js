import { APP_AUTHOR } from "../config.js";
import { createArtwork } from "../utils/media.js";

function buildPrompt({ id, title, likes, views, tags, palette, heights, prompt }) {
  return {
    id,
    title,
    likes,
    views,
    tags,
    author: APP_AUTHOR,
    createdAt: new Date(Date.now() - views * 18_000_000).toISOString(),
    prompt,
    images: heights.map((height, index) =>
      createArtwork({
        title,
        eyebrow: `Visual ${index + 1}`,
        accent: palette[0],
        secondary: palette[1],
        glow: palette[2],
        height,
      }),
    ),
  };
}

export const seedPrompts = [
  buildPrompt({
    id: "prompt-saas-neon",
    title: "SaaS Neon Launch",
    likes: 189,
    views: 1422,
    tags: ["landing", "saas", "ads"],
    palette: ["#4ecdc4", "#14314c", "#ff9467"],
    heights: [1320, 1120, 1380],
    prompt:
      "Create a startup landing page for an AI SaaS product with a dark premium look, expressive headline, glassmorphism cards, conversion-focused CTA, radial gradient background, product stats, customer logos, founder note, and a mobile-first responsive layout.",
  }),
  buildPrompt({
    id: "prompt-editorial-fashion",
    title: "Editorial Fashion Grid",
    likes: 246,
    views: 1680,
    tags: ["fashion", "editorial", "branding"],
    palette: ["#ff8f70", "#23153a", "#ffe6a8"],
    heights: [1480, 1080, 1260],
    prompt:
      "Generate an editorial fashion campaign scene with cinematic side lighting, luxury textures, dramatic composition, minimal props, rich skin tones, shallow depth of field, and a premium magazine cover feeling. Keep the styling modern and confident.",
  }),
  buildPrompt({
    id: "prompt-interior-biophilic",
    title: "Biophilic Interior Concept",
    likes: 132,
    views: 1188,
    tags: ["interior", "architecture", "concept"],
    palette: ["#7ae5c5", "#10211f", "#94d9ff"],
    heights: [1180, 1400, 1160],
    prompt:
      "Design a biophilic interior for a creative startup office featuring warm wood, polished concrete, layered plants, sculptural furniture, soft morning light, integrated product display zones, and a calm editorial atmosphere with realistic materials.",
  }),
  buildPrompt({
    id: "prompt-product-orbit",
    title: "Orbit Product Hero",
    likes: 174,
    views: 1294,
    tags: ["product", "3d", "hero"],
    palette: ["#89e3ff", "#0b1630", "#70ffa6"],
    heights: [1360, 1240, 1100],
    prompt:
      "Render a floating consumer tech product as a cinematic hero shot with soft reflections, precise rim light, layered gradients, suspended particles, futuristic packaging cues, and a clean composition optimized for a premium website header.",
  }),
  buildPrompt({
    id: "prompt-cafe-branding",
    title: "Cafe Branding Suite",
    likes: 98,
    views: 884,
    tags: ["branding", "food", "social"],
    palette: ["#ffc86b", "#321b0d", "#ff8f70"],
    heights: [1280, 1180, 1340],
    prompt:
      "Create a cohesive branding suite for a specialty coffee shop with tactile packaging, social-ready mockups, warm analog colors, artisan label details, moody editorial shadows, and a friendly yet elevated startup brand personality.",
  }),
  buildPrompt({
    id: "prompt-ui-dashboard",
    title: "Analytics Dashboard Motion",
    likes: 287,
    views: 2144,
    tags: ["ui", "dashboard", "motion"],
    palette: ["#7ae5c5", "#10273f", "#9fe7ff"],
    heights: [1220, 1500, 1140],
    prompt:
      "Design a dark analytics dashboard for a tech startup with bold typography, modular charts, layered cards, onboarding tips, tasteful motion cues, soft shadows, glowing accent lines, and hierarchy optimized for fast scanning and decision making.",
  }),
];
