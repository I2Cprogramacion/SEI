#!/usr/bin/env python3
"""
Servidor FastAPI para procesamiento de PDFs del Perfil Único
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import json
from pdf_processor import PerfilUnicoProcessor
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDF Processor API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # URLs del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar el procesador
processor = PerfilUnicoProcessor()

@app.get("/")
async def root():
    return {"message": "PDF Processor API está funcionando"}

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    """
    Procesar un archivo PDF del Perfil Único y extraer datos
    """
    try:
        # Validar que sea un archivo PDF
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")
        
        # Validar tamaño del archivo (máximo 10MB)
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="El archivo es demasiado grande (máximo 10MB)")
        
        # Crear archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Procesar el PDF
            logger.info(f"Procesando archivo: {file.filename}")
            extracted_data = processor.process_pdf(temp_file_path)
            
            # Agregar metadatos
            result = {
                "success": True,
                "filename": file.filename,
                "extracted_data": extracted_data,
                "fields_found": list(extracted_data.keys()),
                "total_fields": len(extracted_data)
            }
            
            logger.info(f"Datos extraídos exitosamente: {len(extracted_data)} campos")
            return result
            
        finally:
            # Limpiar archivo temporal
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        logger.error(f"Error procesando PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")

@app.get("/health")
async def health_check():
    """Verificar estado del servidor"""
    return {"status": "healthy", "service": "pdf-processor"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
