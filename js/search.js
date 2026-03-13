// PartsFinder Pro - Search Functionality
// Handles online search for parts lists and manuals
// FIX v3: DuckDuckGo vervangen door Cohere AI-kennisbank (werkt altijd)
// FIX v3: Duidelijke UI met "AI Kennisbank" knop als online zoeken mislukt

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

    document.getElementById('searchLoading').classList.remove('hidden');
    document.getElementById('searchResults').classList.add('hidden');
    document.getElementById('searchBtn').disabled = true;

    try {
        // Stap 1: Probeer online zoeken via DuckDuckGo (snel, maar zelden succesvol voor parts lists)
        const onlineResult = await tryOnlineSearch(brand, model);

        if (onlineResult && onlineResult.text && onlineResult.text.trim().length > 100) {
            // Online data gevonden — analyseer met AI
            console.log('Online data gevonden, analyseer met AI...');
            const parts = await analyzeWithCohere(onlineResult.text, brand, model);

            if (parts && parts.length > 0) {
                const analysisResult = {
                    brand, model,
                    source:    'web-search',
                    timestamp: new Date().toISOString(),
                    parts
                };
                displaySearchResults(analysisResult, 'online');
                updateAnalysisDisplay(analysisResult);
                showNotification('Online parts list gevonden en geanalyseerd!', 'success');
                setTimeout(() => switchTab('analysis'), 2000);
                return;
            }
        }

        // Stap 2: Online zoeken mislukt → toon opties aan gebruiker
        displaySearchOptions(brand, model);

    } catch (error) {
        console.error('Search error:', error);
        showNotification(`Fout bij zoeken: ${error.message}`, 'error');
        displaySearchOptions(brand, model);
    } finally {
        document.getElementById('searchLoading').classList.add('hidden');
        document.getElementById('searchBtn').disabled = false;
    }
}

// ── Probeer online zoeken via DuckDuckGo Instant Answer API ─────────────────
async function tryOnlineSearch(brand, model) {
    try {
        const query = `${brand} ${model} spare parts list`;
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
        const response = await fetch(ddgUrl, { signal: AbortSignal.timeout(5000) });

        if (!response.ok) return null;

        const data = await response.json();
        let combinedText = '';

        if (data.AbstractText)  combinedText += data.AbstractText + '\n';
        if (data.Answer)        combinedText += data.Answer + '\n';
        if (data.Definition)    combinedText += data.Definition + '\n';
        if (data.RelatedTopics) {
            data.RelatedTopics.forEach(t => { if (t.Text) combinedText += t.Text + '\n'; });
        }

        return combinedText.trim().length > 100 ? { text: combinedText, source: 'DuckDuckGo' } : null;
    } catch {
        return null;
    }
}

