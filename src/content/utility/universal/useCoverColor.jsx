import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

// Ambil warna dominan dari cover. Hasil: { hex, isDark }
export const useCoverColor = (cover) => {
  const [bg, setBg] = useState({ hex: "#f5f5f5", isDark: false });

  useEffect(() => {
    if (!cover) return;
    const fac = new FastAverageColor();
    let cancelled = false;

    fac
      .getColorAsync(cover, { algorithm: "dominant" })
      .then((color) => {
        if (!cancelled) setBg({ hex: color.hex, isDark: color.isDark });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      fac.destroy();
    };
  }, [cover]);

  return bg;
};