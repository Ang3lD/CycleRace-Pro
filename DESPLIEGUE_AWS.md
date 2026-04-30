# Guía de Arquitectura, Dockerización y Despliegue en AWS para CycleRace Pro

Este documento detalla la arquitectura del sistema, cómo implementar un panel de estado de los microservicios usando FastAPI, las instrucciones para dockerizar el entorno local y la guía paso a paso para el despliegue en AWS sin errores.

## 1. Arquitectura del Ecosistema

El sistema se compone de los siguientes elementos integrados en la nube de AWS:

1.  **Frontend (React)**: La aplicación SPA que contiene la Landing Page y los paneles de control. Es el único punto de interacción del usuario.
2.  **AWS API Gateway**: Actúa como el punto de entrada principal (Reverse Proxy) para todas las peticiones del backend. Maneja la terminación HTTPS y enruta las solicitudes al microservicio correspondiente.
3.  **Microservicios (FastAPI)**: Cinco servicios independientes (ej. Auth, Eventos, Corredores, Tracking, Logs). Reciben las peticiones del API Gateway, **validan el token JWT** en cada solicitud, ejecutan la lógica de negocio y se comunican con sus bases de datos respectivas.
4.  **Bases de Datos**: Desplegadas en AWS (Amazon RDS para PostgreSQL/MySQL, DocumentDB para MongoDB).

### Flujo de la Petición
1. El usuario accede al **Front End (React)** desde el navegador.
2. El Frontend envía una petición HTTPS hacia el **API Gateway**.
3. El **API Gateway** distribuye la petición al microservicio FastAPI correspondiente.
4. El **Microservicio** extrae el token JWT del header `Authorization`, lo valida localmente y, si es correcto, procesa la solicitud consultando a la **Base de Datos**.

---

## 2. Panel de Estado de Microservicios (Health Dashboard)

Para tener una página donde se visualicen los microservicios activos y cómo están funcionando, implementaremos un endpoint centralizado de "Health Check" usando FastAPI y lo consumiremos en React.

### Implementación en FastAPI (Servicio Monitor / Gateway)

Puedes agregar este código en un servicio central o crear un pequeño microservicio "Monitor":

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio

app = FastAPI(title="Monitor de Microservicios CycleRace")

