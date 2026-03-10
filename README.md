# PartsFinder Pro - Grootkeuken Apparatuur Spare Parts Analyse Tool

## 📋 Projectomschrijving

PartsFinder Pro is een complete webapplicatie voor het analyseren van grootkeuken apparatuur onderdelen en het genereren van professionele Bill of Materials (BOM) en Recommended Spare Parts Lists (RSPL) voor marine en industriële toepassingen. (C) 2026 AB Apps

## ✨ Huidige Functionaliteiten

### ✅ Geïmplementeerd

1. **Zoekfunctionaliteit**
   - Invoer merk en type/model van grootkeuken apparaat
   - Online zoeken naar parts lists en manuals
   - Integratie met gratis search API's

2. **AI Analyse**
   - Integratie met Cohere AI (gratis API)
   - Automatische analyse van spare parts lijsten
   - Intelligente extractie van onderdeel informatie

3. **PDF Upload & Analyse**
   - Upload bestaande parts lists (PDF formaat)
   - Automatische parsing met PDF.js
   - AI-gestuurde analyse van geüploade documenten

4. **BOM Generator**
   - Genereren van complete Bill of Materials
   - 70+ kolommen volgens maritieme specificaties
   - Export naar Excel (XLSX)

5. **RSPL Generator**
   - Genereren van Recommended Spare Parts List
   - 3-jaars voorspelling voor scheepsvoorraad
   - 20 kolommen volgens specificaties
   - Export naar Excel (XLSX)

6. **Excel Export**
   - XLSX export met SheetJS bibliotheek
   - Voorgeformatteerde kolommen
   - Ready-to-use spreadsheets

## 🚀 Functie URI's en Entry Points

### Hoofdpagina
- **URL**: `index.html`
- **Functie**: Hoofdinterface met alle functionaliteit

### Secties
1. **Search Section** (`#search-section`)
   - Merk en model invoer
   - Online search functionaliteit

2. **Upload Section** (`#upload-section`)
   - PDF upload functionaliteit
   - Drag & drop interface

3. **Analysis Section** (`#analysis-section`)
   - AI analyse resultaten
   - Preview van gevonden onderdelen

4. **Generate Section** (`#generate-section`)
   - BOM generatie
   - RSPL generatie
   - Excel export opties

## 📊 Data Structuren

### BOM Kolommen (70+ velden)
1. PHYSICAL PRODUCT BREAKDOWN (PPB)
2. PPB DESCRIPTION
3. OEM PART NUMBER
4. NAME OF MANUFACTURER
5. CAGE CODE NO. OEM
6. SUBCONTRACTOR PART NUMBER
7. CAGE CODE NO. SUBCONTRACTOR
8. SPARE PART NAME
9. QTY PER ASSEMBLY
10. UNIT OF ISSUE
11. UNIT PRICE (EURO) Excl. VAT
12. DRAWING NO. ASSEMBLY DRAWING
13. POSITION NO. DRAWING
14. EXPLODED VIEW NO.
15. POSITION NO. EXPLODED VIEW
16. SPECIFICATION NUMBER
17. SERIAL NUMBER TRACEABILITY REQUIRED (Y/N)
18. GS1 CODE
19. EXPORT CONTROL CLASSIFICATION NUMBER (EAR)
20. EXPORT CONTROL CLASSIFICATION NUMBER (ITAR)
21. EXPORT CONTROL CLASSIFICATION NUMBER (NLML)
22. EXPORT CONTROL CLASSIFICATION NUMBER (EUDU)
23. DELIVERY TIME (DAYS)
24. UNIT SIZE LENGTH
25. UNIT SIZE WIDTH
26. UNIT SIZE HEIGHT
27. UNIT SIZE UOM
28. WEIGHT ITEM
29. UNIT WEIGHT UOM
30. PART TYPE LRU Y/N
31. SPARE PARTS CLASSIFICATION
32. HAZARDOUS MATERIAL UN NUMBER
33. SYSTEM REPAIR COST [EURO]
34. LRU REPAIR COST [EURO]
35. PACKAGING LEVEL CODE
36. STANDARD PACKAGE QUANTITY
37. CATEGORY 1 CONTAINER MANUFACTURER CAGE CODE
38. CATEGORY 1 CONTAINER REFERENCE NUMBER
39. END LIFE OF TYPE (ELOT)
40. PROBABILITY OBSOLESCENCE ARISES WITHIN YEARS
41. CONSEQUENCES OF OBSOLESCENCE
42. INDICATION OF THE COST OF OBSOLESCENCE (EURO)
43. OBSOLESCENCE APPROACH (STRATEGY)
44. OBSOLESCENCE MITIGATION ACTION
45. TURNAROUND TIME (TaT) (DAYS)
46. CONVERSION FACTOR
47. MTBF
48. TYPE OF UNIT OF MTBF
49. MTBF SOURCE
50. MTTR (HOURS)
51. RECOMMENDED SPARE PART (Y/N)
52. REASON FOR SELECTION RECOMMENDED SPARE PART
53. SPARE PART TYPE (Pr/Cr/Con)
54. ITEM CATEGORY CODE (ICC)
55. REPAIR LEVEL (OLM/ILM/DLM)
56. NATO STOCK NUMBER (NSN)
57. NO. RECOM. ON-BOARD SPARES (2 years)
58. NO. RECOM. BASE SPARES 0-2 YEARS
59. MIN. SALES QTY
60. SHELF LIFE (MONTHS)
61. SHELF LIFE ACTION CODE
62. SPECIAL STORAGE (Y/N)
63. INSURANCE ITEM (Y/N)
64. QUANTITY OF REQUIRED INSURANCE ITEMS BASE
65. REQUIRED BY CLASS (Y/N)
66. QUANTITY CLASS SPARES REQUIRED ON-BOARD
67. INTERIM SUPPORT ITEMS LIST (PTD) (Y/N)
68. REMARKS
69. HS CODE (DOUANE)
70. COO (COUNTRY OF ORIGIN)

