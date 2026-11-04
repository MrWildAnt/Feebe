import { useEffect, useRef, useState } from "react";
import { animate, utils } from "animejs";

// ---------- Settings ----------
const DISK_SIZE = 600; // size-150 = 37.5rem = 600px
const DISK_TARGET = 200; // size-50 = 12.5rem = 200px
const END_TOP = -80;
const END_LEFT = -80;
const DOCK_AT = 0.98;
const NAV_FADE_START = 0.6;
const BAR_COUNT = 180;

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// ---------- Window size ----------
export const useWindowSize = () => {
  const [size, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
};

// ---------- Vinyl rotation (ikut play / pause) ----------
export const useVinyl = (isPlaying) => {
  const animationRef = useRef(null);

  useEffect(() => {
    const animation = animate(".vinyl-disk", {
      rotate: "1turn",
      duration: 6000,
      ease: "linear",
      loop: true,
      autoplay: true,
    });
    animationRef.current = animation;

    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, []);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (isPlaying) animation.play();
    else animation.pause();
  }, [isPlaying]);
};

// ---------- Disk mengecil ke pojok + navbar fade in saat scroll ----------
export const useDiskScroll = (isCentered) => {
  const [isDocked, setIsDocked] = useState(false);
  const diskLayerRef = useRef(null);
  const navBgRef = useRef(null);
  const navProgressRef = useRef(0);
  const isCenteredRef = useRef(isCentered);

  useEffect(() => {
    isCenteredRef.current = isCentered;
  }, [isCentered]);

  useEffect(() => {
    const layer = diskLayerRef.current;
    if (!layer) return;

    const s = DISK_TARGET / DISK_SIZE;

    const update = () => {
      const section = document.querySelector(".music-by-type");
      if (!section) return;

      const vh = window.innerHeight;
      const top = section.getBoundingClientRect().top;

      // 0 saat section masih di bawah layar, 1 saat top-nya sampai di atas
      const p = clamp01((vh - top) / vh);
      layer.style.setProperty("--scroll-p", String(p));
      setIsDocked(p >= DOCK_AT);

      // Navbar bg + bars fade in di akhir scroll
      const navP = clamp01((p - NAV_FADE_START) / (1 - NAV_FADE_START));
      navProgressRef.current = navP;
      if (navBgRef.current) utils.set(navBgRef.current, { opacity: navP });

      // Sudut kiri-atas disk sebelum scroll
      const startLeft = isCenteredRef.current
        ? window.innerWidth / 2 - DISK_SIZE / 2
        : -DISK_SIZE / 2;
      const startTop = vh / 2 - DISK_SIZE / 2;

      // origin top-left: hasil akhir = translate + s * sudut awal
      utils.set(layer, {
        translateX: (END_LEFT - s * startLeft) * p,
        translateY: (END_TOP - s * startTop) * p,
        scale: 1 - (1 - s) * p,
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { isDocked, diskLayerRef, navBgRef, navProgressRef };
};

// ---------- Audio visualizer: 180 bars, tanpa gap (hero + navbar) ----------
const drawBars = (ctx, canvas, data, color) => {
  const step = data.length / BAR_COUNT;
  const barWidth = canvas.width / BAR_COUNT;
  ctx.fillStyle = color;

  for (let i = 0; i < BAR_COUNT; i++) {
    const index = Math.min(data.length - 1, Math.floor(i * step));
    const barHeight = (data[index] / 255) * canvas.height;
    ctx.fillRect(
      i * barWidth,
      canvas.height - barHeight,
      Math.ceil(barWidth),
      barHeight,
    );
  }
};

export const useVisualizer = ({
  audioRef,
  gainRef,
  levelRef,
  canvasRef,
  navCanvasRef,
  navProgressRef,
  isDark,
}) => {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const frameRef = useRef(null);
  const isDarkRef = useRef(false);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const navCanvas = navCanvasRef.current;
    if (!audio || !canvas) return;

    const ctx = canvas.getContext("2d");
    const navCtx = navCanvas ? navCanvas.getContext("2d") : null;
    if (!ctx) return;

    let disposed = false;
    let data = null; // buffer dipakai ulang, tidak dibuat tiap frame

    const clear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (navCtx) navCtx.clearRect(0, 0, navCanvas.width, navCanvas.height);
    };

    const draw = () => {
      if (disposed) return;
      clear();

      const analyser = analyserRef.current;
      if (analyser) {
        if (!data) data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);

        const color = isDarkRef.current
          ? "rgba(255, 255, 255, 0.55)"
          : "rgba(0, 0, 0, 0.40)";

        drawBars(ctx, canvas, data, color);
        // Navbar bars hanya saat navbar terlihat
        if (navCtx && navProgressRef.current > 0) {
          drawBars(navCtx, navCanvas, data, color);
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    const start = async () => {
      try {
        // Graph dibuat sekali saja per elemen audio
        if (!audioContextRef.current) {
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;

          const audioContext = new AudioContextClass();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.8;

          const gain = audioContext.createGain();
          gain.gain.value = levelRef.current;

          const source = audioContext.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(gain); // analyser sebelum gain, bars tidak mengecil saat volume turun
          gain.connect(audioContext.destination);

          audio.volume = 1;
          audio.muted = false;

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          gainRef.current = gain; // dibaca provider untuk volume
        }

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        cancelAnimationFrame(frameRef.current);
        draw();
      } catch (error) {
        console.error("Could not start the audio visualizer:", error);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frameRef.current);
      clear();
    };

    audio.addEventListener("play", start);
    audio.addEventListener("pause", stop);
    audio.addEventListener("ended", stop);

    if (!audio.paused) start();

    return () => {
      disposed = true;
      audio.removeEventListener("play", start);
      audio.removeEventListener("pause", stop);
      audio.removeEventListener("ended", stop);
      cancelAnimationFrame(frameRef.current);
    };
  }, [audioRef, gainRef, levelRef, canvasRef, navCanvasRef, navProgressRef]);
};