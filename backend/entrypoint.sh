#!/bin/sh
# Entrypoint script for backend container
# Optionally deploys contract if DEPLOY_CONTRACT=true

echo "🚀 Starting VerifiChain Backend..."

# Check if contract compilation artifacts exist
if [ ! -f "/app/blockchain/build/contracts/CredentialRegistry.json" ]; then
    echo "❌ Contract compilation artifacts not found!"
    echo "   This should not happen if Dockerfile compiled contracts correctly."
    exit 1
fi

# Optionally deploy contract if DEPLOY_CONTRACT is set
if [ "$DEPLOY_CONTRACT" = "true" ]; then
    echo "📦 Deploying contract (DEPLOY_CONTRACT=true)..."
    cd /app/blockchain
    if ! node ../backend/scripts/deploy-contract.js; then
        echo "⚠️  Contract deployment failed, but continuing with server start..."
        echo "   You can deploy manually later or check CONTRACT_ADDRESS is set correctly."
    fi
    cd /app
fi

# Start the backend server
echo "🌐 Starting backend server..."
exec node backend/server.js

