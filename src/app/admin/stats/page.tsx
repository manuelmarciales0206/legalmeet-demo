'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardData {
  general: {
    totalCases: number;
    casesToday: number;
    casesThisWeek: number;
    activeConversations: number;
    totalRevenue: number;
    avgRevenue: number;
  };
  categories: Array<{ name: string; value: number }>;
  urgencies: Array<{ name: string; value: number; color: string }>;
  recentCases: Array<{
    radicado: string;
    categoria: string;
    urgencia: string;
    timestamp: string;
    revenue: number;
  }>;
  casesByDay: Array<{ day: string; cases: number }>;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No hay datos disponibles</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `$${Math.round(amount).toLocaleString('es-CO')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Panel de Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">
                Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Casos"
            value={data.general.totalCases}
            icon="📋"
            color="blue"
          />
          <StatCard
            title="Casos Hoy"
            value={data.general.casesToday}
            icon="📅"
            color="green"
          />
          <StatCard
            title="Conversaciones Activas"
            value={data.general.activeConversations}
            icon="💬"
            color="purple"
          />
          <StatCard
            title="Ingresos Estimados"
            value={formatCurrency(data.general.totalRevenue)}
            icon="💰"
            color="yellow"
            subtitle={`Promedio: ${formatCurrency(data.general.avgRevenue)}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📂 Casos por Categoría</h2>
            <div className="space-y-3">
              {data.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-900">{cat.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${data.general.totalCases > 0 ? (cat.value / data.general.totalCases) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {data.categories.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay casos registrados aún</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Distribución de Urgencias</h2>
            <div className="space-y-4">
              {data.urgencies.map((urg, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: urg.color }}
                  >
                    {urg.value}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{urg.name}</p>
                    <p className="text-sm text-gray-500">
                      {data.general.totalCases > 0
                        ? Math.round((urg.value / data.general.totalCases) * 100)
                        : 0}% del total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📈 Casos por Día (Última Semana)</h2>
          <div className="flex items-end justify-between gap-2 h-64">
            {data.casesByDay.map((day, idx) => {
              const maxCases = Math.max(...data.casesByDay.map(d => d.cases), 1);
              const height = (day.cases / maxCases) * 100;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full">
                    <div
                      className="bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700 cursor-pointer"
                      style={{ height: `${Math.max(height * 2, 4)}px` }}
                      title={`${day.cases} casos`}
                    />
                    <div className="absolute -top-6 left-0 right-0 text-center">
                      <span className="text-sm font-bold text-gray-900">{day.cases}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🕐 Últimos Casos Clasificados</h2>
          {data.recentCases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Radicado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Urgencia</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Comisión</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCases.map((caso, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono text-gray-900">{caso.radicado}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{caso.categoria}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            caso.urgencia === 'ALTA'
                              ? 'bg-red-100 text-red-700'
                              : caso.urgencia === 'MEDIA'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {caso.urgencia}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{caso.timestamp}</td>
                      <td className="py-3 px-4 text-sm font-medium text-right text-gray-900">
                        {formatCurrency(caso.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay casos registrados aún. Completa algunas conversaciones por WhatsApp para ver datos aquí.</p>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  subtitle?: string;
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
    </div>
  );
}