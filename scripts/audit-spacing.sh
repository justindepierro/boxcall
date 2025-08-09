#!/usr/bin/env bash
# Simple spacing audit: lists files using large padding / gap utilities.
set -euo pipefail
PATTERN='p-6|p-8|px-8|py-8|gap-6|gap-8'
echo "Auditing spacing utilities (pattern: $PATTERN)" >&2
grep -R --line-number -E "$PATTERN" src/components || true
