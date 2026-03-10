# PartsFinder Pro - Deployment Instructies

## 🚀 Deployment Opties

### Optie 1: GitHub Pages (Aanbevolen - Gratis & Simpel)

#### Stap 1: Repository Aanmaken
```bash
# Maak nieuwe GitHub repository
# Ga naar: https://github.com/new
# Repository naam: partsfinder-pro
# Visibility: Public
```

#### Stap 2: Code Uploaden
```bash
# Initialiseer git in je project folder
git init

# Voeg alle bestanden toe
git add .

# Commit
git commit -m "Initial commit - PartsFinder Pro v1.0"

# Voeg remote repository toe
git remote add origin https://github.com/JOUW_USERNAME/partsfinder-pro.git

# Push naar GitHub
git branch -M main
git push -u origin main
```

#### Stap 3: GitHub Pages Activeren
1. Ga naar repository Settings
2. Scroll naar "Pages" sectie
3. Source: selecteer "main" branch
4. Folder: root
5. Klik "Save"
6. Wacht 1-2 minuten
7. Je site is live op: `https://JOUW_USERNAME.github.io/partsfinder-pro/`

---

### Optie 2: Vercel (Aanbevolen voor Serverless Functions)

#### Stap 1: Vercel Account
```bash
# Registreer op vercel.com (gratis met GitHub)
# Installeer Vercel CLI (optioneel)
npm install -g vercel
```

#### Stap 2: Deploy
```bash
# Via CLI
vercel

# Of via GitHub integratie:
# 1. Ga naar vercel.com/dashboard
# 2. Klik "New Project"
# 3. Import je GitHub repository
# 4. Deploy (automatisch)
```

#### Voordelen Vercel
- Automatische HTTPS
- Serverless functions mogelijk
- CDN voor snelle laadtijden
- Automatische deployments bij git push

---

### Optie 3: Netlify

#### Deploy via Netlify
```bash
# 1. Registreer op netlify.com
# 2. Drag & drop je project folder naar Netlify dashboard
# OF
# 3. Connect met GitHub repository
# 4. Build settings: laat leeg (statische site)
# 5. Deploy!
```

#### Netlify Features
- Gratis SSL certificaat
- Form handling
- Edge functions
- 100GB bandwidth/maand (gratis tier)

---

### Optie 4: Render.com

#### Voor Statische Site
```bash
# 1. Ga naar render.com
# 2. Klik "New +" → "Static Site"
# 3. Connect GitHub repository
# 4. Build command: laat leeg
# 5. Publish directory: /
# 6. Deploy!
```

---

## 🔧 Pre-Deployment Checklist

### ✅ Controleer voor Deployment
- [ ] Alle bestanden zijn aanwezig
- [ ] API keys zijn NIET hardcoded (gebruikers moeten eigen keys invoeren)
- [ ] Alle CDN links werken
- [ ] README.md is up-to-date
- [ ] Geen console.errors in browser
- [ ] Mobile responsive getest
- [ ] Cross-browser getest (Chrome, Firefox, Safari, Edge)

### 🔒 Security Checklist
- [ ] Geen API keys in source code
- [ ] LocalStorage gebruikt voor user settings
- [ ] HTTPS enabled (automatisch bij hosting platforms)
- [ ] CORS headers correct ingesteld (indien nodig)

---

## 🌐 Post-Deployment

### Custom Domain (Optioneel)
```bash
# GitHub Pages
# 1. Koop domein (bijv. bij Namecheap, Google Domains)
# 2. Voeg CNAME record toe:
#    Type: CNAME
#    Name: www
#    Value: JOUW_USERNAME.github.io
# 3. In GitHub repo: Settings → Pages → Custom domain

# Vercel/Netlify
# Volg hun wizard voor custom domain setup
```

### SSL Certificaat
- GitHub Pages: Automatisch via Let's Encrypt
- Vercel: Automatisch
- Netlify: Automatisch
- Render: Automatisch

---

## 📊 Testing na Deployment

### Functionele Tests
```bash
# Test deze functionaliteit:
1. ✓ Tab navigatie werkt
2. ✓ Settings modal opent/sluit
3. ✓ API key kan worden opgeslagen
4. ✓ Search functionaliteit (met demo data)
5. ✓ PDF upload werkt
6. ✓ Analyse resultaten tonen
7. ✓ BOM export naar Excel
8. ✓ RSPL export naar Excel
9. ✓ Notificaties tonen correct
10. ✓ Mobile responsive werkt
```

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Performance Tests
```bash
# Gebruik deze tools:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

# Target scores:
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90
```

---

## 🐛 Troubleshooting

### PDF.js Niet Laden
```javascript
// Controleer in browser console:
console.log(typeof pdfjsLib); // Should return 'object'

// Fix: Check CDN URL in index.html
// https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js
```

### SheetJS Export Werkt Niet
```javascript
// Controleer:
console.log(typeof XLSX); // Should return 'object'

// Fix: Check CDN URL in index.html
// https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
```

### Cohere API Errors
```bash
# Veelvoorkomende fouten:
1. "Unauthorized" → Check API key
2. "Rate limit exceeded" → Wacht of upgrade plan
3. "CORS error" → Cohere API ondersteunt CORS, check browser console
```

### CORS Issues
```bash
# Als je externe API's gebruikt:
# Optie 1: Gebruik CORS proxy (development)
https://cors-anywhere.herokuapp.com/

# Optie 2: Implement serverless function (Vercel/Netlify)
# Optie 3: Backend API met CORS enabled
```

---

## 🔄 Updates Deployen

### GitHub Pages
```bash
git add .
git commit -m "Update: beschrijving van changes"
git push origin main
# GitHub Pages update automatisch binnen 1-2 minuten
```

### Vercel/Netlify
```bash
# Automatisch bij git push naar main branch
# OF
vercel --prod  # Via CLI
```

---

## 📈 Analytics (Optioneel)

### Google Analytics
```html
<!-- Voeg toe in <head> van index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Plausible Analytics (Privacy-friendly)
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🎯 Live URL Examples

Na deployment krijg je een URL zoals:

- **GitHub Pages**: `https://username.github.io/partsfinder-pro/`
- **Vercel**: `https://partsfinder-pro.vercel.app/`
- **Netlify**: `https://partsfinder-pro.netlify.app/`
- **Render**: `https://partsfinder-pro.onrender.com/`

---

## 💡 Tips voor Productie

1. **Gebruik een custom domain** voor professionaliteit
2. **Enable analytics** om gebruik te monitoren
3. **Maak backup** van je code (GitHub is al een backup)
4. **Monitor API usage** (Cohere dashboard)
5. **Verzamel user feedback** en itereer
6. **Update README** met live URL
7. **Maak screenshots** voor documentatie
8. **Schrijf changelog** voor updates

---

## 🆘 Support

Voor vragen en support:
- Check de README.md voor basis informatie
- Bekijk browser console voor error messages
- Test met sample data als API issues zijn
- Voor Cohere API: https://docs.cohere.com
- Voor SheetJS: https://docs.sheetjs.com
- Voor PDF.js: https://mozilla.github.io/pdf.js/

---

**Klaar voor deployment! 🚀**

Volg de stappen hierboven en je applicatie is binnen enkele minuten live!
