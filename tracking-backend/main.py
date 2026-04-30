from fastapi import FastAPI
import time

app = FastAPI(title="tracking-backend")
start_time = time.time()

@app.get("/health")
def health():
    uptime = round(time.time() - start_time, 2)
    return {
        "status": "ok", 
        "service": "tracking-backend",
        "version": "1.2.0",
        "uptime_seconds": uptime,
        "database": "MongoDB",
        "memory_usage": "24MB"
    }
