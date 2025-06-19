import * as Firestore from "firebase/firestore"
import { firestoreDB, auth, getCollection } from '../firebase/index'; 
import {
    //Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut, 
    User as firebaseUser, // Renombrar para evitar conflicto con tu clase User local
    AuthError,
    AuthProvider,

    // Aquí puedes importar otras funciones de Firebase Auth que necesites en el futuro:
    updateProfile,
    UserCredential,
    OAuthProvider, // Para Apple
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword,
    updateEmail,
    
    // deleteUser,
    // etc.
} from 'firebase/auth';


import { User as AppUser } from '../../classes/User'
import { UsersManager } from '../../classes/UsersManager'
import { UserProfile } from '../../Auth/react-components/AuthContext'; // Import UserProfile for type safety
import { updateDocument } from '../firebase/index'

import { toast } from 'sonner'

import { IUser } from '../../types'
//import { User } from '../../classes/User'  // Usar firebaseUser directamente en las promesas
/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param email - El email del usuario.
 * @param password - La contraseña del usuario.
 * @returns Una promesa que se resuelve con las credenciales del usuario si el login es exitoso.
 * @throws Un error si el inicio de sesión falla.
 */


export interface SignUpData {
    email: string;
    password_DO_NOT_STORE_THIS_PLAINTEXT: string; // Renombrado para enfatizar
    nickName: string;
}

export interface SignInData {
    email: string;
    password_DO_NOT_STORE_THIS_PLAINTEXT: string; // Renombrado para enfatizar
}

// interface AuthContextType {
//     currentUser: FirebaseUser | null;
//     appUser: AppUser | null; // Usuario de tu aplicación cargado desde Firestore
//     loading: boolean;
//     usersManager: UsersManager; // Para acceder a los datos del usuario de Firestore
// }


// interface AuthError {
//     code: string;
//     message: string;
// }

// interface UserProfileData {
//     displayName?: string;
//     photoURL?: string;
// }


/**
* Procesa el inicio de sesión o registro a través de un proveedor OAuth (Google, GitHub).
* Crea un documento de usuario en Firestore si es la primera vez que inicia sesión.
*/


// Función para verificar si un nickname ya existe
const isNicknameTaken = async (nickName: string): Promise<boolean> => {
    const usersRef = Firestore.collection(firestoreDB, "users");
    const q = Firestore.query(usersRef, Firestore.where("nickname", "==", nickName));
    const querySnapshot = await Firestore.getDocs(q);
    return !querySnapshot.empty;
};



