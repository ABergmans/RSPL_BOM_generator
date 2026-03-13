// PartsFinder Pro - Search Functionality
// v4: Directe AI-kennisbank zoekfunctie (geen DuckDuckGo meer — werkte toch niet)
// Zoeken → AI Kennisbank (Claude) → resultaten tonen

document.addEventListener('DOMContentLoaded', function() {
    const searchBtn  = document.getElementById('searchBtn');
    const brandInput = document.getElementById('brandInput');
    const modelInput = document.getElementById('modelInput');

    searchBtn.addEventListener('click', performSearch);

    brandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    modelInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});

async function performSearch() {
    const brand = document.getElementById('brandInput').value.trim();
    const model = document.getElementById('modelInput').value.trim();

    if (!brand || !model) {
        showNotification('Vul beide velden in (Merk en Model)', 'warning');
        return;
    }

    if (!validateApiKey()) {
        return;
    }

    const searchLoading = document.getElementById('searchLoading');
    const searchResults = document.getElementById('searchResults');
    const searchBtn     = document.getElementById('searchBtn');

    searchLoading.classList.remove('hidden');
    searchResults.classList.add('hidden');
    searchBtn.disabled = true;

    // Update loading text
    const loadingText = searchLoading.querySelector('p');
    if (loadingText) loadingText.textContent = `Claude AI zoekt naar onderdelen van ${brand} ${model}...`;

    try {
        showNotification(`Parts list ophalen voor ${brand} ${model}...`, 'info');

        const parts = await generatePartsListFromAI(brand, model);

        if (!parts || parts.length === 0) {
            showNotification('Geen onderdelen gevonden. Probeer een PDF te uploaden.', 'warning');
            displaySearchOptions(brand, model);
            return;
        }

        const analysisResult = {
            brand,
            model,
            source:    'ai-knowledge',
            timestamp: new Date().toISOString(),
            parts
        };

        displaySearchResults(analysisResult, 'ai-knowledge');
        updateAnalysisDisplay(analysisResult);

        const crCount  = parts.filter(p => p.type === 'Cr').length;
        const conCount = parts.filter(p => p.type === 'Con').length;
        const prCount  = parts.filter(p => p.type === 'Pr').length;

        showNotification(
            `${parts.length} onderdelen gevonden (${crCount} kritiek, ${conCount} verbruik, ${prCount} preventief)`,
            'success'
        );

        setTimeout(() => switchTab('analysis'), 2000);

    } catch (error) {
        console.error('Search error:', error);
        showNotification(`Fout bij zoeken: ${error.message}`, 'error');
        displaySearchOptions(brand, model);
    } finally {
        searchLoading.classList.add('hidden');
        searchBtn.disabled = false;
    }
}

// ── Toon opties als AI ook mislukt ───────────────────────────────────────────
function displaySearchOptions(brand, model) {
    const searchResults        = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');

    searchResultsContent.innerHTML = `
        <div class="space-y-4">
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p class="font-semibold text-amber-800 mb-2">
                    <i class="fas fa-info-circle mr-2"></i>
                    AI kon geen parts list genereren voor ${brand} ${model}
                </p>
                <p class="text-sm text-amber-700">
                    Controleer of het merk en model correct zijn ingevoerd, of upload een PDF van de officiële parts list.
                </p>
            </div>

            <div class="bg-green-50 border-2 border-green-300 rounded-lg p-5">
                <div class="flex items-start space-x-3 mb-3">
                    <i class="fas fa-file-pdf text-green-600 text-2xl mt-1"></i>
                    <div>
                        <p class="font-bold text-green-800 text-lg">Upload PDF (aanbevolen voor exacte part numbers)</p>
                        <p class="text-sm text-green-700 mt-1">
                            Download de officiële parts list van de fabrikantwebsite en upload deze hier. 
                            Claude extraheert de <strong>exacte onderdeelnummers</strong> direct uit de PDF.
                        </p>
                    </div>
                </div>
                <button onclick="switchTab('upload')"
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">
                    <i class="fas fa-upload mr-2"></i>Ga naar PDF Upload
                </button>
            </div>
        </div>
    `;

    searchResults.classList.remove('hidden');
}

// ── Toon zoekresultaten ───────────────────────────────────────────────────────
function displaySearchResults(data, sourceType) {
    const searchResults        = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');

    const criticalCount   = data.parts.filter(p => p.type === 'Cr' || p.critical).length;
    const consumableCount = data.parts.filter(p => p.type === 'Con').length;
    const preventiveCount = data.parts.filter(p => p.type === 'Pr' && !p.critical).length;
    const withPartNum     = data.parts.filter(p => p.partNumber && p.partNumber.trim() !== '').length;

    searchResultsContent.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <p class="font-semibold text-gray-800">${data.brand} ${data.model}</p>
                        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Claude AI</span>
                    </div>
                    <p class="text-sm text-gray-600">
                        Gevonden: <strong>${data.parts.length}</strong> onderdelen 
                        (${withPartNum} met onderdeelnummer)
                    </p>
                </div>
                <button onclick="switchTab('analysis')" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Bekijk Analyse <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
            <div class="grid grid-cols-3 gap-3">
                <div class="bg-red-50 rounded-lg p-3 text-center">
                    <p class="text-2xl font-bold text-red-600">${criticalCount}</p>
                    <p class="text-xs text-gray-600">Kritiek (Cr)</p>
                </div>
                <div class="bg-amber-50 rounded-lg p-3 text-center">
                    <p class="text-2xl font-bold text-amber-600">${consumableCount}</p>
                    <p class="text-xs text-gray-600">Verbruik (Con)</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-3 text-center">
                    <p class="text-2xl font-bold text-blue-600">${preventiveCount}</p>
                    <p class="text-xs text-gray-600">Preventief (Pr)</p>
                </div>
            </div>
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p class="text-sm text-amber-700">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <strong>AI-gegenereerde data</strong> — Controleer part numbers altijd via 
                    officiële fabrikantsdocumentatie. Upload een PDF voor exacte onderdeelnummers.
                </p>
            </div>
        </div>
    `;

    searchResults.classList.remove('hidden');
}

// Export for use in other modules
window.performSearch = performSearch;
