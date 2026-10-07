import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import * as THREE from 'three';

type ModelKind =
  | 'roll'
  | 'foundation'
  | 'roof';

type Props = {
  kind: ModelKind;
  progress: MutableRefObject<number>;
};

type LayerStackProps = Props & {
  animate: boolean;
  mobile: boolean;
};

function LayerStack({
  kind,
  progress,
  animate,
  mobile,
}: LayerStackProps) {
  const group =
    useRef<THREE.Group>(null);

  const count =
    kind === 'roll'
      ? 5
      : kind === 'foundation'
        ? 6
        : 7;

  const colors = useMemo(() => {
    if (kind === 'roll') {
      return [
        '#b69d6a',
        '#35332e',
        '#d6a43c',
        '#25231f',
        '#45423b',
      ];
    }

    if (kind === 'foundation') {
      return [
        '#625d50',
        '#978e7d',
        '#706d65',
        '#d5a13b',
        '#8b8578',
        '#514d43',
      ];
    }

    return [
      '#79756b',
      '#a47e42',
      '#d4a03a',
      '#bd8f35',
      '#77776c',
      '#aca28d',
      '#5c574b',
    ];
  }, [kind]);

  useFrame((state, delta) => {
    if (!animate) return;
    if (!group.current) return;

    const p = progress.current;

    const mobileY =
      Math.sin(
        state.clock.elapsedTime * 0.45,
      ) * 0.08;

    const mobileX =
      Math.sin(
        state.clock.elapsedTime * 0.3,
      ) * 0.035;

    const targetY = mobile
      ? mobileY
      : state.pointer.x * 0.24;

    const targetX = mobile
      ? mobileX
      : -state.pointer.y * 0.13;

    group.current.rotation.y +=
      (targetY -
        group.current.rotation.y) *
      Math.min(1, delta * 2.4);

    group.current.rotation.x +=
      (targetX -
        group.current.rotation.x) *
      Math.min(1, delta * 2.4);

    const targetZ =
      kind === 'roll'
        ? 0.14 + p * 0.5
        : 0.01;

    group.current.rotation.z +=
      (targetZ -
        group.current.rotation.z) *
      Math.min(1, delta * 0.75);

    group.current.children.forEach(
      (child, index) => {
        const separation =
          kind === 'roll'
            ? Math.sin(
                p * Math.PI,
              ) * 0.75
            : Math.sin(
                p * Math.PI,
              ) * 0.56;

        const baseY = Number(
          child.userData.baseY ?? 0,
        );

        child.position.y +=
          (
            baseY +
            (
              index -
              (count - 1) / 2
            ) *
              separation -
            child.position.y
          ) *
          Math.min(1, delta * 3);

        const targetRotation =
          kind === 'roll'
            ? p * 0.16
            : 0;

        child.rotation.x +=
          (
            targetRotation -
            child.rotation.x
          ) *
          Math.min(1, delta * 2);
      },
    );
  });

  return (
    <group ref={group}>
      {kind === 'roll'
        ? colors.map(
            (color, i) => {
              const radius =
                0.88 -
                i * 0.095;

              return (
                <group
                  key={color}
                  position={[
                    0,
                    (i - 2) *
                      0.085,
                    0,
                  ]}
                  userData={{
                    baseY:
                      (i - 2) *
                      0.085,
                  }}
                >
                  <mesh
                    rotation={[
                      Math.PI / 2,
                      0,
                      0,
                    ]}
                    castShadow
                    receiveShadow
                  >
                    <cylinderGeometry
                      args={[
                        radius,
                        radius,
                        2.3,
                        mobile
                          ? 48
                          : 72,
                        1,
                        true,
                      ]}
                    />

                    <meshStandardMaterial
                      color={color}
                      roughness={0.82}
                      side={
                        THREE.DoubleSide
                      }
                    />
                  </mesh>

                  <mesh
                    position={[
                      0,
                      0,
                      1.16,
                    ]}
                  >
                    <torusGeometry
                      args={[
                        radius *
                          0.86,
                        0.018,
                        8,
                        mobile
                          ? 40
                          : 64,
                      ]}
                    />

                    <meshStandardMaterial
                      color={
                        i === 2
                          ? '#e5bd69'
                          : '#75694f'
                      }
                      roughness={0.55}
                    />
                  </mesh>
                </group>
              );
            },
          )
        : colors.map(
            (color, i) => {
              const isBino =
                kind ===
                'foundation'
                  ? i === 3
                  : i === 2 ||
                    i === 3;

              const width =
                kind ===
                'foundation'
                  ? i === 0 ||
                    i === 5
                    ? 2.75
                    : 2.5
                  : 3.1;

              const baseY =
                (
                  i -
                  (count - 1) /
                    2
                ) * 0.19;

              return (
                <mesh
                  key={`${color}-${i}`}
                  position={[
                    0,
                    baseY,
                    0,
                  ]}
                  userData={{
                    baseY,
                  }}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry
                    args={[
                      width,
                      isBino
                        ? 0.11
                        : 0.19,
                      1.45,
                    ]}
                  />

                  <meshStandardMaterial
                    color={color}
                    roughness={
                      isBino
                        ? 0.43
                        : 0.84
                    }
                    metalness={
                      isBino
                        ? 0.1
                        : 0
                    }
                    emissive={
                      isBino
                        ? '#8a5c0c'
                        : '#000000'
                    }
                    emissiveIntensity={
                      isBino
                        ? 0.23
                        : 0
                    }
                  />
                </mesh>
              );
            },
          )}
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
      {particles.map(
        (particle, index) => (
          <mesh
            key={index}
            position={
              particle.p as [
                number,
                number,
                number,
              ]
            }
            rotation={[
              index * 0.31,
              index * 0.6,
              index * 0.2,
            ]}
          >
            {particle.type ===
            'sphere' ? (
              <sphereGeometry
                args={[
                  particle.s[0],
                  12,
                  10,
                ]}
              />
            ) : particle.type ===
              'bolt' ? (
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
                  particle.s as [
                    number,
                    number,
                    number,
                  ]
                }
              />
            )}

            <meshStandardMaterial
              color={particle.c}
              roughness={0.6}
              metalness={
                particle.type ===
                'bolt'
                  ? 0.58
                  : 0.05
              }
            />
          </mesh>
        ),
      )}
    </group>
  );
}