export const signUpWithEmail = async ({
    email,
    password_DO_NOT_STORE_THIS_PLAINTEXT,
    nickName,
}: SignUpData): Promise<firebaseUser> => {
    try {
        const trimmedNickname = nickName.trim();

        const normalizedEmail = email.toLowerCase();
        // const userByEmailRef = Firestore.doc(firestoreDB, `usersByEmail/${normalizedEmail}`);
        // const userByEmailSnap = await Firestore.getDoc(userByEmailRef);
  
        // if (userByEmailSnap.exists()) {
        //     const error = new Error("This email is already registered. Please sign in or use a different email.") as AuthError
        //     error.code = "auth/email-already-in-use-firestore";
        //     throw error;
        // }

        console.log("[signUpWithEmail] Attempting to create user in Firebase Auth...");        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password_DO_NOT_STORE_THIS_PLAINTEXT);
        const user = userCredential.user;

        console.log("[signUpWithEmail] User created in Firebase Auth. UID:", user.uid);


    // Prepare user profile data, ensuring consistency with UserProfile interface
        const userProfileData: UserProfile = {
            uid: user.uid,
            email: user.email, 
            nickName: trimmedNickname, // Ensure this matches UserProfile (lowercase 'n')
            firstName: "",
            lastName: "",
            photoURL: user.photoURL || null, // Use undefined if null for optional fields
            providerId: user.providerData[0]?.providerId || 'password',
            accountCreatedAt: Firestore.Timestamp.fromDate(new Date()), // Matches UserProfile
            lastLoginAt: Firestore.Timestamp.fromDate(new Date()),    // Matches UserProfile
            status: 'active',                                         // Matches UserProfile
            // Initialize other optional fields from UserProfile as undefined or default values
            organization: "",
            roleInApp: "viewer", // Default role
            address: "",
            phoneNumber: "",
            phoneCountryNumber: "",
            projectsAssigned: [],
            descriptionUser: ""
        };

        try {
            console.log("[signUpWithEmail] Attempting to create user document in Firestore 'users' collection with data:", JSON.stringify(userProfileData));
            await Firestore.setDoc(Firestore.doc(firestoreDB, 'users', user.uid), userProfileData);
            console.log("[signUpWithEmail] User document created in 'users' collection.");
        } catch (firestoreError: any) { 
            console.error("[signUpWithEmail] Error creating user document in 'users' collection. Firestore Error Code:", firestoreError.code, "Message:", firestoreError.message, "Details:", firestoreError);
            // Optional: Delete the Auth user if profile creation fails critically
            // await user.delete().catch(delErr => console.error("Failed to delete auth user after profile creation error", delErr));
            throw new Error(`Failed to create user profile in Firestore 'users': ${firestoreError.message || 'Unknown Firestore error'}`);
        }

        try {
            console.log("[signUpWithEmail] Attempting to create email mapping in 'usersByEmail' collection for email:", normalizedEmail, "with UID:", user.uid);
            await Firestore.setDoc(Firestore.doc(firestoreDB, `usersByEmail/${normalizedEmail}`), { uid: user.uid });
            console.log("[signUpWithEmail] Email mapping created in 'usersByEmail' collection.");
        } catch (firestoreError: any) { 
            console.error("[signUpWithEmail] Error creating email mapping in 'usersByEmail' collection. Firestore Error Code:", firestoreError.code, "Message:", firestoreError.message, "Details:", firestoreError);
            throw new Error(`Failed to create email mapping in Firestore 'usersByEmail': ${firestoreError.message || 'Unknown Firestore error'}`);
        }



        return user;
    } catch (error: any) { // This is the outer catch block (around line 166)
        console.error("Error en signUpWithEmail (outer catch block):", error); 
        if (error.code) { 
            console.error("Outer catch - Error code:", error.code);
        }
        throw error;
    }
};

export const signInWithEmail = async ({
    email,
    password_DO_NOT_STORE_THIS_PLAINTEXT
}: SignInData): Promise<firebaseUser> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password_DO_NOT_STORE_THIS_PLAINTEXT);
        return userCredential.user;
    } catch (error) {
        console.error("Error en signInWithEmail:", error);
        throw error;
    }
};
  

