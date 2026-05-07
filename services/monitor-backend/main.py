from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio

app = FastAPI(title="Monitor de Microservicios CycleRace")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MICROSERVICIOS = {
    "Auth Service": "http://auth-backend:8000/health",
    "Eventos Service": "http://eventos-backend:8000/health",
    "Corredores Service": "http://corredores-backend:8000/health",
    "Tracking Service": "http://tracking-backend:8000/health"
}

async def check_service(name: str, url: str):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=3.0)
            data = response.json() if response.status_code == 200 else {}
            status = "Activo 🟢" if response.status_code == 200 else "Con Errores 🟡"
            return {
                "nombre": name, 
                "estado": status, 
                "status_code": response.status_code,
                "detalles": data
            }
        except httpx.RequestError:
            return {"nombre": name, "estado": "Caído 🔴", "status_code": 500, "detalles": {}}

@app.get("/api/status")
async def get_system_status():
    tasks = [check_service(name, url) for name, url in MICROSERVICIOS.items()]
    resultados = await asyncio.gather(*tasks)
    return {"microservicios": resultados}

@app.get("/health")
def health():
    return {"status": "ok"}
