"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, X } from "lucide-react"

export function TestButton() {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    console.log('🔥 BOTÓN DE PRUEBA FUNCIONANDO!')
    setShowModal(true)
  }

  return (
    <>
      {/* Botón de prueba */}
      <Button 
        onClick={handleClick}
        className="bg-red-500 hover:bg-red-600 text-white mb-4"
      >
        <Eye className="h-4 w-4 mr-2" />
        🚨 BOTÓN DE PRUEBA - HAZ CLIC AQUÍ
      </Button>

      {/* Modal de prueba */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">¡MODAL FUNCIONANDO! 🎉</h2>
              <Button 
                onClick={() => setShowModal(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-700 mb-4">
              Si ves esto, el sistema de modales funciona perfectamente.
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm text-gray-600">
                <strong>Instrucciones:</strong>
              </p>
              <ol className="text-sm text-gray-600 mt-2 list-decimal list-inside">
                <li>Este botón de prueba funciona</li>
                <li>El CV debería funcionar igual</li>
                <li>Si no funciona, hay un problema específico con el CV</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

