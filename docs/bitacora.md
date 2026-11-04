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
| Tres iteraciones | Versión 2 de 3 (en rama `version-2`) |

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

**Pendientes**

- [ ] Capturas de la versión 2 para comparar con la versión 1.

## Versión 3 — _(pendiente)_
