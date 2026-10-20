
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import * as THREE from 'three';

type ModelKind = 'roll' | 'foundation' | 'roof';

type Props = {
  kind: ModelKind;
  progress: MutableRefObject<number>;
  active?: boolean;
};

type LayerStackProps = Props & {
  animate: boolean;
  mobile: boolean;
};

type Surface =
  | 'black'
  | 'woven'
  | 'mineralGrey'
  | 'mineralBrown'
  | 'mineralDark'
  | 'mineralLight'
  | 'sand'
  | 'concrete'
  | 'soil'
  | 'foil';

type SurfaceStyle = {
  base: string;
  chips: string[];
  roughness: number;
  metalness: number;
  density: number;
};

const surfaceStyles: Record<Surface, SurfaceStyle> = {
  black: {
    base: '#171918',
    chips: ['#252725', '#343531', '#44443e', '#0e1010'],
    roughness: 0.86,
    metalness: 0.02,
    density: 4200,
  },
  woven: {
    base: '#55534e',
    chips: ['#85817a', '#34332f', '#a6a198', '#62615b'],
    roughness: 0.9,
    metalness: 0,
    density: 7500,
  },
  mineralGrey: {
    base: '#777874',
    chips: ['#dad9d2', '#b6b3a9', '#454746', '#92948d'],
    roughness: 0.98,
    metalness: 0,
    density: 11500,
  },
  mineralBrown: {
    base: '#99765e',
    chips: ['#d4ad8b', '#604d43', '#c18e6c', '#b99e86'],
    roughness: 0.98,
    metalness: 0,
    density: 11500,
  },
  mineralDark: {
    base: '#4c4d4c',
    chips: ['#999994', '#252728', '#6a6d68', '#c6c1b5'],
    roughness: 0.99,
    metalness: 0,
    density: 12000,
  },
  mineralLight: {
    base: '#b9b4a8',
    chips: ['#efebe2', '#79766e', '#ccc6b8', '#9a968d'],
    roughness: 0.97,
    metalness: 0,
    density: 10000,
  },
  sand: {
    base: '#b49972',
    chips: ['#e0c5a0', '#78634c', '#c8ab83', '#f0d9b4'],
    roughness: 0.97,
    metalness: 0,
    density: 10000,
  },
  concrete: {
    base: '#a4a19a',
    chips: ['#e0dbd0', '#79766f', '#bab6aa', '#66635c'],
    roughness: 0.98,
    metalness: 0,
    density: 9000,
  },
  soil: {
    base: '#645547',
    chips: ['#a08a71', '#40382f', '#78624e', '#352f29'],
    roughness: 1,
    metalness: 0,
    density: 11000,
  },
  foil: {
    base: '#b5b6b3',
    chips: ['#edeae4', '#686d70', '#d6d6d1', '#929691'],
    roughness: 0.43,
    metalness: 0.45,
    density: 3400,
  },
};

