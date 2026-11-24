use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
pub struct MonitoringPoint {
    pub period: String,
    pub month: u8,
    pub restored_ndvi: f64,
    pub unrestored_ndvi: f64,
    pub restored_nbr: f64,
    pub unrestored_nbr: f64,
    pub baseline_ndvi: f64,
}

#[derive(Clone, Debug, Serialize)]
pub struct MonitoringResponse {
    pub zone_id: String,
    pub series: Vec<MonitoringPoint>,
    pub monthly_series: Vec<MonitoringPoint>,
    pub total_impacted_ha: f64,
    pub canopy_recovery_percent: u8,
    pub peat_health_index: f64,
    pub recovery_status: String,
}
