# Podología Parrilla · Web + Backend

Web multipágina + panel de administración completo para el Centro de Podología Parrilla en Sevilla.

## Estructura

```
parrilla-v2/
├── index.html          # Página principal
├── servicios.html      # Servicios
├── tarifas.html        # Precios
├── equipo.html         # Equipo
├── faq.html            # Preguntas frecuentes
├── contacto.html       # Contacto
├── reservar.html       # Formulario de reservas (público)
├── styles.css          # Estilos compartidos
├── nav.js              # JS compartido (nav, reveal, etc.)
├── admin/
│   └── index.html      # Panel de administración completo
├── api/
│   ├── reservas.js     # GET lista / POST crear reserva
│   ├── reservas/[id].js# GET / PUT / DELETE una reserva
│   ├── disponibilidad.js# Slots disponibles por fecha
│   ├── servicios.js    # CRUD servicios
│   ├── horarios.js     # Horarios y bloqueos
│   ├── pacientes.js    # Listado y edición de pacientes
│   ├── cms.js          # Contenido CMS editable
│   └── admin/
│       ├── login.js    # Autenticación
│       └── stats.js    # Estadísticas dashboard
└── lib/
    ├── supabase.js     # Cliente de base de datos
    ├── email.js        # Emails con Resend
    ├── auth.js         # JWT para el panel admin
    └── schema.sql      # Schema completo de Supabase
```

## Despliegue en Vercel + Supabase

### 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `lib/schema.sql`
3. Anota la **Project URL** y la **service_role key** (Settings → API)

### 2. Deploy en Vercel

1. Sube esta carpeta a un repositorio de GitHub
2. Importa el repositorio en [vercel.com](https://vercel.com)
3. En **Environment Variables** añade:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | Tu Project URL de Supabase |
| `SUPABASE_SERVICE_KEY` | Tu service_role key |
| `ADMIN_EMAIL` | podologiaparrilla@gmail.com |
| `ADMIN_PASSWORD` | Tu contraseña segura |
| `ADMIN_SECRET` | Cadena aleatoria larga (JWT secret) |
| `RESEND_API_KEY` | Tu clave de [resend.com](https://resend.com) (opcional) |
| `EMAIL_FROM` | citas@podologiaparrilla.com |

4. Despliega. La URL del panel admin será: `https://tu-dominio.vercel.app/admin`

### 3. Acceso al panel

- URL: `/admin`
- Email: el configurado en `ADMIN_EMAIL`
- Contraseña: la configurada en `ADMIN_PASSWORD`

## Panel de administración — Funcionalidades

| Sección | Funciones |
|---|---|
| **Dashboard** | Estadísticas: citas de hoy/semana/mes, ingresos, pendientes |
| **Reservas** | Ver, filtrar, editar, confirmar, cancelar reservas |
| **Agenda** | Vista de calendario por día |
| **Pacientes** | Listado de pacientes con historial |
| **Servicios** | Crear, editar, activar/desactivar servicios y precios |
| **Horarios** | Configurar horario semanal y períodos de cierre |
| **CMS · Textos** | Editar hero, datos de contacto, redes, SEO |
| **CMS · Testimonios** | Gestionar reseñas visibles en la web |
| **CMS · FAQ** | Gestionar preguntas frecuentes |

## Emails automáticos

Con Resend configurado, el sistema envía automáticamente:
- **Al paciente** al crear una reserva (solicitud recibida)
- **Al admin** con cada nueva reserva
- **Al paciente** cuando se confirma la cita
