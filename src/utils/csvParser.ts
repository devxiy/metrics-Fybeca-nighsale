import { SurveyRecord } from '../types';

export const parseCSV = (csvText: string): SurveyRecord[] => {
    const lines = csvText.split('\n');
    // const headers = lines[0].split(','); // Naive split, but sufficient if headers don't have commas

    // Helper to safely split CSV line handling quotes
    const splitLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    const data: SurveyRecord[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const currentRow = splitLine(line);

        // Filter out empty rows or trailing newlines
        // New CSV has roughly 9 columns
        if (currentRow.length < 5) continue;

        const record: SurveyRecord = {
            conocimiento_nightsale: currentRow[0]?.replace(/"/g, '').trim(),
            dia_conocimiento: currentRow[1]?.replace(/"/g, '').trim(),
            compra_nightsale: currentRow[2]?.replace(/"/g, '').trim(),
            frecuencia_compra: currentRow[3]?.replace(/"/g, '').trim(),
            canal_compra: currentRow[4]?.replace(/"/g, '').trim(),
            satisfaccion_compra: currentRow[5]?.replace(/"/g, '').trim(),
            recomendacion: currentRow[6]?.replace(/"/g, '').trim(),
            razon_no_compra: currentRow[7]?.replace(/"/g, '').trim(),
            ciudad: currentRow[8]?.replace(/"/g, '').trim() || currentRow[currentRow.length - 1]?.replace(/"/g, '').trim()
        };

        // Normalize city
        if (record.ciudad) {
            const c = record.ciudad.toLowerCase();
            if (c.includes('quito') || c.includes('uio') || c.includes('sangolqui') || c.includes('tumbaco') || c.includes('pichincha')) {
                record.ciudad = 'Quito';
            } else if (c.includes('guayaquil') || c.includes('gye') || c.includes('samborondon') || c.includes('daule') || c.includes('duran') || c.includes('milagro')) {
                record.ciudad = 'Guayaquil';
            } else {
                // Keep original or map to 'Otros'
                // For this dashboard we might want to group everything else or keep them as is.
                // Leaving as is for now, but maybe capitalization fix
                record.ciudad = record.ciudad.charAt(0).toUpperCase() + record.ciudad.slice(1).toLowerCase();
            }
        }

        data.push(record);
    }

    return data;
};
