import { useState, useEffect } from 'react';
import { parseCSV } from './utils/csvParser';
import { SurveyRecord } from './types';
import { NightSaleAnalysis } from './components/tabs/NightSaleAnalysis';

// --- CSV DATA LOADING ---
const EncuestaLaboral = () => {
    const [data, setData] = useState<SurveyRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch from public directory
                const response = await fetch('/Encuesta-Fybeca-NightSale-Enero-2026-2026-02-11-20-36-37.csv');
                if (!response.ok) {
                    throw new Error('Failed to load CSV file. Ensure it is in the public directory.');
                }
                const text = await response.text();
                const parsed = parseCSV(text);
                setData(parsed);
            } catch (err) {
                console.error(err);
                setError("Error cargando los datos. Asegúrate de que el archivo CSV está en la carpeta 'public'.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold animate-pulse">Cargando datos del estudio...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 mb-8 shadow-lg border border-indigo-800 flex flex-col md:flex-row items-center gap-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none"></div>
                    <img src="/metrics-logo.jpg" alt="Logo" className="h-24 w-auto rounded-xl shadow-md z-10 border-2 border-white/20" />
                    <div className="z-10 text-center md:text-left">
                        <h1 className="text-4xl font-bold italic mb-2 tracking-tight">Estudio Night Sale</h1>
                        <p className="text-indigo-200 text-lg font-light">Análisis de percepción, conversión y satisfacción - Fybeca</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[600px] border border-gray-100">
                    <div className="p-8 bg-gray-50/30">
                        <NightSaleAnalysis data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncuestaLaboral;
