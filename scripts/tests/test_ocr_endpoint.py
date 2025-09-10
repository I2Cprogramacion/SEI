#!/usr/bin/env python3
"""
Script para probar el endpoint de OCR sin autenticación
"""

import requests
import json
import os
import sys

def test_ocr_endpoint():
    """Probar el endpoint de OCR sin token de autenticación"""
    
    # URL del endpoint
    url = "http://localhost:3000/api/ocr"
    
    # Archivo PDF de prueba
    pdf_path = "../perfil-unico(Dynhora-Ramirez) (1).pdf"
    
    if not os.path.exists(pdf_path):
        print("❌ Archivo PDF de prueba no encontrado:", pdf_path)
        return False
    
    print("🧪 Probando endpoint de OCR sin autenticación...")
    print(f"📄 Archivo: {pdf_path}")
    print(f"🌐 URL: {url}")
    print("=" * 50)
    
    try:
        # Preparar archivo para envío
        with open(pdf_path, 'rb') as f:
            files = {'file': (os.path.basename(pdf_path), f, 'application/pdf')}
            
            print("🔄 Enviando archivo al endpoint...")
            response = requests.post(url, files=files, timeout=30)
        
        print(f"📊 Código de respuesta: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Respuesta exitosa!")
            print(f"📋 Campos extraídos: {result.get('total_fields', 0)}")
            print(f"📝 Archivo procesado: {result.get('filename', 'N/A')}")
            
            if 'data' in result:
                print("\n📋 Datos extraídos:")
                print("-" * 30)
                for field, value in result['data'].items():
                    if value:
                        print(f"  {field}: {value}")
                    else:
                        print(f"  {field}: (no encontrado)")
            
            return True
        else:
            print("❌ Error en la respuesta:")
            try:
                error_data = response.json()
                print(f"   Mensaje: {error_data.get('error', 'Error desconocido')}")
            except:
                print(f"   Respuesta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor Next.js")
        print("   Asegúrate de que esté ejecutándose: npm run dev")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout - el servidor tardó demasiado en responder")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_pdf_processor_server():
    """Probar si el servidor de procesamiento de PDFs está funcionando"""
    
    print("\n🔍 Verificando servidor de procesamiento de PDFs...")
    
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            print("✅ Servidor de procesamiento de PDFs funcionando")
            return True
        else:
            print(f"⚠️ Servidor respondió con código: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Servidor de procesamiento de PDFs no está ejecutándose")
        print("   Ejecuta: cd scripts && ./start_pdf_server.sh")
        return False
    except Exception as e:
        print(f"❌ Error verificando servidor: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas del endpoint de OCR")
    print("=" * 60)
    
    # Verificar servidor de procesamiento
    server_ok = test_pdf_processor_server()
    
    if not server_ok:
        print("\n⚠️ El servidor de procesamiento de PDFs debe estar ejecutándose")
        print("   Ejecuta: cd scripts && ./start_pdf_server.sh")
        return 1
    
    # Probar endpoint de OCR
    ocr_ok = test_ocr_endpoint()
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    print(f"  Servidor de procesamiento: {'✅ OK' if server_ok else '❌ FAIL'}")
    print(f"  Endpoint de OCR: {'✅ OK' if ocr_ok else '❌ FAIL'}")
    
    if server_ok and ocr_ok:
        print("\n🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.")
        return 0
    else:
        print("\n⚠️ Algunas pruebas fallaron. Revisa los errores arriba.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
