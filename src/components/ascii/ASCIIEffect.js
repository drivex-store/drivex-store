import { Effect } from "postprocessing"; 
import { Uniform, Texture, Color, CanvasTexture } from "three";
import { asciiShader } from "@/components/ascii/shader";
import { fg, fv } from "@/components/ascii/debugs/debug";

export class ASCIIEffect extends Effect {
  charactersTexture = null;
  depthMapTexture = null;
  framesToSkip = 0;
  visibilityHandler = null;

  constructor({
    characters = " .:,'-^=*+?!|0#X%WM@",
    fontSize = 54,
    cellSize = 30,
    color = "#ffffff",
    invert = false,
    alphaThreshold = 0.1,
    respectAlpha = true,
    progress = 1,
    colorProgress = 1,
    randomness = 0.3,
    revealDirection = 1,
    revealEnd = 0.85,
    enableGooeyReveal = false,
    gooeyRadius = 0.15,
    gooeySoftness = 0.08,
    gooeyNoiseIntensity = 0.03,
    enableDepthParallax = false,
    parallaxIntensity = 0.02,
    colorDark,
    depthDetailMin = 1,
    revealOrigin = { x: 0.5, y: 0.5 },
  } = {}) {
    super("ASCIIEffect", asciiShader, {
      uniforms: new Map([
        ["uCharacters", new Uniform(new Texture())],
        ["uCellSize", new Uniform(cellSize)],
        ["uCharactersCount", new Uniform(characters.length)],
        ["uColor", new Uniform(new Color(color))],
        ["uInvert", new Uniform(invert)],
        ["uAlphaThreshold", new Uniform(alphaThreshold)],
        ["uRespectAlpha", new Uniform(respectAlpha)],
        ["uProgress", new Uniform(progress)],
        ["uColorProgress", new Uniform(colorProgress)],
        ["uRandomness", new Uniform(randomness)],
        ["uRevealDirection", new Uniform(revealDirection)],
        ["uRevealEnd", new Uniform(revealEnd)],
        ["uEnableGooeyReveal", new Uniform(enableGooeyReveal)],
        ["uMouse", new Uniform({ x: -1, y: -1 })],
        ["uGooeyRadius", new Uniform(gooeyRadius)],
        ["uGooeySoftness", new Uniform(gooeySoftness)],
        ["uGooeyNoiseIntensity", new Uniform(gooeyNoiseIntensity)],
        ["uGooeyIntensity", new Uniform(0)],
        ["uScrambleSeed", new Uniform(0)],
        ["uTime", new Uniform(0)],
        ["uHeadTurnAmount", new Uniform(0)],
        ["uDepthMap", new Uniform(new Texture())],
        ["uEnableDepthParallax", new Uniform(enableDepthParallax)],
        ["uParallaxIntensity", new Uniform(parallaxIntensity)],
        ["uParallaxOffset", new Uniform({ x: 0, y: 0 })],
        ["uColorDark", new Uniform(new Color(colorDark ?? color))],
        ["uDepthDetailMin", new Uniform(depthDetailMin)],
        ["uClickPoint", new Uniform({ x: -1, y: -1 })],
        ["uRadialInvert", new Uniform(0)],
        ["uImpactProgress", new Uniform(0)],
        ["uRevealOrigin", new Uniform({ x: revealOrigin.x, y: revealOrigin.y })],
      ]),
    });

    const charUniform = this.uniforms.get("uCharacters");
    if (charUniform) {
      this.charactersTexture = this.createCharactersTexture(characters, fontSize);
      charUniform.value = this.charactersTexture;
    }

    if (typeof document !== "undefined") {
      this.visibilityHandler = () => {
        if (document.visibilityState === "visible") {
          this.framesToSkip = 5;
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }
  }

  dispose() {
    if (this.visibilityHandler && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.charactersTexture) {
      this.charactersTexture.dispose();
      this.charactersTexture = null;
      fv();
    }
    if (this.depthMapTexture) {
      this.depthMapTexture.dispose();
      this.depthMapTexture = null;
      fv();
    }
    super.dispose();
  }

  update(_renderer, _inputBuffer, deltaTime) {
    if (deltaTime === undefined) return;
    if (1000 * deltaTime > 500) this.framesToSkip = 5;
    if (this.framesToSkip > 0) {
      this.framesToSkip--;
      return;
    }
    const timeUniform = this.uniforms.get("uTime");
    if (timeUniform) {
      const clamped = Math.min(deltaTime, 0.033);
      timeUniform.value += clamped;
      if (timeUniform.value > 1000) {
        timeUniform.value = timeUniform.value % 1000;
      }
    }
  }

  createCharactersTexture(characters, fontSize) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    // r0 → CanvasTexture (mag/min filters 1003 = LinearFilter in three.js)
    const texture = new CanvasTexture(canvas);
    // NOTE: original used new r0(n, void 0, 1e3, 1e3, 1003, 1003)
    texture.minFilter = texture.magFilter = 1003; // LinearFilter

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Context not available");

    const font = `${fontSize}px "Cascadia Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`;

    const draw = () => {
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      for (let i = 0; i < characters.length; i++) {
        const ch = characters[i];
        const col = i % 16;
        const row = Math.floor(i / 16);
        if (ch) ctx.fillText(ch, 64 * col + 32, 64 * row + 32);
      }
      texture.needsUpdate = true;
    };

    draw();

    if (typeof document !== "undefined" && document.fonts?.load) {
      document.fonts
        .load(font)
        .then(() => draw())
        .catch(() => {});
      setTimeout(() => draw(), 100);
    }

    fg();
    return texture;
  }

  setColor(color) {
    const u = this.uniforms.get("uColor");
    if (u) u.value = new Color(color);
  }
  setCellSize(v) {
    const u = this.uniforms.get("uCellSize");
    if (u) u.value = v;
  }
  setProgress(v) {
    const u = this.uniforms.get("uProgress");
    if (u) u.value = v;
  }
  setColorProgress(v) {
    const u = this.uniforms.get("uColorProgress");
    if (u) u.value = v;
  }
  setRandomness(v) {
    const u = this.uniforms.get("uRandomness");
    if (u) u.value = v;
  }
  setMousePosition(x, y) {
    const u = this.uniforms.get("uMouse");
    if (u) u.value = { x, y };
  }
  setEnableGooeyReveal(v) {
    const u = this.uniforms.get("uEnableGooeyReveal");
    if (u) u.value = v;
  }
  setGooeyRadius(v) {
    const u = this.uniforms.get("uGooeyRadius");
    if (u) u.value = v;
  }
  setGooeySoftness(v) {
    const u = this.uniforms.get("uGooeySoftness");
    if (u) u.value = v;
  }
  setGooeyNoiseIntensity(v) {
    const u = this.uniforms.get("uGooeyNoiseIntensity");
    if (u) u.value = v;
  }
  setScrambleSeed(v) {
    const u = this.uniforms.get("uScrambleSeed");
    if (u) u.value = v;
  }
  setGooeyIntensity(v) {
    const u = this.uniforms.get("uGooeyIntensity");
    if (u) u.value = v;
  }
  setHeadTurnAmount(v) {
    const u = this.uniforms.get("uHeadTurnAmount");
    if (u) u.value = v;
  }
  setDepthMap(tex) {
    if (this.depthMapTexture) {
      this.depthMapTexture.dispose();
      fv();
    }
    this.depthMapTexture = tex;
    fg();
    const u = this.uniforms.get("uDepthMap");
    if (u) u.value = tex;
  }
  setEnableDepthParallax(v) {
    const u = this.uniforms.get("uEnableDepthParallax");
    if (u) u.value = v;
  }
  setParallaxOffset(x, y) {
    const u = this.uniforms.get("uParallaxOffset");
    if (u) u.value = { x, y };
  }
  setParallaxIntensity(v) {
    const u = this.uniforms.get("uParallaxIntensity");
    if (u) u.value = v;
  }
  setDepthDetailMin(v) {
    const u = this.uniforms.get("uDepthDetailMin");
    if (u) u.value = v;
  }
  setImpactProgress(v) {
    const u = this.uniforms.get("uImpactProgress");
    if (u) u.value = v;
  }
  setRadialInvert(v) {
    const u = this.uniforms.get("uRadialInvert");
    if (u) u.value = v;
  }
  setClickPoint(x, y) {
    const u = this.uniforms.get("uClickPoint");
    if (u) u.value = { x, y };
  }
  setRevealOrigin(x, y) {
    const u = this.uniforms.get("uRevealOrigin");
    if (u) u.value = { x, y };
  }
  setColorDark(color) {
    const u = this.uniforms.get("uColorDark");
    if (u) u.value = new Color(color);
  }
}