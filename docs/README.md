# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 🚴 Plataforma de Gestión de Carreras de Ciclismo
### Migración Monolítico → Microservicios con Arquitectura Hexagonal

---

## Índice

1. [Descripción General](#descripción-general)
2. [Objetivos del Proyecto](#2-objetivos-del-proyecto)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Seguridad y Acceso](#4-seguridad-y-acceso)
5. [Interfaces de Usuario (Frontend)](#5-interfaces-de-usuario-frontend)
6. [Estrategia de Despliegue (Cloud)](#6-estrategia-de-despliegue-cloud)
7. [Caso de Uso y Ciclo de Vida del Desarrollo](#7-caso-de-uso-y-ciclo-de-vida-del-desarrollo)
8. [Cronograma de Actividades](#8-cronograma-de-actividades)
9. [Anexos y Evidencias](#9-anexos-y-evidencias)
10. [Fuentes de Información](#10-fuentes-de-información)

---

## 1. Descripción General

La plataforma es una solución de software multiplataforma diseñada para gestionar el **registro, pago y validación de participantes** en carreras de ciclismo. El sistema permite a los corredores inscribirse, adjuntar comprobantes de pago y recibir automáticamente un **número de competidor consecutivo** una vez que el administrador valide la transacción.

### Flujo Principal del Negocio

```
Corredor llena formulario → Adjunta comprobante de pago →
Administrador valida transferencia → Sistema asigna número de competidor (QR)
```

> **Tipos de carreras soportadas:**
> - Carrera de 100 kilómetros (adultos)
> - Carrera infantil (niños)
> - Carrera para damas
> - Categorías por edades

---

## 2. Objetivos del Proyecto

### 2.1 Objetivo General

Desarrollar una solución de software **robusta, escalable y multiplataforma** mediante la migración de un modelo monolítico hacia una **arquitectura de microservicios**, aplicando el patrón de arquitectura hexagonal para garantizar el desacoplamiento de la lógica de negocio y permitiendo el acceso concurrente desde dispositivos móviles, tablets y computadoras mediante despliegues en la nube.

### 2.2 Objetivos Específicos

| # | Área | Descripción |
|---|------|-------------|
| 1 | **Diseño Arquitectónico** | Implementar 05 microservicios independientes aplicando el patrón Puertos y Adaptadores para aislar el dominio de la infraestructura. |
| 2 | **Gestión de Persistencia** | Configurar 05 bases de datos distintas (Relacionales y NoSQL) para asegurar la autonomía de datos de cada servicio. |
| 3 | **Seguridad** | Centralizar la autenticación y autorización mediante JWT para clientes web y móviles. |
| 4 | **Desarrollo Multiplataforma** | Construir interfaz web con React + Vite y aplicación móvil con React Native (smartphone/tablet). |
| 5 | **Operaciones Cloud** | Desplegar infraestructura en AWS y capa de presentación en Vercel con pipelines CI/CD vía GitHub Actions. |
| 6 | **Colaboración** | Evidenciar trabajo en equipo mediante flujo profesional en GitHub (ramas + revisiones de código). |

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura Hexagonal (Ports & Adapters)

La arquitectura hexagonal permite aislar completamente la **lógica de dominio** de los detalles de infraestructura (bases de datos, APIs externas, interfaces de usuario).

```
┌─────────────────────────────────────────────────┐
│                  ADAPTADORES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ REST API │  │  React   │  │ React Native │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │           │
│  ─────────────── PUERTOS (IN) ───────────────── │
│  │                                             │ │
│  │           DOMINIO / LÓGICA DE NEGOCIO       │ │
│  │   (Entidades, Casos de Uso, Reglas)         │ │
│  │                                             │ │
│  ─────────────── PUERTOS (OUT) ──────────────── │
│       │              │               │           │
│  ┌────┴─────┐  ┌─────┴────┐  ┌──────┴───────┐  │
│  │   MySQL  │  │ MongoDB  │  │   Redis/SQS  │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

### 3.2 Definición de los 05 Microservicios

| # | Microservicio | Responsabilidad | Tecnología Sugerida |
|---|---------------|-----------------|---------------------|
| 1 | **Auth Service** | Registro de usuarios, login, emisión y validación de JWT | Node.js / Express |
| 2 | **Registration Service** | Gestión de inscripciones por carrera y categoría | Node.js / NestJS |
| 3 | **Payment Service** | Recepción de comprobantes, validación por administrador, activación de número de competidor | Python / FastAPI |
| 4 | **Competitor Service** | Asignación consecutiva de números de corredor, generación de QR | Go / Gin |
| 5 | **Reports Service** | Reportes estadísticos: registros diarios, totales de cobro, dashboards por categoría | Python / FastAPI |

#### Flujo Inter-Servicios

```
Auth → Registration → Payment → Competitor → Reports
        ↓                ↓           ↓
   (Categoría)    (Comprobante)  (Núm. QR)
```

### 3.3 Gestión de Bases de Datos Independientes

Cada microservicio posee su propia base de datos (**Database per Service Pattern**):

| Microservicio | Base de Datos | Tipo | Justificación |
|---------------|---------------|------|---------------|
| Auth Service | **PostgreSQL** | Relacional | Integridad en datos de usuarios y roles |
| Registration Service | **MySQL** | Relacional | Relaciones entre inscripciones y categorías |
| Payment Service | **MongoDB** | NoSQL | Flexibilidad en documentos de comprobantes adjuntos |
| Competitor Service | **Redis** | Clave-Valor | Alta velocidad en asignación de números consecutivos |
| Reports Service | **MongoDB** | NoSQL | Agregaciones y estadísticas en tiempo real |

---

## 4. Seguridad y Acceso

### 4.1 Implementación de JSON Web Tokens (JWT)

```
┌────────────┐     POST /auth/login      ┌─────────────┐
│   Cliente  │ ─────────────────────────▶│ Auth Service│
│(Web/Mobile)│ ◀─────────────────────── │             │
└────────────┘     JWT Token (Bearer)    └─────────────┘
       │
       │  Authorization: Bearer <token>
       ▼
┌────────────────────────────────────────────────────┐
│              API GATEWAY / Microservicios           │
│  • Valida firma JWT                                 │
│  • Extrae claims (userId, rol, exp)                 │
│  • Autoriza o rechaza la petición                   │
└────────────────────────────────────────────────────┘
```

- **Tokens de corta duración** (15 min Access Token)
- **Refresh Tokens** almacenados en HttpOnly cookies
- **Roles:** `admin`, `corredor`, `viewer`

### 4.2 HTTPS con Certbot y DNS

| Componente | Herramienta | Descripción |
|------------|-------------|-------------|
| Certificado SSL | **Certbot (Let's Encrypt)** | Generación y renovación automática de certificados TLS |
| Registro DNS | **Route 53 (AWS)** | Apuntamiento del dominio a la infraestructura en la nube |
| Proxy inverso | **Nginx** | Terminación SSL y enrutamiento hacia microservicios |
| Renovación | **Cron job** | `certbot renew` automatizado cada 60 días |

---

## 5. Interfaces de Usuario (Frontend)

### 5.1 Landing Page y Dashboard (React + Vite)

| Módulo | Descripción |
|--------|-------------|
| **Landing Page** | Presentación de la carrera, categorías, costos de inscripción y call-to-action de registro |
| **Formulario de Registro** | Datos personales: nombre, dirección, teléfono, email + selección de categoría |
| **Carga de Comprobante** | Upload de captura/transferencia bancaria en PDF o imagen |
| **Panel del Corredor** | Visualización del estado de validación y número de competidor + QR descargable |
| **Dashboard Administrativo** | Lista de inscritos, validación de pagos (Aceptar / Rechazar), reportes estadísticos |

#### Stack Frontend Web

```
React 18 + Vite 5
├── React Router DOM (navegación SPA)
├── Axios (peticiones HTTP + JWT interceptors)
├── Zustand (gestión de estado global)
├── Chart.js / Recharts (gráficas de reportes)
└── TailwindCSS (estilos utilitarios)
```

### 5.2 Aplicación Móvil y Tablet (React Native)

| Módulo | Descripción |
|--------|-------------|
| **Login / Registro** | Autenticación con JWT, biometría opcional |
| **Inscripción** | Formulario adaptado a pantalla táctil, carga de foto de comprobante con cámara |
| **Número de Competidor** | Visualización del QR en pantalla para validación en evento |
| **Notificaciones Push** | Alertas al corredor cuando el admin valida su pago |
| **Vista Tablet** | Layout de dos columnas optimizado para tablets |

#### Stack Móvil

```
React Native (Expo)
├── Expo Camera (captura de comprobante)
├── Expo Notifications (push notifications)
├── React Navigation (stack + bottom tabs)
├── AsyncStorage (token local)
└── Distribución: Expo Go / APK (Android)
```

#### Clientes y Despliegue

| Plataforma | Tecnología | Propósito | Despliegue |
|------------|------------|-----------|------------|
| Web (Público/Gestión) | React + Vite | Landing Page y Dashboard Administrativo | Vercel / AWS |
| Móvil (Smartphone/Tablet) | React Native | Acceso operativo y notificaciones | Expo / APK |

---

## 6. Estrategia de Despliegue (Cloud)

### 6.1 Backend en Amazon Web Services (AWS)

```
                        ┌─────────────────────────────────┐
                        │           AWS CLOUD              │
                        │                                  │
Internet ──▶ Route 53 ──▶ ALB (Load Balancer)             │
                        │      │                           │
                        │  ┌───┴────────────────────────┐ │
                        │  │     ECS / EC2 Cluster      │ │
                        │  │  ┌─────┐ ┌─────┐ ┌─────┐  │ │
                        │  │  │ MS1 │ │ MS2 │ │ MS3 │  │ │
                        │  │  └─────┘ └─────┘ └─────┘  │ │
                        │  │  ┌─────┐ ┌─────┐           │ │
                        │  │  │ MS4 │ │ MS5 │           │ │
                        │  │  └─────┘ └─────┘           │ │
                        │  └────────────────────────────┘ │
                        │  ┌──────┐ ┌────────┐ ┌──────┐  │
                        │  │  RDS │ │MongoDB │ │Redis │  │
                        │  └──────┘ └────────┘ └──────┘  │
                        │  ┌───────────────────────────┐  │
                        │  │   S3 (Comprobantes/Assets)│  │
                        │  └───────────────────────────┘  │
                        └─────────────────────────────────┘
```

**Servicios AWS utilizados:**

| Servicio | Uso |
|----------|-----|
| **ECS / EC2** | Contenedores Docker de microservicios |
| **RDS (PostgreSQL/MySQL)** | Bases de datos relacionales gestionadas |
| **DocumentDB / MongoDB Atlas** | Base de datos NoSQL |
| **ElastiCache (Redis)** | Caché y asignación de números |
| **S3** | Almacenamiento de comprobantes de pago e imágenes |
| **ALB** | Balanceo de carga entre instancias |
| **Route 53** | Gestión de DNS |
| **ACM + Certbot** | Certificados SSL/TLS |
| **SES** | Envío de emails con número de competidor |

### 6.2 Frontend Web en Vercel (Landing Page)

- **Landing Page pública** → desplegada en **Vercel** para máxima velocidad de carga y CDN global
- Ideal para promoción del producto y SEO
- Integración automática con repositorio GitHub (push = deploy)
- Preview deployments por rama (staging automático)

### 6.3 Frontend de la Aplicación en AWS

- **Dashboard Administrativo** y módulos protegidos → desplegados en **AWS (S3 + CloudFront)**
- Distribución global mediante CDN de CloudFront
- Control de acceso con JWT + políticas IAM

### Pipeline CI/CD con GitHub Actions

```yaml
# Flujo de despliegue automatizado
Push a main ──▶ GitHub Actions
                    ├── Run Tests (Jest / Pytest)
                    ├── Build Docker Images
                    ├── Push a ECR (AWS)
                    ├── Deploy a ECS (Backend)
                    └── Deploy a Vercel (Frontend)
```

---

## 7. Caso de Uso y Ciclo de Vida del Desarrollo

### Caso de Uso Principal: Registro de Corredor

```
Actor: Corredor          Actor: Administrador       Sistema
  │                            │                      │
  │── Llena formulario ────────────────────────────▶  │
  │   (nombre, email, categoría)                      │
  │                                                   │
  │── Adjunta comprobante de pago ─────────────────▶  │
  │                                                   │
  │                            │◀── Notificación ─── │
  │                            │    nuevo pago        │
  │                            │                      │
  │                            │── Valida transferencia▶│
  │                            │   (Aceptar/Rechazar) │
  │                                                   │
  │◀── Asignación automática de número consecutivo ── │
  │    + Generación de código QR                      │
  │                                                   │
  │◀── Email con número de competidor ─────────────── │
```

### Metodología Ágil: SCRUM

| Elemento | Detalle |
|----------|---------|
| **Framework** | SCRUM |
| **Sprint** | 2 semanas |
| **Ceremonias** | Sprint Planning, Daily Standup, Sprint Review, Retrospectiva |
| **Herramienta** | GitHub Projects (Kanban board) |
| **Roles** | Product Owner, Scrum Master, Dev Team |

### Épicas del Proyecto

| Épica | Descripción | Sprint |
|-------|-------------|--------|
| EP-01 | Infraestructura base (Docker, AWS, CI/CD) | Sprint 1 |
| EP-02 | Auth Service + JWT | Sprint 1 |
| EP-03 | Registration Service + Frontend Landing | Sprint 2 |
| EP-04 | Payment Service + validación admin | Sprint 2-3 |
| EP-05 | Competitor Service + QR | Sprint 3 |
| EP-06 | Reports Service + Dashboard | Sprint 4 |
| EP-07 | App Móvil React Native | Sprint 3-4 |
| EP-08 | QA, pruebas de integración y despliegue final | Sprint 5 |

---

## 8. Cronograma de Actividades

| Semana | Actividades | Responsable |
|--------|-------------|-------------|
| 1-2 | Configuración de repositorios, entorno Docker, estructura base de microservicios | Todo el equipo |
| 3-4 | Desarrollo Auth Service + Registration Service | Backend Team |
| 5-6 | Development Payment Service + integración con S3 (comprobantes) | Backend Team |
| 7-8 | Competitor Service (numeración QR) + Reports Service (estadísticas) | Backend Team |
| 9-10 | Frontend Web: Landing Page + Dashboard Admin (React + Vite) | Frontend Team |
| 11-12 | App Móvil: React Native (registro + QR + notificaciones) | Mobile Team |
| 13 | Integración completa + pruebas End-to-End | QA / Todo el equipo |
| 14 | Despliegue en producción (AWS + Vercel) + DNS + SSL | DevOps |
| 15 | Documentación final + presentación | Todo el equipo |

---

## 9. Anexos y Evidencias

### 9.1 Repositorios de GitHub

| Repositorio | Descripción | URL |
|-------------|-------------|-----|
| `cycling-auth-service` | Microservicio de autenticación | _por definir_ |
| `cycling-registration-service` | Microservicio de inscripciones | _por definir_ |
| `cycling-payment-service` | Microservicio de pagos y validación | _por definir_ |
| `cycling-competitor-service` | Microservicio de numeración y QR | _por definir_ |
| `cycling-reports-service` | Microservicio de reportes | _por definir_ |
| `cycling-frontend-web` | Aplicación React + Vite | _por definir_ |
| `cycling-mobile-app` | Aplicación React Native | _por definir_ |
| `cycling-infra` | IaC (Terraform / Docker Compose) | _por definir_ |

**Flujo de trabajo Git:**

```
main (producción)
 └── develop (integración)
       ├── feature/auth-jwt
       ├── feature/payment-validation
       ├── feature/competitor-qr
       └── hotfix/...
```

### 9.2 Evidencia del Equipo de Trabajo

- Capturas de **GitHub Insights** (commits por integrante)
- Screenshots de **Pull Requests** con code reviews
- Actas de **Sprint Reviews** y **Retrospectivas**
- Evidencia de **Daily Standups** (Slack / Discord / Meet)
- Videos demostrativos de funcionalidades

---

## 10. Fuentes de Información

| # | Fuente | Tipo |
|---|--------|------|
| 1 | **Transcripción de reunión de requerimientos** (Hablante 1 & 2) — Descripción del flujo de registro, validación de pagos y asignación de número de corredor | Primaria |
| 2 | Microservices Patterns — Chris Richardson | Libro |
| 3 | Hexagonal Architecture (Alistair Cockburn) — [alistair.cockburn.us](https://alistair.cockburn.us/hexagonal-architecture/) | Web |
| 4 | AWS Well-Architected Framework — [docs.aws.amazon.com](https://docs.aws.amazon.com/wellarchitected/) | Documentación oficial |
| 5 | React Documentation — [react.dev](https://react.dev) | Documentación oficial |
| 6 | React Native (Expo) — [expo.dev](https://expo.dev) | Documentación oficial |
| 7 | JSON Web Tokens — [jwt.io](https://jwt.io) | Referencia técnica |
| 8 | Certbot (Let's Encrypt) — [certbot.eff.org](https://certbot.eff.org) | Documentación oficial |
| 9 | GitHub Actions CI/CD — [docs.github.com](https://docs.github.com/actions) | Documentación oficial |
| 10 | SCRUM Guide 2020 — [scrumguides.org](https://scrumguides.org) | Metodología |

---

> *Documento generado como parte del Proyecto Final — Arquitectura de Microservicios*  
> *Plataforma de Gestión de Carreras de Ciclismo*  
> *Fecha: Abril 2026*
