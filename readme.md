# Inventario Kinal — Sistema de Inventario

Full-stack: **TypeScript + Node.js + Express + Prisma + PostgreSQL** (backend) + **Angular 22** (frontend).

```
Categoria (1) ───< Producto (1) ───< Movimiento
```

---

## Ejecutar el proyecto

Necesitas **2 terminales** — una para el backend y otra para el frontend.

### Backend (API — puerto 3000)

```bash
cd backend
pnpm install
# Copiar y editar .env con tu conexión a PostgreSQL
cp .env.example .env
# Generar hash de contraseña del admin
pnpm exec ts-node src/scripts/generarHash.ts admin123
# Pegar el hash en ADMIN_PASSWORD_HASH del .env
# Crear tablas en la BD
pnpm exec prisma migrate dev --name init
# (Opcional) Datos de ejemplo
pnpm exec prisma db seed
# Iniciar servidor
pnpm run dev
```

### Frontend (Angular — puerto 4200)

```bash
cd kinal-inventario-frontend
pnpm install
ng serve -o
```

> Si `ng serve` no funciona, instala Angular CLI global: `pnpm add -g @angular/cli`

### Probar la API

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/productos
```

### Login de prueba

```
Correo: admin@kinal.edu.gt
Password: (el que definiste en ADMIN_PASSWORD_HASH)
```

---

## Scripts disponibles

| Script | Ubicación | Descripción |
|--------|-----------|-------------|
| `pnpm run dev` | `backend/` | Inicia el servidor API con nodemon (hot-reload) |
| `ng serve` | `kinal-inventario-frontend/` | Inicia el servidor de desarrollo Angular |
| `ng build` | `kinal-inventario-frontend/` | Compila el frontend para producción en `dist/` |
| `pnpm exec prisma studio` | `backend/` | Abre una interfaz web para ver/editar la BD |
| `pnpm exec prisma db seed` | `backend/` | Inserta datos de ejemplo (seed.ts) |
| `pnpm run insert-data` | `backend/` | Inserta 12 productos + 3 categorías de prueba |
| `pnpm exec ts-node src/scripts/generarHash.ts <pass>` | `backend/` | Genera hash bcrypt para el .env |

---

## Insertar datos de prueba adicionales

```bash
cd backend
pnpm run insert-data
```

Agrega 3 categorías (Tecnología, Alimentos, Ferretería) y 12 productos con stock variado.
No duplica categorías (usa `upsert`). Se puede ejecutar múltiples veces.

---

## Estructura del proyecto

```
kinal-inventario/
├── backend/                     # API REST (Express + Prisma + PostgreSQL)
│   ├── src/
│   │   ├── controllers/         # Lógica de cada endpoint
│   │   ├── routes/              # Definición de rutas (/api/...)
│   │   ├── services/            # Lógica de negocio + BD
│   │   ├── middlewares/         # Auth JWT + error handler
│   │   ├── types/               # Validación Zod + tipos TS
│   │   └── index.ts             # Punto de entrada
│   └── prisma/
│       ├── schema.prisma        # Modelo de datos
│       ├── seed.ts              # Seed original
│       └── insert-data.ts       # Script de datos adicionales
│
├── kinal-inventario-frontend/   # SPA Angular standalone
│   └── src/app/
│       ├── core/models/         # Interfaces TS (Categoria, Producto, Movimiento)
│       ├── core/services/       # Auth, HTTP CRUD, interceptor, guard
│       ├── features/login/      # Pantalla de inicio de sesión
│       ├── features/productos/  # Lista + formulario
│       ├── features/categorias/ # Lista + formulario
│       └── features/movimientos/# Lista + formulario
│
├── frontend/                    # Template fuente (Angular 18, referencia)
├── .gitignore
└── readme.md
```

---

## Soluciones (documentación de fixes)

<details>
<summary>Ver histórico de problemas y soluciones</summary>

### Formato
```
IA: (Nombre de la IA)
Problema: (Descripción)
Solución: (Explicación)
```

---

### IA: Gemini 2.5 Flash

**Problema:** Error `Cannot find module @rollup/rollup-linux-x64-gnu` al ejecutar `ng serve`.

**Solución:** Eliminar `node_modules` y `pnpm-lock.yaml`, luego `pnpm install` para descarga limpia de binarios nativos.

---

### IA: opencode (big-pickle)

**Problema:** El sistema no registraba movimientos automáticos al crear/actualizar productos. No había auditoría de cambios de stock.

**Solución – Cambios implementados:**

1. **Registro automático de movimientos** (`backend/src/services/producto.service.ts`):
   - `crear()`: auto-registra movimiento `ENTRADA` con stock inicial (transacción Prisma)
   - `actualizar()`: detecta cambios de stock, registra `ENTRADA` o `SALIDA` según corresponda
   - `eliminar()`: cascade para limpiar movimientos asociados

2. **Método `registrarAutomatico()`** (`backend/src/services/movimiento.service.ts`): crea movimientos sin modificar stock (uso interno)

3. **Vistas verificadas**: todas las vistas del frontend (listas y formularios) funcionales

---

### IA: opencode (big-pickle) — Fix 2

**Problema:** Vistas de Productos, Categorías y Movimientos atoradas en "Cargando..." permanentemente.

**Causa raíz:**
- Backend Express caído (nodemon zombie, puerto 3000 no escuchando)
- Handlers de error sin `console.error` (imposible diagnosticar desde el navegador)

**Soluciones:**

1. **Reinicio del backend**: `kill` al proceso zombie y `pnpm run dev`
2. **Mejora en error handlers**: se agregó `console.error(err)` y `err.error?.mensaje` en los 3 componentes lista
3. **Refactor del interceptor**: se eliminó `inject(AuthService)`, ahora usa `localStorage.getItem()` directo con try-catch
4. **Lección**: se necesitan 2 terminales (backend + frontend)

---

### IA: opencode (big-pickle) — Fix 3

**Problema:** Datos llegaban al callback `next` del Observable pero la interfaz no se actualizaba (cargando permanente).

**Causa raíz:** Change detection de Angular no se disparaba tras la respuesta HTTP (fetch + Zone.js).

**Solución:** Se inyectó `ChangeDetectorRef` en los 3 componentes lista y se llamó `detectChanges()` después de asignar datos.

---

### IA: opencode (big-pickle) — Fix 4 (Rediseño Visual)

**Problema:** Frontend con diseño básico, sin identidad visual profesional.

**Solución:** Se aplicó el diseño **"Liquid Glass Logistics"** — tema oscuro con glassmorphism, acentos cian/violeta, tipografía Inter.

**Archivos modificados:**

| Archivo | Cambio |
|---------|--------|
| `src/index.html` | Google Fonts + Tailwind CDN + colores personalizados |
| `src/styles.css` | `.glass-card`, `.btn-primary`, `.btn-ghost`, `.liquid-blob`, `.status-dot` |
| `src/app/app.component.html/css` | Sidebar glass fija + mobile bottom nav + layout responsive |
| `producto-list/` | 4 stats cards + tabla con badges y dots de estado |
| `categoria-list/` | Bento grid responsive con cards glass |
| `movimiento-list/` | Stats + tabla timeline con indicador de tipo |
| `producto-form/`, `categoria-form/`, `movimiento-form/` | Formularios glass con inputs oscuros y glow cian |
| `login/` | Card glass centrado con ícono decorativo |

**Elementos del diseño:**
- **Glassmorphism**: `backdrop-filter: blur(24px)` + borde translúcido + sombra suave
- **Background blobs**: círculos animados con blur para profundidad
- **Tipografía**: Inter en 6 escalas (display-lg a label-caps)
- **Estados visuales**: dot verde (en stock), rojo (stock bajo), violeta (salida), cian (entrada)
- **Responsive**: sidebar colapsa a bottom nav en móvil

</details>

---
