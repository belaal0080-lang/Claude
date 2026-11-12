#!/usr/bin/env bash
# Wrapper script for fetch-media skill
# This ensures the Python script runs correctly regardless of current working directory

# Get the directory where this script is located (absolute path)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Set up environment
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"

# Load .env file if it exists
if [ -f "$SKILL_DIR/.env" ]; then
    set -a  # automatically export all variables
    source "$SKILL_DIR/.env"
    set +a
fi

# Run the Python script with absolute path
exec python3 "$SCRIPT_DIR/search_media.py" "$@"
