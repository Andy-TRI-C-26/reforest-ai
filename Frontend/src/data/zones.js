export function severity(dnbr) {
  if (dnbr < 0.10) return { label:'Tidak Terbakar', color:'#2dd4bf' }
  if (dnbr <= 0.26) return { label:'Keparahan Rendah', color:'#55b5a1' }
  if (dnbr <= 0.43) return { label:'Keparahan Sedang-Rendah', color:'#eab308' }
  if (dnbr <= 0.65) return { label:'Keparahan Sedang-Tinggi', color:'#f97316' }
  return { label:'Keparahan Tinggi', color:'#ef4444' }
}