function seeded(seed: number) {
  let value = seed % 2147483647;

  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createSurfaceTexture(
  surface: Surface,
  seed: number,
  brand: 'none' | 'top' | 'roll' = 'none',
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  const style = surfaceStyles[surface];

  if (!ctx) return texture;

  const random = seeded(seed);
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = style.base;
  ctx.fillRect(0, 0, width, height);

  const shade = ctx.createLinearGradient(0, 0, width, height);

  shade.addColorStop(0, 'rgba(255,255,255,0.12)');
  shade.addColorStop(0.55, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.16)');

  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < style.density; i++) {
    const x = random() * width;
    const y = random() * height;

    const size =
      surface === 'black'
        ? 0.5 + random() * 1.9
        : 0.75 + random() * 3.3;

    ctx.fillStyle =
      style.chips[Math.floor(random() * style.chips.length)];

    ctx.globalAlpha = 0.23 + random() * 0.66;

    ctx.beginPath();
    ctx.moveTo(x - size, y - size * 0.4);
    ctx.lineTo(x + size * 0.65, y - size * 0.75);
    ctx.lineTo(x + size, y + size * 0.2);
    ctx.lineTo(x - size * 0.25, y + size * 0.83);
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  if (surface === 'woven') {
    ctx.strokeStyle = 'rgba(236,232,221,0.16)';
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  if (surface === 'foil') {
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle =
        `rgba(255,255,255,${0.03 + random() * 0.15})`;

      ctx.lineWidth = 1 + random() * 2;

      const y = random() * height;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + (random() - 0.5) * 30);
      ctx.stroke();
    }
  }

  if (brand === 'top') {
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = 'rgba(10,12,12,0.88)';
    ctx.fillRect(centerX - 225, centerY - 98, 450, 196);

    ctx.strokeStyle = '#b5a78d';
    ctx.lineWidth = 4;
    ctx.strokeRect(centerX - 219, centerY - 92, 438, 184);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#f2f0e9';
    ctx.font = 'bold 132px Arial, sans-serif';
    ctx.fillText('BINO', centerX, centerY - 12);

    ctx.fillStyle = '#cfc6b3';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText('WATERPROOFING', centerX, centerY + 65);
  }

  if (brand === 'roll') {
    const band = 35;
    const cells = 20;

    for (const yStart of [0, height - band]) {
      for (let x = 0; x < width; x += cells) {
        for (let y = yStart; y < yStart + band; y += cells) {
          const even =
            (
              Math.floor(x / cells) +
              Math.floor((y - yStart) / cells)
            ) % 2 === 0;

          ctx.fillStyle = even ? '#dedbd2' : '#3b3d3c';
          ctx.fillRect(x, y, cells, cells);
        }
      }
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 4; i++) {
      const x = 128 + i * 256;

      ctx.fillStyle = 'rgba(11,12,13,0.65)';
      ctx.fillRect(x - 113, 190, 226, 128);

      ctx.fillStyle = '#eeeae1';
      ctx.font = 'bold 70px Arial, sans-serif';
      ctx.fillText('BINO', x, 248);

      ctx.fillStyle = '#c0b7a7';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('WATERPROOFING', x, 287);
    }
  }

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

function RollPiece({
  index,
  mobile,
}: {
  index: number;
  mobile: boolean;
}) {
  const surfaces: Surface[] = [
    'black',
    'mineralBrown',
    'woven',
    'black',
    'foil',
  ];

  const surface = surfaces[index];
  const radius = 0.88 - index * 0.095;
  const baseY = (index - 2) * 0.085;

  const texture = useMemo(
    () =>
      createSurfaceTexture(
        surface,
        100 + index * 29,
        index === 0 ? 'roll' : 'none',
      ),
    [surface, index],
  );

  useEffect(
    () => () => {
      texture.dispose();
    },
    [texture],
  );

  return (
    <group
      position={[0, baseY, 0]}
      userData={{ baseY }}
    >
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            radius,
            radius,
            2.3,
            mobile ? 48 : 72,
            1,
            true,
          ]}
        />

        <meshStandardMaterial
          color="#ffffff"
          map={texture}
          roughness={surfaceStyles[surface].roughness}
          metalness={surfaceStyles[surface].metalness}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, 1.16]}>
        <torusGeometry
          args={[
            radius * 0.86,
            0.018,
            8,
            mobile ? 40 : 64,
          ]}
        />

        <meshStandardMaterial
          color="#887d6a"
          roughness={0.68}
        />
      </mesh>
    </group>
  );
}

