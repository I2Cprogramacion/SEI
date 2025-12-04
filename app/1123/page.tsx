export default function Page1123() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center p-8">
      <div className="max-w-4xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            🎉 ¡Encontraste el Easter Egg! 🎉
          </h1>
          <p className="text-xl text-purple-300">
            Bienvenido a la página secreta de SEI
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 space-y-6">
          <h2 className="text-3xl font-semibold text-purple-300">
            Los Creadores
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-400/30">
              <h3 className="text-2xl font-bold text-purple-300 mb-2">Dairon Tarín</h3>
              <p className="text-gray-300">
                Arquitecto de sistemas y visionario del proyecto. Especialista en bases de datos y optimización de rendimiento.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-400/30">
              <h3 className="text-2xl font-bold text-blue-300 mb-2">Jesús Ojeda</h3>
              <p className="text-gray-300">
                Maestro del backend y APIs. Experto en integración de servicios y arquitectura escalable.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-xl p-6 border border-pink-400/30">
              <h3 className="text-2xl font-bold text-pink-300 mb-2">Derek Siqueiros</h3>
              <p className="text-gray-300">
                Genio del frontend y experiencia de usuario. Especialista en diseño y animaciones que cautivan.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-purple-500/20">
          <p className="text-lg text-purple-200 leading-relaxed">
            <span className="font-semibold text-purple-300">SEI</span> nació de la pasión por crear herramientas 
            que impulsen la investigación científica. Tres desarrolladores unidos por la visión de transformar 
            la manera en que los investigadores colaboran, publican y se conectan. 
          </p>
          <p className="text-sm text-purple-300 mt-4">
            💡 "La innovación empieza con la colaboración"
          </p>
        </div>

        <p className="text-sm text-gray-400 pt-4">
          Ahora que conoces nuestro secreto, ¡eres parte de la familia SEI! 🚀
        </p>
      </div>
    </div>
  );
}
