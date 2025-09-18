
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import tempfile
import os
from scripts.pdf_processor import extract_data_from_pdf

app = FastAPI()

@app.post("/process-pdf")
async def process_pdf(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        data = extract_data_from_pdf(tmp_path)
        # Log explícito para depuración
        print("[OCR] Datos extraídos:", data)
    except Exception as e:
        os.remove(tmp_path)
        return JSONResponse(status_code=500, content={"error": str(e)})
    os.remove(tmp_path)
    return {"data": data}
