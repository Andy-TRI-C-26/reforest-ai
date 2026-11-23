use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub log_filter: String,
    pub cors_origins: Vec<String>,
    pub static_dir: Option<String>,
}

impl Config {
    pub fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        let port = env::var("PORT").unwrap_or_else(|_| "8080".into()).parse()?;
        Ok(Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port,
            log_filter: env::var("RUST_LOG")
                .unwrap_or_else(|_| "reforest_backend=debug,tower_http=debug".into()),
            cors_origins: env::var("CORS_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:5173".into())
                .split(',')
                .map(str::trim)
                .filter(|origin| !origin.is_empty())
                .map(str::to_owned)
                .collect(),
            static_dir: env::var("STATIC_DIR")
                .ok()
                .filter(|path| !path.trim().is_empty()),
        })
    }
}
