use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
pub struct SpeciesRecommendation {
    pub latin_name: String,
    pub common_name: String,
    pub seedlings_per_ha: u32,
}

#[derive(Clone, Debug, Serialize)]
pub struct RestorationAction {
    pub step: u8,
    pub action: String,
    pub target_year: u8,
}

#[derive(Clone, Debug, Serialize)]
pub struct Recommendation {
    pub zone_id: String,
    pub strategy: String,
    pub species: Vec<SpeciesRecommendation>,
    pub seedlings_per_ha: u32,
    pub total_seedlings: u64,
    pub actions: Vec<RestorationAction>,
}
