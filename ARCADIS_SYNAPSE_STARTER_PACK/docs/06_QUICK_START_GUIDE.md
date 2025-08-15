# ⚡ QUICK START GUIDE - 30 MINUTES TO MVP

## 🎯 Objectif
Avoir un fork VSCode fonctionnel avec architecture dual-agent en 30 minutes.

---

## 📋 PRÉ-REQUIS

```bash
# Vérifier les installations
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
git --version   # >= 2.30.0
python --version # >= 3.8 (pour node-gyp)

# Installer pnpm si nécessaire
npm install -g pnpm

# Installer Cursor (ironique mais nécessaire)
# Télécharger depuis https://cursor.sh
```

---

## 🚀 ÉTAPE 1 : FORK VSCODE (5 minutes)

```bash
# 1. Créer votre workspace
mkdir ~/arcadis-synapse-ide
cd ~/arcadis-synapse-ide

# 2. Fork VSCode
git clone https://github.com/microsoft/vscode.git
cd vscode

# 3. Checkout version stable
git checkout release/1.85

# 4. Ouvrir dans Cursor
cursor .
```

---

## 🔧 ÉTAPE 2 : SETUP INITIAL (5 minutes)

### Dans Cursor, utiliser Cmd+K :

```bash
# Premier prompt
Cmd+K: "Setup this VSCode fork for development with yarn, including all dependencies and build scripts"

# Deuxième prompt  
Cmd+K: "Create a build script that compiles VSCode for my current platform"
```

### Puis dans le terminal :

```bash
# Installer les dépendances
yarn

# Premier build test
yarn compile
```

---

## 🎨 ÉTAPE 3 : REBRANDING RAPIDE (5 minutes)

### Utiliser Cursor Composer (Cmd+Shift+I) :

```markdown
Task: Rebrand this VSCode fork to "Arcadis Synapse"

1. Replace all "Visual Studio Code" with "Arcadis Synapse"
2. Replace all "Code - OSS" with "Synapse"
3. Update product.json with:
   - nameShort: "Synapse"
   - nameLong: "Arcadis Synapse IDE"
   - applicationName: "synapse"
   - dataFolderName: ".synapse"
4. Change main color theme to blue (#0054A6)
5. Remove Microsoft telemetry
```

---

## 🤖 ÉTAPE 4 : EXTENSION DUAL-AGENT (10 minutes)

### Créer l'extension de base :

```bash
# Dans le dossier vscode
mkdir extensions/arcadis-synapse
cd extensions/arcadis-synapse
```

### Utiliser Cursor pour générer :

```bash
Cmd+K: "Create a VSCode extension with:
- Activity bar icon 'Synapse'
- Webview panel for chat
- Commands for Cortex and Neuron
- WebSocket client connecting to localhost:7437"
```

### Structure attendue :

```
extensions/arcadis-synapse/
├── package.json
├── src/
│   ├── extension.ts
│   ├── cortexAgent.ts
│   ├── neuronAgent.ts
│   ├── orchestrator.ts
│   └── webview/
│       └── chat.html
└── tsconfig.json
```

---

## 🔌 ÉTAPE 5 : SERVICE LOCAL (5 minutes)

### Créer le service orchestrateur :

```bash
# Retour à la racine
cd ~/arcadis-synapse-ide
mkdir synapse-service
cd synapse-service
```

### Initialiser avec Cursor :

```bash
Cmd+K: "Create a Node.js WebSocket server on port 7437 that:
- Accepts connections from VSCode extension
- Routes messages to Cortex (Claude Opus) or Neuron (Claude Sonnet)
- Manages conversation state
- Handles streaming responses"
```

### Package.json minimal :

```json
{
  "name": "synapse-orchestrator",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "ws": "^8.16.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "dotenv": "^16.4.0"
  }
}
```

---

## ⚡ COMMANDES CURSOR MAGIQUES

### Les prompts qui font gagner du temps :

