// import { updateAsideButtonsState } from "../index.tsx"
import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"
//import { updateAsideButtonsState } from "./HTMLUtilities.ts";

import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage, deleteToDoIssue } from "./ToDoManager";
import { ToDoIssue} from "./ToDoIssue"
import { IToDoIssue } from '../types'
import { MessagePopUp } from "./MessagePopUp"
import { User } from "../classes/User.ts";
import { UserProfile } from '../Auth/react-components/AuthContext';

import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, Firestore, Timestamp } from 'firebase/firestore'
import { firestoreDB } from '../services/firebase/index';
import { IUser } from '../types'; 
import { CACHE_TIMESTAMP_KEY, USERS_CACHE_KEY, USERS_CACHE_TIMESTAMP_KEY } from "../const.ts";


export class UsersManager {
    private _users: User[] = [];
    private unsubscribe: (() => void) | null = null; // Para desuscribirse del listener de Firestore
    private _isReady: boolean = false; // Nuevo estado para indicar si la carga inicial está completa
    private _readyCallbacks: (() => void)[] = []; // Callbacks para notificar cuando esté listo

    // Callbacks para que los componentes externos se suscriban a cambios
    // Estos son ahora más generales para las actualizaciones de lista, ya que onSnapshot maneja los cambios granulares internamente
    public onUsersListUpdated: (() => void) | null = null;

    /**
     * Constructor de UsersManager.
     * Inicializa el manager y configura el listener de Firestore para la sincronización en tiempo real.
     */

    constructor() {
        console.log('UsersManager: Inicializando y configurando el listener de Firestore.');
        this.setupFirestoreListener(); // Inicia el listener de Firestore al construir la instancia
    }

    // Los callbacks onUserCreated, onUserDeleted, onUserUpdated se eliminan
    // porque onUsersListUpdated es más general y suficiente para la mayoría de los casos.
    // Si se necesita granularidad, se puede implementar dentro de onUsersListUpdated
    // o a través de un sistema de eventos más robusto.
    // get list(): User[] = []

    // onUserCreated = (user: User) => { }
    // onUserDeleted = (email: string) => { }
    // onUserUpdated = (id: string) => { }
    // onAssignedProjectTeamDeleted = (assignedProjectTeamId: string) => { }


    // private _isLoaded: Promise<void>;
    // private _resolveLoaded: (() => void) | null = null;

    // private unsubscribeFromFirestore: Unsubscribe | null = null;
    



    // newUser(data: User, id?: string): User | undefined {
    //     const UsersEmails = this.list.map((user) => {
    //         return user.email
    //     })

    //     if (UsersEmails.includes(data.email)) {
    //         // Find and remove the existing user list since you are going to use it later
    //         // This checking is because you are going to use this methodwhen recover de user from the database
    //         const existingUserIndex = this.list.findIndex((user) =>
    //             user.email === data.email)
    //         if (existingUserIndex !== -1) {
    //             //It is clare that there is an index, since there is a user with that email
    //             // 1. Remove the existing project from the list
    //             this.list = this.list.filter((user) => user.email !== data.email);

    //             //2.Create anew user with the imported data
    //             const newUser = new User(data, id)

    //             // 3.Add the new project to the list
    //             this.list.push(newUser)
    //             this.onUserCreated(newUser)
    //             return newUser
    //         } else {
    //             console.error("User to overwrite not found in the list.")
    //             return undefined
    //         }
    //     } else {
    //         const processedData = {
    //             ...data,
    //             accountCreatedAt: data.accountCreatedAt instanceof Date 
    //               ? data.accountCreatedAt 
    //               : new Date(data.accountCreatedAt),
    //             lastLoginAt: data.lastLoginAt instanceof Date 
    //               ? data.lastLoginAt 
    //               : new Date(data.lastLoginAt),
    //           };

    //         // 1.Create a new user with the imported data
    //         const newUser = new User(processedData, id)
    //         // 2.Add the new project to the list
    //         this.list.push(newUser)
    //         this.onUserCreated(newUser)
    //         return newUser
    //     }
    // }

    // filterUsers(email: string) {
    //     const filteredUsers = this.list.filter((user) => {
    //         return user.email.toLowerCase().includes(email.toLowerCase())
    //     })
    //     return filteredUsers
    // }

    // /* USED INSIDE INDEX.TSX */
    // updateReactUsers(dataToUpdate: User) {
    //     const userIndex = this.list.findIndex(p => p.id === dataToUpdate.id)
        