### RSPL Kolommen (20 velden)
1. SPARE PART NAME
2. SUPPLIER PART NUMBER
3. CAGE CODE NO. SUPPLIER
4. QUANTITY PER ASSEMBLY
5. Pr = Preventive Spare / Cr = Corrective Spare / Con = Consumable
6. NO. RECOM. SPARES / HS code (douane) / COO / 0 - 2 YEARS
7. NO. RECOM. SPARES / 0 - 6 YEARS, INCL. 1ste OVERHAUL
8. UNIT OF ISSUE
9. REASON FOR SELECTION
10. MIN. SALES QTY
11. STANDARD PACKAGE QUANTITY
12. DIMENSION ITEM L x W x H (CM)
13. WEIGHT ITEM (KG)
14. DIMENSION PACKAGING L x W x H (CM)
15. WEIGHT ITEM INCL. PACKAGING (KG)
16. SHELF LIFE (DAYS)
17. SPECIAL STORAGE (Y/N)
18. REPAIR LEVEL (OLM/ILM/DLM/CLM)
19. REQUIRED FOR HAT/SAT INCL. TRANSIT (Y/N)
20. REMARKS

## 🔧 Technologie Stack

### Frontend
- **HTML5**: Semantische structuur
- **CSS3**: Modern, responsive design met Flexbox/Grid
- **JavaScript (ES6+)**: Alle applicatie logica
- **Tailwind CSS**: Via CDN voor snelle styling
- **Font Awesome**: Voor iconen

### Libraries (via CDN)
- **SheetJS (xlsx)**: Excel export functionaliteit
- **PDF.js**: PDF parsing in browser
- **Chart.js**: Optionele data visualisatie

### AI & APIs
- **Cohere API**: Gratis tier voor AI analyse
- **DuckDuckGo API**: Gratis search zonder API key
- **Alternative**: SerpAPI free tier voor web search

## 🌐 Gratis Hosting Opties

### Aanbevolen Platforms
1. **GitHub Pages** (voor statische versie)
   - Volledig gratis
   - Directe deployment vanaf repository
   - HTTPS included

2. **Vercel** (met serverless functions indien nodig)
   - Gratis hobby tier
   - Automatische deployments
   - Serverless functions support

3. **Netlify** (met edge functions)
   - Gratis tier met 100GB bandwidth
   - Form handling & functions
   - Continuous deployment

4. **Render.com** (voor Python backend indien nodig)
   - Gratis web service tier
   - Automatische HTTPS
   - Docker support

## 📝 Gebruik Instructies

### 1. Online Search Methode
1. Vul merk in (bijv. "Rational", "Electrolux", "Convotherm")
2. Vul type/model in (bijv. "SCC 101", "AOS061EAH1")
3. Klik op "Zoek Parts List"
4. Wacht op AI analyse
5. Bekijk resultaten en kies BOM of RSPL
6. Download Excel bestand

### 2. PDF Upload Methode
1. Klik op "Upload PDF" of drag & drop
2. Selecteer bestaande parts list PDF
3. Wacht op parsing en AI analyse
4. Bekijk resultaten
5. Kies BOM of RSPL generatie
6. Download Excel bestand