const handleOAuthSignIn = async (
    provider: AuthProvider,
    nicknameFromForm?: string
): Promise<firebaseUser> => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const providerName = provider.providerId.split('.')[0]; // 'google' o 'github'

        // Verificar si el usuario ya existe en Firestore
        const userDocRef = Firestore.doc(firestoreDB, 'users', user.uid);
        const userDocSnap = await Firestore.getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            // NUEVO usuario, crear perfil en Firestore
            let finalNickname = nicknameFromForm?.trim();

            // Verificar si el nickname del formulario (si existe y es válido) está tomado
            if (finalNickname && await isNicknameTaken(finalNickname)) {
                toast.error(`This nickname "${finalNickname}" is already used by other user. Try a new one.`);
                finalNickname = undefined; // Forzar la búsqueda de un nickname alternativo
            }

            if (!finalNickname && user.displayName) {
                const potentialNickname = user.displayName.split(' ')[0]; // Tomar solo el primer nombre
                if (potentialNickname && !await isNicknameTaken(potentialNickname)) {
                    finalNickname = potentialNickname;
                }
            }

            if (!finalNickname && user.email) {
                const emailNickname = user.email.split('@')[0];
                if (emailNickname && !await isNicknameTaken(emailNickname)) {
                    finalNickname = emailNickname;
                }
            }
            
            if (!finalNickname) { // Generar uno si todo lo demás falla o está tomado
                let i = 0;
                let tempNickname = `user_${user.uid.substring(0, 6)}`;
                while (await isNicknameTaken(tempNickname)) {
                    i++;
                    tempNickname = `user_${user.uid.substring(0, 6)}_${i}`;
                }
                finalNickname = tempNickname;
                toast.info(`Your assigned nickname is ${finalNickname} because the one you provided was unavailable or none was specified.`);
            }
            const userEmail = user.email || `${finalNickname.replace(/\s+/g, '_')}@${providerName}.example.com`; // Placeholder si no hay email


            await Firestore.setDoc(userDocRef, {
                uid: user.uid,
                email: userEmail,
                nickName: finalNickname,
                firstName: "", // Ya no se piden
                lastName: "",  // Ya no se piden
                photoURL: user.photoURL, // Guardar la foto de perfil del proveedor
                providerId: result.providerId, // Guardar el ID del proveedor (e.g., 'google.com', 'github.com')
                accountCreatedAt: Firestore.Timestamp.fromDate(new Date()),
            });
            // Si el email del proveedor ya existe en usersByEmail bajo otro UID,
            // Firebase Auth debería haber manejado esto con 'auth/account-exists-with-different-credential'.
            // Aquí asumimos que si llegamos a este punto con un nuevo UID, podemos crear el usuario.
            // Sin embargo, es buena idea verificar usersByEmail también para consistencia.
            if (user.email) {
                const userByEmailRef = Firestore.doc(firestoreDB, `usersByEmail/${user.email.toLowerCase()}`);
                const userByEmailSnap = await Firestore.getDoc(userByEmailRef);
                if (userByEmailSnap.exists() && userByEmailSnap.data()?.uid !== user.uid) {
                    // Esto indica una situación compleja: el email está asociado a otro UID.
                    // Firebase Auth debería haber lanzado 'auth/account-exists-with-different-credential'.
                    // Si no lo hizo, podrías lanzar un error personalizado o intentar un flujo de enlace.
                    // Por simplicidad aquí, procederemos, pero esto necesita cuidadosa consideración.
                    console.warn(`Email ${user.email} ya existe en usersByEmail con UID ${userByEmailSnap.data()?.uid}, pero el UID actual es ${user.uid}.`);
                }
                if (!userByEmailSnap.exists()) {
                    await Firestore.setDoc(Firestore.doc(firestoreDB, `usersByEmail/${user.email.toLowerCase()}`), { uid: user.uid });
                }
            }
        } else {
            // Si el usuario ya existe, sus datos de perfil ya deberían estar en Firestore.
            const existingData = userDocSnap.data();
            // Opcional: Actualizar photoURL o displayName si han cambiado en el proveedor
            // Por ahora, solo actualizamos photoURL si ha cambiado.
            if (user.photoURL && existingData && user.photoURL !== existingData.photoURL) {
                await updateDocument(user.uid, 
                    { photoURL: user.photoURL },
                    { basePath: 'users' } // Especificar que estamos actualizando la colección 'users'
                );
            }
        }
        return user;
    } catch (error) {
    console.error("Error en handleOAuthSignIn:", error);
    throw error; // Re-lanzar para que el componente lo maneje
    }
};





export const signInWithGoogle = async (nicknameFromForm?: string): Promise<firebaseUser> => {
    const provider = new GoogleAuthProvider();
    return handleOAuthSignIn(provider, nicknameFromForm);
};

export const signInWithGitHub = async (nicknameFromForm?: string): Promise<firebaseUser> => {
    const provider = new GithubAuthProvider();
    // Opcional: solicitar scope para el email si GitHub no lo provee por defecto
    // provider.addScope('user:email');
    return handleOAuthSignIn(provider, nicknameFromForm);
};

