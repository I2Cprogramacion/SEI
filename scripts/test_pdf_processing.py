#!/usr/bin/env python3
"""
Script de prueba para el procesador de PDFs
"""

import sys
import os
import json
from pdf_processor import PerfilUnicoProcessor

def test_pdf_processing():
    """Probar el procesamiento de PDFs"""
    
    # Ruta al PDF de prueba
    pdf_path = "../perfil-unico(Dynhora-Ramirez) (1).pdf"
    
    if not os.path.exists(pdf_path):
        print("❌ Archivo PDF de prueba no encontrado:", pdf_path)
        print("   Asegúrate de que el archivo esté en la raíz del proyecto")
        return False
    
    print("🧪 Iniciando prueba de procesamiento de PDFs...")
    print(f"📄 Archivo: {pdf_path}")
    print("=" * 50)
    
    try:
        # Crear procesador
        processor = PerfilUnicoProcessor()
        
        # Procesar PDF
        print("🔄 Procesando PDF...")
        data = processor.process_pdf(pdf_path)
        
        # Mostrar resultados
        print("\n✅ Procesamiento completado!")
        print(f"📊 Campos extraídos: {len(data)}")
        print("\n📋 Datos extraídos:")
        print("-" * 30)
        
        for field, value in data.items():
            if value:
                print(f"  {field}: {value}")
            else:
                print(f"  {field}: (no encontrado)")
        
        # Validar campos importantes
        important_fields = ['nombre_completo', 'curp', 'correo']
        found_important = sum(1 for field in important_fields if data.get(field))
        
        print(f"\n📈 Resumen:")
        print(f"  - Campos totales: {len(data)}")
        print(f"  - Campos importantes encontrados: {found_important}/{len(important_fields)}")
        print(f"  - Tasa de éxito: {(found_important/len(important_fields)*100):.1f}%")
        
        # Guardar resultados en archivo
        output_file = "test_results.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Resultados guardados en: {output_file}")
        
        return found_important >= 2  # Considerar exitoso si encuentra al menos 2 campos importantes
        
    except Exception as e:
        print(f"\n❌ Error durante el procesamiento: {e}")
        return False

def test_server_connection():
    """Probar conexión con el servidor FastAPI"""
    try:
        import requests
        
        print("\n🌐 Probando conexión con servidor...")
        response = requests.get("http://localhost:8001/health", timeout=5)
        
        if response.status_code == 200:
            print("✅ Servidor respondiendo correctamente")
            return True
        else:
            print(f"⚠️ Servidor respondió con código: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor. ¿Está ejecutándose?")
        print("   Ejecuta: ./start_pdf_server.sh")
        return False
    except ImportError:
        print("⚠️ requests no instalado. Instalando...")
        os.system("pip install requests")
        return test_server_connection()
    except Exception as e:
        print(f"❌ Error probando servidor: {e}")
        return False

def main():
    """Función principal de prueba"""
    print("🚀 Iniciando pruebas del sistema de procesamiento de PDFs")
    print("=" * 60)
    
    # Prueba 1: Procesamiento directo
    pdf_success = test_pdf_processing()
    
    # Prueba 2: Conexión con servidor
    server_success = test_server_connection()
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    print(f"  Procesamiento de PDF: {'✅ PASS' if pdf_success else '❌ FAIL'}")
    print(f"  Conexión con servidor: {'✅ PASS' if server_success else '❌ FAIL'}")
    
    if pdf_success and server_success:
        print("\n🎉 ¡Todas las pruebas pasaron! El sistema está listo para usar.")
        return 0
    else:
        print("\n⚠️ Algunas pruebas fallaron. Revisa los errores arriba.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
