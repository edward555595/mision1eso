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


## Correcciones V4.1

- Se impide saltar al plan de semanas pulsando Inicio sin sesión.
- El botón Crear cuenta muestra errores visibles si Firebase rechaza el registro.
- La pantalla inicial de una semana incluye botón "Comenzar diagnóstico".
- La navegación queda protegida: con Firebase configurado, solo usuarios registrados o modo local pueden entrar.
- Si aparece `auth/unauthorized-domain`, añade tu dominio de GitHub Pages en Firebase:
  Authentication → Settings → Authorized domains.


## V4.2 Login obligatorio

Cambios:
- El modo local queda desactivado en la interfaz.
- Se restaura la configuración real de Firebase.
- Si Firebase no carga, la pantalla de acceso muestra error visible.
- El botón Inicio ya no permite entrar al plan de semanas sin usuario autenticado.

Después de subir esta versión:
1. Espera 1-3 minutos.
2. Recarga la web con Ctrl+F5.
3. Crea cuenta con email y contraseña.
4. Si Firebase devuelve error `unauthorized-domain`, añade el dominio de GitHub Pages en Firebase Authentication → Settings → Authorized domains.
