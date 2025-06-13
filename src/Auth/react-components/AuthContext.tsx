import * as React from 'react';
import * as Firestore from "firebase/firestore"
import { getDocumentById } from '../../services/firebase' // Importa tu instancia de auth
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { User as AppUser } from '../../classes/User'; // Tu clase User
import { IProjectAssignment, IUser, UserRoleInAppKey, UserRoleInAppValue, UserStatusKey, UserStatusValue } from '../../types'
import { UsersManager } from '../../classes/UsersManager'; // Asumiendo que tienes un UsersManager
import { firestoreDB, auth, getCollection } from '../../services/firebase/index'; 

export interface UserProfile extends Firestore.DocumentData {
    uid: string;
    email: string | null;
    nickname?: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string | null;
    providerId?: string;
    createdAt?: Firestore.Timestamp;
    phoneNumber?: string;
    phoneCountryNumber?: string;
    organization?: string;
    roleInApp?: UserRoleInAppKey | UserRoleInAppValue;
    address?: string;
    accountCreatedAt: Firestore.Timestamp | Date; 
    lastLoginAt?: Firestore.Timestamp | Date
    status: UserStatusKey | UserStatusValue
    projectsAssigned?: IProjectAssignment[];
    descriptionUser?: string
    // Añade cualquier otro campo que almacenes en el perfil de usuario en Firestore
  }

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
    //usersManager: UsersManager; // Para acceder a los datos del usuario de Firestore
    // Podrías añadir una función para recargar el perfil si es necesario
    // reloadUserProfile: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('AuthProvider: Initializing');
    const [currentUser, setCurrentUser] = React.useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);

    const usersManager = React.useMemo(() => new UsersManager(), []); // Instancia de UsersManager

    React.useEffect(() => {
        console.log('[AuthContext] Setting up auth state observer');
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("[AuthContext] 🔥 Auth state changed:", user ? `User UID: ${user.uid}` : "No user");
            setCurrentUser(user);
            if (user) {
                console.log("[AuthContext] 👤 Loading user profile for:", user.uid);
                const userDocRef = Firestore.doc(firestoreDB, 'users', user.uid);
                const userDocSnap = await Firestore.getDoc(userDocRef);
                // Si hay un usuario de Firebase, intenta cargar el perfil de UserProfile desde Firestore
                if (userDocSnap.exists()) {
                    setUserProfile({ uid: user.uid, email: user.email, ...userDocSnap.data() } as UserProfile);
                } else {
                    // Esto podría ocurrir si el documento de Firestore no se creó correctamente o se eliminó.
                    // Podrías intentar crearlo aquí o manejarlo como un error.
                    console.warn(`[AuthContext] Perfil de Firestore no encontrado para UID: ${user.uid}. Usando datos básicos de Auth.`);
                    setUserProfile({ uid: user.uid, email: user.email, nickname: user.email?.split('@')[0] || 'User' });
                }
            } else {
                console.log("[AuthContext] No user authenticated, setting userProfile to null.");
                setUserProfile(null)
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [usersManager]); // usersManager es estable debido a useMemo, pero es buena práctica incluirlo si se usa dentro.

    console.log('AuthProvider: Rendering', { loading, userExists: !!currentUser })

    return (
        <AuthContext.Provider value={{ currentUser, userProfile, loading }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };


// Este archivo gestiona el estado global del usuario autenticado.