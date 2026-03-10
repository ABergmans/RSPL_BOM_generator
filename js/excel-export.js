// PartsFinder Pro - Excel Export
// Handles XLSX file generation using SheetJS library

// Export data to Excel file
function exportToExcel(data, columns, filename, sheetName = 'Sheet1') {
    try {
        // Validate inputs
        if (!data || data.length === 0) {
            throw new Error('Geen data beschikbaar om te exporteren');
        }
        
        if (!columns || columns.length === 0) {
            throw new Error('Geen kolommen gedefinieerd');
        }
        
        console.log(`Exporting ${data.length} rows to Excel...`);
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Prepare data for worksheet
        const worksheetData = prepareWorksheetData(data, columns);
        
        // Create worksheet from data
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Apply styling
        applyWorksheetStyling(worksheet, columns.length, data.length);
        
        // Set column widths
        setColumnWidths(worksheet, columns);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, filename, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'binary'
        });
        
        console.log(`Excel file "${filename}" generated successfully`);
        return true;
        
    } catch (error) {
        console.error('Excel export error:', error);
        throw error;
    }
}

// Prepare worksheet data with headers
function prepareWorksheetData(data, columns) {
    const worksheetData = [];
    
    // Add header row
    worksheetData.push(columns);
    
    // Add data rows
    data.forEach(row => {
        const rowData = columns.map(column => {
            const value = row[column];
            
            // Handle undefined/null values
            if (value === undefined || value === null) {
                return '';
            }
            
            // Convert to appropriate type
            if (typeof value === 'number') {
                return value;
            }
            
            return String(value);
        });
        
        worksheetData.push(rowData);
    });
    
    return worksheetData;
}

// Apply styling to worksheet
function applyWorksheetStyling(worksheet, numColumns, numRows) {
    // Set range
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Style header row
    for (let col = 0; col < numColumns; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        
        if (!worksheet[cellAddress]) continue;
        
        // Apply header styling
        worksheet[cellAddress].s = {
            font: {
                bold: true,
                color: { rgb: "FFFFFF" },
                sz: 11
            },
            fill: {
                fgColor: { rgb: "2563EB" }
            },
            alignment: {
                horizontal: "center",
                vertical: "center",
                wrapText: true
            },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };
    }
    
    // Apply zebra striping to data rows
    for (let row = 1; row <= numRows; row++) {
        const isEven = row % 2 === 0;
        
        for (let col = 0; col < numColumns; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            
            if (!worksheet[cellAddress]) continue;
            
            worksheet[cellAddress].s = {
                alignment: {
                    vertical: "top",
                    wrapText: true
                },
                fill: {
                    fgColor: { rgb: isEven ? "F3F4F6" : "FFFFFF" }
                },
                border: {
                    top: { style: "thin", color: { rgb: "E5E7EB" } },
                    bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                    left: { style: "thin", color: { rgb: "E5E7EB" } },
                    right: { style: "thin", color: { rgb: "E5E7EB" } }
                }
            };
        }
    }
}

// Set column widths based on content
function setColumnWidths(worksheet, columns) {
    const colWidths = [];
    
    columns.forEach((column, index) => {
        // Calculate width based on header length
        let maxWidth = column.length;
        
        // Set minimum and maximum widths
        const minWidth = 10;
        const maxWidth_limit = 50;
        
        // Adjust width
        let width = Math.max(minWidth, Math.min(maxWidth, maxWidth_limit));
        
        // Special handling for certain column types
        if (column.includes('DESCRIPTION') || column.includes('REMARKS') || column.includes('NAME')) {
            width = 30;
        } else if (column.includes('NUMBER') || column.includes('CODE')) {
            width = 15;
        } else if (column.includes('QTY') || column.includes('QUANTITY')) {
            width = 12;
        } else if (column.includes('PRICE') || column.includes('COST')) {
            width = 12;
        } else if (column.includes('DATE') || column.includes('TIME')) {
            width = 12;
        } else if (column.includes('Y/N')) {
            width = 8;
        }
        
        colWidths.push({ wch: width });
    });
    
    worksheet['!cols'] = colWidths;
}

// Export data with custom formatting
function exportToExcelAdvanced(data, columns, filename, options = {}) {
    const {
        sheetName = 'Sheet1',
        headerColor = '2563EB',
        zebraStripe = true,
        freezeHeader = true,
        autoFilter = true
    } = options;
    
    try {
        const workbook = XLSX.utils.book_new();
        const worksheetData = prepareWorksheetData(data, columns);
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Apply styling
        applyWorksheetStyling(worksheet, columns.length, data.length);
        setColumnWidths(worksheet, columns);
        
        // Freeze header row
        if (freezeHeader) {
            worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
        }
        
        // Add auto filter
        if (autoFilter) {
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, filename);
        
        return true;
    } catch (error) {
        console.error('Advanced Excel export error:', error);
        throw error;
    }
}

// Export multiple sheets
function exportToExcelMultiSheet(sheets, filename) {
    try {
        const workbook = XLSX.utils.book_new();
        
        sheets.forEach(sheet => {
            const { data, columns, name } = sheet;
            const worksheetData = prepareWorksheetData(data, columns);
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
            
            applyWorksheetStyling(worksheet, columns.length, data.length);
            setColumnWidths(worksheet, columns);
            
            XLSX.utils.book_append_sheet(workbook, worksheet, name);
        });
        
        XLSX.writeFile(workbook, filename);
        return true;
    } catch (error) {
        console.error('Multi-sheet Excel export error:', error);
        throw error;
    }
}

// Export to CSV (alternative format)
function exportToCSV(data, columns, filename) {
    try {
        const worksheetData = prepareWorksheetData(data, columns);
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        
        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
    } catch (error) {
        console.error('CSV export error:', error);
        throw error;
    }
}

// Preview data before export
function previewExportData(data, columns, maxRows = 10) {
    console.log('Export Preview:');
    console.log('Columns:', columns.length);
    console.log('Total Rows:', data.length);
    console.log('Sample Data (first', maxRows, 'rows):');
    
    const preview = data.slice(0, maxRows);
    console.table(preview);
    
    return {
        columns: columns.length,
        rows: data.length,
        preview: preview
    };
}

// Validate export data
function validateExportData(data, columns) {
    const errors = [];
    
    if (!data || !Array.isArray(data)) {
        errors.push('Data must be an array');
    }
    
    if (data.length === 0) {
        errors.push('Data array is empty');
    }
    
    if (!columns || !Array.isArray(columns)) {
        errors.push('Columns must be an array');
    }
    
    if (columns.length === 0) {
        errors.push('Columns array is empty');
    }
    
    // Check if all data rows have values for all columns
    data.forEach((row, index) => {
        columns.forEach(column => {
            if (!(column in row)) {
                errors.push(`Row ${index + 1} missing column: ${column}`);
            }
        });
    });
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Format numbers for Excel
function formatNumber(value, decimals = 2) {
    if (typeof value === 'number') {
        return parseFloat(value.toFixed(decimals));
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : parseFloat(parsed.toFixed(decimals));
}

// Format dates for Excel
function formatDate(date) {
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return date;
}

// Export functions for use in other modules
window.exportToExcel = exportToExcel;
window.exportToExcelAdvanced = exportToExcelAdvanced;
window.exportToExcelMultiSheet = exportToExcelMultiSheet;
window.exportToCSV = exportToCSV;
window.previewExportData = previewExportData;
window.validateExportData = validateExportData;
window.formatNumber = formatNumber;
window.formatDate = formatDate;