export function BinoModel({
  kind,
  progress,
}: Props) {
  const mobile =
    typeof window !==
      'undefined' &&
    window.matchMedia(
      '(max-width: 767px)',
    ).matches;

  const reducedMotion =
    typeof window !==
      'undefined' &&
    window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

  return (
    <Canvas
      dpr={
        mobile
          ? [1, 1.25]
          : [1, 1.6]
      }
      camera={{
        position: mobile
          ? [4.8, 2.8, 6.5]
          : [4.2, 2.5, 5.4],

        fov: mobile
          ? 42
          : 35,
      }}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        powerPreference:
          'high-performance',
      }}
    >
      <ambientLight
        intensity={
          mobile
            ? 1.15
            : 1.05
        }
      />

      <directionalLight
        position={[5, 7, 4]}
        intensity={
          mobile
            ? 1.9
            : 2.1
        }
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
            speed={
              mobile
                ? 0.5
                : 0.65
            }
            rotationIntensity={
              mobile
                ? 0.015
                : 0.025
            }
            floatIntensity={
              mobile
                ? 0.05
                : 0.08
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
              speed={
                mobile
                  ? 0.6
                  : 0.8
              }
              rotationIntensity={
                mobile
                  ? 0.06
                  : 0.1
              }
              floatIntensity={
                mobile
                  ? 0.1
                  : 0.16
              }
            >
              <AirDetails />
            </Float>
          ))}

        <ContactShadows
          position={[0, -1.65, 0]}
          opacity={
            mobile
              ? 0.25
              : 0.32
          }
          scale={
            mobile
              ? 6
              : 8
          }
          blur={
            mobile
              ? 2.2
              : 2.6
          }
          far={4}
        />
      </Suspense>
    </Canvas>
  );
}