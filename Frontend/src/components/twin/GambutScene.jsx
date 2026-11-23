import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function LowPolyTree({ position, scale=1, stressed=false }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0,0.38,0]}><cylinderGeometry args={[0.025,0.045,0.76,7]} /><meshStandardMaterial color="#5e4933" roughness={1}/></mesh>
      <mesh castShadow position={[0,0.95,0]}><coneGeometry args={[0.34,0.82,7]} /><meshStandardMaterial color={stressed?'#6e7447':'#1d6e45'} roughness={0.9}/></mesh>
      <mesh castShadow position={[0.02,1.28,0]}><coneGeometry args={[0.24,0.58,7]} /><meshStandardMaterial color={stressed?'#858451':'#2b8250'} roughness={0.9}/></mesh>
    </group>
  )
}

export default function GambutScene({ zone, year }) {
  const terrainGeometry = useMemo(()=>{
    const geometry=new THREE.PlaneGeometry(7.4,5.2,24,18)
    const position=geometry.attributes.position
    for(let i=0;i<position.count;i++){
      const x=position.getX(i), y=position.getY(i)
      position.setZ(i,Math.sin(x*1.7)*0.035+Math.cos(y*2.1)*0.028+Math.sin((x+y)*2.8)*0.018)
    }
    geometry.computeVertexNormals()
    return geometry
  },[])

  const burnOpacity = Math.max(0,year<=2?1-(year*0.25):0.5-Math.min(0.5,(year-2)*0.1))
  const soilColor=zone.dnbr>0.66?'#2c251f':zone.dnbr>=0.27?'#4a3528':'#60472f'
  const burnColor=zone.dnbr>0.66?'#171614':zone.dnbr>=0.27?'#3a2c23':'#3e3228'
  const existingCount=year===0?4:year<2?8:year<5?15:year<8?24:32
  const restorationVisible=zone.dnbr>0.27
  const blockVisible=zone.dnbr>0.44&&year>=2
  const treeScale=year===0?0.35:year<2?0.45:year<5?0.72:year<8?0.9:1.08
  const existingTrees=useMemo(()=>{
    const trees=[]
    for(let i=0;i<32;i++){
      const col=i%8,row=Math.floor(i/8),jitter=((i*7)%5-2)*0.08
      trees.push([-2.8+col*0.82+jitter,-0.1+row*0.38+jitter])
    }
    return trees
  },[])

  return (
    <Canvas shadows dpr={[1,1.6]} camera={{position:[6.8,5.8,7.2],fov:38}} gl={{alpha:true,antialias:true}}>
      <ambientLight intensity={1.35}/>
      <directionalLight castShadow position={[5,9,6]} intensity={2.2} color="#fff1d2" shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><primitive object={terrainGeometry} attach="geometry"/><meshStandardMaterial color={soilColor} roughness={0.96}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.035,0]} receiveShadow><circleGeometry args={[2.18,48]}/><meshStandardMaterial color={burnColor} transparent opacity={burnOpacity} roughness={1} depthWrite={burnOpacity>0.05}/></mesh>
      {year>=5&&<mesh rotation={[-Math.PI/2,0,0]} position={[0.65,0.05,-0.12]}><circleGeometry args={[2.65,48]}/><meshStandardMaterial color="#35573d" transparent opacity={Math.min(0.82,(year-4)*0.14)} roughness={1}/></mesh>}
      {existingTrees.slice(0,existingCount).map(([x,z],i)=><LowPolyTree key={`existing-${i}`} position={[x,0.03,z]} scale={year===0?0.45:0.62+(i%4)*0.08} stressed={zone.dnbr>0.44||year<3}/>)}
      {restorationVisible&&year>=2&&Array.from({length:year>=8?18:year>=5?12:7}).map((_,i)=>{
        const x=-2.5+(i%6)*0.95,z=-1.45+Math.floor(i/6)*0.88
        return <LowPolyTree key={`restored-${i}`} position={[x,0.025,z]} scale={treeScale*(0.72+(i%3)*0.08)} stressed={false}/>
      })}
      {year>=5&&[[-2.9,-1.9],[2.7,-1.55],[2.2,1.5],[-1.8,1.75],[0.2,-1.95]].map(([x,z],i)=><mesh key={`shrub-${i}`} castShadow position={[x,0.12,z]}><dodecahedronGeometry args={[0.19,0]}/><meshStandardMaterial color="#2f7044" roughness={1}/></mesh>)}
      <mesh position={[0,-0.04,0]} receiveShadow><boxGeometry args={[7.4,0.08,5.2]}/><meshStandardMaterial color="#263027" roughness={1}/></mesh>
      {zone.dnbr>0.44&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}><boxGeometry args={[0.18,4.8,0.025]}/><meshStandardMaterial color="#6ba99a" transparent opacity={year>=5?0.72:year>=2?0.28:0.08} roughness={0.2}/></mesh>}
      {blockVisible&&[-1.8,0,1.8].map((z,i)=><mesh key={`block-${i}`} castShadow position={[0,0.23,z]}><boxGeometry args={[1.05,0.38,0.14]}/><meshStandardMaterial color="#7a5535" roughness={0.82}/></mesh>)}
      <OrbitControls makeDefault enablePan minDistance={6} maxDistance={13} minPolarAngle={Math.PI/5} maxPolarAngle={Math.PI/2.08}/>
    </Canvas>
  )
}
