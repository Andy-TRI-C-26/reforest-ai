use async_trait::async_trait;
use chrono::NaiveDate;
use geojson::{Geometry, Value};

use crate::{error::AppError, models::Zone, repository::ZoneRepository};

#[derive(Clone, Default)]
pub struct MockZoneRepository;

impl MockZoneRepository {
    pub fn new() -> Self {
        Self
    }

    #[allow(clippy::too_many_arguments)]
    fn zone(
        id: &str,
        name: &str,
        area: f64,
        pre: f64,
        post: f64,
        dnbr: f64,
        ndvi: f64,
        depth: f64,
        distance: f64,
        water: f64,
        coords: Vec<Vec<Vec<f64>>>,
    ) -> Zone {
        let zone = Zone {
            id: id.into(),
            name: name.into(),
            geometry: Geometry::new(Value::Polygon(coords)),
            area_ha: area,
            nbr_pre: pre,
            nbr_post: post,
            dnbr,
            ndvi,
            peat_depth_m: depth,
            canal_distance_m: distance,
            water_table_cm: water,
            priority: crate::services::severity::priority(dnbr),
            severity: crate::services::severity::severity(dnbr),
            observed_at: NaiveDate::from_ymd_opt(2026, 11, 23).expect("valid date"),
            model_confidence: 0.894,
        };
        zone.validate().expect("mock zone must be valid");
        zone
    }
}

#[async_trait]
impl ZoneRepository for MockZoneRepository {
    async fn list_zones(&self) -> Result<Vec<Zone>, AppError> {
        Ok(vec![
            Self::zone(
                "ZONA-TN-01",
                "Block Gambut Utara",
                184.6,
                0.72,
                -0.08,
                0.80,
                0.18,
                4.2,
                280.0,
                -86.0,
                vec![vec![
                    vec![-114.065, -2.337],
                    vec![-114.046, -2.337],
                    vec![-114.047, -2.352],
                    vec![-114.066, -2.353],
                    vec![-114.065, -2.337],
                ]],
            ),
            Self::zone(
                "ZONA-TN-02",
                "Seksi Kanal Timur",
                132.8,
                0.68,
                0.18,
                0.50,
                0.31,
                3.6,
                420.0,
                -72.0,
                vec![vec![
                    vec![-114.088, -2.354],
                    vec![-114.068, -2.353],
                    vec![-114.069, -2.368],
                    vec![-114.089, -2.369],
                    vec![-114.088, -2.354],
                ]],
            ),
            Self::zone(
                "ZONA-TN-03",
                "Hutan Gambut Tengah",
                246.3,
                0.75,
                0.39,
                0.36,
                0.52,
                5.1,
                760.0,
                -48.0,
                vec![vec![
                    vec![-114.102, -2.338],
                    vec![-114.083, -2.337],
                    vec![-114.084, -2.352],
                    vec![-114.103, -2.352],
                    vec![-114.102, -2.338],
                ]],
            ),
            Self::zone(
                "ZONA-TN-04",
                "Koridor Riparian Barat",
                98.4,
                0.70,
                0.55,
                0.15,
                0.68,
                2.8,
                980.0,
                -31.0,
                vec![vec![
                    vec![-114.103, -2.365],
                    vec![-114.104, -2.354],
                    vec![-114.119, -2.355],
                    vec![-114.119, -2.367],
                    vec![-114.103, -2.365],
                ]],
            ),
            Self::zone(
                "ZONA-TN-05",
                "Plot Restorasi Selatan",
                156.2,
                0.73,
                0.46,
                0.27,
                0.47,
                3.9,
                640.0,
                -54.0,
                vec![vec![
                    vec![-114.067, -2.370],
                    vec![-114.047, -2.369],
                    vec![-114.049, -2.384],
                    vec![-114.069, -2.385],
                    vec![-114.067, -2.370],
                ]],
            ),
        ])
    }

    async fn get_zone(&self, zone_id: &str) -> Result<Option<Zone>, AppError> {
        Ok(self
            .list_zones()
            .await?
            .into_iter()
            .find(|zone| zone.id == zone_id))
    }
}
