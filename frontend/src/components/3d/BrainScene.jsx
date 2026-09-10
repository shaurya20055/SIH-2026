import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Neural Pulse (electrical signal traveling along a path) ── */
function NeuralPulse({ curve, speed = 1, color = '#6366F1' }) {
  const ref = useRef();
  const t = useRef(Math.random());

  useFrame((_, delta) => {
    t.current = (t.current + delta * speed * 0.3) % 1;
    if (ref.current) {
      const pos = curve.getPoint(t.current);
      ref.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

/* ── Neural Pathway (glowing line between two points) ── */
function NeuralPathway({ start, end, color = '#6366F1', pulseColor = '#06B6D4' }) {
  const mid = useMemo(() => {
    const m = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    m.x += (Math.random() - 0.5) * 0.3;
    m.y += (Math.random() - 0.5) * 0.3;
    m.z += (Math.random() - 0.5) * 0.3;
    return m;
  }, [start, end]);

  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(start, mid, end),
    [start, mid, end]
  );

  const points = useMemo(() => curve.getPoints(30), [curve]);
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <group>
      <line geometry={lineGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.15} />
      </line>
      <NeuralPulse curve={curve} speed={0.8 + Math.random() * 0.6} color={pulseColor} />
    </group>
  );
}

/* ── Brain Core (distorted translucent sphere) ── */
function BrainCore() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
      // Breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={meshRef}>
        <Sphere args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color="#4338CA"
            transparent
            opacity={0.15}
            distort={0.25}
            speed={1.5}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
        {/* Inner glow layer */}
        <Sphere args={[1.15, 32, 32]}>
          <meshBasicMaterial color="#6366F1" transparent opacity={0.04} />
        </Sphere>
        {/* Fresnel rim */}
        <Sphere args={[1.22, 32, 32]}>
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.06} wireframe />
        </Sphere>
      </mesh>
    </Float>
  );
}

/* ── Synapse Particles ── */
function SynapseParticles({ count = 200 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.8 + Math.random() * 0.6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        color="#A5B4FC"
        size={0.012}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

/* ── Ambient Star Particles ── */
function StarField({ count = 300 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        color="#94A3B8"
        size={0.008}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

/* ── Energy Platform (ring beneath brain) ── */
function EnergyPlatform() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.0, 1.4, 64]} />
      <meshBasicMaterial color="#6366F1" transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Mouse Follow ── */
function MouseTracker() {
  const { camera } = useThree();

  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      const y = -(e.clientY / window.innerHeight - 0.5) * 0.3;
      camera.position.x += (x - camera.position.x) * 0.02;
      camera.position.y += (y - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [camera]);

  return null;
}

/* ── Neural Network (pathways connecting random points) ── */
function NeuralNetwork() {
  const pathways = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.7 + Math.random() * 0.5;
      nodes.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }

    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      // Connect to 2-3 nearest neighbors
      const sorted = [...nodes]
        .map((n, idx) => ({ node: n, dist: nodes[i].distanceTo(n), idx }))
        .filter(n => n.idx !== i)
        .sort((a, b) => a.dist - b.dist);

      const numConnections = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < Math.min(numConnections, sorted.length); j++) {
        const key = [Math.min(i, sorted[j].idx), Math.max(i, sorted[j].idx)].join('-');
        if (!connections.find(c => c.key === key)) {
          connections.push({
            key,
            start: nodes[i],
            end: sorted[j].node,
          });
        }
      }
    }

    return connections;
  }, []);

  const colors = ['#6366F1', '#8B5CF6', '#06B6D4', '#A5B4FC'];
  const pulseColors = ['#06B6D4', '#D946EF', '#3B82F6', '#34D399'];

  return (
    <group>
      {pathways.map((p, i) => (
        <NeuralPathway
          key={p.key}
          start={p.start}
          end={p.end}
          color={colors[i % colors.length]}
          pulseColor={pulseColors[i % pulseColors.length]}
        />
      ))}
    </group>
  );
}

/* ═══ MAIN BRAIN SCENE COMPONENT ═══ */
export default function BrainScene({ className, style }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#6366F1" />
        <pointLight position={[-5, -3, 3]} intensity={0.3} color="#06B6D4" />
        <pointLight position={[0, 3, -5]} intensity={0.2} color="#8B5CF6" />

        <BrainCore />
        <NeuralNetwork />
        <SynapseParticles count={150} />
        <StarField count={200} />
        <EnergyPlatform />
        <MouseTracker />
      </Canvas>
    </div>
  );
}
