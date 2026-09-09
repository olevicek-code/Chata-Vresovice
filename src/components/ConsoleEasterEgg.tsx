"use client";

import { useEffect } from "react";

/** A small, harmless hello for anyone curious enough to open DevTools –
 * zero footprint for everyone else. Purely decorative, safe to remove. */
export default function ConsoleEasterEgg() {
  useEffect(() => {
    const heading = "font-size:20px;font-weight:bold;color:#55e0a8;";
    const line = "font-size:13px;color:#c98f5e;";
    const art = "font-family:monospace;font-size:12px;color:#8a5a3b;";

    console.log("%c🌲 Chata Vřesovice", heading);
    console.log("%cHledáte poklad, nebo jen díru v kódu? 👀", line);
    console.log(
      "%c" +
        "   ,   ,\n" +
        "   \\\\_//\n" +
        "  ( o.o )   <- tohle je liška, co tu bydlí\n" +
        "   > ^ <\n",
      art
    );
    console.log(
      "%cJestli nám chcete něco vzkázat, radši napište na info@chatavresovice.cz než sem 🙂",
      line
    );
  }, []);

  return null;
}
