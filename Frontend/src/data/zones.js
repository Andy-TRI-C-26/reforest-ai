export const CENTER = [-2.3500, 114.0833]

export const zones = [
  { id:'ZONA-TN-01', name:'Block Gambut Utara', area:184.6, nbrPre:0.72, nbrPost:-0.08, dnbr:0.80, ndvi:0.18, depth:4.2, distance:280, watertable:-86, priority:'Prioritas 1 - Kritis', coords:[[-2.337,-114.065],[-2.337,-114.046],[-2.352,-114.047],[-2.353,-114.066]] },
  { id:'ZONA-TN-02', name:'Seksi Kanal Timur', area:132.8, nbrPre:0.68, nbrPost:0.18, dnbr:0.50, ndvi:0.31, depth:3.6, distance:420, watertable:-72, priority:'Prioritas 1 - Kritis', coords:[[-2.354,-114.088],[-2.353,-114.068],[-2.368,-114.069],[-2.369,-114.089]] },
  { id:'ZONA-TN-03', name:'Hutan Gambut Tengah', area:246.3, nbrPre:0.75, nbrPost:0.39, dnbr:0.36, ndvi:0.52, depth:5.1, distance:760, watertable:-48, priority:'Prioritas 2 - Sedang', coords:[[-2.338,-114.102],[-2.337,-114.083],[-2.352,-114.084],[-2.352,-114.103]] },
  { id:'ZONA-TN-04', name:'Koridor Riparian Barat', area:98.4, nbrPre:0.70, nbrPost:0.55, dnbr:0.15, ndvi:0.68, depth:2.8, distance:980, watertable:-31, priority:'Prioritas 3 - Alami', coords:[[-2.365,-114.103],[-2.354,-114.104],[-2.355,-114.119],[-2.367,-114.119]] },
  { id:'ZONA-TN-05', name:'Plot Restorasi Selatan', area:156.2, nbrPre:0.73, nbrPost:0.46, dnbr:0.27, ndvi:0.47, depth:3.9, distance:640, watertable:-54, priority:'Prioritas 2 - Sedang', coords:[[-2.370,-114.067],[-2.369,-114.047],[-2.384,-114.049],[-2.385,-114.069]] },
]

export const trendData = [
  { period:'2023 Q1', restored:0.61, unrestored:0.58, nbrRestored:0.48, nbrUnrestored:0.45 },
  { period:'2023 Q3', restored:0.12, unrestored:0.16, nbrRestored:-0.34, nbrUnrestored:-0.29 },
  { period:'2024 Q1', restored:0.25, unrestored:0.22, nbrRestored:-0.12, nbrUnrestored:-0.15 },
  { period:'2024 Q3', restored:0.39, unrestored:0.29, nbrRestored:0.08, nbrUnrestored:-0.04 },
  { period:'2025 Q1', restored:0.48, unrestored:0.34, nbrRestored:0.21, nbrUnrestored:0.02 },
  { period:'2025 Q3', restored:0.56, unrestored:0.38, nbrRestored:0.34, nbrUnrestored:0.07 },
  { period:'2026 Q1', restored:0.63, unrestored:0.41, nbrRestored:0.43, nbrUnrestored:0.11 },
]

export function severity(dnbr) {
  if (dnbr < 0.10) return { label:'Tidak Terbakar', color:'#2dd4bf' }
  if (dnbr <= 0.26) return { label:'Keparahan Rendah', color:'#55b5a1' }
  if (dnbr <= 0.43) return { label:'Keparahan Sedang-Rendah', color:'#eab308' }
  if (dnbr <= 0.65) return { label:'Keparahan Sedang-Tinggi', color:'#f97316' }
  return { label:'Keparahan Tinggi', color:'#ef4444' }
}
