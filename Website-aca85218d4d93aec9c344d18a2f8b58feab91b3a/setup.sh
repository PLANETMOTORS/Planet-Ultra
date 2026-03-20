#!/bin/bash
set -e

echo "=== Planet Motors Setup ==="

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
  echo "Installing Firebase CLI..."
  npm install -g firebase-tools
fi

# Install functions dependencies
echo "Installing functions dependencies..."
cd functions && npm install && cd ..

# Create .env if missing
if [ ! -f functions/.env ]; then
  echo "Creating functions/.env..."
  cat > functions/.env << 'EOF'
BREVO_API_KEY=YOUR_BREVO_API_KEY_HERE
STAFF_EMAIL=toni@planetmotors.app
FROM_EMAIL=noreply@planetmotors.app
EOF
  echo "⚠️  Edit functions/.env and replace YOUR_BREVO_API_KEY_HERE with your real Brevo API key."
fi

# Login and deploy
echo "Logging in to Firebase..."
firebase login

echo "Deploying functions..."
firebase deploy --only functions --project planet-motors

echo "=== Done! ==="
