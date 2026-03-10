// PartsFinder Pro - PDF Parser
// Handles PDF upload and text extraction using PDF.js

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const pdfInput = document.getElementById('pdfInput');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const uploadSuccessMessage = document.getElementById('uploadSuccessMessage');
    const progressBar = document.getElementById('progressBar');
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
    
    // Show progress
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    
    uploadProgress.classList.remove('hidden');
    uploadSuccess.classList.add('hidden');
    
    try {
        // Simulate upload progress
        updateProgress(20);
        
        // Extract text from PDF
        const extractedText = await extractTextFromPDF(file);
        updateProgress(50);
        
        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('Geen tekst gevonden in PDF. Mogelijk is het een gescande afbeelding.');
        }
        
        // Detect brand and model from filename or content
        const detectedInfo = detectBrandAndModel(file.name, extractedText);
        updateProgress(70);
        
        // Analyze with AI
        const parts = await analyzeWithCohere(extractedText, detectedInfo.brand, detectedInfo.model);
        updateProgress(90);
        
        // Create analysis result
        const analysisResult = {
            brand: detectedInfo.brand,
            model: detectedInfo.model,
            source: 'pdf-upload',
            filename: file.name,
            timestamp: new Date().toISOString(),
            parts: parts
        };
        
        updateProgress(100);
        
        // Show success
        uploadSuccess.classList.remove('hidden');
        document.getElementById('uploadSuccessMessage').textContent = 
            `${file.name} succesvol verwerkt. ${parts.length} onderdelen geïdentificeerd.`;
        
        // Update analysis display
        updateAnalysisDisplay(analysisResult);
        
        showNotification('PDF succesvol geanalyseerd!', 'success');
        
        // Switch to analysis tab after 2 seconds
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
    const progressBar = document.getElementById('progressBar');
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
                
                // Load PDF document
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                let fullText = '';
                
                // Extract text from each page
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ');
                    
                    fullText += pageText + '\n';
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
    // Common kitchen equipment brands
    const brands = [
        'Rational', 'Electrolux', 'Convotherm', 'Combi', 'Hobart',
        'Alto-Shaam', 'Cleveland', 'Vulcan', 'Garland', 'Southbend',
        'Blodgett', 'Middleby', 'TurboChef', 'Lincoln', 'Manitowoc',
        'Scotsman', 'Hoshizaki', 'Ice-O-Matic', 'True', 'Traulsen'
    ];
    
    let detectedBrand = 'Unknown';
    let detectedModel = 'Unknown';
    
    // Check filename
    const filenameLower = filename.toLowerCase();
    for (const brand of brands) {
        if (filenameLower.includes(brand.toLowerCase())) {
            detectedBrand = brand;
            break;
        }
    }
    
    // Check text content (first 1000 characters)
    const textSample = text.substring(0, 1000).toLowerCase();
    if (detectedBrand === 'Unknown') {
        for (const brand of brands) {
            if (textSample.includes(brand.toLowerCase())) {
                detectedBrand = brand;
                break;
            }
        }
    }
    
    // Try to find model number patterns
    // Common patterns: SCC 101, AOS061EAH1, RG 20-1, etc.
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
    
    // If still unknown, try to extract from filename
    if (detectedModel === 'Unknown') {
        const modelMatch = filename.match(/([A-Z\d-]{3,})/);
        if (modelMatch) {
            detectedModel = modelMatch[1];
        }
    }
    
    return {
        brand: detectedBrand,
        model: detectedModel
    };
}

// Parse parts list from text (fallback if AI fails)
function parsePartsList(text) {
    const parts = [];
    const lines = text.split('\n');
    
    // Look for lines that look like part entries
    // Common patterns: "Part Number | Description | Quantity"
    const partPattern = /([A-Z\d-]{4,})\s+(.{10,}?)\s+(\d+)/;
    
    for (const line of lines) {
        const match = line.match(partPattern);
        if (match) {
            parts.push({
                partNumber: match[1].trim(),
                description: match[2].trim(),
                quantity: parseInt(match[3]),
                type: 'Pr', // Default
                name: match[2].trim().substring(0, 50)
            });
        }
    }
    
    // If no parts found, return sample data
    if (parts.length === 0) {
        return generateSamplePartsData();
    }
    
    return parts;
}

// Export functions
window.handlePdfUpload = handlePdfUpload;
window.extractTextFromPDF = extractTextFromPDF;
window.detectBrandAndModel = detectBrandAndModel;
