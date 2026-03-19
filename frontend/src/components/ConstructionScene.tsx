import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'

// ── Building component ────────────────────────────────────────────────────────
interface BuildingProps {
  position: [number, number, number]
  height: number
  color: string
  label?: string
}

function Building({ position, height, color }: BuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const windowsRef = useRef<THREE.InstancedMesh>(null!)

  const windowPositions = useMemo(() => {
    const positions: THREE.Matrix4[] = []
    const rows = Math.floor(height * 2)
    const cols = 2
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const m = new THREE.Matrix4()
        m.setPosition(
          (c - 0.5) * 0.35,
          0.5 + r * 0.5 - height / 2,
          0.51
        )
        positions.push(m)
      }
    }
    return positions
  }, [height])

  return (
    <group position={position}>
      {/* Main structure */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.7}
          emissive={new THREE.Color(color)}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Gold roof accent */}
      <mesh position={[0, height / 2 + 0.05, 0]}>
        <boxGeometry args={[1.05, 0.08, 1.05]} />
        <meshStandardMaterial
          color="#C9A227"
          metalness={0.8}
          roughness={0.2}
          emissive="#C9A227"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Windows */}
      {windowPositions.length > 0 && (
        <instancedMesh ref={windowsRef} args={[undefined, undefined, windowPositions.length]}>
          <planeGeometry args={[0.2, 0.25]} />
          <meshStandardMaterial
            color="#7ECFFF"
            emissive="#4AA8E8"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
          {/* matrices applied via InstanceSetter below */}
        </instancedMesh>
      )}
      {/* Programmatically set instance matrices */}
      <InstanceSetter mesh={windowsRef} matrices={windowPositions} />
    </group>
  )
}

function InstanceSetter({
  mesh,
  matrices,
}: {
  mesh: React.RefObject<THREE.InstancedMesh>
  matrices: THREE.Matrix4[]
}) {
  useFrame(() => {
    if (!mesh.current) return
    matrices.forEach((m, i) => {
      mesh.current!.setMatrixAt(i, m)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return null
}

// ── Crane ─────────────────────────────────────────────────────────────────────
function Crane({ isProcessing }: { isProcessing: boolean }) {
  const craneRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (craneRef.current) {
      const speed = isProcessing ? 0.8 : 0.2
      craneRef.current.rotation.y += delta * speed
    }
  })

  return (
    <group ref={craneRef} position={[-4, 0, -2]}>
      {/* Mast */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.18, 5, 0.18]} />
        <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Boom (horizontal arm) */}
      <mesh position={[1.5, 5, 0]} castShadow>
        <boxGeometry args={[3, 0.14, 0.14]} />
        <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Counter boom */}
      <mesh position={[-0.8, 5, 0]} castShadow>
        <boxGeometry args={[1.6, 0.12, 0.12]} />
        <meshStandardMaterial color="#7A6018" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Hook cable */}
      <mesh position={[2.5, 4.1, 0]}>
        <boxGeometry args={[0.03, 1.8, 0.03]} />
        <meshStandardMaterial color="#94A3B8" />
      </mesh>
      {/* Hook */}
      <mesh position={[2.5, 3.2, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#C9A227" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// ── Gold particles ─────────────────────────────────────────────────────────────
function GoldParticles() {
  const count = 120
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = Math.random() * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16
      vel[i * 3]     = (Math.random() - 0.5) * 0.02
      vel[i * 3 + 1] = 0.015 + Math.random() * 0.02
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }
    return { positions: pos, velocities: vel }
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const pos = geo.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]
      if (pos[i * 3 + 1] > 9) {
        pos[i * 3]     = (Math.random() - 0.5) * 16
        pos[i * 3 + 1] = -0.5
        pos[i * 3 + 2] = (Math.random() - 0.5) * 16
      }
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#C9A227"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  )
}

// ── Ground grid ────────────────────────────────────────────────────────────────
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#060D1B"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      <gridHelper args={[28, 28, '#162440', '#0D1829']} position={[0, 0.01, 0]} />
    </>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ isProcessing }: { isProcessing: boolean }) {
  const buildings = [
    { position: [-1, 0, 0.5] as [number,number,number], height: 5.0, color: '#062052', label: 'Travis County' },
    { position: [1.5, 0, -0.5] as [number,number,number], height: 4.0, color: '#0A2B6E', label: 'Harris County' },
    { position: [3, 0, 1] as [number,number,number], height: 3.5, color: '#0C2255', label: 'Bexar County' },
    { position: [0.5, 0, -2] as [number,number,number], height: 2.8, color: '#091B45', label: 'Tarrant County' },
    { position: [2, 0, -2.5] as [number,number,number], height: 1.8, color: '#071538', label: 'Collin County' },
  ]

  return (
    <>
      {/* Environment lighting */}
      <ambientLight intensity={0.3} color="#1A2A4A" />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        color="#C9A227"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, 8, -5]} intensity={0.6} color="#062052" />
      <pointLight position={[5, 4, 5]} intensity={0.4} color="#C9A227" />

      {/* Fog */}
      <fog attach="fog" args={['#060D1B', 18, 40]} />

      <Ground />

      {buildings.map((b, i) => (
        <Float key={i} speed={0.4 + i * 0.1} rotationIntensity={0} floatIntensity={0.15}>
          <Building {...b} />
        </Float>
      ))}

      <Crane isProcessing={isProcessing} />
      <GoldParticles />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 5}
      />
    </>
  )
}

// ── Exported Canvas wrapper ───────────────────────────────────────────────────
interface ConstructionSceneProps {
  isProcessing?: boolean
  className?: string
}

export default function ConstructionScene({ isProcessing = false, className = '' }: ConstructionSceneProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [8, 7, 12], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <Scene isProcessing={isProcessing} />
    </Canvas>
  )
}
