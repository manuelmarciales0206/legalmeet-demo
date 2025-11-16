'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { abogados } from '@/data/mockData';

export default function MatchingPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [selectedLawyer, setSelectedLawyer] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleSelectLawyer = (lawyerId: string) => {
    setSelectedLawyer(lawyerId);
    
    setTimeout(() => {
      localStorage.setItem('selectedLawyer', lawyerId);
      alert('¡Abogado seleccionado! En la demo completa, aquí irías a agendar la cita.');
      router.push('/dashboard');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Buscando los mejores abogados...</h2>
          <p className="text-gray-600">Analizando tu caso y comparando con abogados especializados</p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Procesando...</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const suggestedLawyers = abogados.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <h1 className="text-2xl font-bold text-gray-900">Abogados Sugeridos</h1>
              <p className="text-sm text-gray-600">Hemos encontrado los mejores profesionales para tu caso</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-green-900 text-lg">¡Matching exitoso!</h3>
              <p className="text-green-700">Hemos seleccionado 3 abogados especializados que pueden ayudarte.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {suggestedLawyers.map((lawyer, index) => {
            const isSelected = selectedLawyer === lawyer.id;
            
            return (
              <div
                key={lawyer.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition ${
                  isSelected
                    ? 'border-blue-500 ring-4 ring-blue-100'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {index === 0 && (
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold py-2 px-4 rounded-t-xl text-center">
                    ⭐ MEJOR MATCH
                  </div>
                )}

                <div className="p-6">
                  <div className="text-center mb-4">
                    <img
                      src={lawyer.foto}
                      alt={lawyer.nombre}
                      className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-blue-100"
                    />
                    <h3 className="text-xl font-bold text-gray-900">{lawyer.nombre}</h3>
                    <p className="text-sm text-blue-600 font-semibold">{lawyer.especialidad}</p>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(lawyer.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">{lawyer.rating}</span>
                    <span className="text-sm text-gray-500">({lawyer.totalReviews})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{lawyer.experiencia}</p>
                      <p className="text-xs text-gray-600">Años experiencia</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{lawyer.casosResueltos}</p>
                      <p className="text-xs text-gray-600">Casos resueltos</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{lawyer.descripcion}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>{lawyer.universidad}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <span>{lawyer.idiomas.join(', ')}</span>
                    </div>
                  </div>

                  <div className={`text-center py-2 px-3 rounded-lg mb-4 ${
                    lawyer.disponibilidad === 'Inmediata'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <p className="text-sm font-semibold">
                      📅 Disponible: {lawyer.disponibilidad}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Tarifa por consulta</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${lawyer.tarifa.toLocaleString('es-CO')}
                      <span className="text-sm font-normal text-gray-600"> COP</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">60 minutos de consulta</p>
                  </div>

                  <button
                    onClick={() => handleSelectLawyer(lawyer.id)}
                    disabled={selectedLawyer !== null}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : selectedLawyer
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Seleccionado
                      </span>
                    ) : (
                      'Seleccionar abogado'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Pago 100% Seguro</h3>
              <p className="text-sm text-blue-800 mb-3">
                Tu pago queda retenido hasta que finalices exitosamente tu consulta. 
                Si no estás satisfecho, puedes solicitar reembolso en las primeras 24 horas.
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Garantía de satisfacción
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Datos protegidos y encriptados
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Abogados verificados y certificados
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}