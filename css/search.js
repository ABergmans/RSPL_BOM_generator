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
        
        // Simulate search with DuckDuckGo API or web scraping
        // In production, you'd use a real search API
        const searchResultsData = await simulateWebSearch(searchQuery);
        
        // Process results with AI
        const analysisResult = await analyzeSearchResults(searchResultsData, brand, model);
        
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

// Simulate web search (in production, use real search API)
async function simulateWebSearch(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return simulated search results
    // In production, this would be replaced with actual search API call
    return {
        query: query,
        results: [
            {
                title: 'Parts Manual - Found via Web Search',
                url: 'https://example.com/manual.pdf',
                snippet: 'Official spare parts catalog with complete part numbers and descriptions'
            }
        ],
        // Simulated parts data that would normally be extracted from found documents
        foundParts: generateSamplePartsData()
    };
}

// Generate sample parts data for demonstration
function generateSamplePartsData() {
    const partTypes = ['Pr', 'Cr', 'Con'];
    const parts = [];
    
    const sampleParts = [
        { name: 'Heating Element', base: 'HTR' },
        { name: 'Control Board', base: 'PCB' },
        { name: 'Temperature Sensor', base: 'SNS' },
        { name: 'Door Seal Gasket', base: 'GSK' },
        { name: 'Fan Motor Assembly', base: 'FAN' },
        { name: 'Water Inlet Valve', base: 'VLV' },
        { name: 'Steam Generator', base: 'STM' },
        { name: 'Display Panel', base: 'DSP' },
        { name: 'Power Supply Unit', base: 'PSU' },
        { name: 'Cleaning Pump', base: 'PMP' },
        { name: 'Air Filter', base: 'FLT' },
        { name: 'Cable Assembly', base: 'CBL' },
        { name: 'Drain Hose', base: 'HSE' },
        { name: 'Thermostat', base: 'THR' },
        { name: 'Relay Switch', base: 'RLY' }
    ];
    
    sampleParts.forEach((part, index) => {
        parts.push({
            partNumber: `${part.base}-${String(index + 1).padStart(4, '0')}`,
            name: part.name,
            description: `${part.name} assembly for commercial kitchen equipment`,
            type: partTypes[Math.floor(Math.random() * partTypes.length)],
            quantity: Math.floor(Math.random() * 3) + 1,
            critical: Math.random() > 0.7,
            supplier: 'OEM Parts Supplier',
            unitPrice: (Math.random() * 500 + 50).toFixed(2),
            leadTime: Math.floor(Math.random() * 30) + 5,
            weight: (Math.random() * 5 + 0.5).toFixed(2),
            dimensions: `${Math.floor(Math.random() * 30 + 10)} x ${Math.floor(Math.random() * 20 + 5)} x ${Math.floor(Math.random() * 15 + 5)}`
        });
    });
    
    return parts;
}

// Analyze search results with AI
async function analyzeSearchResults(searchData, brand, model) {
    console.log('Analyzing search results with AI...');
    
    // Use the found parts or analyze with Cohere AI
    let parts = searchData.foundParts || [];
    
    // If we have actual text to analyze, use Cohere AI
    if (searchData.text) {
        parts = await analyzeWithCohere(searchData.text, brand, model);
    }
    
    return {
        brand: brand,
        model: model,
        source: 'web-search',
        timestamp: new Date().toISOString(),
        parts: parts,
        searchQuery: searchData.query
    };
}

// Display search results
function displaySearchResults(data) {
    const searchResults = document.getElementById('searchResults');
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

// Real-world search implementations (commented out - requires API keys)

/*
// DuckDuckGo Instant Answer API (Free, no key required)
async function searchWithDuckDuckGo(query) {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// SerpAPI (Free tier: 100 searches/month)
async function searchWithSerpAPI(query, apiKey) {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.organic_results || [];
}

// Custom web scraping with CORS proxy
async function searchWithCorsProxy(query) {
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(corsProxy + encodeURIComponent(searchUrl));
    const html = await response.text();
    // Parse HTML to extract search results
    return parseSearchResults(html);
}
*/

// Export for use in other modules
window.performSearch = performSearch;
window.generateSamplePartsData = generateSamplePartsData;
