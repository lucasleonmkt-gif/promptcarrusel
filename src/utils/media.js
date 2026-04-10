export function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createArtwork({
  title,
  eyebrow,
  accent,
  secondary,
  glow,
  height = 1240,
}) {
  const safeTitle = title.replaceAll("&", "&amp;");
  const safeEyebrow = eyebrow.replaceAll("&", "&amp;");

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#08111f"/>
          <stop offset="48%" stop-color="${secondary}"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
        <radialGradient id="halo" cx="0.24" cy="0.18" r="0.8">
          <stop offset="0%" stop-color="${glow}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1080" height="${height}" rx="72" fill="url(#bg)"/>
      <circle cx="220" cy="170" r="280" fill="url(#halo)"/>
      <circle cx="880" cy="${Math.round(height * 0.66)}" r="220" fill="${glow}" fill-opacity="0.22"/>
      <path d="M120 ${Math.round(height * 0.72)}C340 ${Math.round(height * 0.54)} 530 ${Math.round(
        height * 0.9,
      )} 920 ${Math.round(height * 0.55)}" stroke="rgba(255,255,255,0.45)" stroke-width="3" fill="none"/>
      <rect x="72" y="72" width="194" height="58" rx="29" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.18)"/>
      <text x="108" y="110" fill="#ffffff" font-size="24" font-family="Manrope, Arial, sans-serif">${safeEyebrow}</text>
      <text x="80" y="${Math.round(height * 0.48)}" fill="#ffffff" font-size="92" font-weight="700" font-family="Space Grotesk, Arial, sans-serif">${safeTitle}</text>
      <text x="82" y="${Math.round(height * 0.48 + 88)}" fill="rgba(255,255,255,0.82)" font-size="28" font-family="Manrope, Arial, sans-serif">Prompt Atlas visual concept</text>
      <rect x="78" y="${Math.round(height - 190)}" width="320" height="104" rx="28" fill="rgba(7,14,24,0.46)" stroke="rgba(255,255,255,0.14)"/>
      <text x="114" y="${Math.round(height - 128)}" fill="#ffffff" font-size="30" font-family="Space Grotesk, Arial, sans-serif">High-conversion output</text>
    </svg>
  `);
}

export function fileListToDataUrls(fileList) {
  const files = Array.from(fileList ?? []);

  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
}
