# RIVER ID — Mi vida como hincha

Aplicación web para hinchas de River Plate: un **diario digital del hincha** donde cada usuario registra los partidos a los que fue, organiza los próximos, guarda recuerdos y consulta sus estadísticas personales.

> Proyecto no oficial, desarrollado para el Trabajo Práctico 2 de **Desarrollo Frontend II** (2026).

- **App publicada:** https://river-id-ez6q.vercel.app
- **Repositorio:** https://github.com/agustinavegaa/river-id

## Tecnologías

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Firebase](https://firebase.google.com/): Cloud Firestore (base de datos) y Authentication anónima
- [Lucide React](https://lucide.dev/) (íconos)
- Google Fonts: Anton (títulos) e Inter (textos)
- Vercel (despliegue)

## Funcionalidades (versión 2)

- **Inicio:** portada con cuenta regresiva al próximo partido, carrusel de últimos partidos, sección "Sobre River ID" y banner con tu récord.
- **Mis partidos:** agregar, consultar, editar y eliminar partidos; marcar favoritos; comentario personal; búsqueda por rival y filtros por estado.
- **Próximos:** partidos con estado "Próximo", con cuenta regresiva y aviso cuando un partido ya se jugó; se pueden marcar como "Asistí" o "No asistí".
- **Estadísticas:** porcentaje de victorias, partidos asistidos, victorias, empates, derrotas, favoritos y datos curiosos (rival, estadio y competición más vistos).

## Instalación y ejecución local

Requisitos: Node.js 20 o superior.

```bash
npm install
cp .env.example .env    # completar con los datos de Firebase
npm run dev
```

La app queda disponible en `http://localhost:5173`.

Para generar la versión de producción:

```bash
npm run build
npm run preview
```

## Configuración de Firebase

1. Entrar a [Firebase Console](https://console.firebase.google.com/) y crear un proyecto (Google Analytics no es necesario).
2. En **Configuración del proyecto → Tus apps**, registrar una app web con el botón `</>` (Firebase Hosting no es necesario).
3. Copiar los valores del objeto `firebaseConfig` en el archivo `.env`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   Una variable por línea, sin comillas ni comas. Después de cambiar `.env` hay que reiniciar `npm run dev`.
4. **Authentication → Método de acceso:** habilitar **Anónimo**.
5. **Firestore Database → Crear base de datos:** edición Standard, ID `(default)`, ubicación `southamerica-east1 (São Paulo)`, **modo producción**.
6. **Firestore → Reglas:** pegar el contenido de [`firestore.rules`](./firestore.rules) y publicar.

> Las variables `VITE_` quedan visibles en el navegador. Eso es normal para la configuración web de Firebase; la seguridad de los datos la dan las **reglas de Firestore**. Nunca se deben poner claves privadas ni cuentas de servicio en el frontend.

## Datos guardados en Firestore

Colección `matches`. Cada documento es un partido:

| Campo         | Tipo               | Descripción                                      |
| ------------- | ------------------ | ------------------------------------------------ |
| `uid`         | string             | ID del usuario anónimo dueño del registro        |
| `rival`       | string             | Nombre del rival (obligatorio)                   |
| `date`        | string             | Fecha `AAAA-MM-DD` (obligatoria)                 |
| `time`        | string             | Hora `HH:MM` (opcional, desde la versión 2)      |
| `competition` | string             | Competición                                      |
| `stadium`     | string             | Estadio o ubicación                              |
| `riverGoals`  | number \| null     | Goles de River (`null` = sin resultado)          |
| `rivalGoals`  | number \| null     | Goles del rival (`null` = sin resultado)         |
| `status`      | string             | `proximo`, `asisti` o `no_asisti`                |
| `comment`     | string             | Recuerdo o comentario personal                   |
| `favorite`    | boolean            | Partido favorito                                 |
| `createdAt`   | timestamp          | Fecha de creación                                |
| `updatedAt`   | timestamp          | Última modificación                              |

Un resultado vacío se guarda como `null`, para no confundirlo con un 0-0.

## Reglas de seguridad

Las reglas ([`firestore.rules`](./firestore.rules)) permiten que cada usuario lea, cree, modifique y elimine **solo sus propios partidos** (los que tienen su `uid`). Cualquier otra colección queda cerrada.

Como se usa acceso anónimo, cada navegador tiene su propia identidad: abrir la app desde otro dispositivo no muestra la misma lista.

## Estructura del proyecto

```
src/
├── firebase/
│   └── config.js           # Inicializa Firebase con las variables de .env
├── services/
│   ├── authService.js      # Inicio de sesión anónimo
│   └── matchesService.js   # CRUD de partidos en Firestore
├── utils/
│   └── matchUtils.js       # Estados, formato de fechas y cálculo de estadísticas
├── components/             # Piezas reutilizables (tarjetas, formulario, modal...)
├── pages/                  # Pantallas: Inicio, Mis partidos, Próximos, Estadísticas
├── App.jsx                 # Estado principal, navegación y acciones
├── main.jsx                # Punto de entrada
└── index.css               # Estilos
```

### ¿Dónde está cada operación?

- **Configuración de Firebase:** `src/firebase/config.js`
- **Consultar partidos:** `getMatches()` en `src/services/matchesService.js` (usa `getDocs` + `where('uid', '==', uid)`)
- **Agregar:** `addMatch()` (usa `addDoc`)
- **Modificar:** `updateMatch()` (usa `updateDoc`) — editar, favorito y cambio de estado
- **Eliminar:** `deleteMatch()` (usa `deleteDoc`)
- Estas funciones se llaman desde `src/App.jsx` (`handleSave`, `handleConfirmDelete`, `quickUpdate`).

## Despliegue en Vercel

1. Subir el repositorio a GitHub (el `.gitignore` ya excluye `.env`, `node_modules` y `dist`).
2. En [Vercel](https://vercel.com/), importar el repositorio. Framework: **Vite**; build: `npm run build`; output: `dist`. Root Directory: la carpeta donde está `package.json`.
3. En **Settings → Environment Variables** cargar las cuatro variables `VITE_FIREBASE_*` para Production.
4. Desplegar. Si las variables se cambian después, hacer **Redeploy**.

Las reglas de Firestore se publican en Firebase Console, no en Vercel.
