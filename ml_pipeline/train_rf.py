"""Demonstration Random-Forest training pipeline for Sentinel-2 burn severity.

Usage:
    python ml_pipeline/train_rf.py --pre-dir data/pre --post-dir data/post

Expected raster names: B04.tif, B08.tif, B12.tif.
"""

import argparse
from pathlib import Path

import numpy as np
import rasterio
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split


def read_band(directory: Path, name: str) -> np.ndarray:
    path = directory / f"{name}.tif"
    if not path.exists():
        raise FileNotFoundError(f"Missing Sentinel-2 band: {path}")
    with rasterio.open(path) as src:
        return src.read(1).astype("float32")


def indices(red, nir, swir):
    ndvi = (nir - red) / (nir + red + 1e-6)
    nbr = (nir - swir) / (nir + swir + 1e-6)
    return ndvi, nbr


def train(pre_dir: Path, post_dir: Path):
    pre_red = read_band(pre_dir, "B04")
    pre_nir = read_band(pre_dir, "B08")
    pre_swir = read_band(pre_dir, "B12")
    post_red = read_band(post_dir, "B04")
    post_nir = read_band(post_dir, "B08")
    post_swir = read_band(post_dir, "B12")

    pre_ndvi, pre_nbr = indices(pre_red, pre_nir, pre_swir)
    post_ndvi, post_nbr = indices(post_red, post_nir, post_swir)
    dnbr = pre_nbr - post_nbr

    features = np.stack([dnbr, pre_ndvi, post_ndvi, pre_nbr, post_nbr], axis=-1)
    labels = np.select(
        [dnbr < 0.10, dnbr < 0.27, dnbr < 0.44, dnbr < 0.66],
        [0, 1, 2, 3],
        default=4,
    )

    valid = np.isfinite(features).all(axis=-1)
    x = features[valid]
    y = labels[valid]
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.25, random_state=42, stratify=y
    )
    model = RandomForestClassifier(
        n_estimators=300, max_depth=16, class_weight="balanced", random_state=42
    )
    model.fit(x_train, y_train)
    accuracy = model.score(x_test, y_test)
    matrix = confusion_matrix(y_test, model.predict(x_test), labels=range(5))
    names = ["Unburned", "Low", "Moderate-Low", "Moderate-High", "High"]
    print(f"Accuracy: {accuracy:.1%}")
    print("Confusion matrix:\n", matrix)
    print("Feature importance:")
    for name, value in zip(
        ["dNBR", "NDVI_pre", "NDVI_post", "NBR_pre", "NBR_post"],
        model.feature_importances_,
    ):
        print(f"  {name}: {value:.3f}")
    print("Classes:", names)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pre-dir", type=Path, required=True)
    parser.add_argument("--post-dir", type=Path, required=True)
    args = parser.parse_args()
    train(args.pre_dir, args.post_dir)


if __name__ == "__main__":
    main()
