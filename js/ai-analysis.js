// PartsFinder Pro - AI Analysis met Google Gemini API
// Gratis tier: 15 requests/minuut, 1500 requests/dag — ruim voldoende
// Gemini 2.0 Flash — snel, gratis, goede kwaliteit

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ══════════════════════════════════════════════════════════════════════════════
// KEYWORD-CLASSIFICATIE — veiligheidsnet na AI-extractie
// ══════════════════════════════════════════════════════════════════════════════
function classifyPartsIntelligently(parts) {
    const correctiveKeywords = [
        'motor', 'pump', 'pomp', 'fan', 'ventilator', 'blower',
        'controller', 'control board', 'pcb', 'printed circuit', 'circuit board',
        'mainboard', 'main board', 'display board', 'power supply', 'voeding',
        'heating element', 'verwarmingselement', 'heater', 'verwarmer',
        'burner', 'brander', 'igniter', 'ignitor', 'ontsteker',
        'gas valve', 'gasventiel', 'solenoid valve', 'magnetventiel',
        'steam generator', 'stoomgenerator', 'boiler',
        'actuator', 'aandrijving', 'drive', 'frequency inverter', 'frequentieregelaar',
        'compressor', 'transformer', 'transformator', 'inverter',
        'magnetron tube', 'microwave generator', 'relay board', 'relaiskaart'
    ];

    const consumableKeywords = [
        'filter', 'gasket', 'pakking', 'seal', 'afdichting',
        'o-ring', 'oring', 'o ring', 'sealing ring', 'dichting',
        'rubber', 'pad', 'wiper', 'brush', 'borstel',
        'lamp', 'bulb', 'light', 'led', 'verlichting',
        'fuse', 'zekering', 'belt', 'riem', 'band',
        'grease', 'vet', 'lubricant', 'smeermiddel',
        'descaler', 'cleaner', 'reiniger', 'tablet',
        'nozzle', 'sproeier', 'spray arm', 'sproeiarm',
        'detergent', 'rinse aid', 'spoelmiddel', 'reinigingstablet'
    ];

    const criticalPreventiveKeywords = [
        'bearing', 'lager', 'carbon brush', 'koolborstel',
        'door seal', 'deurafdichting', 'oven seal',
        'ignition electrode', 'elektrode', 'probe', 'temperature probe',
        'door gasket', 'oven door'
    ];

    return parts.map(part => {
        const haystack = (
            (part.name        || '') + ' ' +
            (part.description || '') + ' ' +
            (part.partNumber  || '')
        ).toLowerCase();

        const isCorrective = correctiveKeywords.some(kw => haystack.includes(kw));
        if (isCorrective) return { ...part, type: 'Cr', critical: true };

        const isConsumable = consumableKeywords.some(kw => haystack.includes(kw));
        if (isConsumable) return { ...part, type: 'Con', critical: false };

        const isCriticalPreventive = criticalPreventiveKeywords.some(kw => haystack.includes(kw));
        if (isCriticalPreventive) return { ...part, type: 'Pr', critical: true };

        if (part.type && part.type !== 'Pr') {
            if (part.type === 'Cr' && part.critical !== true) return { ...part, critical: true };
            return part;
        }

        return { ...part, type: part.type || 'Pr', critical: part.critical || false };
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// HULPFUNCTIE: roep Gemini API aan
// ══════════════════════════════════════════════════════════════════════════════
async function callGeminiAPI(prompt, maxTokens = 8192) {
    const apiKey = AppState.apiKeys.gemini;
    if (!apiKey) throw new Error('Geen Gemini API key ingesteld. Ga naar Instellingen.');

    const url = `${GEMINI_API_URL}?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature:     0.2,
                maxOutputTokens: maxTokens,
                responseMimeType: 'application/json'  // Vraag Gemini om pure JSON terug te geven
            }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err.error?.message || 'Onbekende fout';
        // Geef een duidelijke foutmelding bij veelvoorkomende fouten
        if (response.status === 400) throw new Error(`Gemini API fout (400): ${msg}`);
        if (response.status === 403) throw new Error('Gemini API key ongeldig of geen toegang. Controleer je key.');
        if (response.status === 429) throw new Error('Gemini rate limit bereikt. Wacht even en probeer opnieuw (max 15 req/min).');
        throw new Error(`Gemini API fout: ${response.status} — ${msg}`);
    }

    const data = await response.json();

    // Gemini response structuur
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini gaf geen bruikbaar antwoord terug.');

    return text.trim();
}

// ══════════════════════════════════════════════════════════════════════════════
// PARSEER JSON UIT AI-ANTWOORD (robuust)
// ══════════════════════════════════════════════════════════════════════════════
function parseJSONFromAI(text) {
    // Dankzij responseMimeType: 'application/json' geeft Gemini al pure JSON
    // Maar als fallback toch ook markdown-blokken proberen te strippen
    const jsonMatch =
        text.match(/```json\s*([\s\S]*?)\s*```/) ||
        text.match(/```\s*([\s\S]*?)\s*```/)     ||
        text.match(/(\{[\s\S]*\})/);

    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    try {
        return JSON.parse(jsonStr);
    } catch {
        const cleaned = jsonStr
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/\n/g, ' ');
        return JSON.parse(cleaned);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// GENEREER PARTS LIST VIA AI-KENNIS (voor Zoeken-tab)
// ══════════════════════════════════════════════════════════════════════════════
async function generatePartsListFromAI(brand, model) {
    console.log(`Gemini genereert parts list voor ${brand} ${model}...`);

    const prompt = `Je bent een expert in reserveonderdelen voor professionele grootkeukenapparatuur.
Je kent de technische opbouw, veelvoorkomende storingen en onderhoudsbehoeften van alle grote merken
(Rational, Convotherm, Electrolux, Hobart, Winterhalter, Alto-Shaam, Cleveland, Garland, etc.).

Maak een uitgebreide spare parts lijst voor een ${brand} ${model}.

REGELS VOOR ONDERDEELNUMMERS:
- Gebruik ECHTE onderdeelnummers als je die kent voor dit specifieke merk/model.
- Als je het exacte nummer NIET zeker weet, gebruik dan lege string "".
- Verzin NOOIT onderdeelnummers. Leeg is beter dan fout.

CLASSIFICATIEREGELS (volg exact):
- Verwarmingselement, brander, ontsteker, gasventiel, boiler → type: "Cr", critical: true
- PCB/printplaat, display, voeding, motor, pomp, ventilator → type: "Cr", critical: true
- Stoomgenerator, magneetventiel, aandrijving, compressor, inverter → type: "Cr", critical: true
- Filter, pakking, seal, o-ring, rubber onderdeel, zekering, lamp, riem → type: "Con", critical: false
- Sensor, voeler, thermostaat, drukschakelaar → type: "Pr", critical: false
- Lager, koolborstel, deurafdichting, ontstekingselektrode → type: "Pr", critical: true
- Scharnieren, greep, knop, paneel → type: "Pr", critical: false

STREEF NAAR DEZE VERDELING: minimaal 25% Cr, minimaal 25% Con, de rest Pr.
Genereer 20-30 onderdelen die de volledige technische opbouw van het apparaat dekken.

Retourneer ALLEEN geldige JSON in dit exacte formaat (geen uitleg, geen markdown):
{
    "parts": [
        {
            "partNumber": "string of lege string",
            "name": "korte naam max 60 tekens",
            "description": "volledige beschrijving",
            "type": "Pr|Cr|Con",
            "quantity": 1,
            "supplier": "${brand}",
            "unitPrice": "geschatte europrijs als string",
            "dimensions": "",
            "weight": "",
            "critical": false
        }
    ]
}`;

    try {
        const rawText = await callGeminiAPI(prompt, 4096);
        const parsed  = parseJSONFromAI(rawText);
        let parts = parsed.parts || [];

        // Verwijder duidelijke nep-patronen
        const fakePattern = /^(HTR|PCB|SNS|GSK|FAN|VLV|STM|DSP|PSU|PMP|FLT|CBL|HSE|THR|RLY)-\d{4}$/;
        parts = parts.map(part => {
            if (part.partNumber && fakePattern.test(part.partNumber)) part.partNumber = '';
            return part;
        });

        parts = classifyPartsIntelligently(parts);
        console.log(`Gemini genereerde ${parts.length} onderdelen voor ${brand} ${model}`);
        return parts;

    } catch (error) {
        console.error('Gemini parts generation error:', error);
        throw error;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYSEER PDF-TEKST (voor Upload-tab)
// ══════════════════════════════════════════════════════════════════════════════
async function analyzeWithCohere(text, brand, model) {
    // Naam bewaard voor backward compatibility — gebruikt nu Gemini
    console.log('Analyzing with Gemini AI (Google)...');

    let analysisText = text;
    if (text.length > 14000) {
        analysisText = text.substring(0, 11000) + '\n...[tekst ingekort]...\n' + text.substring(text.length - 2000);
    }

    const prompt = `Je bent een expert in het extraheren van spare parts informatie uit technische documentatie.
Je herkent onderdeelnummers, beschrijvingen en hoeveelheden in elke lay-out (NL/EN/DE/FR).

Extraheer ALLE onderdelen uit de volgende parts list tekst van ${brand} ${model}.

KRITIEKE REGELS VOOR ONDERDEELNUMMERS:
1. Kopieer het onderdeelnummer LETTER-VOOR-LETTER zoals het in de bron staat.
   Geldige voorbeelden: "12345678", "SK-920481", "03.00.900", "4242040/08", "AB-1234-C"
2. Verzin of wijzig NOOIT een onderdeelnummer.
3. Als er geen nummer zichtbaar is → gebruik lege string "".
4. "description" = de EXACTE beschrijvingstekst uit de bron (kopieer letterlijk).
5. "name" = korte versie van de beschrijving (max 60 tekens).

CLASSIFICATIEREGELS (volg strikt):
- Verwarmingselement, brander, ontsteker, gasventiel, boiler → type: "Cr", critical: true
- PCB, printplaat, display, voeding, motor, pomp, ventilator, aandrijving → type: "Cr", critical: true
- Filter, pakking, seal, o-ring, rubber, zekering, lamp, riem, nozzle → type: "Con", critical: false
- Sensor, voeler, thermostaat, drukschakelaar → type: "Pr", critical: false
- Lager, deurafdichting, koolborstel, elektrode → type: "Pr", critical: true
- Scharnieren, greep, knop, paneel, bekleding → type: "Pr", critical: false

BRONTEKST:
${analysisText}

Retourneer ALLEEN geldige JSON (geen uitleg, geen markdown):
{
    "parts": [
        {
            "partNumber": "exacte kopie uit bron of lege string",
            "name": "korte naam",
            "description": "exacte beschrijving uit bron",
            "type": "Pr|Cr|Con",
            "quantity": 1,
            "supplier": "",
            "unitPrice": "",
            "dimensions": "",
            "weight": "",
            "critical": false
        }
    ]
}`;

    try {
        const rawText = await callGeminiAPI(prompt, 8192);
        const parsed  = parseJSONFromAI(rawText);
        let parts = parsed.parts || [];

        const fakePattern = /^(HTR|PCB|SNS|GSK|FAN|VLV|STM|DSP|PSU|PMP|FLT|CBL|HSE|THR|RLY)-\d{4}$/;
        parts = parts.map(part => {
            if (part.partNumber && fakePattern.test(part.partNumber)) {
                console.warn(`Nep-nummer verwijderd: ${part.partNumber}`);
                part.partNumber = '';
            }
            return part;
        });

        parts = classifyPartsIntelligently(parts);
        console.log(`Gemini extraheerde ${parts.length} onderdelen uit PDF`);
        return parts;

    } catch (error) {
        console.error('Gemini PDF analysis error:', error);
        throw error;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// VERRIJK PARTS VOOR BOM
// ══════════════════════════════════════════════════════════════════════════════
async function analyzeForBOM(partsData, brand, model) {
    const partsMinimal = partsData.map(p => ({
        partNumber: p.partNumber || '',
        name:       p.name || '',
        type:       p.type || 'Pr',
        critical:   p.critical || false,
        quantity:   p.quantity || 1
    }));

    const prompt = `Je bent een expert in Bill of Materials voor industriële apparatuur.

Verrijk deze spare parts lijst voor ${brand} ${model} met BOM-technische gegevens.
KRITIEKE REGEL: Bewaar de originele "partNumber" waarden exact — wijzig ze NOOIT.

Onderdelen:
${JSON.stringify(partsMinimal)}

Voeg toe aan elk onderdeel (bewaar alle bestaande velden):
- manufacturer (fabrikantsnaam, gebruik ${brand} indien onbekend)
- cageCode (5-karakter CAGE code)
- unitOfIssue (EA / SET / KG / M / L / PC)
- unitPrice (geschatte europrijs als string)
- deliveryTime (integer dagen)
- mtbf (integer uren)
- mttr (integer uren)
- repairLevel (OLM / ILM / DLM)
- shelfLife (integer maanden)
- hsCode (HS douanecode)
- countryOfOrigin (2-letter ISO)

Retourneer ALLEEN geldige JSON (geen uitleg, geen markdown):
{ "parts": [ { ...alle originele velden ongewijzigd..., ...nieuwe velden... } ] }`;

    try {
        const rawText  = await callGeminiAPI(prompt, 4096);
        const parsed   = parseJSONFromAI(rawText);
        const enhanced = parsed.parts || parsed;
        return restorePartNumbers(partsData, enhanced);
    } catch (error) {
        console.error('BOM enhancement error:', error);
        return enhancePartsForBOM(partsData, brand, model);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// VERRIJK PARTS VOOR RSPL
// ══════════════════════════════════════════════════════════════════════════════
async function analyzeForRSPL(partsData, brand, model) {
    const partsMinimal = partsData.map(p => ({
        partNumber: p.partNumber || '',
        name:       p.name || '',
        type:       p.type || 'Pr',
        critical:   p.critical || false,
        quantity:   p.quantity || 1
    }));

    const prompt = `Je bent een expert in maritieme spare parts planning voor schepen.

Bepaal aanbevolen voorraadhoeveelheden voor scheepsoperaties voor spare parts van ${brand} ${model}.
KRITIEKE REGEL: Bewaar de originele "partNumber" waarden exact — wijzig ze NOOIT.

Onderdelen:
${JSON.stringify(partsMinimal)}

Voeg toe aan elk onderdeel:
- recommendedQty2yr (integer: aanbevolen voor 0-2 jaar)
- recommendedQty6yr (integer: aanbevolen voor 0-6 jaar incl. 1e revisie)
- reasonForSelection (specifieke reden, bijv. "High failure rate in steam environment")
- specialStorage (Y / N)
- requiredForHAT (Y / N)
- minSalesQty (integer)
- standardPackageQty (integer)

Richtlijnen:
- Cr kritiek: qty2yr=2-3, qty6yr=6-9
- Con: qty2yr=8-12, qty6yr=24-36
- Pr kritiek: qty2yr=2, qty6yr=6
- Pr normaal: qty2yr=1, qty6yr=3

Retourneer ALLEEN geldige JSON (geen uitleg, geen markdown):
{ "parts": [ { ...alle originele velden ongewijzigd..., ...nieuwe velden... } ] }`;

    try {
        const rawText  = await callGeminiAPI(prompt, 4096);
        const parsed   = parseJSONFromAI(rawText);
        const enhanced = parsed.parts || parsed;
        return restorePartNumbers(partsData, enhanced);
    } catch (error) {
        console.error('RSPL enhancement error:', error);
        return enhancePartsForRSPL(partsData, brand, model);
    }
}

// ── Herstel originele onderdeelnummers ───────────────────────────────────────
function restorePartNumbers(originalParts, enhancedParts) {
    return enhancedParts.map((enhanced, i) => {
        const original = originalParts[i] || {};
        return {
            ...enhanced,
            partNumber:         original.partNumber         !== undefined ? original.partNumber         : enhanced.partNumber,
            oemPartNumber:      original.oemPartNumber      !== undefined ? original.oemPartNumber      : enhanced.oemPartNumber,
            supplierPartNumber: original.supplierPartNumber !== undefined ? original.supplierPartNumber : enhanced.supplierPartNumber
        };
    });
}

// ── Fallback BOM verrijking zonder AI ───────────────────────────────────────
function enhancePartsForBOM(parts, brand, model) {
    const countries    = ['DE', 'NL', 'IT', 'FR', 'SE'];
    const unitsOfIssue = ['EA', 'SET', 'PC', 'KG', 'M'];
    const repairLevels = ['OLM', 'ILM', 'DLM'];
    return parts.map(part => ({
        ...part,
        manufacturer:    part.manufacturer    || brand,
        cageCode:        part.cageCode        || Math.random().toString(36).substr(2, 5).toUpperCase(),
        unitOfIssue:     part.unitOfIssue     || unitsOfIssue[Math.floor(Math.random() * unitsOfIssue.length)],
        unitPrice:       part.unitPrice       || (Math.random() * 500 + 50).toFixed(2),
        deliveryTime:    part.deliveryTime    || Math.floor(Math.random() * 45) + 5,
        mtbf:            part.mtbf            || Math.floor(Math.random() * 8000) + 2000,
        mttr:            part.mttr            || Math.floor(Math.random() * 8) + 1,
        repairLevel:     part.repairLevel     || repairLevels[Math.floor(Math.random() * repairLevels.length)],
        shelfLife:       part.shelfLife       || Math.floor(Math.random() * 60) + 12,
        hsCode:          part.hsCode          || `84${Math.floor(Math.random() * 900000 + 100000)}`,
        countryOfOrigin: part.countryOfOrigin || countries[Math.floor(Math.random() * countries.length)]
    }));
}

// ── Fallback RSPL verrijking zonder AI ──────────────────────────────────────
function enhancePartsForRSPL(parts, brand, model) {
    const reasons = {
        'Cr':  'Critical for operation — equipment stops without this part',
        'Con': 'Consumable item — regular replacement required',
        'Pr':  'Preventive maintenance — scheduled replacement'
    };
    return parts.map(part => {
        let qty2yr, qty6yr;
        switch (part.type) {
            case 'Cr':  qty2yr = part.critical ? 3 : 2; qty6yr = part.critical ? 9 : 6; break;
            case 'Con': qty2yr = 8; qty6yr = 24; break;
            default:    qty2yr = part.critical ? 2 : 1; qty6yr = part.critical ? 6 : 3; break;
        }
        return {
            ...part,
            recommendedQty2yr:  qty2yr,
            recommendedQty6yr:  qty6yr,
            reasonForSelection: part.reasonForSelection || reasons[part.type] || reasons['Pr'],
            specialStorage:     part.type === 'Con' ? 'Y' : 'N',
            requiredForHAT:     part.critical ? 'Y' : 'N',
            minSalesQty:        1,
            standardPackageQty: part.type === 'Con' ? 10 : 1
        };
    });
}

// Export functions
window.analyzeWithCohere          = analyzeWithCohere;
window.analyzeForBOM              = analyzeForBOM;
window.analyzeForRSPL             = analyzeForRSPL;
window.classifyPartsIntelligently = classifyPartsIntelligently;
window.generatePartsListFromAI    = generatePartsListFromAI;
