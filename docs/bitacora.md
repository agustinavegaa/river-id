# Bitácora — RIVER ID

Registro del proceso de desarrollo del TP2 de Desarrollo Frontend II.

---

## Versión 1 — Primera versión funcional

**Fecha:** 24/10/2026

### Idea

- **Necesidad:** los hinchas recuerdan partidos, resultados y experiencias, pero no tienen un lugar para organizar esos recuerdos ni consultar su historial.
- **Público:** hinchas de River Plate, jóvenes y adultos.
- **Qué se guarda:** partidos (rival, fecha, competición, estadio, resultado, estado, comentario, favorito), asociados al usuario anónimo.
- **Vuelta de tuerca respecto de un gestor de tareas:** el mismo registro sirve como agenda (próximos), diario (recuerdos y favoritos) y fuente de estadísticas personales (récord como hincha).

### Qué se desarrolló

- Proyecto React + Vite organizado en `firebase/`, `services/`, `utils/`, `components/` y `pages/`.
- Conexión con Firebase: Authentication anónima + Cloud Firestore.
- CRUD completo sobre la colección `matches`.
- Cuatro pantallas: Inicio, Mis partidos, Próximos y Estadísticas.
- Reglas de Firestore que limitan cada registro a su dueño.
- README, `.env.example`, `.gitignore`, `firestore.rules` y `vercel.json`.

### Decisiones de diseño

| Decisión | Motivo |
| --- | --- |
| Paleta rojo `#9E182B`, negro, blanco y gris claro | Identidad de River sin copiar el escudo oficial (la app no es oficial). |
| La "banda roja" como recurso gráfico (logo, hero, borde de la barra lateral) | Es el símbolo más reconocible de la camiseta y se puede usar de forma abstracta. |
| Rojo solo en acciones importantes y en la sección activa | Si todo es rojo, nada se destaca. El negro se usa como color de base. |
| Barra lateral en escritorio, barra inferior en celular | En celular la barra inferior queda al alcance del pulgar. |
| Formulario en una ventana modal (en celular sube desde abajo) | Se puede agregar un partido desde cualquier pantalla sin perder el lugar. |
| Tarjetas con el marcador centrado ("River 2 – 0 Boca") | Imita la forma en que se muestra un resultado en TV; se lee de un vistazo. |
| Colores de resultado: verde (victoria), dorado (empate), rojo (derrota) | Lectura rápida del historial. |
| Sin imágenes externas | La app funciona igual sin conexión a otros servidores de imágenes y carga rápido. |
| Íconos Lucide React | Livianos, consistentes y fáciles de usar como componentes. |

### Decisiones técnicas

| Decisión | Motivo |
| --- | --- |
| Navegación con `useState` en lugar de React Router | Son solo cuatro pantallas; evita una dependencia y configuración extra en Vercel. |
| Una sola colección `matches` filtrada por `status` | La consigna pide no duplicar datos: "Próximos" es un filtro de la misma colección. |
| Goles vacíos guardados como `null` | Para no confundir "sin resultado" con un 0-0. |
| Después de cada operación se vuelve a leer Firestore (`loadMatches`) | Lo que se ve en pantalla es lo que realmente quedó guardado, no una simulación. |
| Ordenamiento por fecha en el navegador (no con `orderBy`) | Evita tener que crear un índice compuesto en Firestore. |
| Fecha guardada como texto `AAAA-MM-DD` | Evita que la zona horaria corra la fecha un día. |
| Pantalla de aviso si falta el `.env` | Si faltan las variables, la app explica qué hacer en vez de quedar en blanco. |

### Funcionalidades implementadas

- [x] Inicio con bienvenida, botón "Agregar partido", estadísticas, próximo partido y últimos partidos.
- [x] Estado vacío cuando no hay partidos.
- [x] Agregar partido con validaciones (rival y fecha obligatorios; goles enteros ≥ 0; ambos goles o ninguno).
- [x] Editar partido.
- [x] Eliminar partido con confirmación.
- [x] Marcar / desmarcar favorito desde la tarjeta.
- [x] Comentario o recuerdo personal.
- [x] Filtros en "Mis partidos" (todos, asistí, no asistí, próximos, favoritos).
- [x] Próximos partidos: agregar (con estado "Próximo" preseleccionado), editar, eliminar y marcar "Asistí" / "No asistí".
- [x] Estadísticas: asistidos, victorias, empates, derrotas, % de victorias y favoritos (solo partidos "Asistí" con resultado completo).
- [x] Mensajes de carga, éxito y error.
- [x] Diseño responsive (escritorio y celular).

### Herramientas de IA utilizadas

- **Claude (Claude Code, app de escritorio)**: análisis de la consigna, propuesta de estructura, generación del código, pruebas de la interfaz y redacción de la documentación.

### Prompt utilizado

Se usó un único prompt inicial extenso (resumido en `docs/prompt-v1.md`), que incluía:

- La consigna en PDF adjunta.
- La idea, el público y el problema que resuelve la app.
- Las cuatro secciones y sus campos.
- La paleta de colores y el estilo visual.
- Los requisitos técnicos (Firebase, `.env`, reglas, GitHub, Vercel).
- El alcance de la versión 1 (qué **no** implementar todavía).
- El pedido de trabajar por etapas y de no inventar credenciales ni resultados de pruebas.

