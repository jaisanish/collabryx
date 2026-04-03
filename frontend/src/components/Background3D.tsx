import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleLines = () => {
  const pointsCount = 120;
  const maxDistance = 2.0; // Distance for line connections
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate random positions and velocities
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(pointsCount * 3);
    const vel = [];
    for (let i = 0; i < pointsCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      
      vel.push(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015
      );
    }
    return { positions: pos, velocities: vel };
  }, []);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({ 
      color: 0x818cf8, // Linear-ish purple-blue
      transparent: true, 
      opacity: 0.15 
    });
  }, []);
  
  const { mouse, viewport } = useThree();

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;

    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const linePositions = [];
    let vertexCount = 0;

    // Viewport relative mouse target
    const mx = (mouse.x * viewport.width) / 2;
    const my = (mouse.y * viewport.height) / 2;

    // Update positions
    for (let i = 0; i < pointsCount; i++) {
      // Distance to mouse for slight repulsion/attraction effect
      const dx = mx - positionsArray[i * 3];
      const dy = my - positionsArray[i * 3 + 1];
      const distToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distToMouse < 4) {
        velocities[i * 3] -= dx * 0.0003;
        velocities[i * 3 + 1] -= dy * 0.0003;
      }

      positionsArray[i * 3] += velocities[i * 3];
      positionsArray[i * 3 + 1] += velocities[i * 3 + 1];
      positionsArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Keep within soft bounds by gently reversing velocity if out of range
      if (Math.abs(positionsArray[i * 3]) > 12) velocities[i * 3] *= -0.9;
      if (Math.abs(positionsArray[i * 3 + 1]) > 12) velocities[i * 3 + 1] *= -0.9;
      if (Math.abs(positionsArray[i * 3 + 2]) > 8) velocities[i * 3 + 2] *= -0.9;

      // Find connections
      for (let j = i + 1; j < pointsCount; j++) {
        const dx2 = positionsArray[i * 3] - positionsArray[j * 3];
        const dy2 = positionsArray[i * 3 + 1] - positionsArray[j * 3 + 1];
        const dz2 = positionsArray[i * 3 + 2] - positionsArray[j * 3 + 2];
        const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);

        if (dist < maxDistance) {
          linePositions.push(
            positionsArray[i * 3], positionsArray[i * 3 + 1], positionsArray[i * 3 + 2],
            positionsArray[j * 3], positionsArray[j * 3 + 1], positionsArray[j * 3 + 2]
          );
          vertexCount += 2;
        }
      }
    }

    // Force buffer updates
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, vertexCount);
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#38bdf8" transparent opacity={0.5} sizeAttenuation />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />
    </>
  );
};

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        {/* Subtle glowing fog to mask hard edges */}
        <fog attach="fog" args={['#0a0a0a', 5, 15]} />
        <ParticleLines />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background z-1" />
    </div>
  );
}
