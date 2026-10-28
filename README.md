# 🚀 OpenWorkspace Backend (NestJS Architecture)

> **Backend completo, modular y de alto rendimiento para OpenWorkspace implementado en NestJS (TypeScript), con documentación interactiva Swagger OpenAPI 3.0, sincronización CRDT Yjs en tiempo real vía WebSockets, almacenamiento S3/MinIO, worker de indexación vectorial en background con `pgvector` y servicio de correo SMTP.**

![NestJS](https://img.shields.io/badge/NestJS-10.4-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-6.4-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Yjs CRDT](https://img.shields.io/badge/Yjs-CRDT_Sync-FF6B6B?style=for-the-badge)
![Swagger](https://img.shields.io/badge/OpenAPI_3.0-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![MinIO](https://img.shields.io/badge/MinIO-S3_Storage-C72C48?style=for-the-badge&logo=minio&logoColor=white)

---

## 📋 Tabla de Contenidos

1. [Visión General del Proyecto](#-visión-general-del-proyecto)
2. [Arquitectura y Estructura del Código](#-arquitectura-y-estructura-del-código)
3. [Módulos del Sistema y Catálogo de Endpoints (81 Rutas)](#-módulos-del-sistema-y-catálogo-de-endpoints)
4. [Sincronización CRDT y WebSockets (/ws/v2)](#-sincronización-crdt-y-websockets-wsv2)
5. [Worker de Indexación Vectorial en Background (pgvector)](#-worker-de-indexación-vectorial-en-background-pgvector)
6. [Sistema de Correo Saliente y Notificaciones (Mailer)](#-sistema-de-correo-saliente-y-notificaciones-mailer)
7. [Base de Datos y Modelos (Prisma + PostgreSQL)](#-base-de-datos-y-modelos-prisma--postgresql)
8. [Configuración y Variables de Entorno (.env)](#-configuración-y-variables-de-entorno-env)
9. [Guía de Instalación y Ejecución](#-guía-de-instalación-y-ejecución)
10. [Documentación Swagger Interactiva](#-documentación-swagger-interactiva)
11. [Guía de Pruebas Rápidas con cURL](#-guía-de-pruebas-rápidas-con-curl)
12. [Despliegue en Producción y Docker](#-despliegue-en-producción-y-docker)

---

## 🌟 Visión General del Proyecto

Este proyecto es una reimplementación completa del backend oficial de **AppFlowy Cloud** (originalmente escrito en Rust con Actix-web / Tokio), migrado integralmente a **NestJS** con **TypeScript**. Mantiene una compatibilidad del 100% a nivel de API, tipos de respuesta y protocolos binarios requeridos por:

* 🌐 **AppFlowy Web** (Single Page Application en React/TypeScript).
* 💻 **AppFlowy Desktop** (Cliente de escritorio para Linux, macOS y Windows en Flutter/Rust).
* 📱 **AppFlowy Mobile** (Clientes Android e iOS en Flutter).

### Principales Ventajas de la Versión NestJS:
* **Swagger / OpenAPI 3.0 Nativo:** Interfaz gráfica interactiva en `/api/docs` con esquemas tipados, ejemplos y botón de autorización JWT para probar cada endpoint desde el navegador.
* **Protocol Envelope Canónico:** Interceptor global transparente que asegura que todas las respuestas respeten el formato estándar de AppFlowy:
  ```json
  {
    "code": 0,
    "message": "Ok",
    "data": { ... }
  }
  ```
* **Compatibilidad Dual con GoTrue:** Respuestas planas estándar para endpoints de autenticación (`/gotrue/*`), requeridas por clientes basados en Supabase GoTrue client.
* **Manejo Centralizado de Errores:** Filtro de excepciones global (`AppExceptionFilter`) que captura errores HTTP y de base de datos, formateándolos con códigos legibles.
* **pgvector y Búsqueda Semántica:** Soporte nativo para vectores de 1536 dimensiones con indexación HNSW e integración de embeddings.

---

## 🏗 Arquitectura y Estructura del Código

El proyecto sigue los principios de Clean Architecture y la modularidad idiomática de NestJS:

```text
openworkspace-backend/
├── prisma/
│   └── schema.prisma                 # Definición de modelos relacionales e índices PostgreSQL
├── src/
│   ├── main.ts                       # Bootstrap del servidor, Swagger UI, CORS, WebSocket Adapter
│   ├── app.module.ts                 # Módulo raíz que orquesta los 15 módulos
│   │
│   ├── common/                       # Capa transversal y protocolo canónico
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts # Extrae el payload AuthUser del JWT
│   │   │   └── public.decorator.ts       # Marca rutas exentas del guardia JWT
│   │   ├── dto/
│   │   │   └── api-response.dto.ts       # Estructura genérica ApiResponse<T>
│   │   ├── filters/
│   │   │   └── app-exception.filter.ts   # Intercepta excepciones y retorna formato AppFlowy
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts         # Guardia global para verificar tokens JWT
│   │   └── interceptors/
│   │       └── transform-response.interceptor.ts # Envolvente automático { code: 0, message: "Ok", data }
│   │
│   ├── infrastructure/               # Capa de infraestructura y persistencia
│   │   └── database/
│   │       ├── database.module.ts
│   │       └── prisma.service.ts         # Conexión persistente y hooks de desconexión
│   │
│   └── modules/                      # 13 Módulos de dominio + Mailer + Worker
│       ├── admin/                    # Panel de administración, stats globales, usuarios, SSO
│       ├── auth/                     # Autenticación GoTrue (signup, login, recover, magiclink)
│       ├── chat-ai/                  # Chat con IA, mensajes, streaming SSE
│       ├── collab/                   # CRDT Yjs, web-update, full-sync y WebSocket Gateway (/ws/v2)
│       ├── file-storage/             # Gestión de blobs en MinIO/S3, metadatos y cuotas
│       ├── mailer/                   # Servicio de correo saliente SMTP y fallback interactivo dev
│       ├── page/                     # Páginas, vistas, favoritos, papelera, estructura de carpetas
│       ├── quick-note/               # Notas rápidas sincronizadas
│       ├── search/                   # Búsqueda textual y vectorial en af_collab_embeddings
│       ├── system/                   # Health checks y feature flags del servidor
│       ├── template/                 # Centro de plantillas, categorías y creadores
│       ├── user/                     # Perfil de usuario, actualización y espacios
│       ├── worker/                   # Worker en background para indexación pgvector periódica
│       └── workspace/                # CRUD de espacios, miembros, códigos de invitación, accesos
```

---

## 📦 Módulos del Sistema y Catálogo de Endpoints

El backend expone **81 endpoints REST y WebSocket** categorizados en **15 etiquetas Swagger**:

### 1. System (`/health`, `/api/server`)
* `GET /health` - Health check general del sistema.
* `GET /api/health` - Health check secundario de disponibilidad.
* `GET /api/server` - Información del backend (versión, flags de soporte, endpoints compatibles).

### 2. Auth - GoTrue (`/gotrue/*`)
* `GET /gotrue/health` - Estado del motor de autenticación.
* `POST /gotrue/signup` - Registro de nuevos usuarios con creación de registro en `auth.users`, `af_user` y workspace inicial.
* `POST /gotrue/token` - Inicio de sesión con credenciales (retorna JWT access y refresh tokens).
* `POST /gotrue/recover` - Envío de Magic Link o recuperación de acceso vía correo electrónico.
* `POST /gotrue/magiclink` - Solicitud directa de inicio de sesión sin contraseña.
* `GET /gotrue/user` - Retorna los datos del usuario autenticado actual.
* `POST /gotrue/logout` - Cierre de sesión.

### 3. User (`/api/user/*`)
* `GET /api/user/profile` - Consulta del perfil del usuario logueado.
* `POST /api/user/update` - Actualización de nombre y metadatos del usuario.
* `GET /api/user/workspace` - Listado resumido de espacios a los que pertenece el usuario.
* `GET /api/user/verify/:access_token` - Verificación de validez de token de acceso.

### 4. Workspaces (`/api/workspace/*`, `/api/invite-code-info`, `/api/access-request`, `/api/import`)
* `GET /api/workspace` - Lista todos los workspaces del usuario autenticado.
* `POST /api/workspace` - Crea un nuevo espacio de trabajo.
* `GET /api/workspace/:workspace_id/member` - Lista los miembros de un espacio de trabajo.
* `DELETE /api/workspace/:workspace_id` - Elimina un espacio (soft delete).
* `GET /api/invite-code-info` - Valida y consulta información de un código de invitación.
* `POST /api/access-request` - Solicita acceso a un espacio privado.
* `GET /api/access-request/:request_id` - Consulta el estado de una solicitud de acceso.
* `POST /api/access-request/:request_id/approve` - Aprueba una solicitud de acceso pendiente.
* `POST /api/import/create` - Inicia una tarea de importación de datos (Notion, Markdown, etc.).
* `POST /api/import` - Ejecuta la importación de datos.
* `GET /api/import` - Consulta el estado de tareas de importación activas.

### 5. Pages & Views (`/api/workspace/:workspace_id/page-view/*`)
* `POST /api/workspace/:workspace_id/page-view` - Crea una nueva página o vista (Document, Grid, Board, Calendar).
* `GET /api/workspace/:workspace_id/page-view/:view_id` - Obtiene el detalle de una página.
* `PATCH /api/workspace/:workspace_id/page-view/:view_id` - Actualiza metadatos, título, layout o iconos.
* `POST /api/workspace/:workspace_id/page-view/:view_id/favorite` - Alterna el estado de favorito.
* `POST /api/workspace/:workspace_id/page-view/:view_id/move-to-trash` - Mueve una página a la papelera.
* `POST /api/workspace/:workspace_id/page-view/:view_id/restore-from-trash` - Restaura una página de la papelera.
* `GET /api/workspace/:workspace_id/folder` - Estructura jerárquica de carpetas y páginas activas.
* `GET /api/workspace/:workspace_id/trash` - Lista de documentos en la papelera.
* `GET /api/workspace/:workspace_id/favorite` - Lista de documentos marcados como favoritos.

### 6. Collab CRDT (`/api/workspace/v1/:workspace_id/collab/*` & `/ws/v2`)
* `GET /api/workspace/v1/:workspace_id/collab/:object_id` - Obtiene el estado codificado del documento Yjs.
* `GET /api/workspace/v1/:workspace_id/collab/:object_id/json` - Obtiene la representación JSON del documento.
* `POST /api/workspace/v1/:workspace_id/collab/:object_id/web-update` - Aplica un buffer de actualización incremental CRDT.
* `POST /api/workspace/v1/:workspace_id/collab/:object_id/full-sync` - Sincronización completa de estado con el cliente.
* `GET /api/workspace/:workspace_id/collab/:object_id/row-document-collab-exists` - Verifica existencia de documento de fila.
* `POST /api/workspace/:workspace_id/batch/collab` - Consulta o sincronización por lotes de múltiples collabs.
* `GET /api/workspace/:workspace_id/collab/:object_id` (v0 compat) - Lectura compatible legacy.
* `POST /api/workspace/:workspace_id/collab/:object_id` (v0 compat) - Escritura compatible legacy.
* `PUT /api/workspace/:workspace_id/collab/:object_id` (v0 compat) - Actualización compatible legacy.
* `DELETE /api/workspace/:workspace_id/collab/:object_id` (v0 compat) - Eliminación compatible legacy.
* `WS /ws/v2` - Gateway bidireccional WebSocket para colaboración en tiempo real con Yjs.

### 7. File Storage (`/api/file_storage/:workspace_id/*`)
* `PUT /api/file_storage/:workspace_id/v1/blob/:parent_dir` - Sube un archivo binario a S3/MinIO.
* `GET /api/file_storage/:workspace_id/v1/blob/:parent_dir/:file_id` - Descarga un archivo en streaming.
* `GET /api/file_storage/:workspace_id/v1/metadata/:parent_dir/:file_id` - Obtiene metadatos del archivo.
* `DELETE /api/file_storage/:workspace_id/v1/blob/:parent_dir/:file_id` - Elimina un archivo del bucket.
* `GET /api/file_storage/:workspace_id/usage` - Consulta el espacio total consumido por el workspace.

### 8. Quick Notes (`/api/workspace/:workspace_id/quick-note/*`)
* `GET /api/workspace/:workspace_id/quick-note` - Lista notas rápidas del usuario.
* `POST /api/workspace/:workspace_id/quick-note` - Crea una nueva nota rápida.
* `PUT /api/workspace/:workspace_id/quick-note/:quick_note_id` - Actualiza el contenido de una nota rápida.
* `DELETE /api/workspace/:workspace_id/quick-note/:quick_note_id` - Elimina una nota rápida.

### 9. Template Center (`/api/template-center/*`)
* `GET /api/template-center/homepage` - Consulta la página de inicio del centro de plantillas.
* `GET /api/template-center/category` - Lista todas las categorías disponibles.
* `POST /api/template-center/category` - Crea una nueva categoría.
* `GET /api/template-center/category/:category_id` - Detalle de categoría.
* `PUT /api/template-center/category/:category_id` - Actualiza categoría.
* `DELETE /api/template-center/category/:category_id` - Elimina categoría.
* `GET /api/template-center/creator` - Lista de creadores de plantillas.
* `POST /api/template-center/creator` - Registra un nuevo creador.
* `GET /api/template-center/creator/:creator_id` - Detalle de creador.
* `PUT /api/template-center/creator/:creator_id` - Actualiza perfil de creador.
* `DELETE /api/template-center/creator/:creator_id` - Elimina creador.
* `GET /api/template-center/template` - Lista de plantillas disponibles.
* `POST /api/template-center/template` - Publica una nueva plantilla.
* `GET /api/template-center/template/:view_id` - Detalle de plantilla.
* `PUT /api/template-center/template/:view_id` - Actualiza plantilla.
* `DELETE /api/template-center/template/:view_id` - Elimina plantilla.

### 10. Chat con IA (`/api/chat/:workspace_id/*`)
* `POST /api/chat/:workspace_id` - Inicia una nueva sesión de conversación con IA.
* `GET /api/chat/:workspace_id/:chat_id` - Obtiene los detalles de la sesión.
* `DELETE /api/chat/:workspace_id/:chat_id` - Elimina una sesión de chat.
* `GET /api/chat/:workspace_id/:chat_id/message` - Lista los mensajes del chat.
* `PUT /api/chat/:workspace_id/:chat_id/message` - Actualiza un mensaje existente.
* `POST /api/chat/:workspace_id/:chat_id/message/question` - Envía una pregunta al modelo.
* `POST /api/chat/:workspace_id/:chat_id/message/answer` - Guarda la respuesta del asistente.
* `GET /api/chat/:workspace_id/:chat_id/:message_id/answer` - Consulta la respuesta asociada.
* `POST /api/chat/:workspace_id/:chat_id/answer/stream` - Stream de respuesta de IA en tiempo real.
* `GET /api/chat/:workspace_id/:chat_id/:message_id/related_question` - Obtiene preguntas relacionadas sugeridas.
* `GET /api/chat/:workspace_id/:chat_id/settings` - Consulta configuración del asistente en el chat.
* `POST /api/chat/:workspace_id/:chat_id/settings` - Guarda configuración del asistente.

### 11. AI Tools & Completions (`/api/ai/:workspace_id/*`)
* `POST /api/ai/:workspace_id/complete/stream` - Autocompletado de texto vía Server-Sent Events (SSE).
* `POST /api/ai/:workspace_id/v2/complete/stream` - Versión v2 optimizada de autocompletado en streaming.
* `POST /api/ai/:workspace_id/summarize_row` - Resumen automático de filas y bases de datos.
* `POST /api/ai/:workspace_id/translate_row` - Traducción automática de contenido de filas.
* `GET /api/ai/:workspace_id/local/config` - Configuración local de IA del workspace.
* `POST /api/ai/:workspace_id/calculate_similarity` - Cálculo de similitud coseno entre dos textos.
* `GET /api/ai/:workspace_id/model/list` - Modelos de lenguaje disponibles configurados.

### 12. Search (`/api/search/*`)
* `GET /api/search/:workspace_id` - Búsqueda por palabra clave combinando títulos y fragmentos de texto vectorizados en `af_collab_embeddings`.
* `GET /api/search/:workspace_id/summary` - Resumen agregado con estadísticas y total de coincidencias.

### 13. Admin Console (`/api/admin/*`)
* `GET /api/admin/stats` - Estadísticas globales del clúster (usuarios, espacios, documentos, almacenamiento).
* `GET /api/admin/users` - Lista de todos los usuarios registrados.
* `POST /api/admin/users` - Creación administrativa de usuarios.
* `GET /api/admin/users/:user_id` - Información detallada de un usuario.
* `PUT /api/admin/users/:user_id` - Modificación de datos de usuario.
* `DELETE /api/admin/users/:user_id` - Eliminación de usuario.
* `GET /api/admin/workspaces` - Lista de todos los workspaces del servidor.
* `POST /api/admin/users/:email/generate-link` - Generación de Magic Link administrativo de acceso directo.
* `GET /api/admin/sso` - Lista de proveedores SSO / OAuth configurados.
* `POST /api/admin/sso` - Creación o actualización de proveedor SSO.
* `DELETE /api/admin/sso/:provider_id` - Eliminación de configuración SSO.

### 14. Mailer (`/api/mailer/*`)
* `GET /api/mailer/status` - Consulta el estado del transporte de correo (SMTP o consola de desarrollo).
* `POST /api/mailer/test` - Envío de correo de prueba para validar la conectividad.
* `POST /api/mailer/invite` - Envío de invitaciones por correo utilizando la plantilla HTML oficial de AppFlowy.

### 15. Worker (`/api/worker/*`)
* `GET /api/worker/status` - Métricas operativas del indexador (documentos totales, indexados, pendientes y fragmentos de embeddings).
* `POST /api/worker/index-now` - Dispara de manera inmediata y forzada una pasada de indexación vectorial sobre documentos pendientes.

---

## ⚡ Sincronización CRDT y WebSockets (/ws/v2)

AppFlowy se basa en **Yjs**, una estructura de datos replicada sin conflictos (CRDT). El backend en NestJS proporciona dos mecanismos de sincronización totalmente compatibles:

1. **Protocolo HTTP Web-Update (`POST /api/workspace/v1/:id/collab/:oid/web-update`):**
   * El cliente envía una actualización incremental binaria.
   * El servidor carga el estado existente del documento desde `af_collab.blob`, aplica la actualización mediante `Y.applyUpdate(ydoc, update)` y persiste el nuevo estado combinado `Y.encodeStateAsUpdate(ydoc)`.
2. **WebSocket Gateway en `/ws/v2` (`CollabGateway`):**
   * Conexión persistente mediante el estándar `ws`.
   * Maneja mensajes de sincronización en tiempo real (`collab_update`) y latidos (`ping`/`pong`).
   * Difunde instantáneamente las mutaciones a todas las demás sesiones conectadas al mismo `oid` (room).

---

## 🧠 Worker de Indexación Vectorial en Background (pgvector)

El subsistema [`IndexerService`](file:///home/rodrigo/Escritorio/JavaScript/app-flowy/appflowy-backend-nest/src/modules/worker/indexer.service.ts) sustituye al binario en Rust `services/appflowy-worker`:

* **Detección Automática:** Cada 30 segundos (configurable), consulta en PostgreSQL los documentos de `af_collab` donde `indexed_at IS NULL` o `updated_at > indexed_at`.
* **Extracción de Texto:** Decodifica los blobs binarios Yjs usando `Y.Doc` y extrae recursivamente párrafos de texto, bloques y mapas compartidos.
* **Chunking Inteligente:** Divide textos largos en fragmentos de 1000 caracteres con 100 de solapamiento (`chunkOverlap`) para preservar el contexto de las oraciones.
* **Generación de Embeddings:**
  * Si se proporciona una clave OpenAI (`OPENAI_API_KEY`), invoca el modelo `text-embedding-3-small` generando vectores normalizados de **1536 dimensiones**.
  * Si no hay API key, genera vectores deterministas normalizados basados en hash SHA-256 de 1536 dimensiones, permitiendo que PostgreSQL indexe y ejecute consultas de distancia coseno sin errores ni costos obligatorios de IA.
* **Persistencia Nativa en PostgreSQL:**
  Inserta directamente en `af_collab_embeddings` mediante la sintaxis nativa de `pgvector`:
  ```sql
  INSERT INTO af_collab_embeddings (fragment_id, oid, content_type, indexed_at, content, embedding, metadata, fragment_index, embedder_type)
  VALUES ($1, $2::uuid, 0, NOW(), $3, $4::vector, $5::jsonb, $6, 0)
  ON CONFLICT (fragment_id, oid)
  DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding, indexed_at = NOW();
  ```
  y actualiza `af_collab.indexed_at = NOW()`.

---

## 📧 Sistema de Correo Saliente y Notificaciones (Mailer)

El subsistema [`MailerService`](file:///home/rodrigo/Escritorio/JavaScript/app-flowy/appflowy-backend-nest/src/modules/mailer/mailer.service.ts) replica las funciones de `src/mailer.rs` con soporte para:

* **Modo Resiliente de Desarrollo:** Si no configuras credenciales SMTP en el `.env`, el servidor **nunca se cuelga ni falla**. En su lugar, formatea e imprime tarjetas visuales con los links directamente en el log de NestJS:
  ```text
  ┌──────────────────────────────────────────────────────────────────────┐
  │ 📧 [APPFLOWY MAILER - CONSOLE FALLBACK]
  │ To:      usuario@ejemplo.com
  │ Subject: Rodrigo invited you to Engineering Hub in AppFlowy
  │ Body:
  │ Rodrigo invited you to Engineering Hub: http://localhost:3000/invite?code=123
  └──────────────────────────────────────────────────────────────────────┘
  ```
* **Modo SMTP de Producción:** Al colocar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASS` en tu archivo `.env`, se activa automáticamente el transporte Nodemailer para enviar correos reales con diseño HTML responsive oficial de AppFlowy (gradiente índigo/púrpura, botones CTA y pie de página institucional).

---

## 🗄 Base de Datos y Modelos (Prisma + PostgreSQL)

El backend se conecta directamente a la instancia existente de PostgreSQL con extensión **pgvector** habilitada.

### Tablas Principales Mapeadas en Prisma (`prisma/schema.prisma`):

| Modelo Prisma | Tabla PostgreSQL | Descripción |
|---|---|---|
| `User` | `af_user` | Usuarios de AppFlowy vinculados a `auth.users` mediante UUID |
| `Workspace` | `af_workspace` | Espacios de trabajo (personales y colaborativos) |
| `WorkspaceMember` | `af_workspace_member` | Miembros del espacio y sus roles de acceso |
| `View` | `af_view` & `af_folder_view` | Vistas, páginas, documentos y jerarquía de carpetas |
| `Collab` | `af_collab` | Estado binario de documentos Yjs CRDT con marcas de actualización |
| `CollabSnapshot` | `af_collab_snapshot` | Instantáneas históricas de versiones de documentos |
| `BlobMetadata` | `af_blob_metadata` | Metadatos de archivos multimedia subidos a S3/MinIO |
| `QuickNote` | `af_quick_note` | Notas rápidas de usuario |
| `TemplateCategory` | `af_template_category` | Categorías del centro de plantillas |
| `TemplateCreator` | `af_template_creator` | Creadores y autores de plantillas |
| `TemplateView` | `af_template_view` | Plantillas comunitarias y oficiales |

---

## ⚙️ Configuración y Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto [`appflowy-backend-nest`](file:///home/rodrigo/Escritorio/JavaScript/app-flowy/appflowy-backend-nest/.env) con la siguiente configuración:

```env
# Puerto del servidor NestJS
PORT=3001

# Conexión a PostgreSQL (con pgvector)
DATABASE_URL="postgresql://postgres:password@172.28.0.2:5432/postgres?schema=public"

# Seguridad y Autenticación JWT
JWT_SECRET="super-secret-appflowy-nest-jwt-key-2026"
JWT_EXPIRES_IN="7d"

# Almacenamiento de Archivos (MinIO / AWS S3)
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_BUCKET="appflowy"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_FORCE_PATH_STYLE="true"

# Servicio de Correo Saliente (Opcional - Si se omite, se usa modo consola fallback)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE="false"
SMTP_FROM="AppFlowy Cloud <noreply@appflowy.io>"

# Worker de Indexación Vectorial en Background
APPFLOWY_WORKER_INDEX_INTERVAL_SECS=30
APPFLOWY_EMBEDDING_CHUNK_SIZE=1000
APPFLOWY_EMBEDDING_CHUNK_OVERLAP=100

# OpenAI (Opcional - Para embeddings semánticos reales y chat)
OPENAI_API_KEY=""
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
```

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos
* Node.js v20.x o superior.
* Gestor de paquetes `pnpm` (recomendado) o `npm`.
* Contenedores de PostgreSQL y MinIO de AppFlowy en ejecución.

### 1. Clonar / Navegar al Proyecto
```bash
cd /home/rodrigo/Escritorio/JavaScript/app-flowy/openworkspace-backend
```

### 2. Instalar Dependencias
```bash
pnpm install
```

### 3. Generar el Cliente de Prisma
```bash
pnpm run prisma:generate
```

### 4. Compilar el Código TypeScript
```bash
pnpm run build
```

### 5. Iniciar el Servidor

* **Modo Desarrollo (con hot-reload):**
  ```bash
  pnpm run start:dev
  ```
* **Modo Producción:**
  ```bash
  pnpm run start:prod
  ```

---

## 📖 Documentación Swagger Interactiva

Una vez iniciado el servidor, accede directamente desde tu navegador a:

🔗 **[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

### Características de la Interfaz Swagger:
* **Filtro y Búsqueda de Endpoints:** Búsqueda rápida por nombre o tag.
* **Botón `Authorize` (Candado Superior Derecho):** Permite ingresar tu JWT `Bearer <token>` obtenido en `/gotrue/token` o `/gotrue/signup` para autenticar automáticamente todas las peticiones con un solo clic.
* **Esquemas DTO y Respuestas Validadas:** Visualización de modelos de petición y respuesta en formato JSON.
* **Prueba en Vivo (`Try it out`):** Ejecución directa de peticiones HTTP contra la base de datos real.

---

## 🧪 Guía de Pruebas Rápidas con cURL

Puedes verificar todo el flujo operativo ejecutando los siguientes comandos en tu terminal:

### 1. Registro de Usuario (`POST /gotrue/signup`)
```bash
curl -s -X POST http://localhost:3001/gotrue/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.user@appflowy.io",
    "password": "SecretPassword123!",
    "data": { "name": "Demo User" }
  }' | jq .
```

### 2. Login de Usuario (`POST /gotrue/token`)
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/gotrue/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.user@appflowy.io",
    "password": "SecretPassword123!"
  }' | jq -r .access_token)

echo "JWT Token: $TOKEN"
```

### 3. Crear un Workspace (`POST /api/workspace`)
```bash
WORKSPACE_ID=$(curl -s -X POST http://localhost:3001/api/workspace \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_name": "Espacio de Ingeniería"
  }' | jq -r .data.workspace_id)

echo "Workspace ID: $WORKSPACE_ID"
```

### 4. Crear una Página / Documento (`POST /api/workspace/:id/page-view`)
```bash
VIEW_ID=$(curl -s -X POST "http://localhost:3001/api/workspace/$WORKSPACE_ID/page-view" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Guía de Inicio Rápido",
    "layout": 0
  }' | jq -r .data.view_id)

echo "View ID: $VIEW_ID"
```

### 5. Sincronizar un Documento CRDT (`POST /api/workspace/v1/:id/collab/:oid/web-update`)
```bash
curl -s -X POST "http://localhost:3001/api/workspace/v1/$WORKSPACE_ID/collab/$VIEW_ID/web-update" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doc_state": [1, 2, 3, 4, 5]
  }' | jq .
```

### 6. Consultar Estado del Worker de Embeddings (`GET /api/worker/status`)
```bash
curl -s http://localhost:3001/api/worker/status | jq .
```

### 7. Enviar un Correo de Prueba (`POST /api/mailer/test`)
```bash
curl -s -X POST http://localhost:3001/api/mailer/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "destinatario@ejemplo.com",
    "subject": "Prueba de AppFlowy",
    "body": "¡El sistema de correo está funcionando perfectamente!"
  }' | jq .
```

---

## 🐳 Despliegue en Producción y Docker

### Opción 1: Ejecutar con PM2 (Proceso en Segundo Plano)
```bash
pnpm install -g pm2
pm2 start dist/main.js --name "appflowy-nest"
pm2 save
```

### Opción 2: Dockerfile de Producción
Crea un `Dockerfile` multietapa optimizado:

```dockerfile
# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run prisma:generate
RUN pnpm run build

# Etapa 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

---
