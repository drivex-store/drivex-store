

let fl = { enabled: false, textureCount: 0, debugMode: false };
let fc = null; // atlas canvas
let fu = null; // atlas meta { size, cell, characters, fontSize }
let fh = "";   // last stats signature

// Truncated in source – reconstructed from call sites + remaining body
function fd(canvas, meta) {
  // original starts mid-body with:
  // ("ascii-debug-atlas", "ASCII Atlas");
  let n = document.getElementById("ascii-debug-atlas");
  if (!n) {
    n = document.createElement("div");
    n.id = "ascii-debug-atlas";
    // positioning / styles not present in remaining source – left as-is
    document.body.appendChild(n);
  }
  while (n.lastChild) n.removeChild(n.lastChild);

  const i = document.createElement("div");
  i.textContent = `size=${meta.size} cell=${meta.cell} chars=${meta.characters.length} font=${meta.fontSize}px`;
  i.style.color = "#ccc";
  n.appendChild(i);

  const r = document.createElement("canvas");
  r.width = 2 * meta.size;
  r.height = 2 * meta.size;
  const a = r.getContext("2d");
  if (!a) {
    n.appendChild(r);
    return;
  }
  a.imageSmoothingEnabled = false;
  a.drawImage(canvas, 0, 0, 2 * meta.size, 2 * meta.size);
  a.strokeStyle = "rgba(255,255,255,0.15)";
  a.lineWidth = 1;
  for (let e = 0; e <= meta.size; e += meta.cell) {
    const nPos = 2 * e + 0.5;
    a.beginPath();
    a.moveTo(nPos, 0);
    a.lineTo(nPos, 2 * meta.size);
    a.stroke();
    a.beginPath();
    a.moveTo(0, nPos);
    a.lineTo(2 * meta.size, nPos);
    a.stroke();
  }
  r.style.width = `${meta.size}px`;
  r.style.height = `${meta.size}px`;
  r.style.border = "1px solid #444";
  n.appendChild(r);
}

function fp(ctx, meta) {
  const { size } = meta;
  const data = ctx.getImageData(0, 0, size, size).data;
  let nonBlack = 0;
  let nonZeroAlpha = 0;
  let rgbWithZeroAlpha = 0;
  let maxAlpha = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3] ?? 0;
    if (r || g || b) nonBlack++;
    if (a > 0) nonZeroAlpha++;
    if ((r || g || b) && a === 0) rgbWithZeroAlpha++;
    if (a > maxAlpha) maxAlpha = a;
  }
  const sig = `${nonBlack}:${nonZeroAlpha}:${rgbWithZeroAlpha}:${maxAlpha}`;
  if (sig !== fh) {
    fh = sig;
    console.log("%c[ASCII Debug] Atlas stats", "color: #ff6b4a; font-weight: bold", {
      size: meta.size,
      cell: meta.cell,
      characters: meta.characters.length,
      fontSize: meta.fontSize,
      nonBlackPixels: nonBlack,
      nonZeroAlphaPixels: nonZeroAlpha,
      rgbWithZeroAlpha,
      maxAlpha,
    });
  }
}

function ff() {
  return fl.enabled || window.__ASCII_DEBUG__ === true;
}

function fm(enabled) {
  fl.enabled = enabled;
  if (enabled) {
    console.log(
      "%c[ASCII Debug] Enabled",
      "color: #ff6b4a; font-weight: bold",
      `
Version: 2026-01-26-2`,
      `
Texture count: ${fl.textureCount}`,
      "\nTo disable: window.__ASCII_DEBUG__ = false"
    );
    if (fc && fu) {
      fd(fc, fu);
      const ctx = fc.getContext("2d");
      if (ctx) fp(ctx, fu);
    }
  }
}

function fg() {
  fl.textureCount++;
  if (ff()) {
    console.log(
      `%c[ASCII Debug] Texture created (total: ${fl.textureCount})`,
      "color: #888"
    );
  }
}

function fv() {
  fl.textureCount = Math.max(0, fl.textureCount - 1);
  if (ff()) {
    console.log(
      `%c[ASCII Debug] Texture disposed (total: ${fl.textureCount})`,
      "color: #888"
    );
  }
}

const utils = {
  enable: () => fm(true),
  disable: () => fm(false),
  getTextureCount() {
    return fl.textureCount;
  },
  setDebugMode(mode) {
    fl.debugMode = mode;
    window.dispatchEvent(new CustomEvent("ascii-debug-mode", { detail: mode }));
    if (ff()) {
      console.log(
        "%c[ASCII Debug] Debug mode",
        "color: #ff6b4a; font-weight: bold",
        mode
      );
    }
  },
  getDebugMode: () => fl.debugMode,
  showAtlas: () => {
    if (fc && fu) fd(fc, fu);
    else
      console.warn(
        "[ASCII Debug] No atlas available yet. Try refreshAtlas() after the scene renders."
      );
  },
  logAtlasStats: () => {
    if (fc && fu) {
      const ctx = fc.getContext("2d");
      if (ctx) fp(ctx, fu);
    } else {
      console.warn(
        "[ASCII Debug] No atlas available yet. Try refreshAtlas() after the scene renders."
      );
    }
  },
  refreshAtlas: () => {
    window.dispatchEvent(new CustomEvent("ascii-debug-refresh"));
  },
  clearOverlays: () => {
    const el = document.getElementById("ascii-debug-atlas");
    el?.parentElement?.removeChild(el);
  },
};

window.__ASCII_DEBUG_UTILS__ = utils;
window.ASCII_DEBUG_UTILS = utils;

export { fd, fp, ff, fm, fg, fv, fl, fc, fu };