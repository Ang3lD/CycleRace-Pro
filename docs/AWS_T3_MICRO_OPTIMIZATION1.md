# Guía de Optimización Extrema para Despliegue en AWS t3.micro (1GB RAM)

Desplegar 16 contenedores (incluyendo múltiples bases de datos y microservicios) en un servidor con apenas 1GB de memoria RAM es todo un desafío. Sin embargo, aplicando las técnicas de **compresión y limitación de recursos** descritas en este documento, tu instancia `t3.micro` podrá soportar el entorno `CycleRace Pro` de manera estable y sin interrupciones por falta de memoria (Out-Of-Memory).

## 1. Configuración de Memoria SWAP (Memoria Virtual)
Este es el paso más importante. Como 1GB de RAM física no es suficiente, le diremos a Linux (en tu instancia de AWS) que tome 4GB de tu disco duro y los use como RAM secundaria.

Ejecuta estos comandos en la terminal de tu instancia AWS **antes** de correr Docker:

```bash
# Crear un archivo de 4GB para Swap
sudo fallocate -l 4G /swapfile

# Dar permisos de seguridad correctos
sudo chmod 600 /swapfile

# Formatear el archivo como Swap
sudo mkswap /swapfile

# Activar el Swap en el sistema
sudo swapon /swapfile

# Hacer que el Swap sea persistente después de reiniciar
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Reducir la "agresividad" con la que Linux usa el Swap (para no dañar el SSD)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```
*Ahora tu servidor de 1GB se comportará como uno de 5GB.*

---

## 2. Optimización del `docker-compose.yml` (Para AWS)

Debes modificar tu archivo `docker-compose.yml` para aplicar "Hard Limits" a la RAM y desactivar configuraciones de bases de datos que consumen mucha memoria innecesaria.

Aquí tienes los bloques clave de optimización:

### 2.1. Nginx y Frontend (Producción)
En lugar de correr el Frontend con Node/Vite consumiendo ~300MB de RAM vigilando los archivos, debes compilar el proyecto (`npm run build`) y que Nginx sirva los archivos HTML/JS estáticos. Nginx solo consume **~15MB de RAM**.

### 2.2. Optimización de PostgreSQL
```yaml
  cyclerace-postgres:
    image: postgres:16-alpine
    command: postgres -c shared_buffers=64MB -c work_mem=4MB
    deploy:
      resources:
        limits:
          memory: 128M
```

### 2.3. Optimización de MySQL
MySQL es un devorador de memoria por defecto debido a su "Performance Schema". Apagarlo salva cientos de Megabytes.
```yaml
  cyclerace-mysql:
    image: mysql:8.0
    command: --performance_schema=OFF --innodb_buffer_pool_size=64M
    deploy:
      resources:
        limits:
          memory: 200M
```

### 2.4. Optimización de MongoDB (Ambas Instancias)
MongoDB con WiredTiger reservará al menos 256MB independientemente de lo que necesite. Puedes forzar el caché a valores muy bajos.
```yaml
  cyclerace-mongo:
    image: mongo:7
    command: --wiredTigerCacheSizeGB 0.1
    deploy:
      resources:
        limits:
          memory: 200M
```

### 2.5. Microservicios FastAPI y Node
Para todos los servicios backend (Python y Node), debes desactivar los modos "reload" o "watch" y poner un límite duro de memoria.

**Python (Quitar `--reload`):**
```yaml
  auth-backend:
    command: ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    deploy:
      resources:
        limits:
          memory: 100M
```
*(Repetir esto para eventos, corredores, tracking y monitor)*

**Node.js API:**
```yaml
  node-api:
    command: ["node", "server/api.js"]
    deploy:
      resources:
        limits:
          memory: 150M
```

---

## 3. Resumen del Presupuesto de Memoria (RAM Física vs Límite)

Al configurar estos límites, garantizas que Docker detenga el crecimiento de los contenedores antes de asfixiar el servidor:

| Servicio | Límite RAM Configurado | Tipo |
| :--- | :--- | :--- |
| Nginx (Sirviendo Front + API) | ~50 MB | Web Server |
| MySQL | 200 MB | Base de Datos |
| MongoDB (x2) | 400 MB (200MB c/u) | Base de Datos |
| PostgreSQL | 128 MB | Base de Datos |
| Redis | 64 MB | Caché |
| FastAPI (x5) | 500 MB (100MB c/u) | Backend Python |
| Node API | 150 MB | Backend Express |
| Go Log-Analyzer | 50 MB | Backend Go |
| Adminer / Mongo Express | ~100 MB | Interfaces BD |
| **Total Límite Teórico** | **~1.6 GB** | |

*Como el límite teórico (1.6 GB) supera la RAM física (1 GB), el **Archivo de SWAP de 4GB (Paso 1)** actuará de comodín almacenando los procesos inactivos, asegurando que tu entorno sobreviva sin cuelgues.*

## Recomendaciones Finales
- En tu entorno local de desarrollo sigue usando el `docker-compose.yml` que tienes ahora (para que tu Frontend se recargue al guardar cambios y tus BD sean rápidas).
- Cuando vayas a AWS, crea una copia llamada `docker-compose.prod.yml` que incluya estos comandos de optimización, la compilación de la carpeta `dist/` para el frontend y los límites `deploy: resources`. Así mantienes la estabilidad.
