use chrono::NaiveDate;
use geojson::Geometry;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum Severity {
    #[serde(rename = "Tidak Terbakar")]
    Unburned,
    #[serde(rename = "Keparahan Rendah")]
    Low,
    #[serde(rename = "Keparahan Sedang-Rendah")]
    ModerateLow,
    #[serde(rename = "Keparahan Sedang-Tinggi")]
    ModerateHigh,
    #[serde(rename = "Keparahan Tinggi")]
    High,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum RestorationPriority {
    #[serde(rename = "PRIORITY_1")]
    Priority1,
    #[serde(rename = "PRIORITY_2")]
    Priority2,
    #[serde(rename = "PRIORITY_3")]
    Priority3,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Zone {
    pub id: String,
    pub name: String,
    pub geometry: Geometry,
    pub area_ha: f64,
    pub nbr_pre: f64,
    pub nbr_post: f64,
    pub dnbr: f64,
    pub ndvi: f64,
    pub peat_depth_m: f64,
    pub canal_distance_m: f64,
    pub water_table_cm: f64,
    pub priority: RestorationPriority,
    pub severity: Severity,
    pub observed_at: NaiveDate,
    pub model_confidence: f64,
}

impl Zone {
    pub fn validate(&self) -> Result<(), String> {
        let bounded = |value: f64| value.is_finite() && (-1.0..=1.0).contains(&value);
        if !bounded(self.ndvi) || !bounded(self.nbr_pre) || !bounded(self.nbr_post) {
            return Err("NDVI dan NBR harus berada pada rentang -1 sampai 1".into());
        }
        if !self.dnbr.is_finite()
            || self.dnbr < 0.0
            || !self.peat_depth_m.is_finite()
            || self.peat_depth_m < 0.0
            || !self.canal_distance_m.is_finite()
            || self.canal_distance_m < 0.0
            || !self.area_ha.is_finite()
            || self.area_ha <= 0.0
            || !self.model_confidence.is_finite()
            || !(0.0..=1.0).contains(&self.model_confidence)
        {
            return Err("nilai numerik zona berada di luar batas".into());
        }
        Ok(())
    }
}
