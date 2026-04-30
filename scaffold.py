import os

services = ['auth-backend', 'eventos-backend', 'corredores-backend', 'tracking-backend', 'monitor-backend']

for s in services:
    os.makedirs(s, exist_ok=True)
    
    # main.py
    if s == 'monitor-backend':
        main_content = '''from fastapi import FastAPI
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
            status = "Activo 🟢" if response.status_code == 200 else "Con Errores 🟡"
            return {"nombre": name, "estado": status, "status_code": response.status_code}
        except httpx.RequestError:
            return {"nombre": name, "estado": "Caído 🔴", "status_code": 500}

@app.get("/api/status")
async def get_system_status():
    tasks = [check_service(name, url) for name, url in MICROSERVICIOS.items()]
    resultados = await asyncio.gather(*tasks)
    return {"microservicios": resultados}

@app.get("/health")
def health():
    return {"status": "ok"}
'''
    else:
        main_content = f'''from fastapi import FastAPI
app = FastAPI(title="{s}")

@app.get("/health")
def health():
    return {{"status": "ok", "service": "{s}"}}
'''
    
    with open(f'{s}/main.py', 'w', encoding='utf-8') as f:
        f.write(main_content)

    # requirements.txt
    reqs = 'fastapi\nuvicorn\n'
    if s == 'monitor-backend':
        reqs += 'httpx\n'
    with open(f'{s}/requirements.txt', 'w', encoding='utf-8') as f:
        f.write(reqs)

    # Dockerfile
    dockerfile_content = '''FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
'''
    with open(f'{s}/Dockerfile', 'w', encoding='utf-8') as f:
        f.write(dockerfile_content)

print('Microservicios creados exitosamente.')
