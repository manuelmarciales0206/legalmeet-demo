'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { casosDemo, citasDemo, statsDemo, abogados } from '@/data/mockData';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  const casosActivos = casosDemo.filter(c => c.estado !== 'COMPLETADO');
  const proximaCita = citasDemo.find(c => c.estado === 'CONFIRMADA');
  const abogadoCita = proximaCita ? abogados.find(a => a.id === proximaCita.abogadoId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xl">⚖️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">LegalMeet</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`}
                  alt={user.nombre}
                  className="w-10 h-10 rounded-full"
                />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{user.nombre}</p>
                  <p className="text-gray-500">Cliente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Bienvenido, {user.nombre.split(' ')[0]}! 👋</h2>
          <p className="text-blue-100 mb-6">¿En qué podemos ayudarte hoy?</p>
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear nuevo caso
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Casos Activos</p>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsDemo.casosActivos}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Completados</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsDemo.casosCompletados}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Próximas Citas</p>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsDemo.proximasCitas}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Horas Consultoría</p>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{statsDemo.horasConsultoria}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Casos Activos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Casos Activos</h3>
            <div className="space-y-4">
              {casosActivos.map((caso) => (
                <div key={caso.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{caso.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">{caso.categoria}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      caso.urgencia === 'ALTA' ? 'bg-red-100 text-red-700' :
                      caso.urgencia === 'MEDIA' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {caso.urgencia === 'ALTA' ? 'Urgente' : caso.urgencia === 'MEDIA' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{caso.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Creado {new Date(caso.fechaCreacion).toLocaleDateString('es-CO')}
                    </span>
                    {caso.estado === 'EN_MATCHING' && (
                      <Link
                        href={`/cases/${caso.id}/matching`}
                        className="text-sm text-blue-600 font-semibold hover:underline"
                      >
                        Ver abogados →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próxima Cita */}
          {proximaCita && abogadoCita && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Próxima Cita</h3>
              <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={abogadoCita.foto}
                    alt={abogadoCita.nombre}
                    className="w-16 h-16 rounded-full border-2 border-blue-400"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{abogadoCita.nombre}</h4>
                    <p className="text-sm text-gray-600">{abogadoCita.especialidad}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-semibold">{abogadoCita.rating}</span>
                      <span className="text-xs text-gray-500">({abogadoCita.totalReviews} reseñas)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900 font-medium">
                      {new Date(proximaCita.fecha).toLocaleDateString('es-CO', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-900 font-medium">{proximaCita.hora} - {proximaCita.duracion} minutos</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-900 font-medium">Videollamada</span>
                  </div>
                </div>

                <Link
                  href={`/sessions/${proximaCita.id}`}
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Unirse a la sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}