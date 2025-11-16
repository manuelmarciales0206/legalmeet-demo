'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xl">⚖️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">LegalMeet</h1>
            </div>
            <Link
              href="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span>🚀</span>
            <span>Asesoría legal desde WhatsApp</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Encuentra tu abogado
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              en minutos
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Conectamos personas con abogados certificados para consultas por chat, audio y videollamada. 
            Simple, rápido y 100% seguro.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
            >
              Comenzar ahora →
            </Link>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition">
              Ver cómo funciona
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">500+</p>
            <p className="text-gray-600 mt-2">Abogados verificados</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">1,000+</p>
            <p className="text-gray-600 mt-2">Consultas realizadas</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">4.9⭐</p>
            <p className="text-gray-600 mt-2">Calificación promedio</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">¿Cómo funciona?</h2>
          <p className="text-xl text-gray-600 text-center mb-16">En 4 simples pasos</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="font-bold text-lg mb-2">1. Describe tu caso</h3>
              <p className="text-gray-600 text-sm">Cuéntanos tu situación legal en pocos minutos</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-bold text-lg mb-2">2. Te conectamos</h3>
              <p className="text-gray-600 text-sm">Nuestro algoritmo encuentra los mejores abogados</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="font-bold text-lg mb-2">3. Agenda tu cita</h3>
              <p className="text-gray-600 text-sm">Elige fecha, hora y tipo de consulta</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="font-bold text-lg mb-2">4. Recibe asesoría</h3>
              <p className="text-gray-600 text-sm">Consulta por WhatsApp, audio o video</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Todas las especialidades</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '💼', name: 'Derecho Laboral' },
              { icon: '👨‍👩‍👧', name: 'Derecho de Familia' },
              { icon: '⚖️', name: 'Derecho Penal' },
              { icon: '🏛️', name: 'Derecho Civil' },
              { icon: '💰', name: 'Derecho Comercial' },
              { icon: '📊', name: 'Derecho Tributario' },
              { icon: '🏠', name: 'Derecho Inmobiliario' },
              { icon: '🚗', name: 'Derecho de Tránsito' },
            ].map((spec) => (
              <div key={spec.name} className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:border-blue-300 hover:shadow-lg transition">
                <div className="text-4xl mb-2">{spec.icon}</div>
                <p className="font-semibold text-gray-900">{spec.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para resolver tu caso legal?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de colombianos que ya confían en LegalMeet
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-xl"
          >
            Comenzar ahora - Es gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-lg">⚖️</span>
                </div>
                <span className="font-bold text-xl">LegalMeet</span>
              </div>
              <p className="text-gray-400 text-sm">
                Democratizando el acceso a servicios legales en Colombia
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Cómo funciona</a></li>
                <li><a href="#" className="hover:text-white">Para abogados</a></li>
                <li><a href="#" className="hover:text-white">Preguntas frecuentes</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Términos y condiciones</a></li>
                <li><a href="#" className="hover:text-white">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-white">Habeas Data</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 LegalMeet - Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}