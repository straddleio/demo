# Paykey Generator

A cryptographic tokenization demo for secure payment processing, built with BLAKE3 hashing.

## Features

- **Authenticated Tokens** - HMAC-based paykey generation prevents forgery
- **Key Derivation** - KDF creates isolated keys for vault, analytics, and API access
- **NerdCon Aesthetic** - Retro-futuristic terminal design with CRT effects
- **Real Cryptography** - Uses b3sum binary for production-grade hashing

## Requirements

- Python 3.x
- `b3sum` (BLAKE3 command-line tool)

## Installation

The `b3sum` tool should already be installed. If not:

```bash
# Arch Linux
sudo pacman -S b3sum

# Or via yay
yay -S b3sum
```

## Usage

1. **Start the server:**
   ```bash
   cd ~/paykey-generator
   python server.py
   ```

2. **Open in browser:**
   ```
   http://localhost:8081
   ```

3. **Generate paykeys:**
   - Enter customer identity data (JSON)
   - Provide bank routing and account numbers
   - Add optional open banking token
   - Set your secret key (32-byte hex)
   - Click "Generate Paykey"

## Architecture

```
Customer Data + Bank Info → BLAKE3 Keyed Mode → Paykey Token
                          ↓
              Key Derivation (KDF)
                          ↓
        Vault Key | Analytics Token | API Key
```

## Files

- `server.py` - Python HTTP server with BLAKE3 integration
- `index.html` - Frontend interface with NerdCon design system
- `README.md` - This file

## Security Features

✓ Authenticated tokens prevent forgery
✓ KDF creates cryptographically isolated keys per context
✓ Deterministic generation (same input = same token)
✓ 256-bit output space (2^256 possible values)

## Demo Context

This is a demonstration application for Fintech NerdCon. It showcases modern cryptographic tokenization techniques for secure payment processing.

---

**Generated with Claude Code**
© 2025 NerdCon Fintech Demo
