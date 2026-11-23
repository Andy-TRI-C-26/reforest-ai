use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("zona tidak ditemukan")]
    ZoneNotFound,
    #[error("{0}")]
    InvalidRequest(String),
    #[error("data zona tidak valid: {0}")]
    InvalidZoneData(String),
    #[error("tahun skenario harus antara 0 dan 10")]
    YearOutOfRange,
    #[error("kesalahan internal")]
    Internal,
}

#[derive(Serialize)]
struct ErrorBody {
    error: ErrorContent,
}

#[derive(Serialize)]
struct ErrorContent {
    code: &'static str,
    message: String,
    details: Option<()>,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match &self {
            Self::ZoneNotFound => (StatusCode::NOT_FOUND, "ZONE_NOT_FOUND", self.to_string()),
            Self::InvalidRequest(_) => {
                (StatusCode::BAD_REQUEST, "INVALID_REQUEST", self.to_string())
            }
            Self::InvalidZoneData(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INVALID_ZONE_DATA",
                self.to_string(),
            ),
            Self::YearOutOfRange => (
                StatusCode::BAD_REQUEST,
                "YEAR_OUT_OF_RANGE",
                self.to_string(),
            ),
            Self::Internal => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                self.to_string(),
            ),
        };
        (
            status,
            Json(ErrorBody {
                error: ErrorContent {
                    code,
                    message,
                    details: None,
                },
            }),
        )
            .into_response()
    }
}
