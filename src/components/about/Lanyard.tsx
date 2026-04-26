/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RigidBodyProps,
  useRopeJoint,
  useSphericalJoint
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import cardGLB from '../../assets/lanyard/card.glb';
import lanyard from '../../assets/lanyard/lanyard.png';
import './Lanyard.css';

// Adapted from React Bits Lanyard. The physics contract stays close to the
// original single-card component; the badge texture is custom for this project.
extend({ MeshLineGeometry, MeshLineMaterial } as any);

const MeshLineMaterialTag = 'meshLineMaterial' as any;

export type LanyardProfile = {
  id: string;
  name: string;
  role: string;
  description: string;
  metaRole: string;
  status: string;
  photoSrc?: string;
  initials: string;
};

type LanyardProps = {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  profile: LanyardProfile;
  onSceneError?: () => void;
};

type BandProps = {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  profile: LanyardProfile;
};

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  profile,
  onSceneError
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper" aria-hidden="true">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, 1.35]}
        gl={{ alpha: transparent, antialias: false, powerPreference: 'low-power' }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <CanvasErrorBridge onSceneError={onSceneError} />
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} profile={profile} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            color="white"
            intensity={2}
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={3}
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={3}
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            color="white"
            intensity={10}
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function CanvasErrorBridge({ onSceneError }: { onSceneError?: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (!onSceneError) return undefined;

    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onSceneError();
    };
    const handleContextCreationError = () => onSceneError();

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextcreationerror', handleContextCreationError);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextcreationerror', handleContextCreationError);
    };
  }, [gl, onSceneError]);

  return null;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, profile }: BandProps) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const segmentProps: Partial<RigidBodyProps> = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const { nodes, materials } = useGLTF(cardGLB) as any;
  const texture = useTexture(lanyard);
  const cardTexture = useBadgeTexture(profile);
  const [initialLinePoints] = useState(() => [
    new THREE.Vector3(1.5, 4, 0),
    new THREE.Vector3(1, 4, 0),
    new THREE.Vector3(0.5, 4, 0),
    new THREE.Vector3(0, 4, 0)
  ]);
  const lineGeometry = useMemo(() => {
    const geometry = new MeshLineGeometry();
    geometry.setPoints(initialLinePoints);
    return geometry;
  }, [initialLinePoints]);
  const [curve] = useState(() => new THREE.CatmullRomCurve3(initialLinePoints.map((point) => point.clone())));
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  useEffect(() => {
    if (!hovered) return undefined;
    document.body.style.cursor = dragged ? 'grabbing' : 'grab';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, dragged]);

  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }

    const fixedBody = fixed.current;
    const joint1 = j1.current;
    const joint2 = j2.current;
    const joint3 = j3.current;
    const cardBody = card.current;
    const bandGeometry = band.current?.geometry;

    if (!fixedBody || !joint1 || !joint2 || !joint3 || !cardBody || !bandGeometry) return;

    [joint1, joint2].forEach((joint) => {
      if (!joint.lerped) joint.lerped = new THREE.Vector3().copy(joint.translation());
      const clampedDistance = Math.max(0.1, Math.min(1, joint.lerped.distanceTo(joint.translation())));
      joint.lerped.lerp(joint.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
    });

    curve.points[0].copy(joint3.translation());
    curve.points[1].copy(joint2.lerped);
    curve.points[2].copy(joint1.lerped);
    curve.points[3].copy(fixedBody.translation());
    const nextPoints = curve.getPoints(isMobile ? 16 : 32);
    const pointsAreFinite = nextPoints.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
    if (pointsAreFinite) {
      bandGeometry.setPoints(nextPoints);
    }

    ang.copy(cardBody.angvel());
    rot.copy(cardBody.rotation());
    cardBody.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
  });

  curve.curveType = 'chordal';
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={card} position={[2, 0, 0]} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            onPointerDown={(event: any) => {
              event.stopPropagation();
              event.target.setPointerCapture(event.pointerId);
              drag(new THREE.Vector3().copy(event.point).sub(vec.copy(card.current.translation())));
            }}
            onPointerOut={() => hover(false)}
            onPointerOver={() => hover(true)}
            onPointerUp={(event: any) => {
              event.stopPropagation();
              event.target.releasePointerCapture(event.pointerId);
              drag(false);
            }}
            position={[0, -1.2, -0.05]}
            scale={2.25}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                emissive="#181818"
                emissiveIntensity={0.32}
                map={cardTexture}
                map-anisotropy={16}
                metalness={0.22}
                roughness={0.78}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <primitive attach="geometry" object={lineGeometry} />
        <MeshLineMaterialTag
          color="white"
          depthTest={false}
          lineWidth={1}
          map={texture}
          repeat={[-4, 1]}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
        />
      </mesh>
    </>
  );
}

function useBadgeTexture(profile: LanyardProfile) {
  const [{ canvas, texture }] = useState(() => {
    const surface = document.createElement('canvas');
    surface.width = 1024;
    surface.height = 1400;
    const badgeTexture = new THREE.CanvasTexture(surface);
    badgeTexture.colorSpace = THREE.SRGBColorSpace;
    badgeTexture.flipY = false;
    badgeTexture.anisotropy = 16;
    return { canvas: surface, texture: badgeTexture };
  });

  useEffect(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBadgeTexture(ctx, profile);
    texture.needsUpdate = true;
  }, [canvas, profile, texture]);

  return texture;
}

