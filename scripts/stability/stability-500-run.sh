#!/bin/bash
# ================================================================================
# CR AUDIOVIZ AI - 500-RUN STABILITY TEST (Extended)
# Only run after 100-run passes
# ================================================================================

set -e

TIMESTAMP=$(date -Iseconds)
OUTPUT_DIR="${OUTPUT_DIR:-evidence/stability}"
mkdir -p "$OUTPUT_DIR"

JSON_FILE="$OUTPUT_DIR/500-run-test.json"
RAW_LOG="$OUTPUT_DIR/500-run-raw.log"

ENDPOINTS=(
  "https://craudiovizai.com/pricing"
  "https://craudiovizai.com/apps"
  "https://craudiovizai.com/api/health"
  "https://craudiovizai.com/dashboard"
)

declare -A success_count fail_count total_time

for ep in "${ENDPOINTS[@]}"; do
  key=$(echo "$ep" | sed 's|https://craudiovizai.com||')
  success_count[$key]=0
  fail_count[$key]=0
  total_time[$key]=0
done

echo "=== STABILITY 500-RUN TEST ===" > "$RAW_LOG"
echo "Timestamp: $TIMESTAMP" >> "$RAW_LOG"

for i in $(seq 1 500); do
  [ $((i % 50)) -eq 0 ] && echo "Progress: $i/500"
  
  for ep in "${ENDPOINTS[@]}"; do
    key=$(echo "$ep" | sed 's|https://craudiovizai.com||')
    start_ms=$(date +%s%3N)
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$ep" 2>/dev/null || echo "000")
    end_ms=$(date +%s%3N)
    duration=$((end_ms - start_ms))
    
    [ "$status" = "200" ] && success_count[$key]=$((${success_count[$key]} + 1)) || fail_count[$key]=$((${fail_count[$key]} + 1))
    total_time[$key]=$((${total_time[$key]} + duration))
    echo "$i,$key,$status,$duration" >> "$RAW_LOG"
  done
  sleep 0.1
done

# Generate JSON
cat > "$JSON_FILE" << EOF
{
  "test_type": "500-run stability test",
  "timestamp": "$TIMESTAMP",
  "total_runs": 500,
  "pass_threshold": 495,
  "results": {}
}
EOF

echo "✅ 500-run test complete"
