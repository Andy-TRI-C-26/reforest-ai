use crate::models::{Recommendation, RestorationAction, SpeciesRecommendation, Zone};

pub fn recommendation(zone: &Zone) -> Recommendation {
    let (strategy, seedlings_per_ha, species, actions) = if zone.dnbr >= 0.44 {
        (
            "Intervensi Hidrologi & Stabilitas Lahan",
            900,
            vec![
                SpeciesRecommendation {
                    latin_name: "Melaleuca cajuputi".into(),
                    common_name: "Gelam".into(),
                    seedlings_per_ha: 650,
                },
                SpeciesRecommendation {
                    latin_name: "Shorea balangeran".into(),
                    common_name: "Belangeran".into(),
                    seedlings_per_ha: 250,
                },
            ],
            vec![
                RestorationAction {
                    step: 1,
                    action: "Pasang sekat kanal".into(),
                    target_year: 0,
                },
                RestorationAction {
                    step: 2,
                    action: "Pulihkan tanah dan pantau tinggi muka air tanah".into(),
                    target_year: 1,
                },
            ],
        )
    } else if zone.dnbr >= 0.27 {
        (
            "Enrichment Planting",
            750,
            vec![
                SpeciesRecommendation {
                    latin_name: "Shorea balangeran".into(),
                    common_name: "Belangeran".into(),
                    seedlings_per_ha: 400,
                },
                SpeciesRecommendation {
                    latin_name: "Dyera polyphylla".into(),
                    common_name: "Jelutung Rawa".into(),
                    seedlings_per_ha: 350,
                },
            ],
            vec![
                RestorationAction {
                    step: 1,
                    action: "Lakukan penanaman pengayaan".into(),
                    target_year: 1,
                },
                RestorationAction {
                    step: 2,
                    action: "Pantau tinggi muka air tanah".into(),
                    target_year: 1,
                },
            ],
        )
    } else {
        (
            "Assisted Natural Regeneration",
            500,
            vec![
                SpeciesRecommendation {
                    latin_name: "Melaleuca cajuputi".into(),
                    common_name: "Gelam".into(),
                    seedlings_per_ha: 250,
                },
                SpeciesRecommendation {
                    latin_name: "Shorea balangeran".into(),
                    common_name: "Belangeran".into(),
                    seedlings_per_ha: 250,
                },
            ],
            vec![
                RestorationAction {
                    step: 1,
                    action: "Lakukan patroli pencegahan kebakaran".into(),
                    target_year: 0,
                },
                RestorationAction {
                    step: 2,
                    action: "Dukung regenerasi alami".into(),
                    target_year: 2,
                },
            ],
        )
    };
    Recommendation {
        zone_id: zone.id.clone(),
        strategy: strategy.into(),
        species,
        seedlings_per_ha,
        total_seedlings: (zone.area_ha * seedlings_per_ha as f64).round() as u64,
        actions,
    }
}
