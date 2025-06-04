import * as Firestore from "firebase/firestore"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    updateProfile,
    UserCredential,
    User as FirebaseUser, // Renombrar para evitar conflicto con tu clase User local si la tienes
    // Aquí puedes importar otras funciones de Firebase Auth que necesites en el futuro:
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updatePassword,
    updateEmail,
    
    // deleteUser,
    // etc.

} from 'firebase/auth';
import { toast } from 'sonner';

import { firestoreDB, auth } from '../firebase/index'; // Asumiendo que exportas 'auth' desde tu config de firebase

/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param email - El email del usuario.
 * @param password - La contraseña del usuario.
 * @returns Una promesa que se resuelve con las credenciales del usuario si el login es exitoso.
 * @throws Un error si el inicio de sesión falla.
 */

interface AuthError {
    code: string;
    message: string;
}

interface UserProfileData {
    displayName?: string;
    photoURL?: string;
}

export class FirebaseAuthService {

    static async  loginWithEmailPassword(email: string, password_param: string): Promise<UserCredential> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password_param);
            // Puedes añadir lógica aquí si necesitas hacer algo después de un login exitoso,
            // como obtener el token JWT, etc.
            console.log("User logged in successfully:", userCredential.user.uid);
            toast.success('Successfully signed in!');
            return userCredential;
        } catch (error: any) {
            // Aquí puedes personalizar el manejo de errores o simplemente re-lanzarlo
            console.error("Error logging in with email and password:", error.code, error.message);

            const authError = error as AuthError;
                const errorMessage = this.getErrorMessage(authError.code);
                toast.error('Sign in failed', { description: errorMessage });
            // Podrías mapear error.code a mensajes más amigables para el usuario si lo deseas
            throw error; // Re-lanzar para que el componente que llama pueda manejarlo
        }
    }

    /**
     * Obtiene el usuario actualmente autenticado.
     * @returns El objeto FirebaseUser si hay un usuario logueado, o null si no lo hay.
     */
    static getCurrentAuthenticatedUser(): FirebaseUser | null {
        return auth.currentUser;
    }

    

    static onAuthUserStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
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

    
    static async logOutUser(): Promise<void> {
        try {
            await signOut(auth);
            console.log("User logged out successfully");
            toast.success('Signed out successfully');
        } catch (error) {
            console.error("Error logging out:", error);
            toast.error('Sign out failed', { description: 'Please try again' });
            throw error;
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
        profileData: UserProfileData
    ): Promise<FirebaseUser> {
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

