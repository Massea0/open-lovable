#!/bin/bash

# 🚀 ARCADIS SYNAPSE - VSCode Fork Script
# This script automates the forking and setup of VSCode

set -e  # Exit on error

echo "🚀 Arcadis Synapse IDE - VSCode Fork Setup"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

if ! command -v yarn &> /dev/null; then
    echo -e "${BLUE}📦 Installing yarn...${NC}"
    npm install -g yarn
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Setup directory
WORKSPACE_DIR="$HOME/arcadis-synapse-ide"
echo -e "${BLUE}📁 Creating workspace at $WORKSPACE_DIR${NC}"

if [ -d "$WORKSPACE_DIR" ]; then
    echo -e "${RED}⚠️  Directory already exists. Remove it? (y/n)${NC}"
    read -r response
    if [ "$response" = "y" ]; then
        rm -rf "$WORKSPACE_DIR"
    else
        echo "Exiting..."
        exit 1
    fi
fi

mkdir -p "$WORKSPACE_DIR"
cd "$WORKSPACE_DIR"

# Clone VSCode
echo -e "${BLUE}📥 Cloning VSCode repository...${NC}"
git clone https://github.com/microsoft/vscode.git
cd vscode

# Checkout stable version
echo -e "${BLUE}🔄 Checking out stable release...${NC}"
git checkout release/1.85

# Initial setup
echo -e "${BLUE}📦 Installing dependencies (this may take a while)...${NC}"
yarn

# Create our extension directory
echo -e "${BLUE}🔧 Creating Arcadis Synapse extension...${NC}"
mkdir -p extensions/arcadis-synapse

# Basic rebranding
echo -e "${BLUE}🎨 Applying Arcadis branding...${NC}"

# Update product.json
cat > product.json << 'EOF'
{
  "nameShort": "Synapse",
  "nameLong": "Arcadis Synapse IDE",
  "applicationName": "synapse",
  "dataFolderName": ".synapse",
  "win32MutexName": "synapse",
  "licenseName": "Proprietary",
  "licenseUrl": "https://arcadis.tech/license",
  "win32DirName": "Arcadis Synapse",
  "win32NameVersion": "Arcadis Synapse IDE",
  "win32RegValueName": "SynapseIDE",
  "win32AppUserModelId": "ArcadisTech.SynapseIDE",
  "win32ShellNameShort": "S&ynapse",
  "darwinBundleIdentifier": "tech.arcadis.synapse",
  "reportIssueUrl": "https://github.com/arcadis-tech/synapse/issues",
  "urlProtocol": "synapse",
  "extensionAllowedProposedApi": [
    "arcadis.synapse"
  ]
}
EOF

# Create build script
echo -e "${BLUE}📝 Creating build scripts...${NC}"

cat > build.sh << 'EOF'
#!/bin/bash
echo "🔨 Building Arcadis Synapse IDE..."
yarn compile
yarn download-builtin-extensions
echo "✅ Build complete!"
EOF

chmod +x build.sh

cat > run.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Arcadis Synapse IDE..."
./scripts/code.sh
EOF

chmod +x run.sh

# Create the service directory
echo -e "${BLUE}🤖 Setting up orchestrator service...${NC}"
cd "$WORKSPACE_DIR"
mkdir -p synapse-service

cat > synapse-service/package.json << 'EOF'
{
  "name": "synapse-orchestrator",
  "version": "1.0.0",
  "description": "Arcadis Synapse Dual-Agent Orchestrator",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "ws": "^8.16.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "dotenv": "^16.4.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
EOF

# Create .env template
echo -e "${BLUE}🔑 Creating environment template...${NC}"
cat > "$WORKSPACE_DIR/.env.example" << 'EOF'
# Anthropic API (Required for Cortex & Neuron)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI API (Optional)
OPENAI_API_KEY=your_openai_api_key_here

# Google API (Optional)
GOOGLE_API_KEY=your_google_api_key_here

# Service Configuration
ORCHESTRATOR_PORT=7437
ORCHESTRATOR_HOST=localhost

# Agent Models
CORTEX_MODEL=claude-3-opus-20240229
NEURON_MODEL=claude-3-sonnet-20240229

# Development
NODE_ENV=development
DEBUG=true
EOF

echo -e "${GREEN}✅ Fork setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. cd $WORKSPACE_DIR/vscode"
echo "2. Open in Cursor: cursor ."
echo "3. Run: ./build.sh"
echo "4. Start: ./run.sh"
echo ""
echo -e "${BLUE}💡 Don't forget to:${NC}"
echo "- Copy your .env.example to .env and add API keys"
echo "- Read docs/QUICK_START_GUIDE.md for detailed instructions"
echo ""
echo -e "${GREEN}🚀 Happy coding with Arcadis Synapse!${NC}"