```bash
# 1. Pour le debugging
"Add comprehensive logging to this VSCode extension"

# 2. Pour l'UI
"Create a beautiful chat interface similar to ChatGPT in this webview"

# 3. Pour l'intégration
"Add inline code suggestions like GitHub Copilot to this editor"

# 4. Pour la performance
"Optimize this code for production with caching and error handling"

# 5. Pour les tests
"Generate unit tests for all methods in this file"
```

---

## 🏃 RUN & TEST

### 1. Lancer le service :

```bash
cd ~/arcadis-synapse-ide/synapse-service
npm start
```

### 2. Lancer VSCode fork :

```bash
cd ~/arcadis-synapse-ide/vscode
./scripts/code.sh
```

### 3. Tester l'extension :

- Ouvrir Command Palette (Cmd+Shift+P)
- Taper "Synapse"
- Voir les commandes disponibles

---

## 🐛 TROUBLESHOOTING

### Erreurs communes :

| Erreur | Solution |
|--------|----------|
| `node-gyp` fails | Install Python 3 and build tools |
| `yarn` not found | Use `npm install -g yarn` |
| Port 7437 busy | Change port in both extension and service |
| Extension not loading | Check `Help > Toggle Developer Tools` |
| Build fails | Clear cache: `yarn clean && yarn` |

### Debug avec Cursor :

```bash
# Si erreur incompréhensible
Cmd+K: "Debug this error: [paste error here]"

# Si performance lente
Cmd+K: "Profile and optimize this code"

# Si crash
Cmd+K: "Add error boundaries and recovery"
```

---

## 📦 STRUCTURE FINALE

```
~/arcadis-synapse-ide/
├── vscode/                    # Fork VSCode
│   ├── src/
│   ├── extensions/
│   │   └── arcadis-synapse/  # Notre extension
│   └── out/
├── synapse-service/          # Service orchestrateur
│   ├── server.js
│   ├── cortex.js
│   ├── neuron.js
│   └── package.json
└── .env                      # API keys
```

---

## 🎯 NEXT STEPS

### Après ces 30 minutes :

1. **Améliorer l'UI** 
   ```bash
   Cmd+K: "Make this chat interface production-ready with animations"
   ```

2. **Ajouter le contexte**
   ```bash
   Cmd+K: "Add workspace file indexing with vector embeddings"
   ```

3. **Implémenter Cmd+K**
   ```bash
   Cmd+K: "Add inline chat like Cursor's Cmd+K feature"
   ```

4. **Optimiser les performances**
   ```bash
   Cmd+K: "Optimize startup time and reduce memory usage"
   ```

---

## 💡 TIPS & TRICKS

### Maximiser Cursor :

1. **Toujours donner le contexte**
   - Mauvais : "Fix this"
   - Bon : "Fix this WebSocket connection error in VSCode extension"

2. **Utiliser les références**
   - `@file` pour référencer des fichiers
   - `@workspace` pour le contexte global

3. **Composer pour les grandes tâches**
   - Cmd+Shift+I pour les refactoring majeurs

4. **Itérer rapidement**
   - Petits changements fréquents > gros changements rares

---

## ✅ CHECKLIST VALIDATION

Avant de considérer le MVP complet :

- [ ] VSCode fork compile et run
- [ ] Rebranding visible (logo, nom, couleurs)
- [ ] Extension charge dans l'IDE
- [ ] Service WebSocket répond
- [ ] Communication extension <-> service OK
- [ ] Un prompt simple fonctionne
- [ ] Pas d'erreurs dans la console

---

## 🚀 FÉLICITATIONS !

Vous avez maintenant :
- ✅ Un fork VSCode fonctionnel
- ✅ Une architecture dual-agent basique
- ✅ Les bases pour rivaliser avec Cursor

**Temps total : 30 minutes**

Maintenant, suivez le `DEVELOPMENT_PLAN.md` pour les 8 prochaines semaines !

---

*"The best code is written by AI, debugged by humans, and shipped by rebels."*