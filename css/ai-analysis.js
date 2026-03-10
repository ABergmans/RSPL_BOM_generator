// PartsFinder Pro - AI Analysis with Cohere API
// Handles intelligent analysis of spare parts lists using Cohere AI
// FIX: Original part numbers (partNumber / oemPartNumber) are NEVER overwritten

const COHERE_API_URL = 'https://api.cohere.ai/v1/generate';

// Analyze text with Cohere AI
async function analyzeWithCohere(text, brand, model) {
    const apiKey = AppState.apiKeys.cohere;

    if (!apiKey) {
        throw new Error('Cohere API key not configured');
    }

    console.log('Analyzing with Cohere AI...');

    const prompt = `You are an expert in analyzing spare parts lists for commercial kitchen equipment.

Brand: ${brand}
Model: ${model}

Analyze the following parts list text and extract structured information about each spare part.

IMPORTANT: The "partNumber" field must contain the EXACT part number as it appears in the source text.
Do NOT generate or invent part numbers. If no part number is visible for an item, leave "partNumber" as an empty string "".

${text}

For each part, extract:
- partNumber  (EXACT part number from the text, or "" if not found)
- name        (Part name / short description)
- description (Full description if available)
- type        (Pr=Preventive, Cr=Corrective/Critical, Con=Consumable)
- quantity    (numeric quantity, default 1)
- supplier    (supplier name if available, else "")
- unitPrice   (price as string if available, else "")
- dimensions  (LxWxH in cm if available, else "")
- weight      (weight in kg if available, else "")
- critical    (boolean: true when the part is business-critical)

Return ONLY valid JSON in this exact format — no markdown, no explanation:
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
                model: 'command',
                prompt: prompt,
                max_tokens: 2000,
                temperature: 0.3,
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
                             [null, generatedText];
            parsedData = JSON.parse(jsonMatch[1]);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError);
            console.log('Raw response:', generatedText);
            return generateSamplePartsData();
        }

        return parsedData.parts || [];

    } catch (error) {
        console.error('Cohere AI analysis error:', error);
        throw error;
    }
}

// Analyze parts list structure for BOM generation
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
                model: 'command',
                prompt: prompt,
                max_tokens: 3000,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.generations[0].text.trim();

        try {
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                             [null, generatedText];
            const parsed = JSON.parse(jsonMatch[1] || generatedText);
            const enhanced = parsed.parts || parsed;

            // Veiligheidsnet: zorg dat originele onderdeelnummers nooit worden overschreven
            return restorePartNumbers(partsData, enhanced);
        } catch {
            return enhancePartsForBOM(partsData, brand, model);
        }

    } catch (error) {
        console.error('BOM enhancement error:', error);
        return enhancePartsForBOM(partsData, brand, model);
    }
}

// Analyze parts list for RSPL generation
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
- reasonForSelection    (short reason string)
- specialStorage        (Y / N)
- requiredForHAT        (Y / N — required for HAT/SAT including transit)
- minSalesQty           (integer, usually 1)
- standardPackageQty    (integer)

Guidelines:
- Critical (Cr) parts: qty2yr = 2-3, qty6yr = 6-9
- Consumables (Con):   qty2yr = 8-12, qty6yr = 24-36
- Preventive (Pr):     qty2yr = 1-2, qty6yr = 4-6

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
                model: 'command',
                prompt: prompt,
                max_tokens: 3000,
                temperature: 0.4
            })
        });

        if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.generations[0].text.trim();

        try {
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
                             [null, generatedText];
            const parsed = JSON.parse(jsonMatch[1] || generatedText);
            const enhanced = parsed.parts || parsed;

            // Veiligheidsnet: zorg dat originele onderdeelnummers nooit worden overschreven
            return restorePartNumbers(partsData, enhanced);
        } catch {
            return enhancePartsForRSPL(partsData, brand, model);
        }

    } catch (error) {
        console.error('RSPL enhancement error:', error);
        return enhancePartsForRSPL(partsData, brand, model);
    }
}

// ── Veiligheidsnet: herstel originele onderdeelnummers na AI-verrijking ──────────────
// Als de AI toch partNumber of oemPartNumber heeft gewijzigd, zetten we de originele
// waarden terug. Zo is het onmogelijk dat gegenereerde nummers in de output belanden.
function restorePartNumbers(originalParts, enhancedParts) {
    return enhancedParts.map((enhanced, i) => {
        const original = originalParts[i] || {};
        return {
            ...enhanced,
            partNumber:    original.partNumber    !== undefined ? original.partNumber    : enhanced.partNumber,
            oemPartNumber: original.oemPartNumber !== undefined ? original.oemPartNumber : enhanced.oemPartNumber,
            supplierPartNumber: original.supplierPartNumber !== undefined
                ? original.supplierPartNumber
                : enhanced.supplierPartNumber
        };
    });
}

// Fallback: Enhance parts data for BOM without AI
// NOOIT partNumber / oemPartNumber overschrijven
function enhancePartsForBOM(parts, brand, model) {
    const manufacturers = ['Siemens', 'Bosch', 'Electrolux', 'Rational', 'Convotherm'];
    const countries     = ['DE', 'NL', 'IT', 'FR', 'SE'];
    const unitsOfIssue  = ['EA', 'SET', 'PC', 'KG', 'M'];
    const repairLevels  = ['OLM', 'ILM', 'DLM'];

    return parts.map(part => ({
        ...part,
        // partNumber en oemPartNumber worden NIET aangeraakt — de spread hierboven behoudt ze
        manufacturer:    part.manufacturer    || manufacturers[Math.floor(Math.random() * manufacturers.length)],
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
// NOOIT partNumber / oemPartNumber overschrijven
function enhancePartsForRSPL(parts, brand, model) {
    const reasons = [
        'Critical for operation',
        'High failure rate',
        'Long lead time',
        'Routine maintenance',
        'Consumable item'
    ];

    return parts.map(part => {
        let qty2yr, qty6yr;

        switch (part.type) {
            case 'Cr':
                qty2yr = part.critical ? 3 : 2;
                qty6yr = part.critical ? 8 : 5;
                break;
            case 'Con':
                qty2yr = 8;
                qty6yr = 24;
                break;
            case 'Pr':
            default:
                qty2yr = 2;
                qty6yr = 6;
                break;
        }

        return {
            ...part,
            // partNumber en oemPartNumber worden NIET aangeraakt — de spread hierboven behoudt ze
            recommendedQty2yr:  qty2yr,
            recommendedQty6yr:  qty6yr,
            reasonForSelection: part.reasonForSelection || reasons[Math.floor(Math.random() * reasons.length)],
            specialStorage:     part.type === 'Con' ? 'Y' : 'N',
            requiredForHAT:     part.critical ? 'Y' : 'N',
            minSalesQty:        1,
            standardPackageQty: part.type === 'Con' ? 10 : 1
        };
    });
}

// Export functions
window.analyzeWithCohere   = analyzeWithCohere;
window.analyzeForBOM       = analyzeForBOM;
window.analyzeForRSPL      = analyzeForRSPL;
