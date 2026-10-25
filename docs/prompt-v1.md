# Prompt inicial — Versión 1

Herramienta: Claude (Claude Code, app de escritorio). Se adjuntó el PDF de la consigna.

Resumen de las secciones del prompt (el texto completo se pegó en la conversación con la IA):

1. **Idea del proyecto:** RIVER ID — "Mi vida como hincha". Diario digital del hincha de River para registrar partidos, organizar próximos, guardar recuerdos y ver estadísticas personales. No es una página oficial ni de noticias.
2. **Estructura:** Inicio (dashboard), Mis partidos (CRUD + favorito + comentario), Próximos partidos (misma colección filtrada por estado) y Mis estadísticas (solo partidos "Asistí" con resultado completo).
3. **Campos y validaciones:** rival y fecha obligatorios; goles enteros ≥ 0; resultado vacío permitido para partidos futuros y distinto de 0-0; confirmación antes de eliminar.
4. **Diseño UX/UI:** paleta #9E182B / #FFFFFF / #171717 / #EAEAEA; estilo deportivo, minimalista; barra lateral o superior en escritorio y navegación adaptada en celular; sin imágenes externas; íconos Lucide.
5. **Requisitos técnicos:** React + Vite, componentes, useState/useEffect; Firestore con CRUD; Authentication anónima; registros asociados al UID; reglas de seguridad; variables `VITE_FIREBASE_*` en `.env` leídas con `import.meta.env`; `.env.example`; README; `.gitignore`; reglas en archivo; build para Vercel.
6. **Funcionamiento real:** "No simular operaciones exitosas si Firebase no guardó los cambios."
7. **Alcance V1:** sin animaciones complejas, gráficos avanzados, APIs deportivas, venta de entradas, redes sociales, chats, imágenes ni perfiles.
8. **Etapas:** analizar la consigna → estructura → interfaz → Firebase/Auth → CRUD → pruebas → GitHub/Vercel. "No inventes credenciales ni datos de Firebase."
9. **Documentación:** bitácora con decisiones, IA, prompts, dificultades y pruebas. "No inventes pruebas ni resultados."
10. **Forma de trabajo:** código sencillo y explicable para una estudiante de Frontend II; mantener lista de requisitos cumplidos y pendientes.
