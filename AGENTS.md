# AGENTS.md

Esta guía está diseñada para que tanto **desarrolladores humanos como agentes de IA (LLMs)** puedan entender la arquitectura, convenciones y flujos de trabajo de este proyecto. El objetivo es facilitar la incorporación y asegurar la consistencia del código.

## 1. Arquitectura y Convenciones de Nomenclatura

### 1.1. Estructura de Directorios

La aplicación sigue una estructura modular basada en la funcionalidad.

- `src/`: Contiene todo el código fuente del frontend.
  - `src/react-components/`: Componentes de React genéricos y reutilizables.
  - `src/classes/`: Modelos de datos y lógica de negocio principal (e.g., `User`, `Project`). Son clases de TypeScript puras.
  - `src/services/`: Módulos para la comunicación con APIs y servicios externos (e.g., `firebase.ts` para interactuar con Firestore y Auth).
  - `src/Auth/`: Agrupa toda la lógica, componentes y hooks relacionados con la autenticación de usuarios.
  - `src/assets/`: Archivos estáticos como imágenes, iconos y fuentes.
- `functions/`: Contiene el código backend de las Cloud Functions de Firebase.
  - `functions/src/`: Código fuente en TypeScript de las funciones.
  - `functions/lib/`: Código transpilado a JavaScript que se despliega en Firebase. **No modificar directamente.**

### 1.2. Convenciones de Nomenclatura

Seguir estas reglas es crucial para la mantenibilidad y la legibilidad automática del código.

- **Archivos:**

  - Componentes React: `PascalCase.tsx` (e.g., `UsersBoardList.tsx`, `UserCardRow.tsx`).
  - Clases, Tipos, Interfaces: `PascalCase.ts` (e.g., `User.ts`).
  - Hooks, Servicios, Utilidades: `camelCase.ts` (e.g., `useUserBoardContext.ts`, `firebase.ts`).

- **Código (TypeScript / React):**

  - Componentes y Clases: `PascalCase` (e.g., `const UsersBoardList: React.FC`, `class User`).
  - Interfaces y Tipos: `PascalCase` (e.g., `interface UserListProps`, `type UserSortKey`).
  - Variables, Constantes, Funciones y Métodos: `camelCase` (e.g., `const userProfile`, `const canManageUsers`, `function toggleSortMenu()`).
  - Hooks de React: `useCamelCase` (e.g., `useAuth`, `useState`).

- **Cloud Functions (Backend):**

  - Nombres de funciones exportadas: `camelCase` (e.g., `export const deleteUserAndData`).

- **Estilos (CSS):**
  - Nombres de clases CSS: `kebab-case` (e.g., `users-list`, `header-user-page-content`).

## 2. Entorno de Desarrollo

- **Instalación:** Clona el repositorio y ejecuta `npm install` para instalar todas las dependencias necesarias.
- **Servidor de desarrollo:** Utiliza `npm run dev` para iniciar el servidor de desarrollo de Vite. La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).
- **Añadir dependencias:** Usa `npm add <nombre-del-paquete>` para añadir una nueva dependencia de producción o `pnpm add -D <nombre-del-paquete>` para una de desarrollo.

## 3. Pruebas y Calidad de Código

- **CI/CD:** El plan de integración continua se encuentra en la carpeta `.github/workflows/`. Asegúrate de que tus cambios pasen todas las verificaciones.
- **Ejecutar todas las pruebas:** Desde la raíz del proyecto, ejecuta `pnpm test` para lanzar la suite de pruebas completa (asumiendo que se usa Vitest).
- **Ejecutar una prueba específica:** Para enfocarte en un test concreto, utiliza el patrón de Vitest: `pnpm test -- -t "<nombre del test>"`.
- **Calidad del código:** Antes de confirmar tus cambios, ejecuta `pnpm lint` para verificar que el código cumple con las reglas de ESLint y TypeScript.
- **Cobertura de pruebas:** Añade o actualiza las pruebas para el código que modifiques. El objetivo es mantener o aumentar la cobertura de pruebas del proyecto.

## 4. Flujo de Contribución (Pull Requests)

- **Formato del título:** `[<ÁreaFuncional>] <Título Descriptivo>`.
  - **Ejemplos:** `[Auth] Implementar flujo de finalización de registro`, `[UsersBoard] Añadir ordenación a la lista de usuarios`.
- **Verificaciones previas:** Antes de enviar un PR, asegúrate de que tu rama está actualizada con la rama principal (`master` o `main`) y que todos los comandos (`pnpm lint` y `pnpm test`) se ejecutan sin errores.
- **Descripción del PR:** Describe claramente los cambios que has realizado y el problema que resuelven. Si es relevante, añade capturas de pantalla o GIFs.


## te explico cómo funciona el sistema de escucha para que, cuando se actualiza algo en Firebase (por ejemplo, un ToDo dentro de un proyecto), el resto de los componentes y la UI se actualicen automáticamente:

_**
1. Listener en Firestore (onSnapshot)
Se utiliza la función onSnapshot de Firebase Firestore para escuchar en tiempo real los cambios en una colección o subcolección (por ejemplo, projects/{projectId}/todos).
Cuando ocurre un cambio (creación, edición o eliminación de un ToDo), el listener recibe una notificación con los datos actualizados.
2. Actualización de la instancia (ProjectsManager)
El callback del listener procesa los datos nuevos y actualiza la instancia de ProjectsManager (o el manager correspondiente).
Esto puede implicar actualizar la lista interna de proyectos y sus ToDos.
3. Actualización de localStorage
Tras actualizar la instancia, normalmente se guarda el nuevo estado en localStorage para mantener la persistencia offline.
4. Actualización de la UI (Componentes React)
Los componentes React que dependen de los datos de ProjectsManager (o del manager correspondiente) están suscritos a los cambios mediante props, context o algún sistema de eventos.
Cuando la instancia se actualiza, los componentes se renderizan de nuevo mostrando la información más reciente.
5. Resumen del flujo
Cambio en Firebase (por cualquier usuario o proceso).
Listener (onSnapshot) detecta el cambio.
Se actualiza la instancia de datos en memoria.
Se actualiza localStorage (si aplica).
La UI se re-renderiza automáticamente con los datos nuevos.
Ventaja
Así, cualquier cambio en Firebase se refleja en todos los clientes conectados en tiempo real, manteniendo la UI sincronizada sin necesidad de recargar la página.

**_

---

_Este documento es una guía viva. Siéntete libre de proponer mejoras mediante un PR._
