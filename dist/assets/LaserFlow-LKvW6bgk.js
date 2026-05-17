import{b as k,j as B}from"./index-BQ55wLdL.js";import{W as H,c as V,O as X,a7 as j,l as G,aS as O,aT as _,h as q,M as I,j as P,i as D}from"./three.module-1yEB221B.js";const $=`
precision highp float;
attribute vec3 position;

void main() {
  gl_Position = vec4(position, 1.0);
}
`,J=`
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

  float verticalMask = smoothstep(-1.08, -0.76, y) * (1.0 - smoothstep(0.72, 1.08, y));
  float edgeFalloff = pow(1.0 - smoothstep(0.0, uFalloffStart, abs(y)), max(0.18, uDecay));
  float flow = 0.78 + sin((y * 12.0) - uTime * 2.2) * uFlowStrength;

  float bottomBloom = 1.0 - smoothstep(-0.92, 0.12, y);
  float topTaper = 1.0 - smoothstep(0.34, 1.02, y);
  float spread = 1.0 + bottomBloom * 2.35;
  float beamX = x / spread;

  float core = exp(-abs(beamX) * 30.0) * flow;
  float halo = exp(-abs(beamX) * 7.0) * (0.16 + bottomBloom * 0.42);
  float floorLine = exp(-abs(y + 0.86) * 42.0) * exp(-abs(x) * 0.95);
  float floorGlow = exp(-abs(y + 0.84) * 7.0) * exp(-abs(x) * 1.35) * 0.72;
  float rebound = exp(-abs(y + 0.68) * 4.2) * exp(-abs(x) * 2.2) * 0.18;
  float fog = fbm(vec2(x * 5.0 + uTime * 0.05, y * 4.6 - uTime * 0.18) * max(0.04, uFogScale) * 10.0);

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

  float energy = (core + halo + floorGlow + floorLine + rebound + fog * 0.052 + lanes * 0.014 * uWispIntensity) * verticalMask * topTaper;
  float alpha = clamp(energy * edgeFalloff * 0.56, 0.0, 0.62);
  vec3 color = uColor * (0.5 + energy * 0.55);

  gl_FragColor = vec4(color, alpha);
}
`;function K(r){let e=r.trim();e.startsWith("#")&&(e=e.slice(1)),e.length===3&&(e=e.split("").map(o=>o+o).join(""));const t=Number.parseInt(e,16);return Number.isNaN(t)?new D(1,1,1):new D((t>>16&255)/255,(t>>8&255)/255,(t&255)/255)}function Y({className:r="",color:e="#ffffff",dpr:t=1,verticalSizing:o=5,horizontalSizing:p=2,wispIntensity:v=20,wispDensity:d=5,wispSpeed:h=15.5,flowStrength:x=.38,fogScale:g=.1,falloffStart:b=1.31,decay:w=.5,onSceneError:f}){const y=k.useRef(null);return k.useEffect(()=>{const l=y.current;if(!l)return;let a;try{a=new H({alpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"low-power"})}catch{f?.();return}const R=new V,L=new X(-1,1,1,-1,0,1),u=new j;u.setAttribute("position",new G(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));const c={uTime:{value:0},uResolution:{value:new q(1,1)},uColor:{value:K(e)},uVerticalSizing:{value:o},uHorizontalSizing:{value:p},uWispIntensity:{value:v},uWispDensity:{value:d},uWispSpeed:{value:h},uFlowStrength:{value:x},uFogScale:{value:g},uFalloffStart:{value:b},uDecay:{value:w}},F=new O({vertexShader:$,fragmentShader:J,uniforms:c,transparent:!0,depthTest:!1,depthWrite:!1,blending:_}),S=new I(u,F);S.frustumCulled=!1,R.add(S);const s=a.domElement;s.className="laser-flow-canvas",l.appendChild(s);let T=0,i=0;const m=Math.min(Math.max(t,.75),1.25),M=new P,W=()=>{const n=l.clientWidth||1,E=l.clientHeight||1;a.setPixelRatio(m),a.setSize(n,E,!1),c.uResolution.value.set(n*m,E*m)},N=()=>{i&&window.cancelAnimationFrame(i),i=window.requestAnimationFrame(W)},z=()=>{c.uTime.value=M.getElapsedTime(),a.render(R,L),T=window.requestAnimationFrame(z)},A=n=>{n.preventDefault(),f?.()};s.addEventListener("webglcontextlost",A);const C=new ResizeObserver(N);return C.observe(l),W(),z(),()=>{window.cancelAnimationFrame(T),i&&window.cancelAnimationFrame(i),C.disconnect(),s.removeEventListener("webglcontextlost",A),u.dispose(),F.dispose(),a.dispose(),a.forceContextLoss(),s.remove()}},[e,t,o,p,v,d,h,x,g,b,w,f]),B.jsx("div",{"aria-hidden":"true",className:`laser-flow-container ${r}`,ref:y})}export{Y as default};