export const signOut = async (): Promise<void> => firebaseSignOut(auth);



export class FirebaseAuthService {

    private static authInstance: Auth = auth;


    // Método para verificar si un email ya existe en Firestore
    static async isEmailTaken(email: string): Promise<boolean> {
        try {
            const usersRef = await getCollection("/users");
            const q = Firestore.query(usersRef, Firestore.where("email", "==", email));
            // Crea la consulta

            const querySnapshot = await Firestore.getDocs(q); // Ejecuta la consulta

            return !querySnapshot.empty; // Retorna true si encuentra algún documento (email tomado)
        } catch (error: any) {
            console.error("Error checking if email is taken:", error);
            toast.error(`Error checking email: ${error.message}`);
            return true; // Asumir que está tomado en caso de error para prevenir problemas
        }
    }

    // Método para crear un usuario en Firebase Authentication y actualizar su perfil
    static async signUpWithEmailPasswordNickname(email: string, password: string, nickName: string): Promise<UserCredential | null> {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.authInstance, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: nickName,
                    // photoURL: "opcional_url_foto_default" 
                });
                // Después de crear en Auth y actualizar perfil, crea el documento en Firestore
                await this.createUserInFirestore(userCredential.user, { nickName: nickName });
                toast.success(`Account for ${nickName} created successfully!`);
                return userCredential;
            }
            throw new Error("Login failed: No user credentials returned.");
        } catch (error: any) {
            console.error("Error signing up with email, password, and nickname:", error);
            const errorMessage = error.message || "An unknown error occurred during sign up.";
            toast.error(`Signup Error: ${errorMessage}`);
            // Puedes mapear error.code a mensajes más amigables si lo deseas
            // ej: if (error.code === 'auth/email-already-in-use') { ... }
            throw new Error(errorMessage);
        }
    }

    // Método para crear el documento del usuario en Firestore
    static async createUserInFirestore(firebaseUser: FirebaseUser, additionalData: Partial<IUser>): Promise<void> {
        if (!firebaseUser) return;

        const userRef = Firestore.doc(firestoreDB, "/Users", firebaseUser.uid);
        const userDocSnap = await Firestore.getDoc(userRef);

        if (!userDocSnap.exists()) {
            const userData: IUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                nickName: firebaseUser.displayName || additionalData.nickName || "",
                firstName: additionalData.firstName || "",
                lastName: additionalData.lastName || "",
                roleInApp: additionalData.roleInApp || 'viewer', // Rol por defecto
                accountCreatedAt: new Date(),
                lastLoginAt: new Date(),
                status: 'active', // Estado por defecto
                // Inicializa otros campos de IUser según sea necesario
                phoneNumber: additionalData.phoneNumber || "",
                phoneCountryNumber: additionalData.phoneCountryNumber || "",
                organization: additionalData.organization || "",
                photoURL: firebaseUser.photoURL || additionalData.photoURL || "",
                address: additionalData.address || "",
                descriptionUser: additionalData.descriptionUser || "",
                projectsAssigned: additionalData.projectsAssigned || [],
            };
            try {
                await Firestore.setDoc(userRef, userData);
                console.log("User document created in Firestore with ID:", firebaseUser.uid);
            } catch (error: any) {
                console.error("Error creating user document in Firestore:", error);
                toast.error(`Firestore Error: ${error.message}`);
                // Considera qué hacer si la creación en Auth fue exitosa pero Firestore falló.
                // Podrías intentar eliminar el usuario de Auth o marcarlo para una revisión manual.
            }
        } else {
            // El documento ya existe, podrías actualizar lastLoginAt o fusionar datos si es necesario
            console.log("User document already exists in Firestore for:", firebaseUser.uid);
            // await updateDoc(userRef, { lastLoginAt: new Date(), ...additionalData }); // Ejemplo de actualización
        }
    }



    static async  loginWithEmailPassword(email: string, password: string): Promise<UserCredential> {
        try {
            const userCredential = await signInWithEmailAndPassword(this.authInstance, email, password);
            if (userCredential.user) {
                // Actualizar lastLoginAt en Firestore
                const userRef = Firestore.doc(firestoreDB, "/Users", userCredential.user.uid);
                await Firestore.setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
            }
            toast.success(`Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`);
            return userCredential;
        } catch (error: any) {
            console.error("Error logging in:", error);
            toast.error(`Login Error: ${error.message}`);
            return null;
        }
    }

    /**
     * Obtiene el usuario actualmente autenticado.
     * @returns El objeto FirebaseUser si hay un usuario logueado, o null si no lo hay.
     */
    static getCurrentAuthenticatedUser(): firebaseUser | null {
        return auth.currentUser;
    }

    

    static onAuthUserStateChanged(callback: (user: firebaseUser | null) => void): () => void {
        // Esta función devuelve la función de desuscripción (unsubscribe)
        return onAuthStateChanged(auth, callback);
    }


    // --- Funciones Adicionales que podrías necesitar (ejemplos) ---

    static async signUpUser(email: string, password: string): Promise<UserCredential> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            toast.success('Account created successfully!');
            return userCredential;
        } catch (error) {
            const authError = error as AuthError;
            const errorMessage = this.getErrorMessage(authError.code);
            toast.error('Sign up failed', { description: errorMessage });
            throw new Error(errorMessage);
        }
    }

    
    s// Método de Logout
    static async logout(): Promise<void> {
        try {
            await signOut(this.authInstance);
            toast.info("You have been logged out.");
        } catch (error: any) {
            console.error("Error logging out:", error);
            toast.error(`Logout Error: ${error.message}`);
        }
    }


    static async resetPassword(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent!');
        } catch (error) {
            const authError = error as AuthError;
            const errorMessage = this.getErrorMessage(authError.code);
            toast.error('Password reset failed', { description: errorMessage });
            throw new Error(errorMessage);
        }
    }

    static async updateUserPassword(newPassword: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user is signed in');
            
            await updatePassword(user, newPassword);
            toast.success('Password updated successfully!');
        } catch (error) {
            const authError = error as AuthError;
            const errorMessage = this.getErrorMessage(authError.code);
            toast.error('Password update failed', { description: errorMessage });
            throw new Error(errorMessage);
        }
    }


    static async updateUserEmail(newEmail: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user is signed in');
            
            await updateEmail(user, newEmail);
            toast.success('Email updated successfully!');
        } catch (error) {
            const authError = error as AuthError;
            const errorMessage = this.getErrorMessage(authError.code);
            toast.error('Email update failed', { description: errorMessage });
            throw new Error(errorMessage);
        }
    }

        static async updateUserProfile(displayName: string, photoURL?: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user is signed in');
            
            await updateProfile(user, { displayName, photoURL });
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Profile update failed', { description: 'Please try again' });
            throw error;
        }
    }


    static async  registerUserWithEmail(
        email: string,
        password_param: string,
        profileData: UserProfile
    ): Promise<firebaseUser> {
        try {
            const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
            const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password_param);
            const firebaseUser = userCredential.user;

            if (firebaseUser) {
                await updateProfile(firebaseUser, {
                    displayName: profileData.displayName,
                    photoURL: profileData.photoURL,
                });
                console.log("User registered and profile updated successfully:", firebaseUser.uid);
                return firebaseUser;
            } else {
                throw new Error("User creation failed, no user returned from Firebase Auth.");
            }
        } catch (error) {
            console.error("Error registering user with email and password:", error);
            throw error;
        }
    }




    private static getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No user found with this email';
            case 'auth/wrong-password':
                return 'Invalid password';
            case 'auth/email-already-in-use':
                return 'Email already registered';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/requires-recent-login':
                return 'Please sign in again to complete this action';
            default:
                return 'An unexpected error occurred';
        }
    }

}

