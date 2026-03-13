// PartsFinder Pro - PDF Parser
// Handles PDF upload and text extraction using PDF.js
// FIX v3: classifyPartsIntelligently() toegepast na AI én regex-parsing
// FIX v2: Verwijderd generateSamplePartsData() als fallback — geen nep-nummers meer

document.addEventListener('DOMContentLoaded', function() {
    const dropZone    = document.getElementById('dropZone');
    const pdfInput    = document.getElementById('pdfInput');
    const uploadProgress        = document.getElementById('uploadProgress');
    const uploadSuccess         = document.getElementById('uploadSuccess');
    const uploadSuccessMessage  = document.getElementById('uploadSuccessMessage');
    const progressBar    = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');

    // Click to upload
    dropZone.addEventListener('click', () => {
        pdfInput.click();
    });

    // File input change
    pdfInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handlePdfUpload(file);
        }
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            handlePdfUpload(file);
        } else {
            showNotification('Alleen PDF bestanden zijn toegestaan', 'error');
        }
    });
});

async function handlePdfUpload(file) {
    if (!validateApiKey()) {
        return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('PDF bestand is te groot (max 10MB)', 'error');
        return;
    }

    const uploadProgress   = document.getElementById('uploadProgress');
    const uploadSuccess    = document.getElementById('uploadSuccess');
    const progressBar      = document.getElementById('progressBar');
    const progressPercent  = document.getElementById('progressPercent');

    uploadProgress.classList.remove('hidden');
    uploadSuccess.classList.add('hidden');

    try {
        updateProgress(10);

        // Stap 1: Tekst extraheren uit PDF
        const extractedText = await extractTextFromPDF(file);
        updateProgress(40);

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error(
                'Geen tekst gevonden in PDF. Mogelijk is het een gescande afbeelding (bitmap-PDF). ' +
                'Gebruik een OCR-tool om de PDF eerst te converteren naar een doorzoekbare PDF.'
            );
        }

        console.log(`Extracted ${extractedText.length} characters from PDF`);

        // Stap 2: Merk en model detecteren
        const detectedInfo = detectBrandAndModel(file.name, extractedText);
        updateProgress(60);

        // Stap 3: AI-analyse — extraheert ECHTE onderdeelnummers uit de tekst
        let parts;
        try {
            parts = await analyzeWithCohere(extractedText, detectedInfo.brand, detectedInfo.model);
        } catch (aiError) {
            // AI mislukt → probeer regex-fallback
            console.warn('AI analysis failed, trying regex fallback:', aiError.message);
            showNotification(
                'AI-analyse mislukt. Poging met tekst-herkenning...',
                'warning'
            );
            parts = parsePartsList(extractedText);

            // ── FIX v3: Pas ook op regex-resultaten de intelligente classificatie toe ──
            if (parts && parts.length > 0) {
                parts = classifyPartsIntelligently(parts);
            }
        }

        updateProgress(90);

        // KRITIEKE CHECK: controleer of er onderdelen zijn
        if (!parts || parts.length === 0) {
            throw new Error(
                'Geen onderdelen gevonden in de PDF. ' +
                'Controleer of de PDF een leesbare parts list / onderdelen-catalogus bevat ' +
                'met duidelijk zichtbare onderdeelnummers.'
            );
        }

        // Statistieken
        const missingNumbers  = parts.filter(p => !p.partNumber || p.partNumber.trim() === '').length;
        const criticalCount   = parts.filter(p => p.type === 'Cr').length;
        const consumableCount = parts.filter(p => p.type === 'Con').length;

        if (missingNumbers > 0) {
            const pct = Math.round((missingNumbers / parts.length) * 100);
            showNotification(
                `Let op: ${missingNumbers} van ${parts.length} onderdelen (${pct}%) hebben geen herkend onderdeelnummer.`,
                'warning'
            );
        }

        // Resultaat samenstellen
        const analysisResult = {
            brand:     detectedInfo.brand,
            model:     detectedInfo.model,
            source:    'pdf-upload',
            filename:  file.name,
            timestamp: new Date().toISOString(),
            parts:     parts
        };

        updateProgress(100);

        // Succesbericht
        uploadSuccess.classList.remove('hidden');
        document.getElementById('uploadSuccessMessage').textContent =
            `${file.name} succesvol verwerkt. ` +
            `${parts.length} onderdelen geïdentificeerd ` +
            `(${criticalCount} kritiek, ${consumableCount} verbruiksartikelen` +
            (missingNumbers > 0 ? `, ${missingNumbers} zonder onderdeelnummer` : '') + ').';

        // Analyse-tab bijwerken
        updateAnalysisDisplay(analysisResult);

        showNotification('PDF succesvol geanalyseerd!', 'success');

        // Na 2 seconden naar analyse-tab
        setTimeout(() => {
            switchTab('analysis');
        }, 2000);

    } catch (error) {
        console.error('PDF processing error:', error);
        showNotification(`Fout bij verwerken PDF: ${error.message}`, 'error');
    } finally {
        setTimeout(() => {
            uploadProgress.classList.add('hidden');
            progressBar.style.width = '0%';
            progressPercent.textContent = '0%';
        }, 3000);
    }
}

