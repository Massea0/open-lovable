# 🔑 Guide de Configuration API - Arcadis Synapse™

## État Actuel

**⚠️ IMPORTANT**: Le système fonctionne actuellement en **mode MOCK** (démonstration).  
Pour activer les vraies fonctionnalités IA, vous devez configurer les clés API.

## 📋 Prérequis

Pour un fonctionnement complet d'Arcadis Synapse™, vous avez besoin de :

### 1. **Anthropic API** (OBLIGATOIRE)
- **Cortex** (Architecte) : Claude 3 Opus
- **Neuron** (Exécuteur) : Claude 3.5 Sonnet
- Obtenir une clé : https://console.anthropic.com/

### 2. **E2B API** (Optionnel - pour sandbox)
- Exécution de code en temps réel
- Obtenir une clé : https://e2b.dev/

### 3. **Firecrawl API** (Optionnel - pour scraping)
- Analyse de sites web
- Obtenir une clé : https://firecrawl.dev/

## 🚀 Configuration Rapide

### Étape 1 : Copier le fichier d'environnement

```bash
# Le fichier .env.local a déjà été créé avec les placeholders
```

### Étape 2 : Ajouter vos clés API

Éditez `/workspace/.env.local` et remplacez les placeholders :

```env
# Configuration minimale pour tester
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx  # Votre vraie clé Anthropic

# Optionnel mais recommandé
E2B_API_KEY=e2b_xxxxx
FIRECRAWL_API_KEY=fc_xxxxx
```

### Étape 3 : Redémarrer le serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis relancer
pnpm dev
```

## 🧪 Test de Fonctionnement

### Mode MOCK (par défaut sans clés)
- ✅ Interface complète disponible
- ✅ Animations et interactions
- ⚠️ Réponses simulées
- ❌ Pas de vraie génération de code

### Mode PRODUCTION (avec clés API)
- ✅ Vraie analyse par Claude Opus (Cortex)
- ✅ Vraie exécution par Claude 3.5 Sonnet (Neuron)
- ✅ Génération de code réelle
- ✅ Persistence de la documentation

## 📊 Vérification du Statut

Une fois configuré, l'interface affichera :
- **Indicateur vert** : APIs connectées
- **Badge "PRODUCTION"** : Mode réel actif
- **Métriques réelles** : Temps de réponse, tokens utilisés

## 💰 Estimation des Coûts

### Utilisation typique (par jour) :
- **Cortex (Opus)** : ~100 requêtes × $0.015 = $1.50
- **Neuron (Sonnet)** : ~200 requêtes × $0.003 = $0.60
- **Total estimé** : ~$2-3/jour en usage normal

## 🔒 Sécurité

**⚠️ IMPORTANT** :
- Ne jamais commiter `.env.local` dans git
- Utiliser des variables d'environnement en production
- Limiter les clés API par IP si possible
- Surveiller l'usage via les dashboards des providers

## 🐛 Dépannage

### "No API key configured"
→ Vérifiez que `.env.local` contient `ANTHROPIC_API_KEY`

### "Invalid API key"
→ Vérifiez que la clé commence par `sk-ant-api03-`

### "Rate limit exceeded"
→ Attendez quelques secondes ou upgradez votre plan

## 📞 Support

Pour toute question sur la configuration :
- Documentation Anthropic : https://docs.anthropic.com/
- Documentation E2B : https://docs.e2b.dev/
- Contact Arcadis Tech : support@arcadis.tech