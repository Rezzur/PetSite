import{b as k,j as L}from"./index-Bo773opo.js";import{W as V,c as j,O,a7 as _,l as q,aS as B,aT as G,h as I,M as P,j as X,i as D}from"./three.module-1yEB221B.js";const $=`
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
`;function K(r){let e=r.trim();e.startsWith("#")&&(e=e.slice(1)),e.length===3&&(e=e.split("").map(o=>o+o).join(""));const t=Number.parseInt(e,16);return Number.isNaN(t)?new D(1,1,1):new D((t>>16&255)/255,(t>>8&255)/255,(t&255)/255)}function Y({className:r="",color:e="#ffffff",dpr:t=1,verticalSizing:o=5,horizontalSizing:p=2,wispIntensity:v=20,wispDensity:d=5,wispSpeed:h=15.5,flowStrength:g=.38,fogScale:x=.1,falloffStart:w=1.31,decay:y=.5,onSceneError:f}){const R=k.useRef(null);return k.useEffect(()=>{const i=R.current;if(!i)return;let a;try{a=new V({alpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"low-power"})}catch{f?.();return}const b=new j,M=new O(-1,1,1,-1,0,1),u=new _;u.setAttribute("position",new q(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));const c={uTime:{value:0},uResolution:{value:new I(1,1)},uColor:{value:K(e)},uVerticalSizing:{value:o},uHorizontalSizing:{value:p},uWispIntensity:{value:v},uWispDensity:{value:d},uWispSpeed:{value:h},uFlowStrength:{value:g},uFogScale:{value:x},uFalloffStart:{value:w},uDecay:{value:y}},F=new B({vertexShader:$,fragmentShader:J,uniforms:c,transparent:!0,depthTest:!1,depthWrite:!1,blending:G}),S=new P(u,F);S.frustumCulled=!1,b.add(S);const n=a.domElement;n.className="laser-flow-canvas",i.appendChild(n);let W=0,l=0;const m=Math.min(Math.max(t,.75),1.25),N=new X,z=()=>{const s=i.clientWidth||1,E=i.clientHeight||1;a.setPixelRatio(m),a.setSize(s,E,!1),c.uResolution.value.set(s*m,E*m)},H=()=>{l&&window.cancelAnimationFrame(l),l=window.requestAnimationFrame(z)},T=()=>{c.uTime.value=N.getElapsedTime(),a.render(b,M),W=window.requestAnimationFrame(T)},A=s=>{s.preventDefault(),f?.()};n.addEventListener("webglcontextlost",A);const C=new ResizeObserver(H);return C.observe(i),z(),T(),()=>{window.cancelAnimationFrame(W),l&&window.cancelAnimationFrame(l),C.disconnect(),n.removeEventListener("webglcontextlost",A),u.dispose(),F.dispose(),a.dispose(),a.forceContextLoss(),n.remove()}},[e,t,o,p,v,d,h,g,x,w,y,f]),L.jsx("div",{"aria-hidden":"true",className:`laser-flow-container ${r}`,ref:R})}export{Y as default};
