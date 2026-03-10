// PartsFinder Pro - Search Functionality
// Handles online search for parts lists and manuals

document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const brandInput = document.getElementById('brandInput');
    const modelInput = document.getElementById('modelInput');
    const searchResults = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');
    const searchLoading = document.getElementById('searchLoading');
    
    searchBtn.addEventListener('click', performSearch);
    
    // Enter key support
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
    
    // Show loading
    document.getElementById('searchLoading').classList.remove('hidden');
    document.getElementById('searchResults').classList.add('hidden');
    document.getElementById('searchBtn').disabled = true;
    
    try {
        // Search for parts list
        const searchQuery = `${brand} ${model} spare parts list manual PDF`;
        console.log('Searching for:', searchQuery);
        
        // Attempt to find real parts list text via DuckDuckGo or CORS proxy
        const searchResultsData = await searchForPartsText(searchQuery, brand, model);
        
        if (!searchResultsData.text || searchResultsData.text.trim().length < 50) {
            // ─── GEEN ECHTE DATA GEVONDEN ────────────────────────────────────────
            // Toon duidelijke foutmelding; genereer GEEN nep-onderdeelnummers
            displayNoRealDataMessage(brand, model, searchQuery);
            showNotification(
                `Geen bruikbare parts list gevonden voor ${brand} ${model}. Upload de PDF handmatig.`,
                'warning'
            );
            return;
        }
        
        // Analyze found text with AI — uses ONLY real part numbers from the text
        const analysisResult = await analyzeSearchResults(searchResultsData, brand, model);
        
        if (!analysisResult.parts || analysisResult.parts.length === 0) {
            displayNoRealDataMessage(brand, model, searchQuery);
            showNotification(
                'AI kon geen onderdelen extraheren uit de gevonden tekst. Upload de PDF handmatig.',
                'warning'
            );
            return;
        }
        
        // Display results
        displaySearchResults(analysisResult);
        
        // Update analysis display
        updateAnalysisDisplay(analysisResult);
        
        showNotification('Zoeken en analyse succesvol voltooid!', 'success');
        
        // Switch to analysis tab
        setTimeout(() => {
            switchTab('analysis');
        }, 2000);
        
    } catch (error) {
        console.error('Search error:', error);
        showNotification(`Fout bij zoeken: ${error.message}`, 'error');
    } finally {
        document.getElementById('searchLoading').classList.add('hidden');
        document.getElementById('searchBtn').disabled = false;
    }
}

// ── Echte zoekopdracht via DuckDuckGo Instant Answer API (CORS-vrij) ─────────────────
// Als de API geen bruikbare tekst teruggeeft, retourneer dan een leeg object.
// NOOIT sample/nep-data retourneren.
async function searchForPartsText(query, brand, model) {
    // Probeer DuckDuckGo Instant Answer API (geen API-key nodig, CORS-vriendelijk)
    try {
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
        const response = await fetch(ddgUrl);
        
        if (response.ok) {
            const data = await response.json();
            
            // Combineer beschikbare tekst uit DuckDuckGo-respons
            let combinedText = '';
            
            if (data.AbstractText)    combinedText += data.AbstractText + '\n';
            if (data.Answer)          combinedText += data.Answer + '\n';
            if (data.Definition)      combinedText += data.Definition + '\n';
            
            if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                data.RelatedTopics.forEach(topic => {
                    if (topic.Text) combinedText += topic.Text + '\n';
                });
            }
            
            if (combinedText.trim().length > 50) {
                return {
                    query,
                    text: combinedText,
                    source: 'DuckDuckGo'
                };
            }
        }
    } catch (e) {
        console.warn('DuckDuckGo search failed:', e.message);
    }
    
    // Geen bruikbare tekst gevonden — retourneer leeg object (GEEN nep-data)
    return { query, text: '', source: 'none' };
}

// ── Toon melding wanneer geen echte data beschikbaar is ──────────────────────────────
function displayNoRealDataMessage(brand, model, query) {
    const searchResults = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');
    
    searchResultsContent.innerHTML = `
        <div class="space-y-3">
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p class="font-semibold text-amber-800 mb-2">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Geen bruikbare parts list gevonden online
                </p>
                <p class="text-sm text-amber-700 mb-3">
                    Voor <strong>${brand} ${model}</strong> is geen automatisch uitleesbare 
                    parts list gevonden via de zoekmachine.
                </p>
                <p class="text-sm text-amber-700 mb-3">
                    <strong>Reden:</strong> Fabrikanten publiceren onderdelen-lijsten 
                    doorgaans als beveiligde PDF of achter een login. De online zoekfunctie 
                    kan deze niet automatisch verwerken.
                </p>
                <div class="bg-white rounded-lg p-3 border border-amber-100">
                    <p class="text-sm font-semibold text-gray-700 mb-1">
                        <i class="fas fa-lightbulb text-amber-500 mr-2"></i>Wat te doen:
                    </p>
                    <ol class="text-sm text-gray-600 list-decimal list-inside space-y-1">
                        <li>Download de parts list / service manual van de fabrikaant website</li>
                        <li>Ga naar de <strong>Upload PDF</strong> tab</li>
                        <li>Upload de PDF — de AI extraheert de echte onderdeelnummers</li>
                    </ol>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                    <i class="fas fa-info-circle mr-1"></i>
                    Zoekopdracht: <code>${query}</code>
                </p>
            </div>
            <button onclick="switchTab('upload')" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                <i class="fas fa-upload mr-2"></i>Ga naar PDF Upload
            </button>
        </div>
    `;
    
    searchResults.classList.remove('hidden');
}

// Analyze search results with AI
async function analyzeSearchResults(searchData, brand, model) {
    console.log('Analyzing search results with AI...');
    
    let parts = [];
    
    // Alleen analyseren als er echte tekst beschikbaar is
    if (searchData.text && searchData.text.trim().length > 50) {
        parts = await analyzeWithCohere(searchData.text, brand, model);
    }
    
    // NOOIT generateSamplePartsData() aanroepen — dat geeft nep-nummers
    
    return {
        brand:       brand,
        model:       model,
        source:      'web-search',
        timestamp:   new Date().toISOString(),
        parts:       parts || [],
        searchQuery: searchData.query
    };
}

// Display search results
function displaySearchResults(data) {
    const searchResults        = document.getElementById('searchResults');
    const searchResultsContent = document.getElementById('searchResultsContent');
    
    searchResultsContent.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold text-gray-800">${data.brand} ${data.model}</p>
                    <p class="text-sm text-gray-600">Gevonden: ${data.parts.length} onderdelen</p>
                </div>
                <button onclick="switchTab('analysis')" class="text-blue-600 hover:text-blue-800 font-medium">
                    Bekijk Analyse <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
            <div class="bg-white rounded-lg p-3 border border-gray-200">
                <p class="text-sm text-gray-700">
                    <i class="fas fa-check-circle text-green-600 mr-2"></i>
                    Parts list gevonden en geanalyseerd
                </p>
            </div>
        </div>
    `;
    
    searchResults.classList.remove('hidden');
}

// Export for use in other modules
window.performSearch            = performSearch;
// generateSamplePartsData is verwijderd — gebruik NOOIT nep-onderdeelnummers
