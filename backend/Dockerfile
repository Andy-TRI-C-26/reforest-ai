FROM rust:1.89-bookworm AS backend-builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=backend-builder /app/target/release/reforest-backend /usr/local/bin/reforest-backend
ENV HOST=0.0.0.0 PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl --fail http://127.0.0.1:8080/health || exit 1
CMD ["reforest-backend"]
