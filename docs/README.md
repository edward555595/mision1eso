# Misión 1.º ESO · V4

## Qué es

Motor definitivo para GitHub Pages + Firebase.

## Estructura

- `index.html`: entrada principal.
- `css/app.css`: estilos.
- `js/`: motor modular.
- `data/course-manifest.json`: lista de semanas.
- `data/weeks/week01.json`: Semana 1.
- `data/weeks/week02.json`: Semana 2.
- `firebase/firebase-config.js`: configuración Firebase.
- `firebase/firestore.rules`: reglas recomendadas.

## Cómo subir a GitHub Pages

1. Descomprime el ZIP.
2. Sube TODO el contenido del ZIP al repositorio, no la carpeta contenedora.
3. En GitHub: Settings → Pages → Deploy from branch → main → /root.
4. Espera 1-3 minutos.
5. Abre `https://TU_USUARIO.github.io/mision1eso`.

## Cómo añadir semanas

1. Crea `data/weeks/week03.json`.
2. En `data/course-manifest.json`, cambia la Semana 3:
   - quita `"placeholder": true`
   - asegúrate de que `"file": "./data/weeks/week03.json"`
3. Sube ambos archivos a GitHub.
4. Todos los alumnos verán la nueva semana automáticamente.

## Firebase

1. Crea proyecto en Firebase.
2. Activa Authentication → Email/Password.
3. Activa Firestore.
4. Copia la configuración en `firebase/firebase-config.js`.
5. Crea tu usuario profesor.
6. Copia su UID en `M1ESO_ADMIN_UIDS`.

## Modo local

Si Firebase no está configurado, la plataforma funciona en modo local con `localStorage`.
