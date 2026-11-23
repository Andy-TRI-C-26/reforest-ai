use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
pub struct MonitoringPoint {
    pub period: String,
    pub restored_ndvi: f64,
    pub unrestored_ndvi: f64,
    pub restored_nbr: f64,
    pub unrestored_nbr: f64,
}

#[derive(Clone, Debug, Serialize)]
pub struct MonitoringResponse {
    pub zone_id: String,
    pub series: Vec<MonitoringPoint>,
    pub total_impacted_ha: f64,
    pub canopy_recovery_percent: u8,
    pub peat_health_index: f64,
}
