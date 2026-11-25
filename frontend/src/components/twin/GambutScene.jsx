'use client'

import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function LowPolyTree({ position, scale = 1, stressed = false }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.025, 0.045, 0.76, 7]} />
        <meshStandardMaterial color="#5e4933" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <coneGeometry args={[0.34, 0.82, 7]} />
        <meshStandardMaterial color={stressed ? '#6e7447' : '#1d6e45'} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.02, 1.28, 0]}>
        <coneGeometry args={[0.24, 0.58, 7]} />
        <meshStandardMaterial color={stressed ? '#858451' : '#2b8250'} roughness={0.9} />
      </mesh>
    </group>
  )
}

const SHRUBS = [[-2.9, -1.9], [2.7, -1.55], [2.2, 1.5], [-1.8, 1.75], [0.2, -1.95]]

// Pohon penyintas: posisi tetap, tidak bergantung tahun simulasi.
const SURVIVORS = [[-2.8, 1.9], [-2.1, 2.1], [-0.8, 2.0], [0.4, 2.1], [1.6, 1.95], [2.6, 2.05], [2.9, 0.6], [-2.9, 0.4]]

// Posisi pohon restorasi: grid 6 kolom × 4 baris = 24, sama dengan batas restored_tree_count backend.
const restoredPosition = (i) => [-2.5 + (i % 6) * 0.95, 0.025, -1.45 + Math.floor(i / 6) * 0.88]

// `scenario` = respons POST /api/scenarios (null bila belum ada / backend tidak tersedia).
export default function GambutScene({ zone, scenario }) {
  const terrain = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(7.4, 5.2, 24, 18)
    const pos = geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, Math.sin(x * 1.7) * 0.035 + Math.cos(y * 2.1) * 0.028 + Math.sin((x + y) * 2.8) * 0.018)
    }
    geometry.computeVertexNormals()
    return geometry
  }, [])

  const burnOpacity = scenario?.burn_scar_opacity ?? 1
  const vegetationScale = scenario?.vegetation_scale ?? 0.35
  const blocksVisible = scenario?.canal_blocks_visible ?? false
  const restoredCount = Math.min(24, scenario?.restored_tree_count ?? 0)
  const canopy = (scenario?.canopy_recovery_percent ?? 0) / 100

  // Warna tanah mengikuti keparahan dari backend.
  const soilColor = zone.critical ? '#2c251f' : zone.high ? '#4a3528' : '#60472f'
  const burnColor = zone.critical ? '#171614' : zone.high ? '#3a2c23' : '#3e3228'

  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [6.8, 5.8, 7.2], fov: 38 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.35} />
      <directionalLight castShadow position={[5, 9, 6]} intensity={2.2} color="#fff1d2" shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={terrain}>
        <meshStandardMaterial color={soilColor} roughness={0.96} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]} receiveShadow>
        <circleGeometry args={[2.18, 48]} />
        <meshStandardMaterial color={burnColor} transparent opacity={burnOpacity} roughness={1} depthWrite={burnOpacity > 0.05} />
      </mesh>

      {canopy > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.65, 0.05, -0.12]}>
          <circleGeometry args={[2.65, 48]} />
          <meshStandardMaterial color="#35573d" transparent opacity={Math.min(0.82, canopy)} roughness={1} />
        </mesh>
      )}

      {SURVIVORS.map(([x, z], i) => (
        <LowPolyTree key={`survivor-${i}`} position={[x, 0.03, z]} scale={0.55 + (i % 4) * 0.06} stressed />
      ))}

      {Array.from({ length: restoredCount }, (_, i) => (
        <LowPolyTree key={`restored-${i}`} position={restoredPosition(i)} scale={vegetationScale * (0.72 + (i % 3) * 0.08)} />
      ))}

      {canopy >= 0.4 && SHRUBS.map(([x, z], i) => (
        <mesh key={`shrub-${i}`} castShadow position={[x, 0.12, z]}>
          <dodecahedronGeometry args={[0.19, 0]} />
          <meshStandardMaterial color="#2f7044" roughness={1} />
        </mesh>
      ))}

      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[7.4, 0.08, 5.2]} />
        <meshStandardMaterial color="#263027" roughness={1} />
      </mesh>

      {zone.high && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <boxGeometry args={[0.18, 4.8, 0.025]} />
          <meshStandardMaterial color="#6ba99a" transparent opacity={blocksVisible ? 0.72 : 0.12} roughness={0.2} />
        </mesh>
      )}

      {blocksVisible && [-1.8, 0, 1.8].map((z, i) => (
        <mesh key={`block-${i}`} castShadow position={[0, 0.23, z]}>
          <boxGeometry args={[1.05, 0.38, 0.14]} />
          <meshStandardMaterial color="#7a5535" roughness={0.82} />
        </mesh>
      ))}

      <OrbitControls makeDefault enablePan minDistance={6} maxDistance={13} minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 2.08} />
    </Canvas>
  )
}