function SystemPiece({
  kind,
  index,
  count,
}: {
  kind: 'foundation' | 'roof';
  index: number;
  count: number;
}) {
  const foundationSurfaces: Surface[] = [
    'soil',
    'mineralLight',
    'concrete',
    'black',
    'mineralBrown',
    'concrete',
  ];

  const roofSurfaces: Surface[] = [
    'concrete',
    'mineralLight',
    'black',
    'black',
    'sand',
    'mineralBrown',
    'mineralGrey',
  ];

  const surface =
    (kind === 'foundation'
      ? foundationSurfaces
      : roofSurfaces)[index];

  const isBino =
    kind === 'foundation'
      ? index === 3
      : index === 2 || index === 3;

  const showLogo = index === count - 1;

  const width =
    kind === 'foundation'
      ? index === 0 || index === 5
        ? 2.75
        : 2.5
      : 3.1;

  const height = isBino ? 0.11 : 0.19;
  const baseY = (index - (count - 1) / 2) * 0.19;

  const textures = useMemo(
    () => ({
      top: createSurfaceTexture(
        surface,
        index * 41 + (kind === 'roof' ? 940 : 410),
        showLogo ? 'top' : 'none',
      ),
      side: createSurfaceTexture(
        surface,
        index * 73 + (kind === 'roof' ? 1820 : 1260),
      ),
    }),
    [surface, index, kind, showLogo],
  );

  useEffect(
    () => () => {
      textures.top.dispose();
      textures.side.dispose();
    },
    [textures],
  );

  const roughness = surfaceStyles[surface].roughness;
  const metalness = surfaceStyles[surface].metalness;

  return (
    <group
      position={[0, baseY, 0]}
      userData={{ baseY }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, 1.45]} />

        <meshStandardMaterial
          attach="material-0"
          map={textures.side}
          roughness={roughness}
          metalness={metalness}
        />

        <meshStandardMaterial
          attach="material-1"
          map={textures.side}
          roughness={roughness}
          metalness={metalness}
        />

        <meshStandardMaterial
          attach="material-2"
          map={textures.top}
          roughness={roughness}
          metalness={metalness}
          bumpMap={showLogo ? undefined : textures.top}
          bumpScale={showLogo || isBino ? 0 : 0.014}
        />

        <meshStandardMaterial
          attach="material-3"
          map={textures.side}
          roughness={roughness}
          metalness={metalness}
        />

        <meshStandardMaterial
          attach="material-4"
          map={textures.side}
          roughness={roughness}
          metalness={metalness}
        />

        <meshStandardMaterial
          attach="material-5"
          map={textures.side}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
    </group>
  );
}

function LayerStack({
  kind,
  progress,
  animate,
  mobile,
}: LayerStackProps) {
  const group = useRef<THREE.Group>(null);

  const count =
    kind === 'roll'
      ? 5
      : kind === 'foundation'
        ? 6
        : 7;

  useFrame((state, delta) => {
    if (!animate || !group.current) return;

    const p = progress.current;

    const mobileY =
      Math.sin(state.clock.elapsedTime * 0.45) * 0.08;

    const mobileX =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.035;

    const targetY = mobile
      ? mobileY
      : state.pointer.x * 0.24;

    const targetX = mobile
      ? mobileX
      : -state.pointer.y * 0.13;

    group.current.rotation.y +=
      (targetY - group.current.rotation.y) *
      Math.min(1, delta * 2.4);

    group.current.rotation.x +=
      (targetX - group.current.rotation.x) *
      Math.min(1, delta * 2.4);

    const targetZ =
      kind === 'roll'
        ? 0.14 + p * 0.5
        : 0.01;

    group.current.rotation.z +=
      (targetZ - group.current.rotation.z) *
      Math.min(1, delta * 0.75);

    group.current.children.forEach((child, index) => {
      const separation =
        kind === 'roll'
          ? Math.sin(p * Math.PI) * 0.75
          : Math.sin(p * Math.PI) * 0.56;

      const baseY = Number(child.userData.baseY ?? 0);

      child.position.y +=
        (
          baseY +
          (index - (count - 1) / 2) * separation -
          child.position.y
        ) *
        Math.min(1, delta * 3);

      const targetRotation =
        kind === 'roll'
          ? p * 0.16
          : 0;

      child.rotation.x +=
        (targetRotation - child.rotation.x) *
        Math.min(1, delta * 2);
    });
  });

  return (
    <group ref={group}>
      {kind === 'roll'
        ? Array.from({ length: count }, (_, i) => (
            <RollPiece
              key={i}
              index={i}
              mobile={mobile}
            />
          ))
        : Array.from({ length: count }, (_, i) => (
            <SystemPiece
              key={`${kind}-${i}`}
              kind={kind}
              index={i}
              count={count}
            />
          ))}
    </group>
  );
}

