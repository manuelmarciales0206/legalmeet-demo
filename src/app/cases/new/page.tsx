'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { especialidades } from '@/data/mockData';

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    urgencia: 'MEDIA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const casoId = 'caso-' + Date.now();
      localStorage.setItem('currentCase', JSON.stringify({ id: casoId, ...formData }));
      router.push(`/cases/${casoId}/matching`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Caso</h1>
              <p className="text-sm text-gray-600">Cuéntanos sobre tu situación legal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="titulo" className="block text-sm font-semibold text-gray-900 mb-2">
                Título del caso *
              </label>
              <input
                id="titulo"
                type="text"
                placeholder="Ej: Despido injustificado, Divorcio de mutuo acuerdo..."
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-semibold text-gray-900 mb-2">
                Categoría legal *
              </label>
              <select
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="">Selecciona una especialidad...</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.nombre}>
                    {esp.icono} {esp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción detallada *
              </label>
              <textarea
                id="descripcion"
                rows={6}
                placeholder="Describe tu situación legal con el mayor detalle posible..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Nivel de urgencia *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgencia: 'BAJA' })}
                  className={`p-4 border-2 rounded-lg transition ${
                    formData.urgencia === 'BAJA'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🟢</div>
                    <p className="font-semibold text-gray-900">Baja</p>
                    <p className="text-xs text-gray-600 mt-1">Puedo esperar</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgencia: 'MEDIA' })}
                  className={`p-4 border-2 rounded-lg transition ${
                    formData.urgencia === 'MEDIA'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🟡</div>
                    <p className="font-semibold text-gray-900">Media</p>
                    <p className="text-xs text-gray-600 mt-1">Respuesta pronto</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgencia: 'ALTA' })}
                  className={`p-4 border-2 rounded-lg transition ${
                    formData.urgencia === 'ALTA'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔴</div>
                    <p className="font-semibold text-gray-900">Alta</p>
                    <p className="text-xs text-gray-600 mt-1">Es urgente</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    ¿Qué sucede después?
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Te mostraremos los 3 mejores abogados para tu caso</li>
                    <li>• Podrás revisar sus perfiles y calificaciones</li>
                    <li>• Seleccionas al abogado que prefieras</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Buscando abogados...' : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}