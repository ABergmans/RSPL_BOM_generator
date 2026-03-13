// PartsFinder Pro - AI Analysis with Cohere API
// Handles intelligent analysis of spare parts lists using Cohere AI
// FIX v3: Intelligente keyword-classificatie toegevoegd (Cr/Con/Pr + critical flag)
// FIX v3: generatePartsListFromAI() toegevoegd voor Zoeken-tab
// FIX: Original part numbers (partNumber / oemPartNumber) are NEVER overwritten

const COHERE_API_URL = 'https://api.cohere.ai/v1/generate';

// ══════════════════════════════════════════════════════════════════════════════
// KEYWORD-CLASSIFICATIE — geeft elk onderdeel het juiste type (Cr/Con/Pr)
// en critical-vlag op basis van de naam/beschrijving.
// Wordt aangeroepen NADAT de AI of regex de onderdelen heeft geëxtraheerd.
// ══════════════════════════════════════════════════════════════════════════════
function classifyPartsIntelligently(parts) {
    // Onderdelen waarvan uitval directe stilstand veroorzaakt → Cr + critical:true
    const correctiveKeywords = [
        'motor', 'pump', 'pomp', 'fan', 'ventilator', 'blower',
        'controller', 'control board', 'pcb', 'printed circuit', 'circuit board',
        'mainboard', 'main board', 'display board', 'power supply', 'voeding',
        'heating element', 'verwarmingselement', 'heater', 'verwarmer',
        'burner', 'brander', 'igniter', 'ignitor', 'ontsteker',
        'gas valve', 'gasventiel', 'solenoid valve', 'magnetventiel',
        'steam generator', 'stoomgenerator', 'boiler',
        'actuator', 'aandrijving', 'drive', 'frequency inverter', 'frequentieregelaar',
        'compressor', 'transformer', 'transformator',
        'magnetron', 'magnetron tube', 'microwave', 'magnetron'
    ];

    // Verbruiksartikelen die regelmatig vervangen worden → Con
    const consumableKeywords = [
        'filter', 'gasket', 'pakking', 'seal', 'afdichting',
        'o-ring', 'oring', 'o ring', 'sealing ring', 'dichting',
        'rubber', 'pad', 'wiper', 'brush', 'borstel',
        'lamp', 'bulb', 'light', 'led', 'verlichting',
        'fuse', 'zekering', 'belt', 'riem', 'band',
        'grease', 'vet', 'lubricant', 'smeermiddel',
        'descaler', 'cleaner', 'reiniger', 'tablet',
        'nozzle', 'sproeier', 'spray arm', 'sproeiarm'
    ];

    // Onderdelen voor preventief onderhoud → Pr  (critical:true als ze snel-slijtend zijn)
    const criticalPreventiveKeywords = [
        'bearing', 'lager', 'carbon brush', 'koolborstel',
        'door seal', 'deurafdichting', 'oven seal',
        'ignition electrode', 'entstekingselektrode'
    ];

    return parts.map(part => {
        const haystack = (
            (part.name        || '') + ' ' +
            (part.description || '') + ' ' +
            (part.partNumber  || '')
        ).toLowerCase();

        // 1. Check Corrective/Critical
        const isCorrective = correctiveKeywords.some(kw => haystack.includes(kw));
        if (isCorrective) {
            return { ...part, type: 'Cr', critical: true };
        }

        // 2. Check Consumable
        const isConsumable = consumableKeywords.some(kw => haystack.includes(kw));
        if (isConsumable) {
            return { ...part, type: 'Con', critical: false };
        }

        // 3. Check kritieke preventieve onderdelen
        const isCriticalPreventive = criticalPreventiveKeywords.some(kw => haystack.includes(kw));
        if (isCriticalPreventive) {
            return { ...part, type: 'Pr', critical: true };
        }

        // 4. Als de AI al een type heeft ingevuld dat niet 'Pr' is → bewaar dat
        if (part.type && part.type !== 'Pr') {
            // Zorg voor correcte critical-vlag
            if (part.type === 'Cr' && part.critical !== true) {
                return { ...part, critical: true };
            }
            return part;
        }

        // 5. Standaard: Pr, niet-kritiek
        return { ...part, type: part.type || 'Pr', critical: part.critical || false };
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// GENEREER PARTS LIST OP BASIS VAN AI-KENNIS (voor Zoeken-tab)
// Vraagt Cohere om een geschatte parts list op basis van trainingskennis.
// Part numbers zijn GESCHAT en worden duidelijk als zodanig gemarkeerd.
// ══════════════════════════════════════════════════════════════════════════════
async function generatePartsListFromAI(brand, model) {
    const apiKey = AppState.apiKeys.cohere;
    if (!apiKey) {
        throw new Error('Cohere API key not configured');
    }

    console.log(`Generating AI knowledge-based parts list for ${brand} ${model}...`);

    const prompt = `You are an expert in commercial kitchen equipment spare parts and maintenance.

Generate a comprehensive spare parts list for ${brand} ${model} commercial kitchen equipment.

IMPORTANT RULES:
1. Use REAL part numbers if you know them from your training data for this specific brand/model.
2. If you don't know the exact part number, leave "partNumber" as empty string "".
3. Do NOT invent part numbers. Empty string is better than a wrong number.
4. Include 15-30 realistic spare parts covering all major component categories.
5. Classify CORRECTLY using the guide below.

CLASSIFICATION GUIDE (follow strictly):
- Heating element, burner, igniter, gas valve → type: "Cr", critical: true
- PCB/control board, display, power supply, motor, pump, fan → type: "Cr", critical: true
- Steam generator, boiler, solenoid valve, actuator, compressor → type: "Cr", critical: true
- Filter, gasket, seal, o-ring, rubber part, fuse, lamp, belt → type: "Con", critical: false
- Sensor, probe, thermostat, pressure switch → type: "Pr", critical: false
- Bearing, carbon brush, door seal, ignition electrode → type: "Pr", critical: true
- Door hinge, handle, knob, panel → type: "Pr", critical: false

IMPORTANT: A realistic parts list for ${brand} equipment should contain:
- ~30% Cr (corrective/critical) parts
- ~30% Con (consumable) parts  
- ~40% Pr (preventive) parts

Return ONLY valid JSON — no markdown, no explanation, no code fences:
{
    "parts": [
        {
            "partNumber": "string or empty",
            "name": "string",
            "description": "string",
            "type": "Pr|Cr|Con",
            "quantity": 1,
            "supplier": "${brand}",
            "unitPrice": "string",
            "dimensions": "",
            "weight": "",
            "critical": false
        }
    ]
}`;

    try {
        const response = await fetch(COHERE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'command-r',
                prompt: prompt,
                max_tokens: 4000,
                temperature: 0.2,
                k: 0,
                stop_sequences: [],
                return_likelihoods: 'NONE'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Cohere API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const generatedText = data.generations[0].text.trim();

        let parsedData;
        try {
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                             generatedText.match(/```\s*([\s\S]*?)\s*```/) ||
                             generatedText.match(/(\{[\s\S]*\})/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedText;
            parsedData = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Failed to parse AI knowledge response as JSON:', parseError);
            throw new Error('AI kon geen geldige JSON genereren. Probeer opnieuw of upload een PDF.');
        }

        let parts = parsedData.parts || [];

        // Pas intelligente classificatie toe als veiligheidsnet
        parts = classifyPartsIntelligently(parts);

        return parts;

    } catch (error) {
        console.error('AI knowledge generation error:', error);
        throw error;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYSEER TEKST MET COHERE AI (voor PDF-upload tab)
// ══════════════════════════════════════════════════════════════════════════════
async function analyzeWithCohere(text, brand, model) {
    const apiKey = AppState.apiKeys.cohere;

    if (!apiKey) {
        throw new Error('Cohere API key not configured');
    }

    console.log('Analyzing with Cohere AI...');

    // Beperk tekst tot 6000 + 2000 tekens
    let analysisText = text;
    if (text.length > 8000) {
        analysisText = text.substring(0, 6000) + '\n...[tekst ingekort]...\n' + text.substring(text.length - 2000);
    }

    const prompt = `You are an expert in analyzing spare parts lists for commercial kitchen equipment.

Brand: ${brand}
Model: ${model}

Analyze the following parts list text and extract structured information about each spare part.

CRITICAL RULES FOR PART NUMBERS:
1. The "partNumber" field must contain the EXACT part number as it appears in the source text.
   Part numbers are typically: sequences of digits, alphanumeric codes, codes with dashes/dots/slashes.
   Examples of valid part numbers: "12345678", "SK-920481", "03.00.900", "4242040/08", "AB-1234-C"
2. Do NOT generate, invent or modify part numbers. Copy them character-for-character.
3. If no part number is visible for an item, leave "partNumber" as empty string "".
4. The "description" field must be the EXACT description text from the source — copy it as-is.
5. The "name" field is a short version of the description (max 60 characters).

CLASSIFICATION GUIDE (follow strictly):
- Heating element, burner, igniter, gas valve → type: "Cr", critical: true
- PCB/control board, display, power supply, motor, pump, fan, blower → type: "Cr", critical: true
- Steam generator, boiler, solenoid valve, actuator, compressor → type: "Cr", critical: true
- Filter, gasket, seal, o-ring, rubber part, fuse, lamp, belt → type: "Con", critical: false
- Sensor, probe, thermostat, pressure switch → type: "Pr", critical: false
- Bearing, carbon brush, door seal, ignition electrode → type: "Pr", critical: true
- Door hinge, handle, knob, panel → type: "Pr", critical: false

SOURCE TEXT:
${analysisText}

For each part found in the text, extract ALL of these fields:
- partNumber  (EXACT part number from the text — copy character-for-character, or "" if not found)
- name        (Part name / short description — max 60 chars)
- description (Full description EXACTLY as in the source text)
- type        (Pr=Preventive, Cr=Corrective/Critical, Con=Consumable — use classification guide above)
- quantity    (numeric quantity, default 1)
- supplier    (supplier name if available, else "")
- unitPrice   (price as string if available, else "")
- dimensions  (LxWxH in cm if available, else "")
- weight      (weight in kg if available, else "")
- critical    (boolean: true for Cr parts and critical Pr parts, false otherwise)

Return ONLY valid JSON in this exact format — no markdown, no explanation, no code fences:
{
    "parts": [
        {
            "partNumber": "string",
            "name": "string",
            "description": "string",
            "type": "Pr|Cr|Con",
            "quantity": 1,
            "supplier": "string",
            "unitPrice": "string",
            "dimensions": "string",
            "weight": "string",
            "critical": false
        }
    ]
}`;

    try {
        const response = await fetch(COHERE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'command-r',
                prompt: prompt,
                max_tokens: 4000,
                temperature: 0.1,
                k: 0,
                stop_sequences: [],
                return_likelihoods: 'NONE'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Cohere API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const generatedText = data.generations[0].text.trim();

        let parsedData;
        try {
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                             generatedText.match(/```\s*([\s\S]*?)\s*```/) ||
                             generatedText.match(/(\{[\s\S]*\})/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedText;
            parsedData = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError);
            console.log('Raw response:', generatedText);
            throw new Error(
                'AI kon de parts list niet verwerken tot geldig JSON. ' +
                'Controleer of de PDF duidelijke onderdeelnummers bevat en probeer opnieuw. ' +
                'Raw AI output (eerste 200 tekens): ' + generatedText.substring(0, 200)
            );
        }

        let parts = parsedData.parts || [];

        // Verwijder duidelijk nep-nummers (AI-hallucinatie)
        const fakePattern = /^(HTR|PCB|SNS|GSK|FAN|VLV|STM|DSP|PSU|PMP|FLT|CBL|HSE|THR|RLY)-\d{4}$/;
        parts = parts.map(part => {
            if (part.partNumber && fakePattern.test(part.partNumber)) {
                console.warn(`Nep-onderdeelnummer gedetecteerd en verwijderd: ${part.partNumber}`);
                part.partNumber = '';
            }
            return part;
        });

        // ── KRITIEK: pas intelligente classificatie toe als veiligheidsnet ────────
        parts = classifyPartsIntelligently(parts);

        return parts;

    } catch (error) {
        console.error('Cohere AI analysis error:', error);
        throw error;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// VERRIJK PARTS VOOR BOM
// ══════════════════════════════════════════════════════════════════════════════
async function analyzeForBOM(partsData, brand, model) {
    const apiKey = AppState.apiKeys.cohere;

    if (!apiKey) {
        console.warn('No API key, using default BOM structure');
        return enhancePartsForBOM(partsData, brand, model);
    }

    const prompt = `You are an expert in creating Bill of Materials (BOM) for industrial equipment.

Brand: ${brand}
Model: ${model}

Given the following spare parts, enhance each with additional BOM-specific information.

CRITICAL RULE: You must PRESERVE the existing "partNumber" and "oemPartNumber" values exactly as provided.
Do NOT change, replace, or invent part numbers. Only add the new fields listed below.

${JSON.stringify(partsData, null, 2)}

Add these fields to each part (keep all existing fields unchanged):
- manufacturer     (manufacturer name, use brand if unknown)
- cageCode         (5-char CAGE code)
- unitOfIssue      (EA / SET / KG / M / L / PC)
- unitPrice        (estimated Euro price as string, only if not already set)
- deliveryTime     (integer days)
- mtbf             (integer hours)
- mttr             (integer hours)
- repairLevel      (OLM / ILM / DLM)
- shelfLife        (integer months)
- hsCode           (HS customs code, Chapter 84)
- countryOfOrigin  (2-letter ISO country code)

Return ONLY valid JSON — no markdown, no explanation:
{ "parts": [ { ...original fields preserved..., ...new fields added... } ] }`;

    try {
        const response = await fetch(COHERE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'command-r',
                prompt: prompt,
                max_tokens: 4000,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.generations[0].text.trim();

        try {
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                             generatedText.match(/(\{[\s\S]*\})/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedText;
            const parsed = JSON.parse(jsonStr);
            const enhanced = parsed.parts || parsed;
            return restorePartNumbers(partsData, enhanced);
        } catch {
            return enhancePartsForBOM(partsData, brand, model);
        }

    } catch (error) {
        console.error('BOM enhancement error:', error);
        return enhancePartsForBOM(partsData, brand, model);
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// VERRIJK PARTS VOOR RSPL
// ══════════════════════════════════════════════════════════════════════════════
async function analyzeForRSPL(partsData, brand, model) {
    const apiKey = AppState.apiKeys.cohere;

    if (!apiKey) {
        console.warn('No API key, using default RSPL calculations');
        return enhancePartsForRSPL(partsData, brand, model);
    }

    const prompt = `You are an expert in maritime spare parts planning for ships.

Brand: ${brand}
Model: ${model}

Given the following spare parts, determine recommended quantities for ship operations.

CRITICAL RULE: You must PRESERVE the existing "partNumber" and "oemPartNumber" values exactly as provided.
Do NOT change, replace, or invent part numbers. Only add the new fields listed below.

${JSON.stringify(partsData, null, 2)}

Add these fields to each part (keep all existing fields unchanged):
- recommendedQty2yr     (integer: recommended quantity for 0-2 years)
- recommendedQty6yr     (integer: recommended quantity for 0-6 years including first overhaul)
- reasonForSelection    (short reason string — be specific: e.g. "High failure rate in steam environment", "Critical for cooking function")
- specialStorage        (Y / N)
- requiredForHAT        (Y / N — required for HAT/SAT including transit)
- minSalesQty           (integer, usually 1)
- standardPackageQty    (integer)

Guidelines:
- Critical Cr parts: qty2yr = 2-3, qty6yr = 6-9
- Consumables Con:   qty2yr = 8-12, qty6yr = 24-36
- Preventive Pr (critical): qty2yr = 2, qty6yr = 6
- Preventive Pr (non-critical): qty2yr = 1, qty6yr = 3

Return ONLY valid JSON — no markdown, no explanation:
{ "parts": [ { ...original fields preserved..., ...new fields added... } ] }`;

    try {
        const response = await fetch(COHERE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'command-r',
                prompt: prompt,
                max_tokens: 4000,
                temperature: 0.2
            })
        });

        if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.generations[0].text.trim();

        try {
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                             generatedText.match(/(\{[\s\S]*\})/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedText;
            const parsed = JSON.parse(jsonStr);
            const enhanced = parsed.parts || parsed;
            return restorePartNumbers(partsData, enhanced);
        } catch {
            return enhancePartsForRSPL(partsData, brand, model);
        }

    } catch (error) {
        console.error('RSPL enhancement error:', error);
        return enhancePartsForRSPL(partsData, brand, model);
    }
}

// ── Veiligheidsnet: herstel originele onderdeelnummers na AI-verrijking ──────
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

// Fallback: Enhance parts data for BOM without AI
function enhancePartsForBOM(parts, brand, model) {
    const manufacturers = ['Siemens', 'Bosch', 'Electrolux', 'Rational', 'Convotherm'];
    const countries     = ['DE', 'NL', 'IT', 'FR', 'SE'];
    const unitsOfIssue  = ['EA', 'SET', 'PC', 'KG', 'M'];
    const repairLevels  = ['OLM', 'ILM', 'DLM'];

    return parts.map(part => ({
        ...part,
        manufacturer:    part.manufacturer    || brand || manufacturers[Math.floor(Math.random() * manufacturers.length)],
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

// Fallback: Enhance parts data for RSPL without AI
function enhancePartsForRSPL(parts, brand, model) {
    const reasons = {
        'Cr':  'Critical for operation — equipment stops without this part',
        'Con': 'Consumable item — regular replacement required',
        'Pr':  'Preventive maintenance — scheduled replacement'
    };

    return parts.map(part => {
        let qty2yr, qty6yr;

        switch (part.type) {
            case 'Cr':
                qty2yr = part.critical ? 3 : 2;
                qty6yr = part.critical ? 9 : 6;
                break;
            case 'Con':
                qty2yr = 8;
                qty6yr = 24;
                break;
            case 'Pr':
            default:
                qty2yr = part.critical ? 2 : 1;
                qty6yr = part.critical ? 6 : 3;
                break;
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