function AirDetails() {
  const particles = [
    {
      p: [-1.2, 0.72, 0.2],
      s: [0.09, 0.09, 0.09],
      c: '#c9b889',
      type: 'sphere',
    },
    {
      p: [1.3, 0.46, -0.2],
      s: [0.07, 0.07, 0.07],
      c: '#d9a441',
      type: 'sphere',
    },
    {
      p: [-0.7, -0.88, 0.25],
      s: [0.055, 0.055, 0.055],
      c: '#9c8c6b',
      type: 'sphere',
    },
    {
      p: [1.06, -0.63, 0.1],
      s: [0.055, 0.22, 0.055],
      c: '#958a74',
      type: 'fiber',
    },
    {
      p: [-1.3, -0.48, -0.3],
      s: [0.045, 0.3, 0.045],
      c: '#b5a57e',
      type: 'fiber',
    },
    {
      p: [0.85, 0.92, 0.3],
      s: [0.05, 0.18, 0.05],
      c: '#726a59',
      type: 'fiber',
    },
    {
      p: [1.45, 0.03, -0.45],
      s: [0.09, 0.09, 0.09],
      c: '#d9a441',
      type: 'bolt',
    },
    {
      p: [-1.45, 0.08, -0.45],
      s: [0.08, 0.08, 0.08],
      c: '#b8a982',
      type: 'bolt',
    },
  ];

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh
          key={index}
          position={
            particle.p as [number, number, number]
          }
          rotation={[
            index * 0.31,
            index * 0.6,
            index * 0.2,
          ]}
        >
          {particle.type === 'sphere' ? (
            <sphereGeometry
              args={[particle.s[0], 12, 10]}
            />
          ) : particle.type === 'bolt' ? (
            <cylinderGeometry
              args={[
                particle.s[0],
                particle.s[0],
                0.18,
                8,
              ]}
            />
          ) : (
            <boxGeometry
              args={
                particle.s as [number, number, number]
              }
            />
          )}

          <meshStandardMaterial
            color={particle.c}
            roughness={0.6}
            metalness={
              particle.type === 'bolt'
                ? 0.58
                : 0.05
            }
          />
        </mesh>
      ))}
    </group>
  );
}

export function BinoModel({
  kind,
  progress,
  active = true,
}: Props) {
  const mobile =
    typeof window !== 'undefined' &&
    window.matchMedia(
      '(max-width: 767px)',
    ).matches;

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={mobile ? [1, 1.1] : [1, 1.25]}
      camera={{
        position: mobile
          ? [4.8, 2.8, 6.5]
          : [4.2, 2.5, 5.4],
        fov: mobile ? 42 : 35,
      }}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <ambientLight
        intensity={mobile ? 1.15 : 1.05}
      />

      <directionalLight
        position={[5, 7, 4]}
        intensity={mobile ? 1.9 : 2.1}
        castShadow={!mobile}
      />

      <pointLight
        position={[-3, 0, -2]}
        intensity={
          kind === 'roll'
            ? 2.5
            : 1.1
        }
        color="#d9a441"
      />

      <Suspense fallback={null}>
        {reducedMotion ? (
          <LayerStack
            kind={kind}
            progress={progress}
            animate={false}
            mobile={mobile}
          />
        ) : (
          <Float
            speed={mobile ? 0.5 : 0.65}
            rotationIntensity={
              mobile ? 0.015 : 0.025
            }
            floatIntensity={
              mobile ? 0.05 : 0.08
            }
          >
            <LayerStack
              kind={kind}
              progress={progress}
              animate
              mobile={mobile}
            />
          </Float>
        )}

        {kind === 'roll' &&
          (reducedMotion ? (
            <AirDetails />
          ) : (
            <Float
              speed={mobile ? 0.6 : 0.8}
              rotationIntensity={
                mobile ? 0.06 : 0.1
              }
              floatIntensity={
                mobile ? 0.1 : 0.16
              }
            >
              <AirDetails />
            </Float>
          ))}

        <ContactShadows
          frames={1}
          resolution={mobile ? 256 : 512}
          position={[0, -1.65, 0]}
          opacity={mobile ? 0.25 : 0.32}
          scale={mobile ? 6 : 8}
          blur={mobile ? 2.2 : 2.6}
          far={4}
        />
      </Suspense>
    </Canvas>
  );
}