    //     if (userIndex !== -1) {
    //         //Preserve the original ID
    //         dataToUpdate.id = this.list[userIndex].id
            
    //         //CReate a new list with the updated project
    //         const updatedUsersList = this.list.map((user, index) =>
    //             index === userIndex ? new User({
    //                 ...user, // Keep existing properties
    //                 ...dataToUpdate // Add new properties
    //             }) : user
    //         )
    //         //Update the list reference
    //         this.list = updatedUsersList

    //         //Return the entire updated list of projects
    //         return updatedUsersList

    //     } else {
    //         console.error("User not found in the list!")
    //         return false
    //     }
    // }

    /**
     * Configura el listener de Firestore para la colección 'users'.
     * Se suscribe a los cambios en tiempo real y actualiza la lista interna de usuarios.
     */
    private setupFirestoreListener() {
        console.log('UsersManager: Configurando listener de Firestore...');
        if (this.unsubscribe) {
            this.unsubscribe(); // Limpiar el listener anterior si existe (útil en hot-reloads o si el manager se reinicia)
            console.log('UsersManager: Listener de Firestore anterior desuscrito.');
        }

        const usersCollectionRef = collection(firestoreDB, 'users');
        this.unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            console.log('UsersManager: onSnapshot disparado. Procesando cambios...');
            const newUsersList: User[] = [];
            snapshot.forEach(doc => {
                // Asegurarse de que las fechas se conviertan correctamente de Firestore Timestamp a Date
                const userData = doc.data() as IUser;
                const userInstance = new User({
                    ...userData,
                    id: doc.id,
                    accountCreatedAt: userData.accountCreatedAt instanceof Timestamp ? userData.accountCreatedAt.toDate() : userData.accountCreatedAt,
                    lastLoginAt: userData.lastLoginAt instanceof Timestamp ? userData.lastLoginAt.toDate() : userData.lastLoginAt,
                });
                newUsersList.push(userInstance);
            });
            this._users = newUsersList; // Actualizar la lista interna del manager

            console.log('UsersManager: Lista interna de usuarios actualizada desde Firestore snapshot.', { count: this._users.length });
            
            // Marcar como listo después de la primera instantánea
            if (!this._isReady) {
                this._isReady = true;
                console.log('UsersManager: Datos iniciales cargados. Notificando callbacks de listo.');
                this._readyCallbacks.forEach(cb => cb()); // Ejecutar callbacks pendientes
                this._readyCallbacks = []; // Limpiar callbacks después de notificar
            }
            
            // Notificar a los suscriptores que la lista ha cambiado (para actualizar UI y caché)
            if (this.onUsersListUpdated) {
                console.log('UsersManager: Invocando onUsersListUpdated.');
                this.onUsersListUpdated();
            }

        }, (error) => {
            console.error('UsersManager: Error escuchando Firestore:', error);
            // Aquí podrías añadir lógica para manejar errores de conexión o permisos
        });
    }

    
    /**
     * Devuelve una copia de la lista actual de usuarios.
     * @returns {User[]} Una copia del array de usuarios.
     */
    get list(): User[] {
        // CORRECCIÓN CRÍTICA: Asegura que se devuelve la lista interna _users
        return [...this._users]; 
    }

    /**
     * Indica si el manager ha completado su carga inicial desde Firestore.
     * @returns {boolean} True si está listo, false en caso contrario.
     */
    get isReady(): boolean {
        return this._isReady; 
    }

    /**
     * Registra un callback para ser ejecutado cuando el manager esté listo.
     * Si ya está listo, el callback se ejecuta inmediatamente.
     * @param {() => void} callback La función a ejecutar.
     */
    onReady(callback: () => void) {
        console.log(`UsersManager: onReady llamado. isReady: ${this._isReady}`);
        if (this._isReady) {
            callback(); // Si ya está listo, llamar inmediatamente
        } else {
            this._readyCallbacks.push(callback); // De lo contrario, añadir a la cola de espera
        }
    }

    /**
     * Añade un nuevo usuario a la lista interna del manager.
     * Este método es para poblar la lista local, no para escribir en Firebase.
     * La escritura en Firebase debe hacerse a través de un método async separado.
     * @param {User} data Los datos del usuario a añadir/actualizar.
     * @param {string} [id] El ID opcional del usuario.
     * @returns {User | undefined} El usuario añadido/actualizado o undefined si no se encontró para sobrescribir.
     */



    newUser(data: User, id?: string): User | undefined {
        console.log('UsersManager: newUser llamado para añadir/actualizar en lista local.', { data, id });
        const existingUserIndex = this._users.findIndex(u => u.id === id || u.email === data.email);

        if (existingUserIndex !== -1) {
            // Si el usuario ya existe (por ID o email), lo sobrescribe
            const newUser = new User(data, id);
            this._users[existingUserIndex] = newUser;
            console.log(`UsersManager: Usuario ${newUser.id || newUser.email} sobrescrito en la lista local.`);
            if (this.onUsersListUpdated) {
                this.onUsersListUpdated(); // Notificar cambio en la lista
            }
            return newUser;
        } else {
            // Si el usuario no existe, lo añade
            const newUser = new User(data, id);
            this._users.push(newUser);
            console.log(`UsersManager: Nuevo usuario ${newUser.id || newUser.email} añadido a la lista local.`);
            if (this.onUsersListUpdated) {
                this.onUsersListUpdated(); // Notificar cambio en la lista
            }
            return newUser;
        }
    }



    
    /**
     * Filtra la lista de usuarios por email.
     * @param {string} email El email a buscar.
     * @returns {User[]} La lista de usuarios filtrada.
     */
    filterUsers(email: string): User[] {
        console.log('UsersManager: filterUsers llamado.', { email });
        return this._users.filter(user => user.email.toLowerCase().includes(email.toLowerCase()));
    }

    /**
     * Actualiza un usuario en Firebase. La lista interna del manager se actualizará vía onSnapshot.
     * @param {string} userId El ID del usuario a actualizar.
     * @param {User} dataToUpdate Los datos del usuario a actualizar.
     * @returns {Promise<User | undefined>} El usuario actualizado o undefined si no se encontró.
     * @throws {Error} Si el manager no está listo o el usuario no se encuentra en la lista local.
     */
    


    
    /* USED INSIDE NEWUSERFORM.TSX */

    async updateUser(userId: string, dataToUpdate: User): Promise<User | undefined> {
        console.log("UsersManager.ts: updateUser called", { userId, dataToUpdate })
            

        if (!this._isReady) {
            // Esto es crucial: si el manager no está listo, la lista local podría estar vacía o desactualizada.
            // Lanzar un error aquí fuerza al componente a esperar o manejar este estado.
            const errorMessage = 'UsersManager no está listo. Los datos iniciales no se han cargado todavía.';
            console.error(`UsersManager: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        // La comprobación local es útil para dar feedback inmediato, pero la fuente de verdad es Firebase.
        const userIndex = this._users.findIndex(u => u.id?.toString().trim() === userId.toString().trim());

        if (userIndex !== -1) { // Si el usuario se encuentra en la lista local
            console.log(`UsersManager: Usuario ${userId} encontrado en la lista local. Procediendo a actualizar en Firebase.`);
            try {
                const userDocRef = doc(firestoreDB, 'users', userId);
                // Convertir User object a objeto plano para Firestore, manejando Date/Timestamp
                const plainData = this.toFirestoreData(dataToUpdate);
                await setDoc(userDocRef, plainData, { merge: true });
                console.log(`UsersManager: Documento actualizado exitosamente en users/${userId}`);
                // La lista interna _users se actualizará automáticamente vía onSnapshot.
                // No es necesario actualizar _users[userIndex] directamente aquí.
                return dataToUpdate; // Devolver los datos actualizados de forma optimista
            } catch (error: any) {
                console.error(`UsersManager: Error actualizando documento en users/${userId}:`, error);
                throw new Error(`Fallo al actualizar usuario en Firebase: ${error.message}`);
            }
        } else {
            // Este error significa que el usuario no estaba en la *lista local* en el momento de la búsqueda.
            const errorMessage = `UsersManager: Usuario ${userId} no encontrado en la lista local!`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }



        // const userIdString = userId.toString().trim()
        // const userIndex = this.list.findIndex(u => u.id?.toString().trim() === userIdString) //Convert to string and trim for the comparing the same type of data

        // if (userIndex !== -1) {
        //     //  Create new user instance with ipdated data
        //     const currentUser = this.list[userIndex]
        //     const updatedUser = new User({
        //         ...currentUser,
        //         ...dataToUpdate,
        //         id: userId,
        //         // accountCreatedAt: dataToUpdate.accountCreatedAt instanceof Date
        //         //     ? dataToUpdate.accountCreatedAt
        //         //     : new Date(dataToUpdate.accountCreatedAt),
        //         // lastLoginAt: dataToUpdate.lastLoginAt instanceof Date
        //         //     ? dataToUpdate.lastLoginAt
        //         //     : new Date(dataToUpdate.lastLoginAt),
        //     })

        //     // Update the list
        //     this.list[userIndex] = updatedUser

        //     //trigger update callback
        //     if (this.onUserUpdated) {
        //         this.onUserUpdated(userId)
        //     }

        //     this.updateLocalStorage()

        //     // Return the updated user
        //     return updatedUser
            
        // } else {
        //     console.error("User not found in the list!")
        //     return null
        // }
        // }
        


    /**
     * Helper para convertir el objeto User a un objeto plano compatible con Firestore.
     * Maneja la conversión de objetos Date a Firestore Timestamps.
     * @param {User} user El objeto User a convertir.
     * @returns {{ [key: string]: any }} El objeto plano para Firestore.
     */



    private updateLocalStorage(): void {
        try {
            console.log('Updating: Stating updateLocalStorage, thislist contain:',
                this.list.map(u => ({ id: u.id, projectsCount: u.projectsAssigned?.length ?? 'N/A' }))
            )
            // Procesar usuarios antes de almacenar en localStorage
            const processedUsers = this.list.map(user => {
                const processedProjectAssigned = user.projectsAssigned?.map(project => {

                    // Asegurarse de que las fechas en projectsAssigned sean strings ISO
                    return {
                        ...project,
                        assignedDate: project.assignedDate instanceof Date ? project.assignedDate.toISOString() : project.assignedDate,
                    };
                });

                // let processedAccountCreatedAt: string | null = null
                // if (user.accountCreatedAt instanceof Date) {
                //     if (!isNaN(user.accountCreatedAt.getTime())) {
                //         processedAccountCreatedAt = user.accountCreatedAt.toISOString()

                //     } else {
                //         console.warn('Update - User ${user.id}: Invalid accountCreatedAt value')
                //         processedAccountCreatedAt = null
                //     }
                // } else if (user.accountCreatedAt !== null && user.accountCreatedAt !== undefined) {
                //     processedAccountCreatedAt = user.accountCreatedAt as string
                // }
                    

                // let processedLastLoginAt: string | null = null
                // if (user.lastLoginAt instanceof Date) {
                //     if (!isNaN(user.lastLoginAt.getTime())) {
                //         processedLastLoginAt = user.lastLoginAt.toISOString()
                //     } else {
                //         console.warn('Update - User ${user.id}: Invalid lastLoginAt value')
                //         processedLastLoginAt = null
                //     }
                // } else if (user.lastLoginAt !== null && user.lastLoginAt !== undefined) {
                //     processedLastLoginAt = user.lastLoginAt as string
                // }



                // Convertir Date a ISO string para localStorage
                return {
                    ...user,
                    projectsAssigned: processedProjectAssigned,
                    accountCreatedAt: user.accountCreatedAt instanceof Date ? user.accountCreatedAt.toISOString() : user.accountCreatedAt,
                    lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : user.lastLoginAt,
                }
            })
                

            //CAMBIAR  EN COSNTANTES
            localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(processedUsers));
            localStorage.setItem(USERS_CACHE_TIMESTAMP_KEY , new Date().toISOString());
            console.log('UsersManager: localStorage actualizado.');

        
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }



    /**
     * Helper para convertir el objeto User a un objeto plano compatible con Firestore.
     * Maneja la conversión de objetos Date a Firestore Timestamps.
     * @param {User} user El objeto User a convertir.
     * @returns {{ [key: string]: any }} El objeto plano para Firestore.
     */
    private toFirestoreData(user: User): { [key: string]: any } {
        const data: { [key: string]: any } = { ...user };
        // Convertir objetos Date a Firestore Timestamps si es necesario
        if (data.accountCreatedAt instanceof Date) {
            data.accountCreatedAt = Timestamp.fromDate(data.accountCreatedAt);
        }
        if (data.lastLoginAt instanceof Date) {
            data.lastLoginAt = Timestamp.fromDate(data.lastLoginAt);
        }
        // Eliminar 'id' si no debe almacenarse como un campo en el documento
        // El ID del documento de Firestore es independiente de los campos
        delete data.id;
        return data;
    }




    /**
     * Método para configurar el elemento select de proyectos en la página de usuarios.
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     * @param {Project[]} projectsList La lista de proyectos.
     * @param {string} [selectedProjectId] El ID del proyecto seleccionado.
     */
    setupProjectSelectUsersPage(projectsList: any[], selectedProjectId?: string) { // projectsList debería ser Project[]
        console.log('UsersManager: setupProjectSelectUsersPage llamado.');
        const select = document.getElementById("projectSelectedUsersPage") as HTMLSelectElement;

        if (!select) {
            console.log("Error in getting the select ToDo Board")
            return
        }

        select.innerHTML = ""

        // Add a default option to select a project
        const option = document.createElement("option");
        option.value = "";
        option.text = "Select a project"
        // option.disabled = true
        option.style.color = "var(--color-fontbase-dark)"
        select.appendChild(option);

        // Populate the select element with project options
        projectsList.forEach((project: any) => {
            const option = document.createElement("option");
            option.value = project.id;
            option.text = project.name;
            select.appendChild(option)

            // Get the stored project ID and project from local storage
            const storedProjectId = localStorage.getItem("selectedProjectId");


            // Select the project corresponding to the stored project ID
            if (storedProjectId) {
                select.value = storedProjectId
                // selectedProject = projectsList.find((project) => project.id === storedProjectId)
            }
        })

            
        //Listen when the user change the Project inside the ToDo Board

        select.addEventListener("change", () => {
            const changedProjectId = select.value

            //Save the Id of the selected project in the local storage
            localStorage.setItem("selectedProjectId", changedProjectId)
            updateAsideButtonsState()


            // Now you can use the selectedProjectId variable, it is updated using the setUpToDoBoard function
            console.log("selectedProjectId", changedProjectId)
        })
    }



    /**
     * Método estático para poblar un formulario HTML con los detalles de un usuario.
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     * @param {User} user El objeto User con los datos para poblar el formulario.
     */
    static populateUserDetailsForm (user: any) { // user debería ser User
        console.log('UsersManager: populateUserDetailsForm llamado.');
        const userDetailsForm = document.getElementById("new-user-form")
        if (!userDetailsForm) {
            console.warn('UsersManager: Formulario de usuario no encontrado.');
            return
        }


        for (const key in user) {
            const inputField = userDetailsForm.querySelectorAll(`[data-form-value="${key}"]`)
            if (inputField.length > 0) {
                inputField.forEach(element => {
                    // Handle different input types                        
                    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                        if (user[key] !== undefined && user[key] !== null) { // Lógica de DOM
                            element.value = user[key]; // Para inputs de texto, fecha, textareass
                        }
                    } else if (element instanceof HTMLSelectElement) {
                        if (user[key] !== undefined && user[key] !== null) {
                            // For select elements, set the selected option
                            const options = element.options
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].value === user[key]) {
                                    options[i].selected = true
                                    break
                                }
                            }
                        }
                    }
                })
            }
        }        
    }


    /**
     * Obtiene un usuario por su ID.
     * @param {string} id El ID del usuario.
     * @returns {User | undefined} El usuario encontrado o undefined.
     */
    getUser(id: string): User | undefined {
        console.log('UsersManager: getUser llamado.', { id });
        return this._users.find(user => user.id === id);
    }


    /**
     * Obtiene un usuario por su nickname.
     * @param {string} nickname El nickname del usuario.
     * @returns {User | undefined} El usuario encontrado o undefined.
     */
    getUserByNickname(nickname: string): User | undefined {
        console.log('UsersManager: getUserByNickname llamado.', { nickname });
        return this._users.find(user => user.nickName?.toLowerCase() === nickname.toLowerCase());
    }

        /**
     * Obtiene un usuario por su email.
     * @param {string} email El email del usuario.
     * @returns {User | undefined} El usuario encontrado o undefined.
     */
    getUserByEmail(email: string): User | undefined {
        console.log('UsersManager: getUserByEmail called.', { email });
        return this._users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }


        /**
     * Inicializa el listener de Firestore para obtener la lista de usuarios.
     * Este método se llama en el constructor de la clase.
     */
        public init() {
            this.setupFirestoreListener();
        }
    

        /**
     * Limpia el listener de Firestore.
     * Debería llamarse cuando la instancia del manager ya no sea necesaria (ej. al desmontar la aplicación).
     */
        public cleanup() {
            console.log('UsersManager: Ejecutando cleanup.');
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
                console.log('UsersManager: Listener de Firestore desuscrito.');
            }
        }
    



    


}