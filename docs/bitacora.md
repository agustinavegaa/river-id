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

**Pendientes**

- [ ] Ver el registro en Firebase Console → Firestore → Datos (para la captura de la entrega).
- [ ] Comprobar que otro usuario no ve los datos (por ejemplo, abrir la app en una ventana de incógnito).
- [ ] Repetir todo desde la URL de Vercel y desde un celular real.

### Estado de los requisitos de la consigna

| Requisito | Estado |
| --- | --- |
| 1. React + Vite con componentes, eventos y estado | Hecho |
| 2. Firestore: consultar, agregar, modificar, eliminar | Hecho y probado en local |
| 3. Persistencia al recargar | Hecho y probado en local |
| 4. GitHub con código e instrucciones | Archivos listos — falta crear el repositorio |
| 5. Vercel con URL funcional | Configuración lista — falta desplegar |
| 6. Validaciones, carga, éxito/error, responsive | Hecho y probado (con servicios simulados) |
| 7. Reglas de Firestore | Publicadas; acceso sin login rechazado |
| Bitácora e informe | En curso (este documento) |
| Tres iteraciones | Versión 1 de 3 |

### Capturas

_(Agregar capturas de: Inicio vacío, formulario con errores, Mis partidos, Próximos, Estadísticas, vista celular, Firestore → Datos con un registro.)_

---

## Versión 2 — _(pendiente)_

## Versión 3 — _(pendiente)_