### 3. Excel Export
- BOM: Alle 70+ kolommen gevuld met geanalyseerde data
- RSPL: 20 kolommen met 3-jaars aanbevelingen
- Format: .xlsx (Excel 2007+)
- Ready voor maritieme logistiek systemen

## 🔑 API Configuratie

### Cohere API Setup
1. Registreer op [cohere.com](https://cohere.com)
2. Krijg gratis API key (trial tier)
3. Voer API key in bij eerste gebruik in de app
4. Key wordt lokaal opgeslagen (localStorage)

### Search API
- DuckDuckGo: Geen API key nodig
- Alternatief: SerpAPI (gratis tier: 100 searches/maand)

## 📂 Project Structuur

```
partsfinder-pro/
├── index.html              # Hoofdapplicatie (single-page app)
├── css/
│   └── style.css          # Custom styling
├── js/
│   ├── app.js             # Hoofdlogica
│   ├── search.js          # Search functionaliteit
│   ├── ai-analysis.js     # Cohere AI integratie
│   ├── pdf-parser.js      # PDF parsing
│   ├── bom-generator.js   # BOM generatie logica
│   ├── rspl-generator.js  # RSPL generatie logica
│   └── excel-export.js    # XLSX export functionaliteit
└── README.md              # Deze documentatie
```

## 🚧 Nog Te Implementeren Features

### Toekomstige Ontwikkelingen
1. **Database Integratie**
   - Opslaan van eerdere analyses
   - Historische data tracking
   - Favoriet merken/modellen

2. **Geavanceerde AI Features**
   - Automatische part categorisatie
   - Voorspellend onderhoud suggesties
   - Kosten optimalisatie algoritmes

3. **Multi-language Support**
   - Engels, Nederlands, Duits
   - Automatische detectie

4. **Batch Processing**
   - Meerdere PDF's tegelijk
   - Bulk export functionaliteit

5. **Template Management**
   - Custom RSPL templates
   - Bedrijfsspecifieke BOM formats

6. **Cloud Storage**
   - Google Drive integratie
   - Dropbox sync
   - OneDrive backup

## 🔄 Aanbevolen Ontwikkelstappen

### Fase 1: Core Functionaliteit (✅ Voltooid)
- [x] Basis UI opzetten
- [x] Search functionaliteit
- [x] PDF upload
- [x] Cohere AI integratie
- [x] BOM generatie
- [x] RSPL generatie
- [x] Excel export

### Fase 2: Verbetering & Testing
- [ ] Uitgebreide error handling
- [ ] Loading states & feedback
- [ ] Cross-browser testing
- [ ] Mobile responsiveness verbeteren
- [ ] Performance optimalisatie

### Fase 3: Deployment
- [ ] GitHub repository setup
- [ ] Deployment naar gekozen platform
- [ ] DNS configuratie (indien custom domain)
- [ ] SSL certificaat verificatie
- [ ] Analytics integratie (optioneel)

### Fase 4: Advanced Features
- [ ] User accounts (optioneel)
- [ ] Data persistence
- [ ] Advanced filtering & search
- [ ] Rapportage functionaliteit
- [ ] API voor integraties

## 📞 Support & Documentatie

### Externe Resources
- **Cohere API Docs**: https://docs.cohere.com
- **SheetJS Docs**: https://docs.sheetjs.com
- **PDF.js Docs**: https://mozilla.github.io/pdf.js/
- **Maritieme Standaarden**: NATO STANAG 4177

### Troubleshooting
- **API Fouten**: Controleer API key geldigheid
- **PDF Parse Fouten**: Zorg dat PDF text-based is (geen gescande afbeeldingen)
- **Excel Export Problemen**: Controleer browser compatibility (moderne browsers vereist)

## 📄 Licentie & Credits

- **Applicatie**: Open source (MIT License)
- **Libraries**: Verschillende open source licenties
- **AI API**: Cohere terms van service van toepassing
- **Gebruik**: Vrij voor commercieel en persoonlijk gebruik

## 🎯 Project Doelstellingen

Deze applicatie is ontworpen om maritieme en industriële onderhoudsafdelingen te helpen bij:
- Efficiënte spare parts planning
- Voorraad optimalisatie
- Kosten reductie
- Compliance met maritieme standaarden
- Minimaliseren van downtime

---

**Versie**: 1.0.0  
**Laatste Update**: 2026-03-09  
**Status**: Volledig Functioneel ✅
