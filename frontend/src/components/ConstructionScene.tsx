import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

// ── Mouse tracker ─────────────────────────────────────────────────────────────
const mouseWorld = { x: 0, y: 0 }

// ── Camera rig with mouse parallax ───────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 6, z: 13 })

  useFrame(() => {
    target.current.x = mouseWorld.x * 1.8
    target.current.y = 6 + mouseWorld.y * 0.6

    camera.position.x += (target.current.x - camera.position.x) * 0.04
    camera.position.y += (target.current.y - camera.position.y) * 0.04
    camera.lookAt(0, 1.5, 0)
  })
  return null
}

// ── Building ──────────────────────────────────────────────────────────────────
interface BuildingProps {
  position: [number, number, number]
  height: number
  color: string
  emissive?: string
}

function Building({ position, height, color, emissive = '#062052' }: BuildingProps) {
  const meshRef   = useRef<THREE.Mesh>(null!)
  const edgeRef   = useRef<THREE.LineSegments>(null!)

  const geo    = useMemo(() => new THREE.BoxGeometry(1, height, 1), [height])
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo])

  return (
    <group position={[position[0], position[1] + height / 2, position[2]]}>
      {/* Body */}
      <mesh ref={meshRef} geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(emissive)}
          emissiveIntensity={0.08}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Gold edges */}
      <lineSegments ref={edgeRef} geometry={edgeGeo}>
        <lineBasicMaterial color="#C9A227" transparent opacity={0.35} />
      </lineSegments>

      {/* Roof glow plane */}
      <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.02, 1.02]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.25} />
      </mesh>

      {/* Window rows */}
      {Array.from({ length: Math.floor(height * 1.5) }, (_, r) => (
        <group key={r} position={[0, -height / 2 + 0.6 + r * 0.65, 0]}>
          {[-0.22, 0.22].map((x, c) => (
            <mesh key={c} position={[x, 0, 0.51]}>
              <planeGeometry args={[0.2, 0.28]} />
              <meshBasicMaterial
                color={Math.random() > 0.3 ? '#7ECFFF' : '#1A3A6A'}
                transparent opacity={0.85}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ── Crane ─────────────────────────────────────────────────────────────────────
function Crane({ isProcessing }: { isProcessing: boolean }) {
  const armRef  = useRef<THREE.Group>(null!)
  const speed   = useRef(0.25)

  useFrame((_, dt) => {
    const target = isProcessing ? 1.2 : 0.25
    speed.current += (target - speed.current) * 0.02
    if (armRef.current) armRef.current.rotation.y += dt * speed.current
  })

  return (
    <group position={[-4.5, 0, -1]}>
      {/* Mast */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[0.18, 6, 0.18]} />
        <meshStandardMaterial color="#C9A227" metalness={0.8} roughness={0.2}
          emissive="#C9A227" emissiveIntensity={0.15} />
      </mesh>

      {/* Rotating arm group */}
      <group ref={armRef} position={[0, 6, 0]}>
        {/* Boom arm */}
        <mesh position={[1.8, 0, 0]}>
          <boxGeometry args={[3.6, 0.12, 0.12]} />
          <meshStandardMaterial color="#C9A227" metalness={0.7} roughness={0.3}
            emissive="#C9A227" emissiveIntensity={0.1} />
        </mesh>
        {/* Counter-arm */}
        <mesh position={[-0.9, 0, 0]}>
          <boxGeometry args={[1.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#7A6018" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Cable */}
        <mesh position={[3, -0.9, 0]}>
          <boxGeometry args={[0.02, 1.8, 0.02]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        {/* Hook */}
        <mesh position={[3, -1.85, 0]}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color="#C9A227" metalness={0.9} roughness={0.1}
            emissive="#C9A227" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  )
}

// ── Gold particle system ───────────────────────────────────────────────────────
function Sparks() {
  const ref   = useRef<THREE.Points>(null!)
  const count = 50

  const { positions, velocities, opacities } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const opa = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = Math.random() * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14
      vel[i * 3]     = (Math.random() - 0.5) * 0.012
      vel[i * 3 + 1] = 0.018 + Math.random() * 0.025
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.012
      opa[i]         = 0.3 + Math.random() * 0.7
    }
    return { positions: pos, velocities: vel, opacities: opa }
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const p = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      p[i * 3]     += velocities[i * 3]
      p[i * 3 + 1] += velocities[i * 3 + 1]
      p[i * 3 + 2] += velocities[i * 3 + 2]
      if (p[i * 3 + 1] > 9) {
        p[i * 3]     = (Math.random() - 0.5) * 18
        p[i * 3 + 1] = 0
        p[i * 3 + 2] = (Math.random() - 0.5) * 14
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-opacity"  args={[opacities, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#C9A227"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        vertexColors={false}
      />
    </points>
  )
}

// ── Ground + grid ─────────────────────────────────────────────────────────────
function Ground() {
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const verts: number[] = []
    const size = 20, step = 2
    for (let i = -size; i <= size; i += step) {
      verts.push(-size, 0.02, i, size, 0.02, i)
      verts.push(i, 0.02, -size, i, 0.02, size)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3))
    return geo
  }, [])

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#060D1B" metalness={0.1} roughness={0.95} />
      </mesh>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#C9A227" transparent opacity={0.06} />
      </lineSegments>
    </>
  )
}

// ── Scene ──────────────────────────────────────────────────────────────────────
const BUILDINGS = [
  { position: [-0.5, 0, 0.5]  as [number,number,number], height: 5.5, color: '#062052', label: 'NY $4.2B'      },
  { position: [1.8,  0, -0.3] as [number,number,number], height: 4.8, color: '#071B45', label: 'Travis $3.5B'  },
  { position: [3.2,  0, 1.2]  as [number,number,number], height: 3.8, color: '#0A1E4A', label: 'Harris $1.5B'  },
  { position: [0.8,  0, -2.0] as [number,number,number], height: 2.8, color: '#091840', label: 'Bexar $800M'   },
  { position: [2.6,  0, -2.2] as [number,number,number], height: 2.0, color: '#081435', label: 'McLennan $300M'},
  { position: [-1.8, 0, -1.5] as [number,number,number], height: 1.2, color: '#071030', label: 'Travis 2011'   },
]

function Scene({ isProcessing }: { isProcessing: boolean }) {
  return (
    <>
      <fog attach="fog" args={['#060D1B', 18, 42]} />
      <ambientLight intensity={0.4} color="#1A2A4A" />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.4}
        color="#C9A227"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={[-6, 8, -5]} intensity={0.5} color="#062052" />
      <pointLight position={[5, 3, 6]}  intensity={0.35} color="#C9A227" />

      <CameraRig />
      <Ground />

      {BUILDINGS.map((b, i) => (
        <Float key={i} speed={0.4 + i * 0.08} rotationIntensity={0} floatIntensity={0.1}>
          <Building {...b} />
        </Float>
      ))}

      <Crane isProcessing={isProcessing} />
      <Sparks />
    </>
  )
}

// ── Exported Canvas ────────────────────────────────────────────────────────────
export default function ConstructionScene({
  isProcessing = false,
  className = '',
}: {
  isProcessing?: boolean
  className?: string
}) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseWorld.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouseWorld.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <Canvas
      className={className}
      camera={{ position: [0, 6, 13], fov: 44 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <Scene isProcessing={isProcessing} />
    </Canvas>
  )
}