Fragmento representativo:

> "Es fundamental que no desarrolles solamente una interfaz visual o un prototipo. La aplicación debe funcionar de verdad. […] No simular operaciones exitosas si Firebase no guardó los cambios."

### Dificultades y cómo se resolvieron

| Dificultad | Solución |
| --- | --- |
| Distinguir un resultado vacío de un 0-0. | Los goles vacíos se guardan como `null` y la función `hasResult()` solo considera resultado completo cuando ambos goles son números. |
| Si se carga un solo gol, el resultado queda incompleto. | Validación extra: hay que completar los dos goles o dejar los dos vacíos. |
| (Prevención) `new Date("AAAA-MM-DD")` interpreta la fecha en UTC y en Argentina puede mostrarse un día antes. | `formatDate()` arma la fecha con año, mes y día por separado. |
| (Prevención) Una consulta con `where` + `orderBy` sobre campos distintos requiere crear un índice en Firestore. | Se consulta solo con `where('uid', '==', uid)` y se ordena en el navegador. |
| El navegador integrado de la herramienta no abría la app de prueba. | El servidor había tomado otro puerto (5199 en lugar de 5200); se revisaron los logs del servidor y se abrió el puerto correcto. |
| No había Java instalado para usar el emulador de Firebase. | Se probó la interfaz con servicios simulados y se dejó la prueba real como pendiente. |
| Durante el desarrollo todavía no había credenciales de Firebase. | La interfaz se probó con servicios simulados en una carpeta temporal fuera del proyecto (ver Pruebas). La prueba contra Firestore real queda pendiente hasta configurar el proyecto. |
| Aviso de Vite en el build: el archivo JavaScript supera 500 kB. | Es por el SDK de Firebase (Firestore). Es solo una advertencia; el build se completa correctamente. Queda como posible mejora (dividir el código). |

### Pruebas realizadas

**Build**

- [x] `npm run build` compila sin errores (con la advertencia de tamaño mencionada arriba).

**Interfaz y lógica (con servicios de Firebase simulados, no con Firestore real)**

Para probar la interfaz sin credenciales se reemplazaron temporalmente `authService`, `matchesService` y `firebase/config` por versiones en memoria, en una carpeta fuera del proyecto. El código del proyecto no se modificó para esta prueba.

- [x] Estado vacío en Inicio.
- [x] Guardar el formulario vacío muestra "Ingresá el nombre del rival." (y error de fecha).
- [x] Cargar un solo gol muestra "Completá los goles de ambos equipos o dejá los dos vacíos."
- [x] Guardar River 2 – 0 Boca: los goles se guardan como números (`2` y `0`), el rival 0 no se toma como vacío.
- [x] Durante el guardado el botón muestra "Guardando..." y queda deshabilitado.
- [x] Marcar favorito desde la estrella actualiza el dato.
- [x] Agregar próximo partido desde "Próximos": el estado "Próximo" viene preseleccionado y los goles se guardan como `null`.
- [x] Con un fallo forzado, "No asistí" muestra "No se pudo actualizar el partido." y el dato **no** cambia.
- [x] "Asistí" cambia el estado, muestra mensaje de éxito y el partido sale de "Próximos".
- [x] Editar el partido para cargar 1 – 1: se muestra "Empate" y el mensaje "Partido actualizado."
- [x] Estadísticas con 2 asistidos (1 victoria, 1 empate): 50 %, 1 favorito — valores correctos.
- [x] Eliminar: aparece la confirmación, al confirmar se borra y se muestra "Partido eliminado."
- [x] Vista celular (375 px): barra inferior, formulario y confirmación como panel inferior, sin scroll horizontal.
- [x] Consola sin errores (salvo el error forzado a propósito).

**Con Firebase real (24/10/2026, en local con `npm run dev`)**

Se configuró el proyecto de Firebase (Authentication anónima, Firestore en modo producción, reglas publicadas) y el archivo `.env`.

- [x] La app inicia sesión anónima y consulta Firestore sin errores (aparece el estado vacío).
- [x] Agregar "PRUEBA Belgrano" 3 – 1: mensaje "Partido guardado en tu historial." y aparece la tarjeta.
- [x] Recargar la página: el partido sigue ahí.
- [x] Editar a 2 – 2: mensaje "Partido actualizado." y, al recargar, el cambio se mantiene.
- [x] Leer la colección `matches` sin autenticación (pedido directo a la API de Firestore): rechazado con `403 PERMISSION_DENIED`. Las reglas no dejan la base abierta.
- [x] Eliminar con confirmación: mensaje "Partido eliminado." y, al recargar, vuelve el estado vacío.
- [x] Consola del navegador sin errores.

