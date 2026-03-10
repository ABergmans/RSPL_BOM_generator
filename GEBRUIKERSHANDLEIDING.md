# PartsFinder Pro - Gebruikershandleiding

## 📖 Inhoudsopgave
1. [Aan de slag](#aan-de-slag)
2. [API Key Configuratie](#api-key-configuratie)
3. [Zoeken naar Parts Lists](#zoeken-naar-parts-lists)
4. [PDF Uploaden](#pdf-uploaden)
5. [Analyse Bekijken](#analyse-bekijken)
6. [BOM Genereren](#bom-genereren)
7. [RSPL Genereren](#rspl-genereren)
8. [Tips & Best Practices](#tips--best-practices)
9. [Veelgestelde Vragen](#veelgestelde-vragen)

---

## 🚀 Aan de slag

### Eerste Gebruik
1. Open de applicatie in je browser
2. Je wordt gevraagd om een Cohere API key in te stellen
3. Klik op **"API Instellingen"** rechts bovenaan
4. Voer je API key in en klik **"Opslaan"**

---

## 🔑 API Key Configuratie

### Gratis Cohere API Key Aanmaken

1. **Ga naar Cohere**
   - Bezoek: https://cohere.com
   - Klik op "Sign Up" of "Get Started"

2. **Registreer Account**
   - Gebruik je werk email
   - Gratis trial: geen creditcard nodig
   - Bevestig je email adres

3. **API Key Ophalen**
   - Ga naar Dashboard
   - Klik op "API Keys"
   - Kopieer je "Trial Key"

4. **Key Invoeren in PartsFinder Pro**
   - Klik op **⚙️ API Instellingen** knop
   - Plak je API key
   - Klik **"Opslaan"**
   - ✅ Je bent klaar om te beginnen!

### Gratis Tier Limieten
- **100+ calls per minuut**
- Geen creditcard vereist
- Perfect voor normale gebruik
- Upgrade mogelijk voor grotere projecten

---

## 🔍 Zoeken naar Parts Lists

### Stap-voor-Stap

1. **Ga naar de "Zoeken" tab**
   - Dit is de standaard startpagina

2. **Vul Merk in**
   - Bijvoorbeeld: `Rational`
   - Of: `Electrolux`, `Convotherm`, `Hobart`

3. **Vul Model in**
   - Bijvoorbeeld: `SCC 101`
   - Of: `AOS061EAH1`, `RG 20-1`

4. **Klik "Zoek Parts List & Analyseer"**
   - Het systeem zoekt online
   - AI analyseert de gevonden data
   - Duurt ongeveer 10-30 seconden

5. **Bekijk Resultaten**
   - Je wordt automatisch naar de Analyse tab geleid
   - Zie alle geïdentificeerde onderdelen

### Voorbeelden Apparatuur

| Merk | Model | Type |
|------|-------|------|
| Rational | SCC 101 | Combi Steamer |
| Electrolux | AOS061EAH1 | Oven |
| Convotherm | C4 eD 10.10 | Steamer |
| Hobart | FX10 | Dishwasher |
| Alto-Shaam | 7.14ESG | Combi Oven |

---

## 📄 PDF Uploaden

### Wanneer Gebruiken?
Upload een PDF als je **al een parts list of manual hebt**.

### Stap-voor-Stap

1. **Ga naar "Upload PDF" tab**

2. **Selecteer PDF**
   - **Optie A**: Klik in het upload gebied
   - **Optie B**: Sleep PDF bestand naar het vak

3. **Wacht op Verwerking**
   - PDF wordt geparsed
   - Tekst wordt geëxtraheerd
   - AI analyseert de content
   - Duurt 15-45 seconden (afhankelijk van PDF grootte)

4. **Bekijk Resultaten**
   - Automatisch naar Analyse tab
   - Alle onderdelen zijn geïdentificeerd

### PDF Vereisten
- ✅ Format: PDF
- ✅ Max grootte: 10MB
- ✅ Type: Text-based PDF (geen gescande afbeeldingen)
- ✅ Taal: Engels, Nederlands, Duits

### Tips voor Beste Resultaten
- Gebruik officiële OEM manuals
- Zorg dat PDF tekst bevat (niet alleen afbeeldingen)
- Hoe meer detail, hoe beter de analyse
- Parts lists met part numbers werken het beste

---

## 📊 Analyse Bekijken

### Overzicht Scherm

Na zoeken of uploaden zie je:

1. **Apparaat Informatie**
   - Merk en Model
   - Bron (web-search of pdf-upload)

2. **Statistieken**
   - **Totaal Onderdelen**: Alle gevonden parts
   - **Kritieke Onderdelen**: Critical spares (Cr)
   - **Verbruiksartikelen**: Consumables (Con)

3. **Onderdelen Tabel**
   - Part Number
   - Beschrijving
   - Type (Pr/Cr/Con)
   - Hoeveelheid

### Part Types Uitleg

| Type | Naam | Betekenis | Voorbeeld |
|------|------|-----------|-----------|
| **Pr** | Preventive | Preventief onderhoud | Filters, smeer |
| **Cr** | Corrective | Kritiek/correctief | Motoren, PCB's |
| **Con** | Consumable | Verbruik | Afdichtingen, schoonmaak |

---

## 📋 BOM Genereren

### Wat is een BOM?
**Bill of Materials** = Complete onderdelen lijst met 70+ kolommen voor industriële/maritieme toepassingen.

### Stap-voor-Stap

1. **Ga naar "Genereer Export" tab**

2. **Klik "Download BOM (XLSX)"**
   - Wacht 3-10 seconden
   - Excel bestand wordt gegenereerd
   - Download start automatisch

3. **Open Excel Bestand**
   - Bestandsnaam: `BOM_[Merk]_[Model]_[Datum].xlsx`
   - Open in Excel, LibreOffice, of Google Sheets

### BOM Bevat (70+ Kolommen)

**Product Informatie**
- Physical Product Breakdown
- OEM Part Numbers
- Manufacturer Details
- CAGE Codes

**Technische Specs**
- Afmetingen (L x W x H)
- Gewicht
- Unit of Issue
- Prijzen (Euro)

**Logistiek**
- Delivery Time
- Lead Times
- Packaging Info
- Storage Requirements

**Maintenance**
- MTBF (Mean Time Between Failures)
- MTTR (Mean Time To Repair)
- Repair Levels
- Shelf Life

**Compliance**
- Export Control Classifications
- HS Codes (Customs)
- Country of Origin
- Hazardous Material Codes

**Planning**
- Recommended Quantities (2 years)
- Recommended Quantities (6 years)
- Insurance Items
- Obsolescence Info

---

## 🚢 RSPL Genereren

### Wat is een RSPL?
**Recommended Spare Parts List** = 3-jaars voorspelling voor scheepsvoorraad (20 kolommen).

### Stap-voor-Stap

1. **Ga naar "Genereer Export" tab**

2. **Klik "Download RSPL (XLSX)"**
   - Wacht 3-10 seconden
   - Excel bestand wordt gegenereerd
   - Download start automatisch

3. **Open Excel Bestand**
   - Bestandsnaam: `RSPL_[Merk]_[Model]_[Datum].xlsx`
   - Ready voor maritime logistics systemen

### RSPL Bevat (20 Kolommen)

**Basis Info**
- Spare Part Name
- Supplier Part Number
- CAGE Code
- Quantity per Assembly

**Classificatie**
- Part Type (Pr/Cr/Con)
- Reason for Selection
- Repair Level

**Aanbevolen Hoeveelheden**
- 0-2 Years (short term)
- 0-6 Years (including 1st overhaul)

**Logistiek**
- Unit of Issue
- Min. Sales Quantity
- Standard Package Quantity

**Fysiek**
- Dimensions Item (L x W x H)
- Weight Item
- Dimensions Packaging
- Weight Including Packaging

**Storage & Handling**
- Shelf Life (Days)
- Special Storage (Y/N)
- Required for HAT/SAT Transit

**Customs**
- HS Code (Douane)
- Country of Origin (COO)

**Opmerkingen**
- Remarks met alle relevante info

---

## 💡 Tips & Best Practices

### Voor Beste Resultaten

1. **Gebruik Officiële Documentatie**
   - OEM parts lists zijn het meest accuraat
   - Service manuals bevatten goede detail

2. **Volledige Model Nummers**
   - Gebruik complete type codes
   - Bijvoorbeeld: `SCC 101` in plaats van `SCC`

3. **Check Multiple Sources**
   - Vergelijk resultaten
   - Upload PDF als web search niet genoeg geeft

4. **Review de Analyse**
   - Check de Analyse tab voordat je exporteert
   - Verifieer dat critical parts correct zijn geclassificeerd

5. **Save Your Exports**
   - Bewaar gegenereerde BOM en RSPL bestanden
   - Gebruik als basis voor procurement

### Performance Tips

- **Kleinere PDF's**: Onder 5MB voor snelste verwerking
- **Goede Internet**: Voor web search functionaliteit
- **Modern Browser**: Chrome, Firefox, Edge (laatste versie)
- **Disable Ad Blockers**: Als web search problemen heeft

---

## ❓ Veelgestelde Vragen (FAQ)

### Algemeen

**Q: Kost deze applicatie geld?**  
A: Nee, de applicatie zelf is gratis. Je hebt wel een gratis Cohere API key nodig.

**Q: Hoeveel kost de Cohere API?**  
A: De trial tier is gratis met 100+ calls/minuut. Voor normale gebruik is dit ruim voldoende.

**Q: Werkt het offline?**  
A: Nee, je hebt internet nodig voor web search en AI analyse.

**Q: Welke browsers worden ondersteund?**  
A: Chrome, Firefox, Safari, en Edge (laatste versies).

### Zoeken & Uploaden

**Q: Welke PDF formaten worden ondersteund?**  
A: Alleen text-based PDF's. Gescande afbeeldingen werken niet.

**Q: Wat als mijn PDF te groot is?**  
A: Maximum is 10MB. Splits grote PDF's of gebruik alleen de relevante pagina's.

**Q: De web search vindt niets, wat nu?**  
A: Upload dan een PDF van de parts list die je hebt.

**Q: Kan ik meerdere apparaten tegelijk analyseren?**  
A: Momenteel één per keer. Herhaal het proces voor elk apparaat.

### Export & Data

**Q: In welk format wordt geëxporteerd?**  
A: XLSX (Excel 2007+), compatible met Excel, LibreOffice, Google Sheets.

**Q: Kan ik de export customizen?**  
A: De kolommen zijn gestandaardiseerd volgens maritieme specs. Je kunt het Excel bestand daarna aanpassen.

**Q: Waar worden mijn analyses opgeslagen?**  
A: Alleen lokaal in je browser (localStorage). Geen server storage.

**Q: Is mijn data veilig?**  
A: Ja, alles blijft lokaal. Alleen de tekst voor AI analyse gaat naar Cohere API.

### Problemen

**Q: "API key not configured" error?**  
A: Ga naar Instellingen en voer je Cohere API key in.

**Q: PDF upload werkt niet?**  
A: Check dat het een text-based PDF is en onder 10MB.

**Q: Excel export geeft errors?**  
A: Gebruik een moderne browser. Clear cache en probeer opnieuw.

**Q: AI analyse geeft rare resultaten?**  
A: Dit kan gebeuren met slechte input data. Upload een betere parts list PDF.

---

## 🆘 Support & Contact

### Als Je Problemen Hebt

1. **Check Browser Console**
   - Druk F12 in browser
   - Kijk naar rode errors
   - Screenshot voor support

2. **Lees DEPLOYMENT.md**
   - Troubleshooting sectie
   - Common issues

3. **Test Met Sample Data**
   - Gebruik demo search functie
   - Verifieer dat basis features werken

### Resources

- **Cohere Docs**: https://docs.cohere.com
- **SheetJS Docs**: https://docs.sheetjs.com
- **PDF.js Docs**: https://mozilla.github.io/pdf.js/

---

## 🎓 Tutorials

### Tutorial 1: Eerste BOM Maken

1. Open PartsFinder Pro
2. Voer API key in (eenmalig)
3. Zoek: Merk = "Rational", Model = "SCC 101"
4. Wacht op analyse (30 sec)
5. Ga naar "Genereer Export"
6. Klik "Download BOM (XLSX)"
7. Open Excel bestand
8. ✅ Je hebt je eerste BOM!

### Tutorial 2: PDF Analyseren

1. Download een OEM parts list PDF
2. Ga naar "Upload PDF" tab
3. Upload je PDF
4. Wacht op verwerking (45 sec)
5. Bekijk analyse resultaten
6. Download RSPL voor je schip
7. ✅ Ready voor procurement!

---

**Veel succes met PartsFinder Pro! 🚀**

Voor vragen: check de FAQ of documentatie.
