# 🚀 Publication sur VS Code Marketplace - Instructions

## ✅ Package créé avec succès!

Le fichier `spring-endpoints-tester-0.1.0.vsix` a été créé (2.62 MB).

## 📋 Étapes pour publier sur le Marketplace

### 1. Créer un compte Publisher sur Visual Studio Marketplace

1. Va sur **https://marketplace.visualstudio.com/manage**
2. Connecte-toi avec ton compte Microsoft (ou crée-en un)
3. Clique sur "Create publisher"
4. Remplis les informations:
   - **Publisher ID**: `mamadoujuniorsy` (doit correspondre au package.json)
   - **Display Name**: `Mamadou SY`
   - **Description**: Une courte bio ou description

### 2. Créer un Personal Access Token (PAT)

1. Va sur **https://dev.azure.com**
2. Clique sur ton profil (en haut à droite) → "Personal access tokens"
3. Clique "New Token"
4. Configure le token:
   - **Name**: `vscode-marketplace`
   - **Organization**: All accessible organizations
   - **Expiration**: 90 jours (ou plus)
   - **Scopes**: Clique "Show all scopes" puis coche:
     - ✅ **Marketplace** → **Manage** (très important!)
5. Clique "Create"
6. **COPIE LE TOKEN IMMÉDIATEMENT** (tu ne pourras plus le voir!)

### 3. Se connecter avec vsce

```bash
vsce login mamadoujuniorsy
```

Colle ton Personal Access Token quand demandé.

### 4. Publier l'extension!

```bash
vsce publish
```

Ou si tu as déjà le fichier .vsix:

```bash
vsce publish --packagePath spring-endpoints-tester-0.1.0.vsix
```

### 5. Attendre la validation

- La publication prend **5-10 minutes** pour être traitée
- Tu recevras un email de confirmation
- L'extension sera visible sur: https://marketplace.visualstudio.com/items?itemName=mamadoujuniorsy.spring-endpoints-tester

## 🧪 Tester localement avant de publier

Tu peux installer le .vsix localement pour vérifier:

```bash
code --install-extension spring-endpoints-tester-0.1.0.vsix
```

Puis:
1. Ouvre VS Code
2. Va dans Extensions (Ctrl+Shift+X)
3. Cherche "Spring Endpoints Tester"
4. Teste toutes les fonctionnalités

Pour désinstaller après le test:
```bash
code --uninstall-extension mamadoujuniorsy.spring-endpoints-tester
```

## ⚠️ Troubleshooting

### Erreur "Publisher not found"
- Assure-toi d'avoir créé le publisher sur marketplace.visualstudio.com/manage
- Le publisher ID dans package.json doit correspondre exactement

### Erreur "Unauthorized"
- Ton PAT n'a peut-être pas les bonnes permissions
- Vérifie que "Marketplace: Manage" est coché
- Recrée un nouveau token si nécessaire

### Erreur "Icon too large"
- L'icon doit faire moins de 1MB
- Compresse ton icon.png si nécessaire

## 📊 Après publication

1. **Vérifie ta page sur le marketplace**:
   https://marketplace.visualstudio.com/items?itemName=mamadoujuniorsy.spring-endpoints-tester

2. **Partage l'extension**:
   - Twitter, LinkedIn, Reddit (r/vscode, r/java, r/springboot)
   - GitHub README avec badge: 
     ```markdown
     [![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/mamadoujuniorsy.spring-endpoints-tester.svg)](https://marketplace.visualstudio.com/items?itemName=mamadoujuniorsy.spring-endpoints-tester)
     ```

3. **Monitor les stats**:
   - Installs, ratings, reviews sur marketplace.visualstudio.com/manage

## 🔄 Publier des mises à jour

Pour publier une nouvelle version:

```bash
# Incrémente la version (patch: 0.1.0 → 0.1.1)
vsce publish patch

# Ou minor (0.1.0 → 0.2.0)
vsce publish minor

# Ou major (0.1.0 → 1.0.0)
vsce publish major
```

Ou manuellement:
1. Change la version dans package.json
2. Mets à jour CHANGELOG.md
3. `vsce package`
4. `vsce publish`

---

**Bon courage pour la publication! 🚀**

Si tu as des questions, consulte: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
