// PartsFinder Pro - Main Application Logic
// Handles UI interactions, tab navigation, and API key management

// Global state
const AppState = {
    currentTab: 'search',
    analysisData: null,
    apiKeys: {
        gemini: localStorage.getItem('geminiApiKey') || ''
    }
};

// DOM Elements
const elements = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    settingsBtn: document.getElementById('settingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    geminiApiKeyInput: document.getElementById('geminiApiKey'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    
    // Analysis Display
    analysisEmpty: document.getElementById('analysisEmpty'),
    analysisContent: document.getElementById('analysisContent'),
    analysisBrand: document.getElementById('analysisBrand'),
    analysisModel: document.getElementById('analysisModel'),
    totalParts: document.getElementById('totalParts'),
    criticalParts: document.getElementById('criticalParts'),
    consumableParts: document.getElementById('consumableParts'),
    partsTableBody: document.getElementById('partsTableBody'),
    
    // Generate Display
    generateEmpty: document.getElementById('generateEmpty'),
    generateContent: document.getElementById('generateContent'),
    exportStatus: document.getElementById('exportStatus'),
    exportStatusMessage: document.getElementById('exportStatusMessage')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('PartsFinder Pro initialized');
    
    initializeTabs();
    initializeSettings();
    checkApiKey();
    
    // Set PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
});

// Tab Navigation
function initializeTabs() {
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update active tab button
    elements.tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active', 'border-blue-600', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-gray-600');
        } else {
            btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-600');
        }
    });
    
    // Show/hide tab content
    elements.tabContents.forEach(content => {
        const contentId = content.id.replace('-tab', '');
        if (contentId === tabName) {
            content.classList.remove('hidden');
            content.classList.add('animate-slide-in');
        } else {
            content.classList.add('hidden');
        }
    });
    
    AppState.currentTab = tabName;
}

// Settings Modal
function initializeSettings() {
    // Open modal
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.remove('hidden');
        elements.settingsModal.classList.add('flex');
        elements.geminiApiKeyInput.value = AppState.apiKeys.gemini;
    });
    
    // Close modal
    elements.closeSettingsBtn.addEventListener('click', closeSettingsModal);
    
    // Close on backdrop click
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            closeSettingsModal();
        }
    });
    
    // Save API key
    elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
}

function closeSettingsModal() {
    elements.settingsModal.classList.add('hidden');
    elements.settingsModal.classList.remove('flex');
}

function saveApiKey() {
    const apiKey = elements.geminiApiKeyInput.value.trim();
    
    if (!apiKey) {
        showNotification('Vul een geldige API key in', 'error');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('geminiApiKey', apiKey);
    AppState.apiKeys.gemini = apiKey;
    
    showNotification('API key succesvol opgeslagen!', 'success');
    closeSettingsModal();
}

function checkApiKey() {
    if (!AppState.apiKeys.gemini) {
        setTimeout(() => {
            if (confirm('Geen Gemini API key gevonden. Wilt u deze nu instellen?')) {
                elements.settingsModal.classList.remove('hidden');
                elements.settingsModal.classList.add('flex');
            }
        }, 1000);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-md animate-slide-in`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-amber-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icons[type] || icons.info} text-2xl mr-3"></i>
            <p class="font-semibold">${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Update Analysis Display
function updateAnalysisDisplay(data) {
    if (!data || !data.parts || data.parts.length === 0) {
        elements.analysisEmpty.classList.remove('hidden');
        elements.analysisContent.classList.add('hidden');
        return;
    }

    elements.analysisEmpty.classList.add('hidden');
    elements.analysisContent.classList.remove('hidden');

    // Update equipment info
    elements.analysisBrand.textContent = data.brand || '-';
    elements.analysisModel.textContent = data.model || '-';

    // Calculate statistics
    const totalParts     = data.parts.length;
    const criticalParts  = data.parts.filter(p => p.type === 'Cr' || p.critical).length;
    const consumableParts = data.parts.filter(p => p.type === 'Con').length;

    elements.totalParts.textContent     = totalParts;
    elements.criticalParts.textContent  = criticalParts;
    elements.consumableParts.textContent = consumableParts;

    // Update parts table
    elements.partsTableBody.innerHTML = '';
    data.parts.forEach((part, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';

        const typeColors = {
            'Pr':  'badge-blue',
            'Cr':  'badge-red',
            'Con': 'badge-amber'
        };

        // Toon het echte onderdeelnummer; als het ontbreekt een visuele aanduiding geven
        const displayPartNumber = (part.partNumber && part.partNumber.trim() !== '')
            ? part.partNumber.trim()
            : (part.oemPartNumber && part.oemPartNumber.trim() !== '')
                ? part.oemPartNumber.trim()
                : '<span class="text-gray-400 italic">onbekend</span>';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${displayPartNumber}
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
                ${part.description || part.name || 'N/A'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="badge ${typeColors[part.type] || 'badge-blue'}">
                    ${part.type || 'Pr'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                ${part.quantity || 1}
            </td>
        `;

        elements.partsTableBody.appendChild(row);
    });

    // Store in global state
    AppState.analysisData = data;

    // Enable generate tab
    updateGenerateDisplay();
}

// Update Generate Display
function updateGenerateDisplay() {
    if (!AppState.analysisData || !AppState.analysisData.parts) {
        elements.generateEmpty.classList.remove('hidden');
        elements.generateContent.classList.add('hidden');
        return;
    }

    elements.generateEmpty.classList.add('hidden');
    elements.generateContent.classList.remove('hidden');

    // Toon hoeveel onderdelen in BOM vs RSPL gaan
    const parts      = AppState.analysisData.parts;
    const totalParts = parts.length;
    const rsplCount  = parts.filter(p =>
        p.type === 'Cr' ||
        p.type === 'Con' ||
        (p.type === 'Pr' && p.critical === true)
    ).length;

    const bomInfo = document.getElementById('bomPartCount');
    if (bomInfo) bomInfo.textContent = `${totalParts} onderdelen (alle)`;

    const rsplInfo = document.getElementById('rsplPartCount');
    if (rsplInfo) rsplInfo.textContent = `${rsplCount} van ${totalParts} onderdelen (Cr + Con + kritieke Pr)`;
}

// Show Export Success
function showExportSuccess(filename, type) {
    elements.exportStatus.classList.remove('hidden');
    elements.exportStatusMessage.textContent = 
        `${type} succesvol geëxporteerd als "${filename}"`;
    
    setTimeout(() => {
        elements.exportStatus.classList.add('hidden');
    }, 5000);
}

// Utility: Format Date
function formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Utility: Validate API Key
function validateApiKey() {
    if (!AppState.apiKeys.gemini) {
        showNotification('Geen Gemini API key ingesteld. Ga naar Instellingen.', 'error');
        return false;
    }
    return true;
}

// Export functions for other modules
window.AppState = AppState;
window.showNotification = showNotification;
window.updateAnalysisDisplay = updateAnalysisDisplay;
window.showExportSuccess = showExportSuccess;
window.formatDate = formatDate;
window.validateApiKey = validateApiKey;
window.switchTab = switchTab;
