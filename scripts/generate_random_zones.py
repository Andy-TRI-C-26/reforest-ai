import json
import random
from pathlib import Path

# Pusat KHDTK Tumbang Nusa, Pulang Pisau, Kalimantan Tengah
CENTER_LAT = -2.3456
CENTER_LNG = 114.0890

ZONE_NAMES = [
    "Block Gambut Utara",
    "Seksi Kanal Timur",
    "Hutan Gambut Tengah",
    "Koridor Riparian Barat",
    "Plot Restorasi Selatan",
    "Kawasan Eks-PLG Blok A",
    "Sektor Penyangga Sungai",
    "Rawa Gambut Dalam",
]

def generate_random_polygon(center_lat, center_lng, index):
    # Buat offset acak di sekitar titik pusat
    offset_lat = CENTER_LAT + (index // 3) * 0.02 + random.uniform(-0.005, 0.005)
    offset_lng = CENTER_LNG + (index % 3) * 0.02 + random.uniform(-0.005, 0.005)
    
    delta = 0.015
    ring = [
        [offset_lng, offset_lat],
        [offset_lng + delta, offset_lat],
        [offset_lng + delta, offset_lat - delta],
        [offset_lng, offset_lat - delta],
        [offset_lng, offset_lat]
    ]
    return ring

def classify_severity(dnbr):
    if dnbr >= 0.66:
        return "Keparahan Tinggi"
    if dnbr >= 0.44:
        return "Keparahan Sedang-Tinggi"
    if dnbr >= 0.27:
        return "Keparahan Sedang-Rendah"
    if dnbr >= 0.10:
        return "Keparahan Rendah"
    return "Tidak Terbakar"

def main():
    random.seed(42) # Agar hasil generate konsisten namun variatif
    num_zones = 8
    features = []

    for i in range(num_zones):
        zone_id = f"ZONA-TN-{i+1:02d}"
        name = ZONE_NAMES[i % len(ZONE_NAMES)]
        area_ha = round(random.uniform(80.0, 260.0), 1)
        
        nbr_pre = round(random.uniform(0.65, 0.82), 2)
        nbr_post = round(random.uniform(-0.15, 0.55), 2)
        dnbr = round(nbr_pre - nbr_post, 2)
        ndvi = round(random.uniform(0.12, 0.75), 2)
        
        peat_depth_m = round(random.uniform(2.0, 6.0), 1)
        canal_distance_m = round(random.uniform(150.0, 1200.0), 1)
        water_table_cm = round(random.uniform(-110.0, -20.0), 1)
        
        ring = generate_random_polygon(CENTER_LAT, CENTER_LNG, i)

        features.append({
            "type": "Feature",
            "properties": {
                "id": zone_id,
                "name": name,
                "area_ha": area_ha,
                "nbr_pre": nbr_pre,
                "nbr_post": nbr_post,
                "dnbr": dnbr,
                "ndvi": ndvi,
                "severity": classify_severity(dnbr),
                "peat_depth_m": peat_depth_m,
                "canal_distance_m": canal_distance_m,
                "water_table_cm": water_table_cm,
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [ring]
            }
        })

    output = {
        "type": "FeatureCollection",
        "name": "KHDTK_Tumbang_Nusa_random_zones",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}},
        "features": features,
    }

    target = Path(__file__).resolve().parents[1] / "frontend" / "public" / "data" / "tumbang-nusa-zones.geojson"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Berhasil menghasilkan {num_zones} zona acak ke: {target}")

if __name__ == "__main__":
    main()
