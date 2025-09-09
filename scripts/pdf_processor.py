#!/usr/bin/env python3
"""
Procesador de PDFs para extraer datos del Perfil Único (PU)
Usa PyMuPDF para extraer texto y pytesseract para OCR en imágenes
"""

import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import re
import json
import sys
from typing import Dict, List, Optional, Tuple
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerfilUnicoProcessor:
    """Procesador para extraer datos del Perfil Único usando OCR"""
    
    def __init__(self):
        # Configurar pytesseract (ajustar según tu instalación)
        # En macOS con Homebrew: pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'
        # En Linux: pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
        # En Windows: pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        pass
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extraer texto directamente del PDF usando PyMuPDF"""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += page.get_text()
            
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extrayendo texto del PDF: {e}")
            return ""
    
    def extract_images_from_pdf(self, pdf_path: str) -> List[Image.Image]:
        """Extraer imágenes del PDF para procesamiento OCR"""
        try:
            doc = fitz.open(pdf_path)
            images = []
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                image_list = page.get_images()
                
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    pix = fitz.Pixmap(doc, xref)
                    
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        img_data = pix.tobytes("png")
                        img_pil = Image.open(io.BytesIO(img_data))
                        images.append(img_pil)
                    else:  # CMYK: convert to RGB first
                        pix1 = fitz.Pixmap(fitz.csRGB, pix)
                        img_data = pix1.tobytes("png")
                        img_pil = Image.open(io.BytesIO(img_data))
                        images.append(img_pil)
                        pix1 = None
                    pix = None
            
            doc.close()
            return images
        except Exception as e:
            logger.error(f"Error extrayendo imágenes del PDF: {e}")
            return []
    
    def ocr_image(self, image: Image.Image) -> str:
        """Aplicar OCR a una imagen usando pytesseract"""
        try:
            # Configurar pytesseract para español
            text = pytesseract.image_to_string(image, lang='spa')
            return text
        except Exception as e:
            logger.error(f"Error en OCR: {e}")
            return ""
    
    def extract_data_from_text(self, text: str) -> Dict[str, str]:
        """Extraer datos específicos del texto usando expresiones regulares"""
        data = {}
        
        # Patrones de búsqueda para cada campo
        patterns = {
            'nombre_completo': [
                r'Nombre\s*completo[:\s]*(.+?)(?:\n|$)',
                r'Apellidos?\s*y\s*nombres?[:\s]*(.+?)(?:\n|$)',
                r'Dr\.?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+[A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)',
                r'Dra\.?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+[A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+)',
            ],
            'curp': [
                r'CURP[:\s]*([A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9])',
                r'Clave\s*Única\s*de\s*Registro\s*de\s*Población[:\s]*([A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9])',
            ],
            'rfc': [
                r'RFC[:\s]*([A-Z]{4}[0-9]{6}[A-Z0-9]{3})',
                r'Registro\s*Federal\s*de\s*Contribuyentes[:\s]*([A-Z]{4}[0-9]{6}[A-Z0-9]{3})',
            ],
            'no_cvu': [
                r'CVU[:\s]*([0-9]{6,})',
                r'Código\s*de\s*Validación\s*Única[:\s]*([0-9]{6,})',
                r'No\.?\s*CVU[:\s]*([0-9]{6,})',
            ],
            'correo': [
                r'Correo\s*electrónico[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
                r'Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
                r'E-mail[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
            ],
            'telefono': [
                r'Teléfono[:\s]*([0-9\s\-\(\)\+]{10,})',
                r'Tel[:\s]*([0-9\s\-\(\)\+]{10,})',
                r'Teléfono\s*celular[:\s]*([0-9\s\-\(\)\+]{10,})',
            ],
            'ultimo_grado_estudios': [
                r'Último\s*grado\s*de\s*estudios[:\s]*(.+?)(?:\n|$)',
                r'Grado\s*académico[:\s]*(.+?)(?:\n|$)',
                r'Formación\s*académica[:\s]*(.+?)(?:\n|$)',
            ],
            'empleo_actual': [
                r'Empleo\s*actual[:\s]*(.+?)(?:\n|$)',
                r'Puesto\s*actual[:\s]*(.+?)(?:\n|$)',
                r'Cargo\s*actual[:\s]*(.+?)(?:\n|$)',
            ],
            'fecha_nacimiento': [
                r'Fecha\s*de\s*nacimiento[:\s]*([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{4})',
                r'Nacimiento[:\s]*([0-9]{1,2}[/\-][0-9]{1,2}[/\-][0-9]{4})',
            ],
            'nacionalidad': [
                r'Nacionalidad[:\s]*([A-Za-záéíóúñ\s]+)',
                r'País[:\s]*([A-Za-záéíóúñ\s]+)',
            ]
        }
        
        # Buscar cada patrón en el texto
        for field, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                if match:
                    value = match.group(1).strip()
                    # Limpiar el valor extraído
                    value = re.sub(r'\s+', ' ', value)  # Normalizar espacios
                    data[field] = value
                    break
        
        return data
    
    def process_pdf(self, pdf_path: str) -> Dict[str, str]:
        """Procesar PDF completo y extraer datos del Perfil Único"""
        logger.info(f"Procesando PDF: {pdf_path}")
        
        # Paso 1: Extraer texto directamente del PDF
        text = self.extract_text_from_pdf(pdf_path)
        logger.info(f"Texto extraído del PDF: {len(text)} caracteres")
        
        # Paso 2: Si no hay texto suficiente, usar OCR en imágenes
        if len(text.strip()) < 100:  # Si hay muy poco texto
            logger.info("Poco texto extraído, aplicando OCR a imágenes...")
            images = self.extract_images_from_pdf(pdf_path)
            
            for i, image in enumerate(images):
                logger.info(f"Procesando imagen {i+1}/{len(images)}")
                ocr_text = self.ocr_image(image)
                text += "\n" + ocr_text
        
        # Paso 3: Extraer datos específicos del texto
        data = self.extract_data_from_text(text)
        
        # Paso 4: Limpiar y validar datos
        cleaned_data = self.clean_extracted_data(data)
        
        logger.info(f"Datos extraídos: {json.dumps(cleaned_data, indent=2, ensure_ascii=False)}")
        return cleaned_data
    
    def clean_extracted_data(self, data: Dict[str, str]) -> Dict[str, str]:
        """Limpiar y validar los datos extraídos"""
        cleaned = {}
        
        # Mapeo de campos del formulario
        field_mapping = {
            'nombre_completo': 'nombre_completo',
            'curp': 'curp',
            'rfc': 'rfc',
            'no_cvu': 'no_cvu',
            'correo': 'correo',
            'telefono': 'telefono',
            'ultimo_grado_estudios': 'ultimo_grado_estudios',
            'empleo_actual': 'empleo_actual',
            'fecha_nacimiento': 'fecha_nacimiento',
            'nacionalidad': 'nacionalidad'
        }
        
        for field, value in data.items():
            if field in field_mapping and value:
                # Limpiar el valor
                cleaned_value = value.strip()
                
                # Validaciones específicas por campo
                if field == 'curp' and not re.match(r'^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$', cleaned_value):
                    continue  # CURP inválida
                elif field == 'rfc' and not re.match(r'^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$', cleaned_value):
                    continue  # RFC inválido
                elif field == 'correo' and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', cleaned_value):
                    continue  # Email inválido
                
                cleaned[field_mapping[field]] = cleaned_value
        
        # Agregar campos por defecto
        if 'nacionalidad' not in cleaned:
            cleaned['nacionalidad'] = 'Mexicana'
        
        return cleaned

def main():
    """Función principal para probar el procesador"""
    if len(sys.argv) != 2:
        print("Uso: python pdf_processor.py <ruta_al_pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    processor = PerfilUnicoProcessor()
    
    try:
        data = processor.process_pdf(pdf_path)
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except Exception as e:
        logger.error(f"Error procesando PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