function updateProgress(percent) {
    const progressBar     = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
}

// Extract text from PDF using PDF.js
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = async function() {
            try {
                const typedArray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                let fullText = '';

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();

                    const items = textContent.items;
                    let pageText = '';
                    let lastY = null;

                    for (const item of items) {
                        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                            pageText += '\n';
                        }
                        pageText += item.str + ' ';
                        lastY = item.transform[5];
                    }

                    fullText += pageText + '\n--- Pagina ' + pageNum + ' einde ---\n';
                }

                resolve(fullText);

            } catch (error) {
                reject(error);
            }
        };

        fileReader.onerror = () => {
            reject(new Error('Fout bij lezen van PDF bestand'));
        };

        fileReader.readAsArrayBuffer(file);
    });
}

// Detect brand and model from filename or content
function detectBrandAndModel(filename, text) {
    const brands = [
        'Rational', 'Electrolux', 'Convotherm', 'Combi', 'Hobart',
        'Alto-Shaam', 'Cleveland', 'Vulcan', 'Garland', 'Southbend',
        'Blodgett', 'Middleby', 'TurboChef', 'Lincoln', 'Manitowoc',
        'Scotsman', 'Hoshizaki', 'Ice-O-Matic', 'True', 'Traulsen',
        'Winterhalter', 'Meiko', 'Maidaid', 'Comenda', 'Welbilt',
        'Manitowoc', 'Taylor', 'Carpigiani', 'Pastomaster'
    ];

    let detectedBrand = 'Unknown';
    let detectedModel = 'Unknown';

    const filenameLower = filename.toLowerCase();
    for (const brand of brands) {
        if (filenameLower.includes(brand.toLowerCase())) {
            detectedBrand = brand;
            break;
        }
    }

    const textSample = text.substring(0, 1000).toLowerCase();
    if (detectedBrand === 'Unknown') {
        for (const brand of brands) {
            if (textSample.includes(brand.toLowerCase())) {
                detectedBrand = brand;
                break;
            }
        }
    }

    const modelPatterns = [
        /\b[A-Z]{2,4}[\s-]?\d{2,4}[A-Z\d]*\b/g,
        /\bModel[\s:]+([A-Z\d-]+)/i,
        /\bType[\s:]+([A-Z\d-]+)/i
    ];

    for (const pattern of modelPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            detectedModel = matches[0].replace(/Model[\s:]+|Type[\s:]+/i, '').trim();
            break;
        }
    }

    if (detectedModel === 'Unknown') {
        const modelMatch = filename.match(/([A-Z\d-]{3,})/);
        if (modelMatch) {
            detectedModel = modelMatch[1];
        }
    }

    return { brand: detectedBrand, model: detectedModel };
}

// Parse parts list from text (regex-fallback als AI faalt)
function parsePartsList(text) {
    const parts = [];
    const lines = text.split('\n');

    // Patroon: minimaal 4 tekens alfanumeriek gevolgd door een beschrijving
    const partPattern = /\b([A-Z0-9][A-Z0-9\-\.\/]{3,})\s+(.{5,80}?)(?:\s+(\d{1,3}))?\s*$/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length < 8) continue;

        const match = trimmed.match(partPattern);
        if (match) {
            const candidatePartNumber = match[1].trim();

            if (candidatePartNumber.length < 4) continue;
            if (/^\d{1,3}$/.test(candidatePartNumber)) continue;
            if (/^\d{4}$/.test(candidatePartNumber)) continue;

            parts.push({
                partNumber:  candidatePartNumber,
                description: match[2].trim(),
                quantity:    match[3] ? parseInt(match[3]) : 1,
                type:        'Pr',
                critical:    false,
                name:        match[2].trim().substring(0, 60)
            });
        }
    }

    if (parts.length > 0) {
        console.log(`Regex fallback vond ${parts.length} onderdelen`);
    } else {
        console.warn('Regex fallback vond geen onderdelen in de PDF-tekst');
    }

    return parts;
}

// Export functions
window.handlePdfUpload      = handlePdfUpload;
window.extractTextFromPDF   = extractTextFromPDF;
window.detectBrandAndModel  = detectBrandAndModel;
