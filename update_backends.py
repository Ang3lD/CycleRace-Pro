import os

services = ['auth-backend', 'eventos-backend', 'corredores-backend', 'tracking-backend']
info_db = {
    'auth-backend': 'PostgreSQL',
    'eventos-backend': 'MySQL',
    'corredores-backend': 'Redis',
    'tracking-backend': 'MongoDB'
}

for s in services:
    content = f'''from fastapi import FastAPI
import time

app = FastAPI(title="{s}")
start_time = time.time()

@app.get("/health")
def health():
    uptime = round(time.time() - start_time, 2)
    return {{
        "status": "ok", 
        "service": "{s}",
        "version": "1.2.0",
        "uptime_seconds": uptime,
        "database": "{info_db[s]}",
        "memory_usage": "24MB"
    }}
'''
    with open(f'{s}/main.py', 'w', encoding='utf-8') as f:
        f.write(content)
