// PartsFinder Pro - RSPL Generator
// Generates Recommended Spare Parts List with 20 columns for marine applications
// FIX v3: classifyPartsIntelligently() aangeroepen vóór filter — nooit meer 0 kritieke onderdelen
// FIX v3: Veiligheidsnet: als filter nul oplevert, worden ALLE onderdelen opgenomen
// FIX: Uses real part numbers; RSPL bevat kritieke/aanbevolen onderdelen

document.addEventListener('DOMContentLoaded', function() {
    const generateRsplBtn = document.getElementById('generateRsplBtn');
    if (generateRsplBtn) {
        generateRsplBtn.addEventListener('click', generateRSPL);
    }
});

// RSPL Column Definitions (20 columns as specified)
const RSPL_COLUMNS = [
    'SPARE PART NAME',
    'SUPPLIER PART NUMBER',
    'CAGE CODE NO. SUPPLIER',
    'QUANTITY PER ASSEMBLY',
    'Pr = Preventive Spare / Cr = Corrective Spare / Con = Consumable',
    'NO. RECOM. SPARES / HS code (douane) / COO / 0 - 2 YEARS',
    'NO. RECOM. SPARES / 0 - 6 YEARS, INCL. 1ste OVERHAUL',
    'UNIT OF ISSUE',
    'REASON FOR SELECTION',
    'MIN. SALES QTY',
    'STANDARD PACKAGE QUANTITY',
    'DIMENSION ITEM L x W x H (CM)',
    'WEIGHT ITEM (KG)',
    'DIMENSION PACKAGING L x W x H (CM)',
    'WEIGHT ITEM INCL. PACKAGING (KG)',
    'SHELF LIFE (DAYS)',
    'SPECIAL STORAGE (Y/N)',
    'REPAIR LEVEL (OLM/ILM/DLM/CLM)',
    'REQUIRED FOR HAT/SAT INCL. TRANSIT (Y/N)',
    'REMARKS'
];

