from fastapi import FastAPI
import time

app = FastAPI(title="corredores-backend")
start_time = time.time()

@app.get("/health")
def health():
    uptime = round(time.time() - start_time, 2)
    return {
        "status": "ok", 
        "service": "corredores-backend",
        "version": "1.2.0",
        "uptime_seconds": uptime,
        "database": "Redis",
        "memory_usage": "24MB"
    }
