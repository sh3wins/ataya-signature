"use client";

/**
 * Plays the Lab video (a pink and a green soft-serve on white) through WebGL,
 * live: the white background becomes see-through, the pink cream takes the
 * first flavour's colours and the green cream the second's, the cones stay as
 * they are. One small video file covers every pair of flavours.
 */

const VS = `attribute vec2 p; varying vec2 uv;
void main(){ uv = vec2(p.x*0.5+0.5, 0.5-p.y*0.5); gl_Position = vec4(p,0.0,1.0); }`;

const FS = `precision mediump float;
varying vec2 uv;
uniform sampler2D v;
uniform vec2 texel;
uniform vec3 a0; uniform vec3 a1; uniform vec3 a2;
uniform vec3 b0; uniform vec3 b1; uniform vec3 b2;

float alphaAt(vec2 q){
  vec3 c = texture2D(v, q).rgb;
  float s = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  float dark = 1.0 - min(c.r, min(c.g, c.b));
  return clamp(max((s - 0.05) / 0.07, (dark - 0.12) / 0.08), 0.0, 1.0);
}
vec3 ramp(float t, vec3 l, vec3 m, vec3 d){
  vec3 dd = d * 0.78;
  if (t < 0.35) return mix(dd, mix(d, m, 0.58), t / 0.35);
  if (t < 0.62) return mix(mix(d, m, 0.58), m, (t - 0.35) / 0.27);
  if (t < 0.86) return mix(m, l, (t - 0.62) / 0.24);
  return mix(l, vec3(1.0), (t - 0.86) / 0.14);
}
void main(){
  vec3 c = texture2D(v, uv).rgb;
  float a = alphaAt(uv);
  // shiny highlights are nearly white: keep them solid when cream surrounds them
  if (a < 0.99) {
    float n1 = 0.0;
    float n2 = 0.0;
    for (int i = 0; i < 8; i++) {
      float ang = float(i) * 0.785398;
      vec2 d = vec2(cos(ang), sin(ang)) * texel;
      n1 += step(0.9, alphaAt(uv + d * 10.0));
      n2 += step(0.9, alphaAt(uv + d * 22.0));
    }
    if (n1 > 5.5 || n2 > 6.5) a = 1.0;
  }
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  float pink = clamp((c.r - c.g) * 8.0 + 0.5, 0.0, 1.0);
  // the waffle is orange: red over green over blue (pink has more blue than green, green more green than red)
  float cone = smoothstep(0.38, 0.5, c.r - c.b) * smoothstep(0.12, 0.22, c.g - c.b) * smoothstep(0.08, 0.16, c.r - c.g);
  vec3 A = ramp(clamp((lum - 0.28) / 0.615, 0.0, 1.0), a0, a1, a2);
  vec3 B = ramp(clamp((lum - 0.15) / 0.784, 0.0, 1.0), b0, b1, b2);
  vec3 col = mix(mix(B, A, pink), c, cone);
  gl_FragColor = vec4(col * a, a);
}`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export interface TintPlayer {
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  play: () => Promise<void>;
  stop: () => void;
}

export function tintVideo(src: string, first: string[], second: string[]): TintPlayer | null {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
  if (!gl) return null;
  const video = document.createElement("video");
  // the same film as WebM where that plays (Chrome, Edge, Firefox), MP4 on Apple devices
  const webm = !/Apple/.test(navigator.vendor) && video.canPlayType('video/webm; codecs="vp9"') !== "";
  video.src = webm ? src.replace(/\.mp4$/, ".webm") : src;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.load();

  const sh = (type: number, code: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, code);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  ["a0", "a1", "a2"].forEach((n, i) => gl.uniform3fv(u(n), hex(first[i])));
  ["b0", "b1", "b2"].forEach((n, i) => gl.uniform3fv(u(n), hex(second[i])));

  let raf = 0;
  const draw = () => {
    if (video.readyState >= 2) {
      const w = video.videoWidth || 768;
      const h = video.videoHeight || 768;
      if (canvas.width !== w) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(u("texel"), 1 / w, 1 / h);
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(draw);
  };

  return {
    canvas,
    video,
    play: async () => {
      video.currentTime = 0;
      await video.play();
      draw();
    },
    stop: () => {
      cancelAnimationFrame(raf);
      video.pause();
    },
  };
}
