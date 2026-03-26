#!/bin/bash

API_KEY="llmchat-15b3d62e659abb450bc597decf6bc05f507f36f337010e20"
BASE_URL="https://delph.tech/api/v1/chat"

# Use jq if available, otherwise python for formatting, otherwise raw output
fmt() {
  if command -v jq &>/dev/null; then
    jq .
  elif command -v python3 &>/dev/null; then
    python3 -m json.tool
  else
    cat
  fi
}

MODELS=("gemini-flash-2.5" "gemini-2.5-pro" "claude-sonnet-4.6" "claude-haiku-4.5" "gpt-4.1-mini" "deepseek-r1" "llama-4-scout")

echo "=== Testing Delph Chat API ==="
echo ""

# Test 1: Basic chat completion with each model
for model in "${MODELS[@]}"; do
  echo "--- $model ---"
  curl -s "$BASE_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$model\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello! Reply with one sentence.\"}]}" | fmt
  echo ""
  echo ""
done

# Test 2: Multi-turn conversation
echo "--- Multi-turn conversation (gemini-flash-2.5) ---"
curl -s "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-flash-2.5","messages":[{"role":"user","content":"What is 2+2?"},{"role":"assistant","content":"4"},{"role":"user","content":"Now multiply that by 3."}]}' | fmt

echo ""
echo ""

# Test 3: Streaming
echo "--- Streaming (gemini-flash-2.5) ---"
curl -s "$BASE_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-flash-2.5","messages":[{"role":"user","content":"Count from 1 to 5."}],"stream":true}'

echo ""
echo ""

# Test 4: Invalid API key
echo "--- Invalid API key (expect auth error) ---"
curl -s "$BASE_URL" \
  -H "Authorization: Bearer invalid-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-flash-2.5","messages":[{"role":"user","content":"Hello!"}]}' | fmt

echo ""
echo "=== Done ==="
