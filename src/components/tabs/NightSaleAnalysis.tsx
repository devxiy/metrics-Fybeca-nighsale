import React, { useMemo } from 'react';
import { Users, Target, ShoppingBag, Radio, ThumbsUp, XCircle, BarChart3, PieChart, Lightbulb, HelpCircle, MessageSquare } from 'lucide-react';
import { SurveyRecord } from '../../types';
import { StatCard, DonutChart, CustomBarChart, VerticalBarChart } from '../shared/Charts';

interface NightSaleAnalysisProps {
    data: SurveyRecord[];
}

export const NightSaleAnalysis: React.FC<NightSaleAnalysisProps> = ({ data }) => {
    const total = data.length;

    // --- Helper to clean and count data ---
    const getStats = (field: keyof SurveyRecord) => {
        const counts: Record<string, number> = {};
        data.forEach(r => {
            let val = r[field]?.trim();
            if (!val || val.toLowerCase() === 'nan' || val.toLowerCase() === 'null' || val === '') return;
            val = val.replace(/^"|"$/g, '');
            // Capitalize first letter
            val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
            counts[val] = (counts[val] || 0) + 1;
        });

        const totalValid = Object.values(counts).reduce((a, b) => a + b, 0);

        return Object.entries(counts)
            .map(([name, value]) => ({
                name,
                value,
                percent: (value / totalValid) * 100
            }))
            .sort((a, b) => b.value - a.value);
    };

    // --- Metrics & Charts Data ---

    // 1. Conocimiento
    const conocimientoStats = useMemo(() => getStats('conocimiento_nightsale'), [data]);
    const percentConocimiento = conocimientoStats.find(s => s.name.toLowerCase().startsWith('sí') || s.name.toLowerCase().startsWith('si'))?.percent || 0;

    // 2. Dia Correcto
    const diaStats = useMemo(() => getStats('dia_conocimiento'), [data]);

    // 3. Compra
    const compraStats = useMemo(() => getStats('compra_nightsale'), [data]);
    const percentCompra = compraStats.find(s => s.name.toLowerCase().startsWith('sí') || s.name.toLowerCase().startsWith('si'))?.percent || 0;

    // 4. Frecuencia
    const frecuenciaStats = useMemo(() => getStats('frecuencia_compra'), [data]);

    // 5. Canal
    const canalStats = useMemo(() => getStats('canal_compra'), [data]);

    // 6. Satisfaccion
    const satisfaccionStats = useMemo(() => getStats('satisfaccion_compra'), [data]);

    // 7. Recomendacion (Distribution)
    const recomendacionStats = useMemo(() => getStats('recomendacion'), [data]);
    const avgRecomendacion = useMemo(() => {
        let sum = 0;
        let count = 0;
        data.forEach(r => {
            const val = parseFloat(r.recomendacion);
            if (!isNaN(val)) {
                sum += val;
                count++;
            }
        });
        return count ? (sum / count).toFixed(1) : "0";
    }, [data]);

    // 8. Razones No Compra
    const noCompraStats = useMemo(() => getStats('razon_no_compra'), [data]);

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Encuestados" value={total} color="bg-gradient-to-br from-indigo-50 to-indigo-100" />
                <StatCard icon={Target} label="Conocimiento" value={`${percentConocimiento.toFixed(1)}%`} color="bg-gradient-to-br from-green-50 to-green-100" />
                <StatCard icon={ShoppingBag} label="Conversión" value={`${percentCompra.toFixed(1)}%`} color="bg-gradient-to-br from-blue-50 to-blue-100" />
                <StatCard icon={ThumbsUp} label="Recomendación Prom." value={`${avgRecomendacion}/5`} color="bg-gradient-to-br from-yellow-50 to-yellow-100" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8 mb-6">Detalle de Resultados por Pregunta</h2>

            {/* PREGUNTA 1 & 2: Conocimiento y Día */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DonutChart
                    data={conocimientoStats}
                    title="1. ¿Has escuchado o visto alguna promoción llamada 'Night Sale'?"
                    icon={Radio}
                    total={total}
                />
                <CustomBarChart
                    data={diaStats.slice(0, 7)}
                    title="2. Según tu conocimiento, ¿cuándo aplica la promoción?"
                    xKey="percent"
                    yKey="name"
                    icon={<HelpCircle className="w-5 h-5 text-gray-500" />}
                    color="#E30613"
                />
            </div>

            {/* PREGUNTA 3 & 4: Compra y Frecuencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DonutChart
                    data={compraStats}
                    title="3. ¿Has comprado en fybeca.com durante Night Sale?"
                    icon={ShoppingBag}
                    total={total}
                />
                <VerticalBarChart
                    data={frecuenciaStats}
                    title="4. ¿Con qué frecuencia compras aprovechando Night Sale?"
                    xKey="name"
                    yKey="percent"
                    icon={<BarChart3 className="w-5 h-5 text-gray-500" />}
                    color="#00338D"
                />
            </div>

            {/* PREGUNTA 5 & 6: Canal y Satisfacción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DonutChart
                    data={canalStats}
                    title="5. ¿Por cuál de estos canales has generado más compras?"
                    icon={PieChart}
                    total={canalStats.reduce((acc, curr) => acc + curr.value, 0)}
                />
                <CustomBarChart
                    data={satisfaccionStats}
                    title="6. ¿Cómo calificarías tu experiencia de compra?"
                    xKey="percent"
                    yKey="name"
                    icon={<ThumbsUp className="w-5 h-5 text-gray-500" />}
                    color="#10B981"
                />
            </div>

            {/* PREGUNTA 7 & 8: Recomendación y Razones No Compra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VerticalBarChart
                    data={recomendacionStats.sort((a, b) => parseInt(a.name) - parseInt(b.name))}
                    title="7. Del 1 al 5, ¿qué tanto recomendarías comprar en Night Sale?"
                    xKey="name"
                    yKey="percent"
                    icon={<MessageSquare className="w-5 h-5 text-gray-500" />}
                    color="#F59E0B"
                />
                <CustomBarChart
                    data={noCompraStats.slice(0, 10)}
                    title="8. ¿Por qué no has comprado en Night Sale?"
                    xKey="percent"
                    yKey="name"
                    icon={<XCircle className="w-5 h-5 text-gray-500" />}
                    color="#EF4444"
                    yAxisWidth={180}
                />
            </div>

            {/* Insights Finales */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="w-6 h-6 mr-2 text-yellow-600" />
                    Conclusiones Clave
                </h3>
                <div className="space-y-3">
                    <p className="text-gray-700">
                        <span className="font-bold text-indigo-900">• Oportunidad de Comunicación:</span> Aunque el <strong>{percentConocimiento.toFixed(1)}%</strong> conoce la promoción, es vital reforzar el "Martes" como día clave, ya que hay dispersión en las respuestas sobre cuándo aplica.
                    </p>
                    <p className="text-gray-700">
                        <span className="font-bold text-indigo-900">• Barreras de Entrada:</span> La principal razón de no compra ("{noCompraStats.length > 0 ? noCompraStats[0].name : 'N/A'}") indica una necesidad de revisar la oferta de valor o la comunicación de beneficios económicos.
                    </p>
                    <p className="text-gray-700">
                        <span className="font-bold text-indigo-900">• Calidad del Servicio:</span> La satisfacción predominante es "{satisfaccionStats.length > 0 ? satisfaccionStats[0].name : 'N/A'}", lo que respalda la operatividad actual de los canales digitales.
                    </p>
                </div>
            </div>
        </div>
    );
};
