export default function Page1123() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            🎮 Easter Egg Desbloqueado 🎮
          </h1>
          <p className="text-xl text-purple-300">
            Encontraste a los verdaderos culpables...
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 space-y-6">
          <h2 className="text-3xl font-semibold text-purple-300 text-center">
            Los Devs de Prácticas
          </h2>
          
          <p className="text-center text-gray-300 text-sm">
            (Tres estudiantes haciendo su servicio social que de alguna forma terminaron programando esto)
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-400/30 space-y-3">
              <h3 className="text-2xl font-bold text-purple-300">Daron Tarín</h3>
              <p className="text-sm text-gray-400">El que arregla lo que los otros dos rompen</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">📧 daron.tarin@i2c.com.mx</p>
                <p className="text-gray-300">💼 "Full Stack" (= hace de todo)</p>
                <p className="text-purple-300 italic">* Promedio de café: 5 tazas/día</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-400/30 space-y-3">
              <h3 className="text-2xl font-bold text-blue-300">Jesús Ojeda</h3>
              <p className="text-sm text-gray-400">El artista del código</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">📧 jgeraojeda@gmail.com</p>
                <p className="text-gray-300">💼 Frontend + UI/UX</p>
                <p className="text-blue-300 italic">* "Ese padding está mal"</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-xl p-6 border border-pink-400/30 space-y-3">
              <h3 className="text-2xl font-bold text-pink-300">Derek Siqueiros</h3>
              <p className="text-sm text-gray-400">El mago de los bugs imposibles</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">📧 drksh2015@gmail.com</p>
                <p className="text-gray-300">💼 Backend + Base de datos</p>
                <p className="text-pink-300 italic">* "¿Ya probaste reiniciar?"</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-purple-500/20 space-y-4">
          <h3 className="text-xl font-semibold text-purple-300 text-center">
            Detrás de Escenas 🎬
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>• <span className="text-purple-300">Commits a las 3 AM:</span> Más de los que nos gustaría admitir</li>
            <li>• <span className="text-blue-300">Horas en Stack Overflow:</span> Incontables</li>
            <li>• <span className="text-pink-300">Bugs arreglados:</span> 287 (y contando...)</li>
            <li>• <span className="text-green-300">Litros de café consumidos:</span> Suficientes para llenar una alberca pequeña</li>
          </ul>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            Este sitio fue desarrollado como parte de nuestro servicio social para SECCTI
          </p>
          <p className="text-xs text-purple-400">
            Si encuentras un bug, probablemente ya lo sabemos (y ya estamos llorando por él)
          </p>
          <p className="text-xs text-gray-500 mt-4">
            🎯 Logro desbloqueado: "Encontraste a los devs" +100 XP
          </p>
        </div>
      </div>
    </div>
  );
}
