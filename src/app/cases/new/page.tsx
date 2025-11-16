'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fromWhatsApp, setFromWhatsApp] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descripcion: '',
    urgencia: 'MEDIA' as 'BAJA' | 'MEDIA' | 'ALTA',
  });

  // Cargar datos del caso si vienen de WhatsApp (sin useSearchParams)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      
      if (dataParam) {
        try {
          const caseData = JSON.parse(decodeURIComponent(dataParam));
          
          console.log('📲 Datos recibidos de WhatsApp:', caseData);
          
          setFormData({
            titulo: caseData.titulo || '',
            categoria: caseData.categoria || '',
            descripcion: caseData.descripcion || '',
            urgencia: caseData.urgencia || 'MEDIA',
          });
          
          setFromWhatsApp(true);
          
        } catch (error) {
          console.error('❌ Error parsing case data:', error);
        }
      }
    }
  }, []);

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
      {fromWhatsApp && (
        <div className="bg-green-500 text-white px-6 py-3 text-center font-semibold animate-fadeIn">
          ✅ Caso cargado desde WhatsApp - Revisa los datos y continúa
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Caso</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Volver
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título del caso *
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Despido injustificado"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría legal *
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una categoría</option>
                <option value="Derecho Laboral">💼 Derecho Laboral</option>
                <option value="Derecho Penal">⚖️ Derecho Penal</option>
                <option value="Derecho de Familia">👨‍👩‍👧 Derecho de Familia</option>
                <option value="Derecho Civil">🏛️ Derecho Civil</option>
                <option value="Derecho Comercial">💰 Derecho Comercial</option>
                <option value="Derecho de Tránsito">🚗 Derecho de Tránsito</option>
                <option value="Derecho Inmobiliario">🏠 Derecho Inmobiliario</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción detallada *
              </label>
              <textarea
                required
                rows={6}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe tu situación legal con el mayor detalle posible..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Mínimo 50 caracteres. Incluye fechas, nombres y hechos relevantes.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nivel de urgencia *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgencia: 'BAJA' })}
                  className={`p-4 border-2 rounded-lg font-semibold transition ${
                    formData.urgencia === 'BAJA'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-green-300'
                  }`}
                >
                  🟢 Baja
                  <p className="text-xs font-normal mt-1">Puedo esperar semanas</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgencia: 'MEDIA' })}
                  className={`p-4 border-2 rounded-lg font-semibold transition ${
                    formData.urgencia === 'MEDIA'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 text-gray-700 hover:border-yellow-300'
                  }`}
                >
                  🟡 Media
                  <p className="text-xs font-normal mt-1">Necesito en días</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgencia: 'ALTA' })}
                  className={`p-4 border-2 rounded-lg font-semibold transition ${
                    formData.urgencia === 'ALTA'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                >
                  🔴 Alta
                  <p className="text-xs font-normal mt-1">Es urgente</p>
                </button>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Buscar Abogados →'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="text-blue-600 text-xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">¿Qué sigue?</h3>
              <p className="text-sm text-blue-700">
                Una vez que envíes este formulario, nuestro sistema buscará los 3 abogados más 
                adecuados para tu caso según especialidad, experiencia y disponibilidad.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}