function drawBadgeTexture(ctx: CanvasRenderingContext2D, profile: LanyardProfile) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const inset = 72;
  const panelX = 132;
  const panelY = 220;
  const panelWidth = width - panelX * 2;
  const panelHeight = 510;
  const lowerY = 790;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  drawTextureGrid(ctx, width, height);
  drawPunchHole(ctx, width, inset);
  drawAsciiIdentityPanel(ctx, profile, panelX, panelY, panelWidth, panelHeight);

  ctx.strokeStyle = 'rgba(255,255,255,0.24)';
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.strokeRect(inset + 18, inset + 18, width - (inset + 18) * 2, height - (inset + 18) * 2);

  ctx.textBaseline = 'top';
  ctx.font = '36px ui-monospace, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = '#d8d8d8';
  ctx.fillText(`ID: ${profile.id}`, inset + 34, inset + 34);
  ctx.textAlign = 'right';
  ctx.fillText(profile.status, width - inset - 34, inset + 34);
  ctx.textAlign = 'left';

  const [firstName, ...restName] = profile.name.split(' ');
  const lastName = restName.join(' ');

  ctx.font = '800 52px ui-monospace, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = '#f7f7f7';
  ctx.fillText(firstName, inset + 34, lowerY);
  ctx.font = '900 56px ui-monospace, Menlo, Monaco, Consolas, monospace';
  ctx.fillText(lastName, inset + 34, lowerY + 58);

  ctx.font = '28px ui-monospace, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = '#bdbdbd';
  ctx.fillText(`ROLE: ${profile.metaRole}`, inset + 34, lowerY + 138);
  ctx.fillText(`STATUS: ${profile.status}`, inset + 34, lowerY + 182);
  ctx.fillStyle = '#e2e2e2';
  wrapText(ctx, profile.role, inset + 34, lowerY + 242, width - inset * 2 - 68, 38, 2);

  drawBarcode(ctx, inset + 34, height - inset - 126, width - inset * 2 - 68, 70);
  drawScanlines(ctx, width, height);
}

function drawAsciiIdentityPanel(
  ctx: CanvasRenderingContext2D,
  profile: LanyardProfile,
  x: number,
  y: number,
  panelWidth: number,
  panelHeight: number
) {
  ctx.save();
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(x, y, panelWidth, panelHeight);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, panelWidth, panelHeight);

  ctx.beginPath();
  ctx.rect(x, y, panelWidth, panelHeight);
  ctx.clip();

  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  for (let gx = x; gx <= x + panelWidth; gx += 46) {
    ctx.fillRect(gx, y, 1, panelHeight);
  }
  for (let gy = y; gy <= y + panelHeight; gy += 46) {
    ctx.fillRect(x, gy, panelWidth, 1);
  }

  const fragments = ['ID', '01', 'DEV', 'UI', '//', 'fn', 'grid', 'pass'];
  ctx.font = '30px ui-monospace, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      ctx.fillText(fragments[(row + col + Number(profile.id)) % fragments.length], x + 44 + col * 162, y + 52 + row * 72);
    }
  }

  const glow = ctx.createRadialGradient(x + panelWidth * 0.5, y + panelHeight * 0.45, 0, x + panelWidth * 0.5, y + panelHeight * 0.45, panelWidth * 0.52);
  glow.addColorStop(0, 'rgba(255,255,255,0.13)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, panelWidth, panelHeight);

  ctx.font = '900 250px ui-monospace, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = '#f2f2f2';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(profile.initials, x + panelWidth / 2, y + panelHeight * 0.52);
  ctx.font = '24px ui-monospace, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.48)';
  ctx.fillText('DIGITAL IDENTITY PASS', x + panelWidth / 2, y + panelHeight - 58);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.restore();
}

function drawPunchHole(ctx: CanvasRenderingContext2D, width: number, inset: number) {
  const slotWidth = 150;
  const slotHeight = 38;
  const x = width / 2 - slotWidth / 2;
  const y = inset + 32;

  ctx.fillStyle = '#000';
  ctx.fillRect(x, y, slotWidth, slotHeight);
  ctx.strokeStyle = 'rgba(255,255,255,0.24)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, slotWidth, slotHeight);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(width / 2 - 46, y + slotHeight / 2 - 3, 92, 6);
}

function drawTextureGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBarcode(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const bars = [12, 4, 9, 18, 5, 5, 22, 7, 11, 4, 16, 8, 6, 20, 9, 5, 13, 4, 18, 7, 10, 5];
  let cursor = x;

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (const bar of bars) {
    if (cursor > x + width) break;
    ctx.fillRect(cursor, y, bar, height);
    cursor += bar + 8;
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.028)';
  for (let y = 0; y < height; y += 9) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = word;
      lines += 1;
      if (lines >= maxLines) return;
    } else {
      line = nextLine;
    }
  }

  if (line && lines < maxLines) ctx.fillText(line, x, y + lines * lineHeight);
}

useGLTF.preload(cardGLB);
