# Guide de Déploiement - Spring Endpoints Tester

## 📦 Préparer l'extension pour la publication

### 1. Installer vsce (VS Code Extension Manager)

```bash
npm install -g @vscode/vsce
```

### 2. Compiler l'extension

```bash
npm run package
```

### 3. Créer le package VSIX

```bash
vsce package
```

Cela créera un fichier `spring-endpoints-tester-0.1.0.vsix`

### 4. Tester le package localement

```bash
code --install-extension spring-endpoints-tester-0.1.0.vsix
```

## 🐙 Publier sur GitHub

### 1. Initialiser le repository Git (si pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit - Spring Endpoints Tester v0.1.0"
```

### 2. Créer un repository sur GitHub

1. Va sur https://github.com/new
2. Nom du repository: `spring-endpoints-tester`
3. Description: "Test Spring Boot REST endpoints directly from VS Code - Free IntelliJ IDEA Ultimate alternative"
4. Public
5. Ne pas initialiser avec README (on a déjà le nôtre)

### 3. Lier le repository local avec GitHub

```bash
git remote add origin https://github.com/VOTRE_USERNAME/spring-endpoints-tester.git
git branch -M main
git push -u origin main
```

### 4. Créer une release sur GitHub

```bash
git tag v0.1.0
git push origin v0.1.0
```

Puis sur GitHub:
1. Va dans "Releases"
2. Clique "Create a new release"
3. Choisis le tag `v0.1.0`
4. Titre: "Spring Endpoints Tester v0.1.0"
5. Description: Copie le contenu de CHANGELOG.md
6. Attache le fichier `.vsix`
7. Publie!

## 🚀 Publier sur VS Code Marketplace

### 1. Créer un Personal Access Token (PAT)

1. Va sur https://dev.azure.com
2. Crée une organisation si tu n'en as pas
3. User Settings → Personal Access Tokens
4. New Token avec les permissions:
   - **Marketplace: Manage**
5. Copie le token (tu ne pourras plus le voir!)

### 2. Créer un publisher

```bash
vsce create-publisher VOTRE_NOM
```

Ou login si tu en as déjà un:

```bash
vsce login VOTRE_NOM
```

Colle ton PAT quand demandé.

### 3. Mettre à jour package.json

Remplace `"publisher": "yourname"` par ton vrai nom de publisher.

### 4. Publier!

```bash
vsce publish
```

Ou pour publier une version spécifique:

```bash
vsce publish minor  # 0.1.0 → 0.2.0
vsce publish patch  # 0.1.0 → 0.1.1
vsce publish major  # 0.1.0 → 1.0.0
```

## ✅ Checklist avant publication

- [ ] README.md complet avec screenshots
- [ ] CHANGELOG.md à jour
- [ ] LICENSE présent
- [ ] Version correcte dans package.json
- [ ] Publisher name configuré
- [ ] Repository GitHub créé et lié
- [ ] Extension testée localement
- [ ] Aucune erreur de compilation
- [ ] Icon créé (optionnel mais recommandé)

## 🔄 Mises à jour futures

Pour publier une mise à jour:

1. Modifie le code
2. Mets à jour CHANGELOG.md
3. Compile et teste
4. Commit les changements
5. `vsce publish patch` (ou minor/major selon le type de changement)
6. Tag et push vers GitHub
7. Crée une nouvelle release sur GitHub

## 📝 Notes

- Le marketplace peut prendre jusqu'à 10 minutes pour traiter la publication
- L'extension sera visible sur https://marketplace.visualstudio.com/items?itemName=PUBLISHER.spring-endpoints-tester
- Les utilisateurs pourront l'installer directement depuis VS Code

## 🆘 En cas de problème

- Documentation vsce: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- Guide officiel: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publishing-extensions