**Versión publicada en Vercel (24/10/2026, https://river-id-ez6q.vercel.app)**

Se subió el código a GitHub (https://github.com/agustinavegaa/river-id), se importó en Vercel y se cargaron las 4 variables `VITE_FIREBASE_*` en Environment Variables.

- [x] La app publicada carga y se conecta a Firebase (estado vacío, consola sin errores).
- [x] Agregar "PRUEBA Vercel" 1 – 0: mensaje de éxito y, al recargar, el partido sigue.
- [x] Marcar como favorito: mensaje "Agregado a favoritos." y, al recargar, sigue marcado (el contador de favoritos muestra 1).
- [x] Vista celular (375 px) de la versión publicada: barra inferior, sin scroll horizontal.
- [x] Eliminar con confirmación: mensaje "Partido eliminado." y, al recargar, vuelve el estado vacío.

**Pendientes**

- [ ] Ver el registro en Firebase Console → Firestore → Datos (para la captura de la entrega).
- [ ] Comprobar que otro usuario no ve los datos (por ejemplo, abrir la app en una ventana de incógnito).
- [ ] Probar desde un celular real.

### Estado de los requisitos de la consigna

| Requisito | Estado |
| --- | --- |
| 1. React + Vite con componentes, eventos y estado | Hecho |
| 2. Firestore: consultar, agregar, modificar, eliminar | Hecho y probado en local |
| 3. Persistencia al recargar | Hecho y probado en local |
| 4. GitHub con código e instrucciones | Hecho: https://github.com/agustinavegaa/river-id |
| 5. Vercel con URL funcional | Hecho y probado: https://river-id-ez6q.vercel.app |
| 6. Validaciones, carga, éxito/error, responsive | Hecho y probado (con servicios simulados) |
| 7. Reglas de Firestore | Publicadas; acceso sin login rechazado |
| Bitácora e informe | En curso (este documento) |
| Iteraciones | V1, V2, V3 y V4 publicadas |

### Capturas

_(Agregar capturas de: Inicio vacío, formulario con errores, Mis partidos, Próximos, Estadísticas, vista celular, Firestore → Datos con un registro.)_

---

## Versión 2 — Rediseño y mejoras de uso

**Fecha:** 04/11/2026 · **Rama:** `version-2`

### Qué cambió respecto de la versión 1

**Diseño (inspirado en una referencia de landing deportiva, manteniendo la paleta de River)**

| Antes (V1) | Ahora (V2) | Por qué |
| --- | --- | --- |
| Barra lateral negra fija | Header oscuro con menú en "píldora" centrado y botón "Agregar partido" | Libera ancho para el contenido y se parece más a una app deportiva actual. |
| Títulos en sans serif común | Títulos en **Anton** (condensada, mayúsculas) y textos en Inter | La tipografía condensada da la fuerza de un póster de fútbol; Inter mantiene la lectura cómoda. |
| Hero con banda roja diagonal | Portada oscura de cada pantalla + **hoja blanca redondeada** que se superpone | Separa claramente la "portada" del contenido y da profundidad sin usar sombras pesadas. |
| Últimos partidos en grilla | **Carrusel horizontal** de tarjetas verticales (se desliza o se arrastra) | Muestra varios partidos sin ocupar mucho alto; en celular se usa con el dedo. |
| Estadísticas en tarjetas iguales | Bloque rojo grande con el % de victorias + tarjetas + "Datos curiosos" | Jerarquía: primero el dato más importante. |
| — | Sección "Sobre River ID" y banner "Tu récord en la cancha" con panel rojo de números | Explica la app a quien entra por primera vez y lleva a Estadísticas. |
| Botones con bordes de 8 px | Botones tipo píldora y botones circulares | Coherencia con el menú y con la referencia. |

En la referencia el color de acento era verde lima; se reemplazó por el **rojo River (#9E182B)**. Negro #171717, blanco y gris claro siguen como base.

Primero, los lugares de las fotos quedaron como **bloques de color** (clase `img-ph`). Después se agregaron las imágenes:

| Lugar | Imagen (`public/images/`) |
| --- | --- |
| Logo y favicon | Escudo de River (`escudo-river.png`, reducido a 240 px de alto; favicon de 64 px) |
| Portada del Inicio y pantalla de carga | El Monumental de noche (`monumental-noche.webp`) |
| Banner "Tu récord en la cancha" y Estadísticas | Jugadores festejando (`festejo-jugadores.webp`) |
| Mis partidos | Hinchada con camisetas (`hinchada-camisetas.webp`) |
| Próximos | Hinchada con banderas (`hinchada-banderas.webp`) |

Las fotos tienen una capa oscura encima para que el texto blanco se lea. Las tarjetas del carrusel siguen en color (rojo victoria, gris empate, negro derrota) porque así el resultado se reconoce de un vistazo.

Se agregó un **pie de página** que aclara que es un proyecto universitario no oficial y que el escudo y las fotos pertenecen al club y a sus autores.

Después se sacó del Inicio el bloque "Hecho con" (React, Firebase y Vercel) y se lo pasó al pie en letra pequeña, junto con la autoría: "Realizado por Agustina Vega para la materia Desarrollo Frontend II en 2026". Se publicó y se comprobó en la URL de Vercel.

**Funcionalidades nuevas**

- [x] Campo **Hora** (opcional) en el formulario. Se guarda en Firestore como `time` (`HH:MM`).
- [x] **Cuenta regresiva** (días, horas, minutos) al próximo partido, en Inicio y en Próximos. Se actualiza sola cada 30 segundos.
- [x] Tarjeta con fecha, hora y estadio del próximo partido; si no hay, un acceso para agendarlo.
- [x] **Búsqueda por rival** en Mis partidos (se combina con los filtros).
- [x] **Aviso de partidos vencidos**: un "Próximo" cuya fecha ya pasó se marca en rojo con "Este partido ya se jugó. ¿Fuiste?" y aparece un resumen arriba de la lista.
- [x] **Datos curiosos** en Estadísticas: rival, estadio y competición que más viste.
- [x] Al cambiar de pantalla, la página vuelve arriba.

### Herramientas de IA y prompt

- **Claude (Claude Code, app de escritorio)**.
- Prompt 2: se adjuntaron el escudo y cuatro fotos con el pedido *"te adjunto como logo: escudo de river y algunas imagenes para usar y despues publicala"*.
- Prompt 1: se adjuntó una imagen de referencia (landing "Athlete Showcase") con el pedido: *"tomá de referencia el diseño, mantené los colores de River: rojo, blanco y gris/negro… las imágenes las agregamos después, dejalos en color y seguí con el plan de mejoras"*.

### Dificultades y cómo se resolvieron

| Dificultad | Solución |
| --- | --- |
| El carrusel arrancaba pegado al borde izquierdo. | El "scroll snap" ignora el padding; se agregó `scroll-padding-inline`. |
| "Independiente" se cortaba en cualquier letra dentro de la tarjeta. | Se cambió `overflow-wrap: anywhere` por `break-word` + `hyphens: auto` (corta con guion: "Indepen-diente"). |
| En celular, la barra de navegación inferior no ocupaba todo el ancho. | Heredaba `justify-self: center` de la regla para tablet; se fijó `justify-self: stretch`. |
| Al arrastrar el carrusel con el mouse se abría la tarjeta al soltar. | Se registra si hubo movimiento y, en ese caso, se ignora el clic. |
| Al probar, el puerto 5173 lo estaba usando otro proyecto. | Se levantó River ID en el puerto 5180. |

### Pruebas realizadas

**Con servicios simulados y 7 partidos de ejemplo** (para ver el diseño con datos, sin cargar datos falsos en Firebase):

- [x] Portada: título, cuenta regresiva al próximo partido y tarjeta con fecha, hora y estadio.
- [x] Carrusel con colores por resultado; tocar una tarjeta abre "Editar partido" con sus datos.
- [x] Arrastrar el carrusel con el mouse lo desplaza y no abre la tarjeta.
- [x] Agregar un próximo para mañana a las 18:00: la cuenta regresiva pasa a ese partido (00 días, 21 h, 50 min en el momento de la prueba).
- [x] Próximos: el partido con fecha pasada muestra el aviso y el resumen "Tenés 1 partido que ya se jugó".
- [x] Búsqueda "boca": quedan solo los 2 partidos contra Boca Juniors.
- [x] Estadísticas: 4 asistidos, 2 G · 1 E · 1 P, 50 %; datos curiosos: Boca Juniors (2), Estadio Monumental (3).
- [x] Celular (375 px): menú abajo a todo el ancho, botón "+" arriba, formulario como panel inferior, sin scroll horizontal.

**Con Firebase real (local, puerto 5180):**

- [x] Estado vacío: cuenta regresiva en "--" y acceso "Agendá tu próximo partido" (abre el formulario con "Próximo" seleccionado).
- [x] Agregar "PRUEBA V2" el 10/11 a las 21:00: se guarda y, al recargar, la cuenta regresiva y la hora siguen.
- [x] Eliminar con confirmación: desaparece y, al recargar, vuelve el estado vacío.
- [x] Consola sin errores.
- `npm run build` compila (sigue la advertencia de tamaño del SDK de Firebase).

**Con las fotos (servicios simulados):**

- [x] Escudo en el header y en las tarjetas del carrusel; favicon con el escudo.
- [x] Fotos en la portada, en las bandas de Mis partidos, Próximos y Estadísticas y en el banner; el texto se lee bien.
- [x] Celular (375 px): portada con foto, banner con el panel de números en fila, pie de página visible arriba de la barra inferior, sin scroll horizontal.

**Publicación en Vercel (04/11/2026)**

Se unió la rama `version-2` con `main` y se subió a GitHub. Vercel desplegó la nueva versión solo, sin tocar nada en su panel (se comprobó que la página publicada ya pedía el nuevo `favicon.png`). Justo después del despliegue, `escudo-river.png` respondió 404 una vez; segundos después respondió 200, igual que las demás fotos: era el despliegue que todavía se estaba propagando.

En https://river-id-ez6q.vercel.app:

- [x] Escudo, fotos y pie de página visibles; consola sin errores.
- [x] Agregar "PRUEBA Vercel V2" (10/11, 21:00) desde "Agendá tu próximo partido": se guarda y, al recargar, la cuenta regresiva muestra ese partido.
- [x] Modificar: en Próximos, "No asistí" → al recargar aparece con estado "No asistí" en Mis partidos.
- [x] Eliminar con confirmación → al recargar vuelve el estado vacío.

**Pendientes**

- [ ] Capturas de la versión 2 para comparar con la versión 1.

## Versión 3 — Optimización UX/UI y funcional

**Fecha:** 12/11/2026 · **Rama:** `version-3`

Objetivo: una versión funcionalmente sólida y consistente, que sirva de base para la Versión 4 (interacciones y animaciones). Se mantuvo la identidad visual de V2: no se agregaron animaciones ni transiciones.

### Metodología

1. Se analizó el código y se probó la V2 con 9 partidos de ejemplo en 320, 820 y 1280 px.
2. Se listaron los problemas encontrados y una propuesta separada en imprescindibles (1 a 12) y opcionales (13 a 15).
3. Se aprobaron las imprescindibles + 13 y 14. La 15 (reglas de Firestore más estrictas) quedó afuera: **las reglas no se modificaron**.

### Problemas encontrados en V2 (al probar)

| # | Problema |
| --- | --- |
| A | Un partido sin hora mostraba la cuenta regresiva a la medianoche ("00:00:00" si era hoy): se inventaba una hora. |
| B | Los botones "Asistí / No asistí" aparecían también en partidos que todavía no se jugaron. |
| C | En tablet (≈ 770–960 px) el botón "+" del encabezado se caía debajo del logo. |
| D | El formulario permitía guardar un "Próximo" con resultado o un "Asistí" con fecha futura. |
| E | El carrusel "partidos que fuiste sumando" incluía partidos "No asistí" (con color de victoria). |
| F | Si había empate en un dato curioso, se mostraba uno solo, elegido al azar. |
| G | Los próximos se ordenaban por fecha pero no por hora. |
| H | Todos los errores de Firebase mostraban el mismo mensaje genérico. |

### Mejoras realizadas y motivos

| Mejora | Motivo UX/UI |
| --- | --- |
| **Cuenta regresiva honesta**: sin hora muestra solo los días (o "HOY") y "Hora a confirmar". | No mostrar información inventada. (A) |
| **Orden por fecha y hora** en todas las listas; sin hora va al final de su día. | Orden cronológico real. (G) |
| **Próximos en dos grupos**: "¿Fuiste?" (ya jugados) y "Se vienen" (en orden). Los botones de asistencia aparecen recién desde el día del partido. | Lo que necesita una acción va primero; no se puede marcar asistencia a un partido futuro. (B) |
| **"Asistí" abre el formulario** con título "¿Cómo salió?" para cargar el resultado; "No asistí" se guarda directo. | Un solo paso para completar el partido y que cuente en estadísticas. |
| **Formulario en secciones**: Datos del partido / Estado y resultado / Tu recuerdo, con "* Campos obligatorios". | Agrupar reduce la carga visual y aclara qué es obligatorio. |
| Si el estado es "Próximo", **el resultado se oculta** y se guarda vacío. | Un partido futuro no tiene resultado. (D) |
| **Validaciones nuevas** con mensajes específicos: fecha futura con "Asistí/No asistí", goles de 0 a 30, rival de hasta 40 caracteres, falta uno de los goles. | Errores claros junto al campo. (D) |
| **Aviso de duplicado**: mismo rival y misma fecha (sin importar mayúsculas, acentos ni espacios). | Evita registros repetidos. |
| **Bloqueo de doble envío** (además del botón deshabilitado) y **cursor al primer campo con error**. | Evita duplicados por apretar dos veces; ayuda a corregir rápido. |
| **Esc** cierra el formulario y la confirmación. | Atajo esperado en una ventana modal. |
| **Mis partidos**: filtros por resultado y competición (solo las que usaste), orden por fecha, "Limpiar filtros", contador "Mostrando X de Y" y estado vacío "No encontramos partidos". Todos los filtros se combinan con la búsqueda. | Encontrar un partido rápido aunque el historial crezca. |
| **Inicio**: accesos rápidos (Agregar partido, Próximos con "X por venir · Y por confirmar", Estadísticas con el %). Carrusel solo con partidos "Asistí". | Las tres acciones principales al alcance; el carrusel muestra lo que dice su título. (E) |
| **Estadísticas**: bloque rojo con % + **gráfico de anillo** (solo CSS, sin librerías) con victorias, empates y derrotas y su porcentaje; aviso de partidos asistidos sin resultado; empates en datos curiosos ("Empate: A, B"); "Competición más frecuente". | Lectura visual inmediata; datos honestos. (F) |
| **Mensajes de error según la causa**: sin conexión, sin permiso, acceso anónimo deshabilitado. Si el navegador sabe que no hay internet, avisa enseguida en vez de quedar "Guardando...". Pantalla de error de carga con título y "Reintentar". | El usuario sabe qué pasó y qué hacer. (H) |
| **Responsive**: encabezado en una fila en tablet; filtros en dos filas desde 1100 px; accesos rápidos en lista en celular; nombres largos del carrusel cortados en 2 líneas. | Sin desbordes ni textos cortados. (C) |

### Componentes y archivos modificados

- Nuevos: `src/components/ResultsChart.jsx` (gráfico de anillo), `src/utils/errors.js` (mensajes de error).
- Modificados: `MatchForm.jsx`, `Countdown.jsx`, `MatchCard.jsx`, `MatchTile.jsx`, `Modal.jsx`, `HomePage.jsx`, `MatchesPage.jsx`, `UpcomingPage.jsx`, `StatsPage.jsx`, `App.jsx`, `utils/matchUtils.js`, `index.css`.
- **Sin cambios**: estructura de datos en Firestore (mismos campos), `matchesService.js`, `firebase/config.js` y `firestore.rules`.

### Dificultades y soluciones

| Dificultad | Solución |
| --- | --- |
| La carpeta temporal con los servicios simulados para pruebas se había borrado. | Se volvió a crear, agregando casos límite: rival con nombre largo y un partido de hoy sin hora. |
| Definir cuándo un partido "ya se jugó" si no tiene hora. | Si es hoy y no tiene hora, no se da por jugado (sigue en la cuenta regresiva), pero ya se pueden mostrar los botones de asistencia porque es el día del partido. |
| El selector de competiciones ordenaba "Copa de la Liga" después de "Copa Sudamericana". | Se ordenó con `localeCompare(..., 'es')`. |
| En pantallas de ≈ 800–1100 px se cortaba "Todas las competiciones" en el selector. | Desde 1100 px la búsqueda pasa a su propia fila y los tres selectores quedan en otra. |
| En la vista de tablet los tres selectores quedaban en 2 + 1. | Se pusieron en 3 columnas. |
| Algunas capturas de la herramienta de prueba salían desactualizadas (por ejemplo, el menú marcando otra sección). | Se verificó el estado real leyendo la página (DOM) antes de sacar conclusiones. |

### Pruebas realizadas

**Funciones de cálculo (con Node, 13 comprobaciones, todas OK):** partido de hoy sin hora no se da por jugado; con hora pasada sí; días hasta el partido; "Hora a confirmar"; orden 18:00 → 21:00 → sin hora; el próximo partido ignora el ya jugado; empate en dato curioso devuelve ambos; estadio vacío no inventa datos; asistidos/con resultado/sin resultado/porcentaje; la cuenta regresiva nunca es negativa.

**Con servicios simulados (9 partidos de ejemplo):**

- [x] Inicio: partido de hoy sin hora → "HOY · Hora a confirmar". Carrusel sin el partido "No asistí". Accesos rápidos: "2 por venir · 1 por confirmar si fuiste", "40% de victorias con vos".
- [x] Próximos: Independiente (ya jugado) en "¿Fuiste?"; San Lorenzo (futuro) sin botones; Rosario Central (hoy) con botones.
- [x] "Asistí" → formulario "¿Cómo salió?"; goles 45 → "Revisá los goles: el máximo es 30."; un solo gol → "Completá los goles de ambos equipos…"; el cursor va al campo con error; al guardar 2–0 pasa a "Asistí" y sale de "¿Fuiste?".
- [x] Duplicado "  san  lorenzo " en la misma fecha → "Ya registraste River vs San Lorenzo el dom, 15 nov 2026."; fecha futura con "Asistí" → "Este partido todavía no se jugó: marcalo como “Próximo”."
- [x] "Próximo": el resultado se oculta. Tres envíos seguidos → **1 solo** partido guardado, con goles `null`.
- [x] Errores: "No tenés permiso…" y "No hay conexión con el servidor…" según la causa; error de carga con "Reintentar" que recupera la lista.
- [x] Esc cierra el formulario.
- [x] Mis partidos: Empates → 2; + Liga Profesional → 1; + búsqueda "xyz" → "No encontramos partidos"; "Limpiar filtros" vuelve a 10 de 10; orden "Más antiguos primero" correcto.
- [x] Estadísticas: 50 % (3 de 6), anillo y leyenda 3/2/1 (50/33/17 %), datos curiosos correctos.
- [x] Responsive: sin scroll horizontal en 320, 820 y 1024 px; encabezado en una fila en 820 px; el último texto queda por encima del menú inferior en celular; formulario usable en 320 px.

**Con Firebase real (local):**

- [x] Agendar "PRUEBA V3" para hoy sin hora con dos envíos seguidos → 1 solo registro; al recargar: "HOY · Hora a confirmar" y "1 por venir".
- [x] "Asistí" → "¿Cómo salió?" → 1–0 → al recargar: carrusel con la victoria, banner 01/01/100 % y Estadísticas 100 %.
- [x] Favorito → al recargar sigue marcado.
- [x] Eliminar con confirmación → al recargar vuelve el estado vacío. Consola sin errores.
- [x] Lectura sin login a Firestore: sigue rechazada (403). Reglas sin cambios.
- `npm run build` compila (sigue la advertencia de tamaño del SDK de Firebase).

### Comparación V2 → V3

| Aspecto | V2 | V3 |
| --- | --- | --- |
| Cuenta regresiva sin hora | Contaba hasta la medianoche | Solo días o "HOY" + "Hora a confirmar" |
| Próximos | Una sola lista, botones en todos | "¿Fuiste?" y "Se vienen"; botones solo desde el día del partido |
| Marcar "Asistí" | Cambiaba el estado sin resultado | Abre "¿Cómo salió?" para cargar el resultado |
| Formulario | Lista de campos | 3 secciones, obligatorios marcados, resultado oculto en "Próximo" |
| Validaciones | Rival, fecha, goles enteros | + fecha futura, máximos, duplicados, doble envío, foco al error |
| Mis partidos | Búsqueda + estado | + resultado, competición, orden, limpiar, contador, vacío de búsqueda |
| Inicio | Carrusel con todos los jugados | Accesos rápidos + carrusel solo "Asistí" |
| Estadísticas | % con barra | % + gráfico de anillo con leyenda, aviso de partidos sin resultado, empates |
| Errores | Mensaje genérico | Según la causa |
| Tablet | "+" se caía de línea | Encabezado en una fila |

### Capturas recomendadas como evidencia

1. Inicio con "HOY · Hora a confirmar" y los accesos rápidos (escritorio y celular).
2. Próximos con los grupos "¿Fuiste?" y "Se vienen".
3. Formulario "¿Cómo salió?" y formulario con errores (duplicado y fecha futura).
4. Mis partidos con filtros combinados y "Mostrando X de Y"; estado "No encontramos partidos".
5. Estadísticas con el gráfico de anillo.
6. Encabezado en tablet: antes (V2, el "+" abajo) y después (V3).
7. Firestore → Datos con un partido guardado.

### Pendiente

- [x] Publicada en Vercel el 12/11/2026 (se unió `version-3` con `main`). En la URL publicada se comprobó que carga los accesos rápidos, se conecta a Firebase y la consola no muestra errores.
- La Versión 4 se dedicó finalmente al nombre y al grupo de cancha (ver abajo). Las animaciones quedaron fuera por la fecha de entrega.


---

## Versión 4 — Tu nombre y tu grupo de cancha

**Fecha:** 12/11/2026 · **Rama:** `version-4`

### Idea

Personalizar la experiencia: que la app sepa cómo te llamás y con quién vas a la cancha. Ir a ver a River casi nunca es solo, y "con quién fui" es parte del recuerdo.

### Decisiones tomadas (con la IA, antes de programar)

| Pregunta | Opciones | Elegido | Motivo |
| --- | --- | --- | --- |
| ¿Qué es el "grupo de cancha"? | Lista personal de compañeros / Grupo compartido entre usuarios con código | **Lista personal** | Simple, segura (cada usuario ve solo lo suyo) y posible de terminar y probar antes de la entrega. El grupo compartido necesitaba reglas entre usuarios y más pruebas. |
| ¿Sumar animaciones en V4? | Sí / No | **No** | Enfocarse en las dos funciones nuevas y reducir riesgo antes de la entrega. |
| ¿Publicar V3 antes de empezar? | Ahora / Al final | **Ahora** | Tener una versión probada en la URL mientras se trabaja. |

### Cambio en Firebase (mostrado y aprobado antes de hacerlo)

- **Colección nueva `profiles`**: un documento por usuario (`profiles/{uid}`) con `name` y `companions`.
- **Campo nuevo opcional `companions`** en cada partido. Los partidos viejos siguen funcionando: si no tienen el campo, se toman como "sin compañeros".
- **Regla nueva** en `firestore.rules` para `profiles`: solo el dueño puede leer y escribir su perfil; nombre de hasta 30 caracteres y grupo de hasta 20 personas. La regla de `matches` no cambió.

### Funcionalidades nuevas

- [x] **Bienvenida**: la primera vez la app pregunta el nombre ("¡Bienvenido, hincha!"). Se puede saltear con "Ahora no", y eso se recuerda en el navegador (solo esa preferencia; el perfil se guarda en Firestore).
- [x] **Saludo**: "Hola, Agustina · Mi vida como hincha" en la portada; la inicial aparece en un botón redondo del encabezado que lleva a **Mi perfil**.
- [x] **Mi perfil**: cambiar el nombre y armar el **grupo de cancha** (agregar y sacar personas). Cada persona muestra cuántos partidos fueron juntos.
- [x] Validaciones: nombre vacío, nombre repetido ("Papá ya está en tu grupo", sin importar mayúsculas ni acentos), hasta 30 caracteres y hasta 20 personas.
- [x] **Formulario de partido**: "¿Con quién fuiste?" (o "¿Con quién vas?" en un próximo) con chips para marcar. Si el grupo está vacío, un acceso "Armarlo en Mi perfil".
- [x] Si sacás a alguien del grupo, **los partidos donde lo marcaste lo siguen mostrando** (y sigue apareciendo marcado al editar ese partido).
- [x] **Tarjetas**: "Con Papá y Juli" (o "Vas con…" en próximos).
- [x] **Estadísticas**: nuevo dato curioso **"Con quién fuiste más"** (solo partidos "Asistí"). Los empates largos se resumen: "Superclásico, Liga Profesional y 3 más".
- [x] Si el perfil no se puede cargar, el resto de la app sigue funcionando y Mi perfil muestra el error con "Reintentar".

### Componentes y archivos

- Nuevos: `src/services/profileService.js`, `src/components/WelcomeModal.jsx`, `src/pages/ProfilePage.jsx`.
- Modificados: `App.jsx`, `Header.jsx` (botón de perfil), `MatchForm.jsx`, `MatchCard.jsx`, `HomePage.jsx`, `StatsPage.jsx`, `utils/matchUtils.js`, `index.css`, `firestore.rules`, `README.md`.

### Dificultades y soluciones

| Dificultad | Solución |
| --- | --- |
| Las reglas cerraban toda colección que no fuera `matches`, así que el perfil no se podía guardar. | Se agregó una regla para `profiles` (mostrada y aprobada antes de hacerlo). Hay que publicarla en Firebase Console: Vercel no la publica. |
| Una edición automática del formulario se cortó a mitad de camino porque el texto buscado tenía caracteres de acentos escritos de otra forma. | Se revisó qué partes se habían aplicado y se completó el resto. Además, el rango de acentos en el código quedó escrito como `\u0300-\u036f` para que se lea. |
| Si alguien sale del grupo, ¿se borra de los partidos viejos? | No: el formulario ofrece el grupo actual más quienes ya estaban marcados en ese partido. |
| Con muchas competiciones empatadas, el dato curioso quedaba larguísimo. | Se muestran las dos primeras y "y N más". |
| En tablet, una regla vieja ponía los datos curiosos en una sola columna. | Se quitó; ahora van de a dos. |

### Pruebas realizadas (servicios simulados)

- [x] Bienvenida: vacío → "Escribí tu nombre o tocá “Ahora no”."; con "Agustina" → se guarda, mensaje "¡Listo, Agustina!", saludo en la portada e inicial "A" en el encabezado.
- [x] "Ahora no" → al recargar no vuelve a aparecer.
- [x] Mi perfil: agregar vacío → error; agregar Papá, Juli y Martín (con Enter); "  papa " → "Papá ya está en tu grupo."
- [x] Partido Boca 2–0 con Papá y Juli, Boca 2–1 con Papá → tarjetas "Con Papá y Juli" y "Con Papá"; Mi perfil: Papá 2, Juli 1, Martín 0 partidos juntos.
- [x] Estadísticas: "Con quién fuiste más: Papá · 2 partidos".
- [x] Sacar a Juli del grupo → el partido conserva a Juli y al editarlo sigue marcada.
- [x] Guardado rechazado por Firebase (lo que pasa si la regla no está publicada) → "No tenés permiso…" y el nombre no cambia.
- [x] Responsive: sin scroll horizontal en 320 px; encabezado en una fila en 768 y 820 px.
- `npm run build` compila.

### Publicación de la regla

El primer intento de entrar a Firebase Console falló con "accounts.youtube.com tardó demasiado en responder" (ERR_TIMED_OUT): es un paso del inicio de sesión de Google, no un problema de la app. Se resolvió volviendo a intentar y la regla se publicó desde Firestore Database → Reglas.

### Pruebas con Firebase real (local, después de publicar la regla)

- [x] Leer el perfil ya no da error de permiso (antes de la regla, Firebase lo rechazaba).
- [x] Bienvenida con "PRUEBA" → saludo "Hola, PRUEBA" e inicial "P"; al recargar sigue y no vuelve a aparecer la bienvenida.
- [x] Agregar "Compañero A" y "Compañero B" al grupo → "Grupo de cancha actualizado."
- [x] Partido "PRUEBA V4" (11/11, Asistí, 2–1) con Compañero A → al recargar la tarjeta dice "Con Compañero A"; Estadísticas: "Con quién fuiste más: Compañero A · 1 partido"; Mi perfil: 1 y 0 partidos juntos.
- [x] **Las reglas rechazan lo indebido**: guardar un nombre de 31 caracteres → `permission-denied`; escribir el perfil de otro usuario → `permission-denied`; leer perfiles sin login (pedido directo a la API) → 403. El perfil real no cambió.
- [x] Limpieza: se eliminó el partido desde la app y el perfil de prueba (la regla permite borrar el propio); al recargar, la bienvenida volvió a aparecer y la base quedó vacía. Consola sin errores.

### Publicación en Vercel (12/11/2026)

Se unió `version-4` con `main`; Vercel publicó la nueva versión sola (se comprobó que el código publicado ya incluía "Mi grupo de cancha").

En https://river-id-ez6q.vercel.app:

- [x] Bienvenida → "PRUEBA" → Mi perfil "Hola, PRUEBA"; agregar "Compañero A".
- [x] Próximo "PRUEBA Vercel V4" (20/11, sin hora) con el formulario mostrando "¿Con quién vas?" → al recargar, en Próximos: "vie, 20 nov 2026 · Hora a confirmar | Vas con Compañero A".
- [x] Eliminar el partido y sacar al compañero → al recargar: sin partidos y "Tu grupo está vacío". Consola sin errores.
- Quedó guardado el nombre "PRUEBA" en el perfil del navegador usado para la prueba (la app no tiene botón para borrar el perfil). Solo lo ve ese navegador; se puede borrar desde Firebase Console → Firestore → Datos → `profiles`.

### Capturas recomendadas

1. Bienvenida pidiendo el nombre.
2. Portada con "Hola, Agustina" y la inicial en el encabezado.
3. Mi perfil con el grupo de cancha.
4. Formulario con "¿Con quién fuiste?".
5. Tarjeta con "Con Papá y Juli" y Estadísticas con "Con quién fuiste más".
6. Firebase Console → Reglas con el bloque `profiles`, y → Datos con un documento de `profiles`.