# Habilitar CORS para que React pueda consumirlo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URLs de los 5 microservicios (nombres de los contenedores en Docker o DNS en AWS)
MICROSERVICIOS = {
    "Auth Service": "http://auth-service:8000/health",
    "Eventos Service": "http://eventos-service:8000/health",
    "Corredores Service": "http://corredores-service:8000/health",
    "Tracking Service": "http://tracking-service:8000/health",
    "Logs Service": "http://logs-backend:8000/health"
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
```

*Nota: Asegúrate de que cada microservicio individual tenga un endpoint básico `@app.get("/health")` que devuelva `{"status": "ok"}`.*

### Implementación en el Frontend (React)

Crea un componente `StatusPage.jsx` en tu frontend:

```jsx
import React, { useState, useEffect } from 'react';

const StatusPage = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Ajusta la URL según el host de tu servicio Monitor
        const response = await fetch('http://localhost:8000/api/status');
        const data = await response.json();
        setServicios(data.microservicios);
      } catch (error) {
        console.error("Error obteniendo el estado", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresca cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Estado del Sistema - CycleRace Pro</h2>
      {loading && servicios.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Cargando estado de microservicios...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {servicios.map((srv, index) => (
            <div key={index} style={{ 
              padding: '20px', 
              backgroundColor: '#1e1e1e', 
              color: '#fff',
              border: '1px solid #333', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#00ff88' }}>{srv.nombre}</h3>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                Estado: <strong>{srv.estado}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusPage;
```

---

## 3. Dockerización Local (`docker-compose up`)

Para correr todo el entorno localmente con un solo comando sin necesidad de subirlo a AWS todavía, utilizaremos Docker.

### 3.1. `Dockerfile` base para los Microservicios FastAPI

En la carpeta de cada microservicio (ej. `auth-backend/`), crea un archivo `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY src/ ./src/
COPY main.py .

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.2. Archivo `docker-compose.yml`

Asegúrate de que en la raíz del proyecto tu `docker-compose.yml` tenga esta estructura para levantar la red completa:

```yaml
version: '3.8'

services:
  # === BASES DE DATOS ===
  postgres_db:
    image: postgres:15
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: adminpassword
      POSTGRES_DB: cyclerace
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  mongo_db:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  # === MICROSERVICIOS FASTAPI ===
  auth-service:
    build: ./auth-backend
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=postgresql://admin:adminpassword@postgres_db:5432/cyclerace
      - JWT_SECRET=tu_super_secreto
    depends_on:
      - postgres_db

  eventos-service:
    build: ./eventos-backend
    ports:
      - "8002:8000"
    depends_on:
      - postgres_db

  corredores-service:
    build: ./corredores-backend
    ports:
      - "8003:8000"
    depends_on:
      - postgres_db

  logs-backend:
    build: ./log-backend
    ports:
      - "8004:8000"
    depends_on:
      - mongo_db

  # === FRONTEND ===
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8000 # Apuntando al Gateway o servicios
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  pg_data:
  mongo_data:
```

Para levantar todo el ecosistema de forma automática, simplemente ejecuta:
```bash
docker compose up --build -d
```

---

## 4. Guía de Despliegue en AWS (Cero Errores)

Cuando estés listo para subirlo a la nube de AWS, sigue estos pasos rigurosamente.

### Fase 1: Preparación de Imágenes Docker
1. Ve a **Amazon ECR (Elastic Container Registry)** y crea un repositorio por cada microservicio.
2. Autentica tu Docker local con AWS ECR:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [TU_CUENTA].dkr.ecr.us-east-1.amazonaws.com
   ```
3. Construye y sube las imágenes a ECR para cada servicio:
   ```bash
   docker build -t auth-service ./auth-backend
   docker tag auth-service:latest [TU_CUENTA].dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
   docker push [TU_CUENTA].dkr.ecr.us-east-1.amazonaws.com/auth-service:latest
   ```

### Fase 2: Despliegue de Bases de Datos
1. **Amazon RDS**: Crea una instancia de PostgreSQL/MySQL.
   - Selecciona "Free tier" si aplica.
   - Configúrala en una VPC (Virtual Private Cloud).
   - En *Security Groups*, permite tráfico entrante en el puerto 5432 solo desde los recursos internos de AWS.
2. **Amazon DocumentDB**: (Para reemplazar MongoDB) Crea el cluster y obtén el string de conexión.

### Fase 3: Despliegue de Microservicios (AWS ECS - Fargate)
Es la forma más segura y libre de mantenimiento operativo (Serverless para contenedores).
1. Crea un **Cluster ECS**.
2. Crea **Task Definitions (Definiciones de Tarea)** para cada microservicio. 
   - Utiliza la imagen correspondiente de ECR.
   - Pasa las Variables de Entorno (URLs de RDS/DocumentDB, JWT Secrets).
   - Asigna 0.5 vCPU y 1GB RAM.
3. Crea un **Servicio ECS** por cada Task. Configúralo con un **Application Load Balancer (ALB) interno** para poder redirigir el tráfico del API Gateway.

### Fase 4: Configuración del API Gateway
1. En **AWS API Gateway**, crea una **HTTP API**.
2. Configura las rutas (Routes) hacia los Load Balancers de ECS:
   - Ruta `/api/auth/{proxy+}` -> Integración hacia el Load Balancer del `auth-service`.
   - Ruta `/api/eventos/{proxy+}` -> Integración hacia `eventos-service`.
3. **Seguridad JWT**: Los microservicios de FastAPI ya están programados para validar el token localmente, por lo que el API Gateway solo necesita actuar como pasarela (Proxy).
4. Configura un **Dominio Personalizado** en API Gateway y asocia un certificado SSL gratuito desde **AWS Certificate Manager (ACM)** para habilitar `https://api.tudominio.com`.

### Fase 5: Despliegue del Frontend (React/Vite)
1. Prepara tu proyecto para producción en local, apuntando las llamadas al AWS API Gateway:
   ```bash
   # En tu archivo .env de producción
   VITE_API_URL=https://api.tudominio.com
   ```
   Genera el build: `npm run build`
2. Ve a **Amazon S3** y crea un Bucket. Activa la opción de "Static website hosting". Sube el contenido de la carpeta `dist`.
3. Ve a **Amazon CloudFront** y crea una distribución apuntando a tu Bucket de S3.
   - Esto habilitará la caché global (CDN) y proveerá de un certificado SSL automático para tu Landing Page (`https://www.tudominio.com`).
4. (Importante): En CloudFront, configura la redirección de errores 404 hacia `/index.html` para que el enrutamiento interno de React (React Router) funcione correctamente.

### Resumen de Seguridad de la Nube
- **Frontend -> API Gateway**: Tráfico encriptado SSL/HTTPS de extremo a extremo.
- **API Gateway -> ECS (Microservicios)**: Flujo de red privado dentro de la nube de AWS.
- **Microservicios -> Base de datos**: Tráfico restringido por Grupos de Seguridad (Security Groups) que bloquean cualquier acceso externo a la base de datos.
