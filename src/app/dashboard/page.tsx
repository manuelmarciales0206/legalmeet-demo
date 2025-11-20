'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PlatformStats {
  totalCases: number;
  activeConversations: number;
  totalLawyers: number;
  resolvedCases: number;
  topCategories: Array<{ name: string; count: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats] = useState<PlatformStats>({
    totalCases: 28,
    activeConversations: 12,
    totalLawyers: 45,
    resolvedCases: 156,
    topCategories: [
      { name: 'Derecho Laboral', count: 15 },
      { name: 'Derecho de Familia', count: 8 },
      { name: 'Derecho Penal', count: 5 },
    ]
  });

  const lawyers = [
    {
      id: 1,
      name: 'Dra. María González',
      specialty: 'Derecho Laboral',
      experience: '12 años',
      rating: 4.9,
      cases: 234,
      availability: 'Disponible',
      price: '$120,000',
      image: '👩‍⚖️'
    },
    {
      id: 2,
      name: 'Dr. Carlos Ramírez',
      specialty: 'Derecho Penal',
      experience: '15 años',
      rating: 4.8,
      cases: 189,
      availability: 'Disponible',
      price: '$180,000',
      image: '👨‍⚖️'
    },
    {
      id: 3,
      name: 'Dra. Ana Martínez',
      specialty: 'Derecho de Familia',
      experience: '10 años',
      rating: 5.0,
      cases: 156,
      availability: 'Disponible',
      price: '$100,000',
      image: '👩‍⚖️'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🏛️ LegalMeet</h1>
              <p className="text-blue-100 mt-1">Tu plataforma de asesoría legal en Colombia</p>
            </div>
            <button
              onClick={() => router.push('/cases/new')}
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition shadow-lg"
            >
              + Nuevo Caso
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Actividad de la Plataforma</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon="📋"
              label="Casos Totales"
              value={stats.totalCases}
              color="blue"
            />
            <StatCard
              icon="💬"
              label="Conversaciones Activas"
              value={stats.activeConversations}
              color="green"
            />
            <StatCard
              icon="⚖️"
              label="Abogados Certificados"
              value={stats.totalLawyers}
              color="purple"
            />
            <StatCard
              icon="✅"
              label="Casos Resueltos"
              value={stats.resolvedCases}
              color="yellow"
            />
          </div>
        </div>

        {/* Top Categories */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Categorías Más Solicitadas</h2>
          <div className="space-y-3">
            {stats.topCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className="font-medium text-gray-700">{cat.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{cat.count} casos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lawyers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">⚖️ Abogados Certificados</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Filtrar
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Ordenar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map(lawyer => (
              <div
                key={lawyer.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/cases/caso-${Date.now()}/matching`)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{lawyer.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{lawyer.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{lawyer.specialty}</p>
                    <p className="text-xs text-gray-500 mt-1">{lawyer.experience} de experiencia</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(lawyer.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{lawyer.rating}</span>
                  <span className="text-sm text-gray-500">({lawyer.cases} casos)</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      lawyer.availability === 'Disponible' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {lawyer.availability}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Desde</p>
                    <p className="text-lg font-bold text-gray-900">{lawyer.price}</p>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                  Ver Perfil
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">¿Necesitas asesoría legal?</h2>
          <p className="text-blue-100 mb-6">
            Conecta con abogados certificados en minutos. Simple, rápido y seguro.
          </p>
          <button
            onClick={() => router.push('/cases/new')}
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition shadow-lg"
          >
            Iniciar Consulta
          </button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-4 text-white`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}