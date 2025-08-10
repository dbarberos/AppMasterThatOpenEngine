/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";
// import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.

// setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Importaciones modulares para el SDK de Admin (más eficiente)
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";

// Inicializa el SDK de Admin.
// No se necesitan argumentos cuando se despliega en el entorno de Firebase.
initializeApp();

// Define opciones globales para todas las funciones en este archivo.
// Es una buena práctica definir la región y el número máximo de
// instancias para controlar costos y latencia.
setGlobalOptions({region: "europe-west1", maxInstances: 10});


// Inicializa los servicios de Firebase Admin una sola vez a nivel global.
// Esto es más eficiente que llamarlos dentro de cada función.
const db = getFirestore();
const auth = getAuth();


/**
 * Cloud Function (invocable) para eliminar un usuario y todos sus datos asociados.
 * - Solo la puede llamar un usuario autenticado con el "custom claim" `superadmin: true`.
 * - Elimina el documento del usuario de la colección 'users'.
 * - Elimina al usuario de Firebase Authentication.
 * - TODO: Ampliar para eliminar datos en cascada (proyectos, tareas, etc.).
 */
export const deleteUserAndData = onCall(async (request) => {
  // --- 1. Verificación de Seguridad ---
  // Asegurarse de que el usuario que invoca la función está autenticado.
  if (!request.auth?.uid) {
    logger.warn("Un usuario no autenticado intentó llamar a deleteUserAndData.");
    throw new HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user.",
    );
  }

  // Asegurarse de que el usuario que invoca la función es un superadmin.
  // Esto se basa en "Custom Claims" que debes asignar a tus superusuarios
  if (request.auth?.token?.superadmin !== true) {
    logger.error(
      `El usuario ${request.auth.uid} sin permisos de superadmin intentó eliminar a otro usuario.`,
    );
    throw new HttpsError(
      "permission-denied",
      "This function can only be called by a superadmin.",
    );
  }

  // --- 2. Validación de los Datos de Entrada ---
  const userIdToDelete = request.data.userIdToDelete;
  if (!userIdToDelete || typeof userIdToDelete !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with a 'userIdToDelete' string argument.",
    );
  }

  // Evitar que un superusuario se elimine a sí mismo accidentalmente.
  if (request.auth.uid === userIdToDelete) {
    throw new HttpsError(
      "failed-precondition",
      "Superadmins cannot delete their own account via this function.",
    );
  }

  logger.info(
    `Petición del superadmin ${request.auth.uid} para eliminar al usuario ${userIdToDelete}.`,
  );


  try {
    // --- 3. Lógica de Eliminación en Cascada ---

    // Paso A: Eliminar el documento del usuario en Firestore.
    logger.info(`Eliminando documento de Firestore para el usuario: ${userIdToDelete}`);
    const userDocRef = db.collection("users").doc(userIdToDelete);
    await userDocRef.delete();
    logger.info(`Documento de Firestore para el usuario ${userIdToDelete} eliminado.`);

    // Paso B: Eliminar al usuario de Firebase Authentication.
    logger.info(`Eliminando usuario de Firebase Authentication: ${userIdToDelete}`);
    await auth.deleteUser(userIdToDelete);
    logger.info(`Usuario ${userIdToDelete} eliminado de Authentication con éxito.`);

    return {success: true, message: `User ${userIdToDelete} deleted successfully.`};
  } catch (error) {
    logger.error("Error al eliminar el usuario:", error);
    // Lanza un error que el cliente (tu app de React) puede capturar.
    if (error instanceof HttpsError) {
      throw error; // Re-lanza el error si ya es de tipo HttpsError
    }
    throw new HttpsError("internal", "Failed to delete user and their data.", error);
  }
});


/**
 * Otorga privilegios de superadmin a un usuario por su email.
 * - Solo puede ser llamada por un superadmin ya existente.
 */
export const setSuperadminClaim = onCall(async (request) => {
    // --- 1. Verificación de Seguridad ---
  if (!request.auth?.uid) {
    logger.warn("Un usuario no autenticado intentó llamar a setSuperadminClaim.");
    throw new HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user.",
    );
  }

  // Asegurarse de que el usuario que invoca la función es un superadmin.
  if (request.auth.token.superadmin !== true) {
    logger.error(
      `Usuario ${request.auth.uid} intentó asignar rol de superadmin sin permisos.`
    );
    throw new HttpsError(
      "permission-denied",
      "This function can only be called by a superadmin."
    );
  }

  // --- 2. Validación de los Datos de Entrada ---
  const targetEmail = request.data.email;
  if (typeof targetEmail !== "string" || !targetEmail) {
    throw new HttpsError(
      "invalid-argument",
      "La función debe ser llamada con el email del usuario."
    );
  }

  try {
    // --- 3. Lógica de Asignación de Rol ---
    const userToUpdate = await auth.getUserByEmail(targetEmail);

    await auth.setCustomUserClaims(userToUpdate.uid, {superadmin: true});

    logger.info(`Superadmin ${request.auth.uid} asignó rol a ${userToUpdate.uid}.`);
    return {message: `¡Éxito! ${targetEmail} ahora es superadmin.`};
  } catch (error) {
    logger.error(`Error asignando rol de superadmin a ${targetEmail}:`, error);
    throw new HttpsError("internal", "No se pudo asignar el rol de superadmin.");
  }
});
