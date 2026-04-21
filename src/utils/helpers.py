import yaml
import os

def load_config(config_path="config/config.yaml"):
    """
    Loads configuration from a YAML file.
    """
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {}

def ensure_dir(path):
    """
    Ensures a directory exists.
    """
    if not os.path.exists(path):
        os.makedirs(path)
