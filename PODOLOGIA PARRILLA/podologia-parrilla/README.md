# Centro de Podologia Parrilla - Web + Panel Admin

Web rediseñada con sistema de reservas online y panel de administracion. Lista para desplegar en Vercel.

## Estructura del proyecto

```
podologia-parrilla/
├── public/
│   ├── index.html       ← Web publica con sistema de reservas
│   └── admin.html       ← Panel de administracion
├── api/
│   └── reservas.js      ← API serverless (Vercel Functions)
├── lib/
│   └── schema.sql       ← Schema de base de datos (Supabase)
├── .env.example         ← Plantilla de variables de entorno
├── vercel.json          ← Configuracion de Vercel
└── package.json
```

## Despliegue en Vercel (paso a paso)

### Paso 1 - Subir a GitHub

1. Crear cuenta en [github.com](https://github.com)
2. Crear repositorio nuevo → "podologia-parrilla"
3. Subir todos los archivos de este proyecto

```bash
git init
git add .
git commit -m "primera version"
git remote add origin https://github.com/TU_USUARIO/podologia-parrilla.git
git push -u origin main
```

### Paso 2 - Conectar con Vercel

1. Ir a [vercel.com](https://vercel.com) → "Continue with GitHub"
2. Seleccionar el repositorio `podologia-parrilla`
3. Click en "Deploy"
4. En 2 minutos la web estara en `podologia-parrilla.vercel.app`

### Paso 3 - Configurar Supabase (opcional para persistencia)

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear proyecto nuevo
3. Ir a "SQL Editor" → pegar el contenido de `lib/schema.sql` → ejecutar
4. Ir a Settings > API → copiar URL y claves

### Paso 4 - Añadir variables de entorno en Vercel

En Vercel → tu proyecto → Settings → Environment Variables, anadir:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave publica de Supabase |
| `SUPABASE_SERVICE_KEY` | Clave privada de Supabase |
| `RESEND_API_KEY` | Clave de Resend (para emails) |

Tras añadir las variables, hacer "Redeploy" en Vercel.

### Paso 5 - Dominio propio (opcional)

1. Comprar dominio en [namecheap.com](https://namecheap.com)
2. En Vercel → Settings → Domains → anadir dominio
3. Vercel te dara los DNS a configurar
4. En 24-48h el dominio estara activo con HTTPS automatico

## Acceso al panel de administracion

- **URL:** `tu-dominio.com/admin`
- **Email (prueba):** admin@podologiaparrilla.com
- **Contrasena (prueba):** admin123

> Cambiar las credenciales antes de pasar a produccion usando Supabase Auth.

## Funcionalidades incluidas

### Web publica
- [x] Diseño profesional y responsive
- [x] Formulario de reservas en 3 pasos
- [x] Servicios y tarifas
- [x] Reseñas de pacientes reales
- [x] Perfil del profesional
- [x] Mapa de ubicacion
- [x] FAQ interactivo
- [x] Contacto directo (telefono y email)

### Panel de admin
- [x] Dashboard con estadisticas
- [x] Grafica de reservas semanales
- [x] Listado completo de reservas
- [x] Busqueda y filtros por estado
- [x] Ver detalle de cada reserva
- [x] Confirmar o cancelar reservas con un click
- [x] Crear reservas manuales
- [x] Listado de pacientes
- [x] Configuracion de horarios
- [x] Gestion de servicios y tarifas

### API
- [x] POST /api/reservas - crear reserva
- [x] GET /api/reservas - listar reservas
- [x] PUT /api/reservas - actualizar estado
- [ ] Email de confirmacion (requiere Resend)
- [ ] Autenticacion real (requiere Supabase Auth)

## Coste estimado en produccion

| Servicio | Coste |
|---|---|
| Vercel (hosting) | 0€/mes |
| Supabase (base de datos) | 0€/mes |
| Resend (emails) | 0€/mes hasta 3.000 emails |
| Dominio .es | ~10€/año |
| **TOTAL** | **~10€/año** |

## Proximos pasos (version completa)

- [ ] Autenticacion real con Supabase Auth
- [ ] Email automatico al reservar (via Resend)
- [ ] Sistema de recordatorios por SMS/WhatsApp
- [ ] Calendario interactivo en el admin
- [ ] Google Calendar sync
- [ ] Ficha de paciente con historial completo
- [ ] Exportar reservas a Excel
- [ ] Estadisticas avanzadas por servicio