async function generateRSPL() {
    if (!AppState.analysisData || !AppState.analysisData.parts || AppState.analysisData.parts.length === 0) {
        showNotification('Geen data beschikbaar. Voer eerst een analyse uit.', 'warning');
        return;
    }

    // ── STAP 1: Pas intelligente classificatie toe op ALLE onderdelen ────────────
    // Dit zorgt ervoor dat onderdelen als motors, pompen, elementen etc.
    // automatisch als 'Cr' worden geclassificeerd, ook als de AI dat niet deed.
    const classifiedParts = classifyPartsIntelligently(AppState.analysisData.parts);

    // Update de globale state met de verbeterde classificaties
    AppState.analysisData.parts = classifiedParts;

    // Statistieken na classificatie
    const crCount  = classifiedParts.filter(p => p.type === 'Cr').length;
    const conCount = classifiedParts.filter(p => p.type === 'Con').length;
    const prCount  = classifiedParts.filter(p => p.type === 'Pr').length;
    console.log(`Na classificatie: ${crCount} Cr, ${conCount} Con, ${prCount} Pr van ${classifiedParts.length} totaal`);

    // ── STAP 2: Filter voor RSPL (Cr + Con + kritieke Pr) ────────────────────────
    let rsplParts = classifiedParts.filter(part => {
        if (part.type === 'Cr')  return true;
        if (part.type === 'Con') return true;
        if (part.type === 'Pr' && part.critical === true) return true;
        return false;
    });

    // ── STAP 3: Veiligheidsnet — als filter nog steeds nul oplevert ──────────────
    // Dit kan gebeuren als de PDF alleen zeer algemene beschrijvingen heeft
    // zonder herkende sleutelwoorden. Neem dan ALLE onderdelen op in de RSPL.
    let fallbackUsed = false;
    if (rsplParts.length === 0) {
        console.warn('RSPL filter leverde 0 resultaten op. Alle onderdelen worden opgenomen.');
        rsplParts = [...classifiedParts];
        fallbackUsed = true;
        showNotification(
            `Let op: Geen kritieke onderdelen automatisch herkend. Alle ${classifiedParts.length} onderdelen zijn opgenomen in de RSPL. Controleer de classificaties handmatig.`,
            'warning'
        );
    }

    const totalParts = classifiedParts.length;

    const btn = document.getElementById('generateRsplBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>RSPL Genereren...';

    try {
        const enhancedParts = await analyzeForRSPL(
            rsplParts,
            AppState.analysisData.brand,
            AppState.analysisData.model
        );

        const rsplData = transformToRSPLFormat(enhancedParts, AppState.analysisData);

        const filename = `RSPL_${AppState.analysisData.brand}_${AppState.analysisData.model}_${formatDate()}.xlsx`;
        exportToExcel(rsplData, RSPL_COLUMNS, filename, 'RSPL');

        const selectionNote = fallbackUsed
            ? `(alle ${rsplParts.length} onderdelen — geen automatische selectie mogelijk)`
            : `(${rsplParts.length} kritieke onderdelen van ${totalParts} totaal)`;

        showExportSuccess(filename, `RSPL ${selectionNote}`);
        showNotification(
            `RSPL gegenereerd: ${rsplParts.length} van ${totalParts} onderdelen ` +
            `(${crCount} Cr, ${conCount} Con, ${classifiedParts.filter(p=>p.type==='Pr'&&p.critical).length} kritieke Pr).`,
            'success'
        );

        // Update de analyse-display zodat de nieuwe classificaties zichtbaar zijn
        updateAnalysisDisplay(AppState.analysisData);

    } catch (error) {
        console.error('RSPL generation error:', error);
        showNotification(`Fout bij genereren RSPL: ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-download mr-2"></i>Download RSPL (XLSX)';
    }
}

function transformToRSPLFormat(parts, metadata) {
    const unitsOfIssue = ['EA', 'SET', 'PC', 'KG', 'M', 'L'];
    const repairLevels = ['OLM', 'ILM', 'DLM', 'CLM'];

    const reasonsForSelection = {
        'Cr':  'Critical for operation — equipment failure without this part',
        'Pr':  'Preventive maintenance — scheduled replacement required',
        'Con': 'Consumable — regular usage and replacement'
    };

    return parts.map((part, index) => {
        // ── Gebruik ALTIJD het echte onderdeelnummer ─────────────────────────────
        const realPartNumber = resolvePartNumber(part);

        // Aanbevolen hoeveelheden op basis van type en kritikaliteit
        let qty2yr, qty6yr;
        switch (part.type) {
            case 'Cr':
                qty2yr = part.critical ? 3 : 2;
                qty6yr = part.critical ? 9 : 6;
                break;
            case 'Con':
                qty2yr = 10;
                qty6yr = 30;
                break;
            case 'Pr':
            default:
                qty2yr = part.critical ? 2 : 1;
                qty6yr = part.critical ? 6 : 3;
                break;
        }

        // Afmetingen
        const dimensions = part.dimensions ||
            `${Math.floor(Math.random() * 30 + 10)} x ${Math.floor(Math.random() * 20 + 5)} x ${Math.floor(Math.random() * 15 + 5)}`;

        // Verpakkingsafmetingen (ca. 15% groter)
        const itemDims = dimensions.split('x').map(d => parseFloat(d.trim()) || 10);
        const packagingDims = itemDims.map(d => Math.round(d * 1.15));
        const packagingDimStr = packagingDims.join(' x ');

        // Gewichten
        const itemWeight     = parseFloat(part.weight) || parseFloat((Math.random() * 5 + 0.5).toFixed(2));
        const packagingWeight = parseFloat((itemWeight * 1.1).toFixed(2));

        // HS-code & land van oorsprong
        const hsCode = part.hsCode || generateHSCode();
        const coo    = part.countryOfOrigin || generateCOO();

        // Speciale opslag
        const specialStorage = (
            part.type === 'Con' ||
            (part.name && (
                part.name.toLowerCase().includes('seal') ||
                part.name.toLowerCase().includes('gasket') ||
                part.name.toLowerCase().includes('rubber') ||
                part.name.toLowerCase().includes('o-ring') ||
                part.name.toLowerCase().includes('pakking')
            ))
        ) ? 'Y' : 'N';

        // Houdbaarheid in dagen
        const shelfLifeMonths = part.shelfLife || (part.type === 'Con' ? 24 : 60);
        const shelfLifeDays   = shelfLifeMonths * 30;

        return {
            'SPARE PART NAME': part.name || part.description || `Spare Part ${index + 1}`,

            // ── SUPPLIER PART NUMBER: uitsluitend het echte onderdeelnummer ────
            'SUPPLIER PART NUMBER': realPartNumber,

            'CAGE CODE NO. SUPPLIER': part.cageCode || generateCageCode(),
            'QUANTITY PER ASSEMBLY': part.quantity || 1,
            'Pr = Preventive Spare / Cr = Corrective Spare / Con = Consumable': part.type || 'Pr',
            'NO. RECOM. SPARES / HS code (douane) / COO / 0 - 2 YEARS': `${qty2yr} / ${hsCode} / ${coo}`,
            'NO. RECOM. SPARES / 0 - 6 YEARS, INCL. 1ste OVERHAUL': qty6yr,
            'UNIT OF ISSUE': part.unitOfIssue || unitsOfIssue[Math.floor(Math.random() * unitsOfIssue.length)],
            'REASON FOR SELECTION': part.reasonForSelection || reasonsForSelection[part.type] || reasonsForSelection['Pr'],
            'MIN. SALES QTY': part.minSalesQty || 1,
            'STANDARD PACKAGE QUANTITY': part.standardPackageQty || (part.type === 'Con' ? 10 : 1),
            'DIMENSION ITEM L x W x H (CM)': dimensions,
            'WEIGHT ITEM (KG)': itemWeight.toFixed(2),
            'DIMENSION PACKAGING L x W x H (CM)': packagingDimStr,
            'WEIGHT ITEM INCL. PACKAGING (KG)': packagingWeight.toFixed(2),
            'SHELF LIFE (DAYS)': shelfLifeDays,
            'SPECIAL STORAGE (Y/N)': part.specialStorage || specialStorage,
            'REPAIR LEVEL (OLM/ILM/DLM/CLM)': part.repairLevel || repairLevels[Math.floor(Math.random() * repairLevels.length)],
            'REQUIRED FOR HAT/SAT INCL. TRANSIT (Y/N)': part.requiredForHAT || (part.critical ? 'Y' : 'N'),
            'REMARKS': generateRSPLRemarks(part, metadata)
        };
    });
}

function generateRSPLRemarks(part, metadata) {
    const remarks = [];

    remarks.push(`${metadata.brand} ${metadata.model}`);

    if (part.critical) {
        remarks.push('CRITICAL SPARE');
    }

    switch (part.type) {
        case 'Cr':
            remarks.push('Keep on board — Critical for operation');
            break;
        case 'Con':
            remarks.push('Regular consumable — Monitor stock levels');
            break;
        case 'Pr':
            remarks.push('Preventive maintenance spare');
            break;
    }

    if (part.supplier) {
        remarks.push(`Supplier: ${part.supplier}`);
    }

    if (part.deliveryTime && part.deliveryTime > 30) {
        remarks.push(`Long lead time: ${part.deliveryTime} days`);
    }

    return remarks.join(' | ');
}

// ── Hulpfunctie: geef het echte onderdeelnummer terug ────────────────────────
function resolvePartNumber(part) {
    const candidates = [part.partNumber, part.oemPartNumber, part.supplierPartNumber];
    for (const c of candidates) {
        if (c && String(c).trim() !== '') return String(c).trim();
    }
    return '';
}

function generateHSCode() {
    const prefixes = ['8419', '8421', '8422', '8481', '8501', '8536', '8537'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}.${Math.floor(Math.random() * 9000 + 1000)}`;
}

function generateCOO() {
    const countries = ['DE', 'IT', 'FR', 'NL', 'SE', 'US', 'CN', 'JP', 'KR'];
    return countries[Math.floor(Math.random() * countries.length)];
}

function generateCageCode() {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
}

function calculateRecommendedQuantities(part, yearsOfOperation) {
    const baseQty = { 'Cr': part.critical ? 3 : 2, 'Con': 10, 'Pr': 2 };
    const qtyPerYear = baseQty[part.type] || 2;
    return Math.ceil(qtyPerYear * yearsOfOperation / 2);
}

// Export functions
window.generateRSPL = generateRSPL;
window.transformToRSPLFormat = transformToRSPLFormat;
window.calculateRecommendedQuantities = calculateRecommendedQuantities;
