import { ImageResponse } from "next/og";

/**
 * Shared renderer for opengraph-image.tsx / twitter-image.tsx – both file
 * conventions need their own default export, but the actual drawing (and
 * the Google Fonts fetch, which is the slow/fallible part) lives here
 * once. Loads Playfair Display so Czech diacritics (ř, í, ě…) render
 * correctly instead of as tofu boxes.
 */

const TITLE = "Chata Vřesovice";
const SUBTITLE = "Odpočinek uprostřed přírody";

async function loadFont(weight: 400 | 700) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@${weight}&text=${encodeURIComponent(
    TITLE + SUBTITLE
  )}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error("Could not find font source in Google Fonts CSS");
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

export async function renderOgImage() {
  const [bold, regular] = await Promise.all([loadFont(700), loadFont(400)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1d2f26 0%, #2f4a3c 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "#000000",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              fontSize: 108,
            }}
          >
            🏡
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Playfair Display",
                fontWeight: 700,
                fontSize: 68,
                color: "#faf7f2",
              }}
            >
              {TITLE}
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: "Playfair Display",
                fontWeight: 400,
                fontSize: 32,
                color: "#c98f5e",
              }}
            >
              {SUBTITLE}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Playfair Display", data: bold, weight: 700, style: "normal" },
        { name: "Playfair Display", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
