import json
from pathlib import Path

CENTER = (-2.3456, 114.0890)

ZONES = [
    ("ZONA-TN-01", "Block Gambut Utara", 184.6, 0.80, 0.18, 4.2, -86,
     [[114.046, -2.337], [114.065, -2.337], [114.066, -2.353], [114.047, -2.352], [114.046, -2.337]]),
    ("ZONA-TN-02", "Seksi Kanal Timur", 132.8, 0.50, 0.31, 3.6, -72,
     [[114.068, -2.353], [114.088, -2.354], [114.089, -2.369], [114.069, -2.368], [114.068, -2.353]]),
    ("ZONA-TN-03", "Hutan Gambut Tengah", 246.3, 0.36, 0.52, 5.1, -48,
     [[114.083, -2.337], [114.102, -2.338], [114.103, -2.352], [114.084, -2.352], [114.083, -2.337]]),
    ("ZONA-TN-04", "Koridor Riparian Barat", 98.4, 0.15, 0.68, 2.8, -31,
     [[114.103, -2.354], [114.119, -2.355], [114.119, -2.367], [114.104, -2.365], [114.103, -2.354]]),
    ("ZONA-TN-05", "Plot Restorasi Selatan", 156.2, 0.27, 0.47, 3.9, -54,
     [[114.047, -2.369], [114.067, -2.370], [114.069, -2.385], [114.049, -2.384], [114.047, -2.369]]),
]


def severity(dnbr):
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
    features = []
    for zone_id, name, area, dnbr, ndvi, peat_depth, water_table, ring in ZONES:
        features.append({
            "type": "Feature",
            "properties": {
                "id": zone_id,
                "name": name,
                "area_ha": area,
                "dnbr": dnbr,
                "ndvi": ndvi,
                "severity": severity(dnbr),
                "peat_depth_m": peat_depth,
                "water_table_cm": water_table,
            },
            "geometry": {"type": "Polygon", "coordinates": [ring]},
        })

    output = {
        "type": "FeatureCollection",
        "name": "KHDTK_Tumbang_Nusa_mock_zones",
        "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}},
        "features": features,
    }
    target = Path(__file__).resolve().parents[1] / "Frontend" / "public" / "data" / "tumbang-nusa-zones.geojson"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(target)


if __name__ == "__main__":
    main()