// ── Toon opties wanneer online zoeken niets oplevert ────────────────────────
function displaySearchOptions(brand, model) {
    const searchResults        = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');

    searchResultsContent.innerHTML = `
        <div class="space-y-4">
            <!-- Uitleg waarom online zoeken niet werkt -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p class="font-semibold text-amber-800 mb-2">
                    <i class="fas fa-info-circle mr-2"></i>
                    Online parts list niet direct beschikbaar
                </p>
                <p class="text-sm text-amber-700">
                    Fabrikanten publiceren parts lists doorgaans als beveiligde PDF 
                    of achter een dealer-login. De online zoekfunctie kan deze niet automatisch ophalen.
                </p>
            </div>

            <!-- Optie 1: AI Kennisbank -->
            <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
                <div class="flex items-start space-x-3 mb-3">
                    <i class="fas fa-robot text-blue-600 text-2xl mt-1"></i>
                    <div>
                        <p class="font-bold text-blue-800 text-lg">
                            Optie 1: AI Kennisbank gebruiken
                        </p>
                        <p class="text-sm text-blue-700 mt-1">
                            De AI genereert een parts list op basis van zijn trainingskennis over 
                            <strong>${brand} ${model}</strong> apparatuur. 
                            Onderdeelnummers worden alleen ingevuld als de AI ze kent — 
                            anders blijft het veld leeg (nooit nep-nummers).
                        </p>
                        <p class="text-xs text-blue-600 mt-2 italic">
                            ⚠️ Let op: AI-kennis kan verouderd zijn. Controleer altijd via de officiële 
                            fabrikantsdocumentatie.
                        </p>
                    </div>
                </div>
                <button id="useAIKnowledgeBtn"
                        onclick="generateFromAIKnowledge('${brand}', '${model}')"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">
                    <i class="fas fa-robot mr-2"></i>Genereer Parts List via AI Kennisbank
                </button>
            </div>

            <!-- Optie 2: PDF Upload -->
            <div class="bg-green-50 border-2 border-green-300 rounded-lg p-5">
                <div class="flex items-start space-x-3 mb-3">
                    <i class="fas fa-file-pdf text-green-600 text-2xl mt-1"></i>
                    <div>
                        <p class="font-bold text-green-800 text-lg">
                            Optie 2: PDF uploaden (aanbevolen voor echte part numbers)
                        </p>
                        <p class="text-sm text-green-700 mt-1">
                            Download de officiële parts list / service manual van de 
                            fabrikantwebsite en upload deze hier. De AI extraheert 
                            de <strong>exacte onderdeelnummers</strong> direct uit de PDF.
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

// ── Genereer parts list via AI-kennisbank (knopklik-handler) ─────────────────
async function generateFromAIKnowledge(brand, model) {
    const btn = document.getElementById('useAIKnowledgeBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI genereert parts list...';
    }

    const searchResultsContent = document.getElementById('searchResultsContent');

    // Tussentijdse loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'aiKnowledgeLoading';
    loadingDiv.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-center';
    loadingDiv.innerHTML = `
        <i class="fas fa-spinner fa-spin text-3xl text-blue-600 mb-2"></i>
        <p class="text-blue-800 font-medium">AI is bezig met het genereren van een parts list voor ${brand} ${model}...</p>
        <p class="text-blue-600 text-sm mt-1">Dit kan 15-30 seconden duren...</p>
    `;
    searchResultsContent.appendChild(loadingDiv);

    try {
        const parts = await generatePartsListFromAI(brand, model);

        // Verwijder loading indicator
        const loadingEl = document.getElementById('aiKnowledgeLoading');
        if (loadingEl) loadingEl.remove();

        if (!parts || parts.length === 0) {
            showNotification('AI kon geen onderdelen genereren voor dit apparaat.', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-robot mr-2"></i>Genereer Parts List via AI Kennisbank';
            }
            return;
        }

        const analysisResult = {
            brand, model,
            source:    'ai-knowledge',
            timestamp: new Date().toISOString(),
            parts
        };

        displaySearchResults(analysisResult, 'ai-knowledge');
        updateAnalysisDisplay(analysisResult);

        const criticalCount   = parts.filter(p => p.type === 'Cr').length;
        const consumableCount = parts.filter(p => p.type === 'Con').length;
        const preventiveCount = parts.filter(p => p.type === 'Pr').length;

        showNotification(
            `AI parts list gegenereerd: ${parts.length} onderdelen ` +
            `(${criticalCount} Cr, ${consumableCount} Con, ${preventiveCount} Pr)`,
            'success'
        );

        setTimeout(() => switchTab('analysis'), 2000);

    } catch (error) {
        const loadingEl = document.getElementById('aiKnowledgeLoading');
        if (loadingEl) loadingEl.remove();

        console.error('AI knowledge error:', error);
        showNotification(`AI generatie mislukt: ${error.message}`, 'error');

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-robot mr-2"></i>Genereer Parts List via AI Kennisbank';
        }
    }
}

// ── Toon zoekresultaten in de UI ─────────────────────────────────────────────
function displaySearchResults(data, sourceType) {
    const searchResults        = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');

    const criticalCount   = data.parts.filter(p => p.type === 'Cr' || p.critical).length;
    const consumableCount = data.parts.filter(p => p.type === 'Con').length;
    const preventiveCount = data.parts.filter(p => p.type === 'Pr').length;

    const sourceLabel = sourceType === 'ai-knowledge'
        ? '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">AI Kennisbank</span>'
        : '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Online gevonden</span>';

    const aiDisclaimer = sourceType === 'ai-knowledge'
        ? `<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
               <p class="text-sm text-amber-700">
                   <i class="fas fa-exclamation-triangle mr-2"></i>
                   <strong>AI-gegenereerde data</strong> — Controleer part numbers altijd via 
                   officiële fabrikantsdocumentatie. Lege part number velden betekenen dat 
                   de AI het nummer niet kent.
               </p>
           </div>`
        : '';

    searchResultsContent.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <p class="font-semibold text-gray-800">${data.brand} ${data.model}</p>
                        ${sourceLabel}
                    </div>
                    <p class="text-sm text-gray-600">Gevonden: <strong>${data.parts.length}</strong> onderdelen</p>
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
            ${aiDisclaimer}
        </div>
    `;

    searchResults.classList.remove('hidden');
}

// Export for use in other modules
window.performSearch          = performSearch;
window.generateFromAIKnowledge = generateFromAIKnowledge;
