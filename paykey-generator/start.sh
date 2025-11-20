#!/bin/bash
# Paykey Generator - Quick Start Script

echo "🚀 Starting Paykey Generator..."
echo "📍 Server will be available at: http://localhost:8081"
echo "🛑 Press Ctrl+C to stop"
echo ""

cd "$(dirname "$0")"
python server.py
