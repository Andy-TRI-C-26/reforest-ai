use async_trait::async_trait;
use chrono::NaiveDate;
use geojson::GeoJson;

use crate::{
    error::AppError,
    models::{RestorationPriority, Severity, Zone},
    repository::ZoneRepository,
};

const ZONES_GEOJSON: &str = include_str!("../../data/tumbang-nusa-zones.geojson");

#[derive(Clone)]
pub struct MockZoneRepository {
    zones: Vec<Zone>,
}

impl MockZoneRepository {
    pub fn new() -> Result<Self, String> {
        let geojson: GeoJson = ZONES_GEOJSON
            .parse()
            .map_err(|error| format!("GeoJSON zona tidak valid: {error}"))?;
        let GeoJson::FeatureCollection(collection) = geojson else {
            return Err("Data zona harus berupa GeoJSON FeatureCollection".into());
        };
        let observed_at = NaiveDate::from_ymd_opt(2026, 11, 23)
            .ok_or_else(|| "Tanggal observasi default tidak valid".to_owned())?;

        let zones = collection
            .features
            .into_iter()
            .map(|feature| parse_zone(feature, observed_at))
            .collect::<Result<Vec<_>, String>>()?;

        if zones.is_empty() {
            return Err("GeoJSON zona tidak berisi feature".into());
        }
        Ok(Self { zones })
    }
}

fn parse_zone(feature: geojson::Feature, observed_at: NaiveDate) -> Result<Zone, String> {
    let properties = feature
        .properties
        .ok_or_else(|| "Feature zona tidak memiliki properties".to_owned())?;
    let geometry = feature
        .geometry
        .ok_or_else(|| "Feature zona tidak memiliki geometry".to_owned())?;
    let property = |key: &str| {
        properties
            .get(key)
            .ok_or_else(|| format!("Properti zona '{key}' tidak ditemukan"))
    };
    let string = |key: &str| {
        property(key)?
            .as_str()
            .map(str::to_owned)
            .ok_or_else(|| format!("Properti zona '{key}' harus berupa teks"))
    };
    let number = |key: &str| {
        property(key)?
            .as_f64()
            .ok_or_else(|| format!("Properti zona '{key}' harus berupa angka"))
    };

    let dnbr = number("dnbr")?;
    let severity = match properties.get("predicted_severity") {
        Some(value) => {
            let label = value
                .as_str()
                .ok_or_else(|| "Properti zona 'predicted_severity' harus berupa teks".to_owned())?;
            serde_json::from_value(serde_json::Value::String(label.to_owned()))
                .map_err(|error| format!("Prediksi severity zona tidak valid: {error}"))?
        }
        None => crate::services::severity::severity(dnbr),
    };
    let priority = match &severity {
        Severity::High | Severity::ModerateHigh => RestorationPriority::Priority1,
        Severity::ModerateLow => RestorationPriority::Priority2,
        Severity::Unburned | Severity::Low => RestorationPriority::Priority3,
    };
    let model_confidence = match properties.get("model_confidence") {
        Some(value) => value
            .as_f64()
            .ok_or_else(|| "Properti zona 'model_confidence' harus berupa angka".to_owned())?,
        None => 0.894,
    };
    let zone = Zone {
        id: string("id")?,
        name: string("name")?,
        geometry,
        area_ha: number("area_ha")?,
        nbr_pre: number("nbr_pre")?,
        nbr_post: number("nbr_post")?,
        dnbr,
        ndvi: number("ndvi")?,
        peat_depth_m: number("peat_depth_m")?,
        canal_distance_m: number("canal_distance_m")?,
        water_table_cm: number("water_table_cm")?,
        priority,
        severity,
        observed_at,
        model_confidence,
    };
    zone.validate()
        .map_err(|error| format!("Data zona '{}' tidak valid: {error}", zone.id))?;
    Ok(zone)
}

#[async_trait]
impl ZoneRepository for MockZoneRepository {
    async fn list_zones(&self) -> Result<Vec<Zone>, AppError> {
        Ok(self.zones.clone())
    }

    async fn get_zone(&self, zone_id: &str) -> Result<Option<Zone>, AppError> {
        Ok(self.zones.iter().cloned().find(|zone| zone.id == zone_id))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn loads_zones_from_geojson_with_valid_coordinates() {
        let repository = MockZoneRepository::new().expect("GeoJSON should load");
        assert!(!repository.zones.is_empty());
        assert!(repository.zones.iter().all(|zone| {
            let geojson::Value::Polygon(rings) = &zone.geometry.value else {
                return false;
            };
            rings
                .iter()
                .flatten()
                .all(|coordinate| coordinate[0] > 100.0 && coordinate[0] < 120.0)
        }));
    }

    #[test]
    fn uses_model_predictions_when_geojson_has_them() {
        let feature: geojson::Feature = serde_json::from_str(
            r#"{
                "type":"Feature",
                "properties":{
                    "id":"zone-ml","name":"ML zone","area_ha":1,
                    "nbr_pre":0.7,"nbr_post":0.5,"dnbr":0.2,"ndvi":0.4,
                    "peat_depth_m":2,"canal_distance_m":100,"water_table_cm":-50,
                    "predicted_severity":"Keparahan Tinggi","model_confidence":0.97
                },
                "geometry":{"type":"Polygon","coordinates":[[[114,-2],[114.01,-2],[114.01,-2.01],[114,-2.01],[114,-2]]]}
            }"#,
        )
        .expect("valid feature");
        let zone = parse_zone(
            feature,
            NaiveDate::from_ymd_opt(2026, 11, 23).expect("valid date"),
        )
        .expect("zone should load");
        assert_eq!(zone.severity, Severity::High);
        assert_eq!(zone.priority, RestorationPriority::Priority1);
        assert_eq!(zone.model_confidence, 0.97);
    }
}
