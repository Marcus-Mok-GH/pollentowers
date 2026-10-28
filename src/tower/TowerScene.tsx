import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { COMPANIES } from "../data/companies";

const FLOOR_H = 1.6;
const TOWER_W = 5;

function Floor({
  index,
  company,
  selected,
  onSelect,
}: {
  index: number;
  company: (typeof COMPANIES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  const emissive = useMemo(
    () => new THREE.Color(selected ? company.color : hovered ? "#ffffff" : "#1a2233"),
    [selected, hovered, company.color],
  );

  useFrame(() => {
    if (!mesh.current) return;
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissive.lerp(emissive, 0.15);
  });

  const w = company.vacant || company.sector === "Building" ? TOWER_W + 0.8 : TOWER_W - index * 0.1;

  return (
    <group position={[0, index * FLOOR_H + FLOOR_H / 2, 0]}>
      <mesh
        ref={mesh}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[w, FLOOR_H - 0.12, w]} />
        <meshStandardMaterial
          color={"#44547a"}
          emissive={emissive}
          emissiveIntensity={selected ? 1.2 : hovered ? 0.9 : 0.5}
          roughness={0.55}
          metalness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.1, w / 2 + 0.011]} onClick={handleClick}>
        <planeGeometry args={[w * 0.82, FLOOR_H * 0.34]} />
        <meshStandardMaterial
          color={company.color}
          emissive={company.color}
          emissiveIntensity={0.8}
        />
      </mesh>
      <Html position={[w / 2 + 0.15, 0, 0]} center distanceFactor={9} zIndexRange={[10, 0]}>
        <div
          style={{
            background: "rgba(8,10,18,0.85)",
            border: `1px solid ${company.color}`,
            color: "#f2f4f8",
            padding: "4px 8px",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "nowrap",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            cursor: "pointer",
          }}
          onClick={() => onSelect()}
        >
          <span style={{ color: company.color }}>{company.floor}</span> · {company.name}
        </div>
      </Html>
    </group>
  );
}

function ElevatorCab({ floorIndex }: { floorIndex: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const targetY = floorIndex * FLOOR_H + FLOOR_H / 2;
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, targetY, 4, dt);
  });
  return (
    <mesh ref={ref} position={[-(TOWER_W / 2 + 0.55), FLOOR_H / 2, 0]}>
      <boxGeometry args={[0.55, 1.1, 0.55]} />
      <meshStandardMaterial color="#6ee7ff" emissive="#6ee7ff" emissiveIntensity={1.4} />
    </mesh>
  );
}

function Tower({
  selectedSlug,
  onSelect,
}: {
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  const ordered = useMemo(
    () => COMPANIES.slice().sort((a, b) => a.floor - b.floor),
    [],
  );
  const selectedIndex = Math.max(
    0,
    ordered.findIndex((c) => c.slug === selectedSlug),
  );

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[8, 14, 6]} intensity={2.0} castShadow />
      <directionalLight position={[-9, 6, -8]} intensity={0.9} color="#7c9dff" />
      <pointLight position={[-6, 4, -6]} intensity={0.6} color="#6ee7ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial color="#0b0f1a" roughness={0.9} />
      </mesh>
      <gridHelper args={[26, 26, "#1e2a44", "#131a2c"]} position={[0, 0, 0]} />
      {ordered.map((c, i) => (
        <Floor
          key={c.slug}
          index={i}
          company={c}
          selected={c.slug === selectedSlug}
          onSelect={() => onSelect(c.slug)}
        />
      ))}
      <ElevatorCab floorIndex={selectedIndex} />
      <mesh position={[0, COMPANIES.length * FLOOR_H + 0.8, 0]}>
        <cylinderGeometry args={[0.05, 0.12, 1.6, 8]} />
        <meshStandardMaterial color="#6ee7ff" emissive="#6ee7ff" emissiveIntensity={1} />
      </mesh>
      <Text
        position={[0, COMPANIES.length * FLOOR_H + 2.2, 0]}
        fontSize={0.7}
        color="#6ee7ff"
        anchorX="center"
        font={undefined}
      >
        POLLENTOWERS
      </Text>
      <OrbitControls
        enableDamping
        minDistance={7}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={0.35}
        target={[0, (COMPANIES.length * FLOOR_H) / 2, 0]}
      />
    </>
  );
}

export default function TowerScene({
  onEnterFloor,
  showDirectory,
}: {
  onEnterFloor: (slug: string) => void;
  showDirectory?: () => void;
}) {
  const [selectedSlug, setSelectedSlug] = useState("lobby");
  const ordered = COMPANIES.slice().sort((a, b) => a.floor - b.floor);

  function select(slug: string, enter = true) {
    setSelectedSlug(slug);
    if (!enter) return;
    if (slug === "lobby") showDirectory?.();
    else onEnterFloor(slug);
  }

  return (
    <div className="tower-stage">
      <aside className="elevator" aria-label="Elevator">
        <div className="elevator-title">Elevator</div>
        {ordered
          .slice()
          .reverse()
          .map((c) => (
            <button
              key={c.slug}
              className={c.slug === selectedSlug ? "active" : ""}
              style={{ borderColor: c.color }}
              onClick={() => select(c.slug, true)}
              title={c.name}
            >
              <span style={{ color: c.color }}>{c.floor}</span>
              <span className="elev-name">{c.name}</span>
            </button>
          ))}
      </aside>
      <Canvas
        camera={{ position: [15, 13, 17], fov: 50 }}
        shadows
        style={{ width: "100%", height: "100%" }}
        onPointerMissed={() => undefined}
      >
        <color attach="background" args={["#070a12"]} />
        <fog attach="fog" args={["#070a12", 22, 46]} />
        <Tower selectedSlug={selectedSlug} onSelect={(slug) => select(slug, true)} />
      </Canvas>
    </div>
  );
}
