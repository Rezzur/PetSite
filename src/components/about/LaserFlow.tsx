import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type LaserFlowProps = {
  className?: string;
  color?: string;
  dpr?: number;
  verticalSizing?: number;
  horizontalSizing?: number;
  wispIntensity?: number;
  wispDensity?: number;
  wispSpeed?: number;
  flowStrength?: number;
  fogScale?: number;
  falloffStart?: number;
  decay?: number;
  onSceneError?: () => void;
};

const VERTEX_SHADER = `
precision highp float;
attribute vec3 position;

void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uVerticalSizing;
uniform float uHorizontalSizing;
uniform float uWispIntensity;
uniform float uWispDensity;
uniform float uWispSpeed;
uniform float uFlowStrength;
uniform float uFogScale;
uniform float uFalloffStart;
uniform float uDecay;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amp * noise(p);
    p *= 2.05;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / max(uResolution.xy, vec2(1.0))) * 2.0 - 1.0;
  uv.x *= uResolution.x / max(uResolution.y, 1.0);

  float verticalRange = max(0.35, uVerticalSizing);
  float horizontalRange = max(0.25, uHorizontalSizing);
  float x = uv.x / horizontalRange;
  float y = uv.y / verticalRange;

  float verticalMask = smoothstep(-1.03, -0.62, y) * (1.0 - smoothstep(0.62, 1.03, y));
  float edgeFalloff = pow(1.0 - smoothstep(0.0, uFalloffStart, abs(y)), max(0.18, uDecay));
  float flow = 0.78 + sin((y * 12.0) - uTime * 2.2) * uFlowStrength;

  float core = exp(-abs(x) * 34.0) * flow;
  float halo = exp(-abs(x) * 11.0) * 0.18;
  float fog = fbm(vec2(x * 8.0 + uTime * 0.05, y * 6.0 - uTime * 0.18) * max(0.04, uFogScale) * 10.0);

  float lanes = 0.0;
  float density = clamp(uWispDensity, 1.0, 8.0);
  for (int i = 0; i < 8; i++) {
    if (float(i) >= density) break;
    float side = mod(float(i), 2.0) * 2.0 - 1.0;
    float laneOffset = side * (0.018 + float(i) * 0.018);
    float laneX = abs(x - laneOffset);
    float lane = smoothstep(0.028, 0.0, laneX);
    float seed = hash(vec2(float(i), 4.7));
    float streak = fract(y * 9.0 + seed + uTime * uWispSpeed * 0.065);
    float segment = smoothstep(0.0, 0.15, streak) * (1.0 - smoothstep(0.38, 1.0, streak));
    lanes += lane * segment;
  }

  float energy = (core + halo + fog * 0.035 + lanes * 0.012 * uWispIntensity) * verticalMask;
  float alpha = clamp(energy * edgeFalloff * 0.46, 0.0, 0.42);
  vec3 color = uColor * (0.52 + energy * 0.48);

  gl_FragColor = vec4(color, alpha);
}
`;

function hexToRgb(hex: string) {
  let value = hex.trim();
  if (value.startsWith('#')) value = value.slice(1);
  if (value.length === 3) {
    value = value
      .split('')
      .map((item) => item + item)
      .join('');
  }

  const parsed = Number.parseInt(value, 16);
  if (Number.isNaN(parsed)) return new THREE.Vector3(1, 1, 1);

  return new THREE.Vector3(((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255);
}

export default function LaserFlow({
  className = '',
  color = '#ffffff',
  dpr = 1,
  verticalSizing = 5,
  horizontalSizing = 2,
  wispIntensity = 20,
  wispDensity = 5,
  wispSpeed = 15.5,
  flowStrength = 0.38,
  fogScale = 0.1,
  falloffStart = 1.31,
  decay = 0.5,
  onSceneError
}: LaserFlowProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power'
      });
    } catch {
      onSceneError?.();
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColor: { value: hexToRgb(color) },
      uVerticalSizing: { value: verticalSizing },
      uHorizontalSizing: { value: horizontalSizing },
      uWispIntensity: { value: wispIntensity },
      uWispDensity: { value: wispDensity },
      uWispSpeed: { value: wispSpeed },
      uFlowStrength: { value: flowStrength },
      uFogScale: { value: fogScale },
      uFalloffStart: { value: falloffStart },
      uDecay: { value: decay }
    };

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const canvas = renderer.domElement;
    canvas.className = 'laser-flow-canvas';
    root.appendChild(canvas);

    let frame = 0;
    let resizeFrame = 0;
    const pixelRatio = Math.min(Math.max(dpr, 0.75), 1.25);
    const clock = new THREE.Clock();

    const resize = () => {
      const width = root.clientWidth || 1;
      const height = root.clientHeight || 1;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
    };

    const requestResize = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(resize);
    };

    const render = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onSceneError?.();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);

    const observer = new ResizeObserver(requestResize);
    observer.observe(root);
    resize();
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [
    color,
    dpr,
    verticalSizing,
    horizontalSizing,
    wispIntensity,
    wispDensity,
    wispSpeed,
    flowStrength,
    fogScale,
    falloffStart,
    decay,
    onSceneError
  ]);

  return <div aria-hidden="true" className={`laser-flow-container ${className}`} ref={rootRef} />;
}
