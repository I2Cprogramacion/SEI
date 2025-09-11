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
    
    def extract_text_and_ocr(self, pdf_path: str) -> str:
        """Extrae texto embebido y aplica OCR a todas las imágenes del PDF"""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            # Extraer texto embebido
            for page in doc:
                text += page.get_text()
            # Extraer imágenes y aplicar OCR
            for page in doc:
                for img in page.get_images(full=True):
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    img_pil = Image.open(io.BytesIO(image_bytes))
                    ocr_text = pytesseract.image_to_string(img_pil, lang='spa')
                    text += "\n" + ocr_text
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extrayendo texto/OCR del PDF: {e}")
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
        """Extrae datos del texto usando patrones flexibles y permite campos vacíos para revisión manual"""
        patterns = {
            "nombre": r"(?:Nombre(?:s)?|Nombres y Apellidos|Nombre completo)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)",
            "apellido_paterno": r"(?:Apellido Paterno|Primer Apellido)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)",
            "apellido_materno": r"(?:Apellido Materno|Segundo Apellido)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)",
            "curp": r"(?:CURP|Curp)\s*[:\-]?\s*([A-Z0-9]{18})",
            "rfc": r"(?:RFC|R.F.C.)\s*[:\-]?\s*([A-Z0-9]{10,13})",
            "correo": r"(?:Correo(?: electrónico)?|Email)\s*[:\-]?\s*([\w\.-]+@[\w\.-]+\.\w+)",
            "telefono": r"(?:Tel(?:éfono)?|Cel(?:ular)?)\s*[:\-]?\s*([\d\s\-]{7,})",
            "institucion": r"(?:Institución|Universidad|Centro de trabajo)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)",
            "cargo": r"(?:Cargo|Puesto)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)",
            "grado": r"(?:Grado(?: académico)?|Nivel de estudios)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)",
            "area": r"(?:Área|Especialidad|Campo de estudio)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ\s]+)",
            "proyecto": r"(?:Proyecto|Título del proyecto)\s*[:\-]?\s*([A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+)",
        }
        results = {}
        for key, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            results[key] = match.group(1).strip() if match else ""
        return results
    
    def process_pdf(self, pdf_path: str) -> Dict[str, str]:
        """Procesar PDF completo y extraer datos del Perfil Único usando texto y OCR funcional"""
        logger.info(f"Procesando PDF: {pdf_path}")
        text = self.extract_text_and_ocr(pdf_path)
        logger.info(f"Texto total extraído: {len(text)} caracteres")
        data = self.extract_data_from_text(text)
        cleaned_data = self.clean_extracted_data(data)
        logger.info(f"Datos extraídos: {json.dumps(cleaned_data, indent=2, ensure_ascii=False)}")
        return cleaned_data
    
    def clean_extracted_data(self, data: Dict[str, str]) -> Dict[str, str]:
        """Limpiar los datos extraídos, permitir campos vacíos para revisión manual"""
        cleaned = {}
        for field, value in data.items():
            cleaned[field] = value.strip() if value else ""
        if 'nacionalidad' not in cleaned or not cleaned['nacionalidad']:
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
