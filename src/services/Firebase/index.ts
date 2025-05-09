import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { IProject, Project } from "../../classes/Project";
import { ToDoIssue } from "../../classes/ToDoIssue";
import { ProjectsManager } from "../../classes/ProjectsManager";
import { IAssignedUsers, ITag, IToDoIssue } from '../../types'
import { toast } from 'sonner'

type SubcollectionType = 'todoList' | 'tags' | 'assignedUsers';


export interface UpdateDocumentOptions {
    basePath?: string;
    subcollection?: SubcollectionType;
    parentId?: string;
    todoId?: string;
    isArrayCollection?: boolean;
}

interface RetryOptions {
    maxRetries?: number;
    timeout?: number;
    baseDelay?: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
    maxRetries: 3,
    timeout: 5000, // 10 seconds
    baseDelay: 1000, // 1 second
};


async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error('Operation timed out - Check your internet connection'));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}

async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = DEFAULT_OPTIONS
): Promise<T> {
    const { maxRetries = 3, timeout = 10000, baseDelay = 1000 } = options;
    let lastError: Error = new Error('No error occurred yet');

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Wrap the operation with timeout
            return await withTimeout(operation(), timeout);
        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${attempt + 1} failed:`, error);

            if (attempt < maxRetries - 1) {
                // Calculate delay with exponential backoff
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
}




// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Access the API key from environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: apiKey,
    authDomain: "masterbimdev.firebaseapp.com",
    projectId: "masterbimdev",
    storageBucket: "masterbimdev.firebasestorage.app",
    messagingSenderId: "1042507851251",
    appId: "1:1042507851251:web:fa91cd063b32a560d89e86",
    measurementId: "G-W7JL3FWK0E"
};

// *** Initialize Firebase ***


// Initialize Firebase with retry
export async function initializeFirebase() {
    return withRetry(async () => {
        try {
            const app = initializeApp(firebaseConfig);
            const db = Firestore.getFirestore();

            // Test connection
            await Firestore.getDocs(Firestore.collection(db, 'projects'));

            return { app, db };
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            throw new Error('Could not initialize Firebase connection');
        }
    }, {
        maxRetries: 2, // Menos reintentos para la inicialización
        timeout: 5000,
        baseDelay: 1000
    });
}

let firestoreDB: Firestore.Firestore;

try {
    const { db } = await initializeFirebase();
    firestoreDB = db;
} catch (error) {
    console.error("Failed to initialize Firebase:", error);

    throw new Error('Could not establish connection to Firebase');
}


// const app = initializeApp(firebaseConfig);
// export const firestoreDB = Firestore.getFirestore()


export function getCollection<T>(path: string) {
    return withRetry(async () => {
        try {
            const collection = Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>;

            // Verify collection is accessible
            await Firestore.getDocs(collection);

            return collection;
        } catch (error) {
            console.error(`Failed to access collection at ${path}:`, error);
            throw new Error(`Could not access collection: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 5000,
        baseDelay: 500
    });
}



// const auth = getAuth(app);

// // Add this function to ensure authentication
// export const ensureFirebaseAuth = async () => {
//     if (!auth.currentUser) {
//         try {
//             await signInAnonymously(auth);
//console.log('Anonymous authentication successful');
//         } catch (error) {
//             console.error("Authentication failed:", error);
//             throw new Error("Failed to authenticate with Firebase");
//         }
//     }
//     return auth.currentUser;
// };



//Retrieve information from Firebase
export const getProjectsFromDB = async (): Promise<Project[]> => {
    return withRetry(async () => {

        // await ensureFirebaseAuth();
        try {
            const projectsCollection = await getCollection<IProject>("/projects")
            const q = Firestore.query(projectsCollection, Firestore.orderBy('name', 'asc'))

            // Add permission check
            await Firestore.getDocs(projectsCollection).catch(error => {
                if (error.code === 'permission-denied') {
                    throw new Error('Firebase: Access denied. Please check your authentication status and permissions.');
                }
                throw error;
            });

            const firebaseProjects = await Firestore.getDocs(q)

            // Array to store all projects with their nested data
            const projects: Project[] = []

            // Fetch each project and its nested collections
            for (const projectDoc of firebaseProjects.docs) {
                const projectData = projectDoc.data()

                // Fetch todoList collection for this project
                const todoListRef = Firestore.collection(Firestore.doc(firestoreDB, 'projects', projectDoc.id), 'todoList')
                const todoListSnapshot = await Firestore.getDocs(todoListRef)
                const todoList: IToDoIssue[] = []

                // Process each todo item and its nested collections
                for (const todoDoc of todoListSnapshot.docs) {
                    const todoData = todoDoc.data()

                    // Convert Firestore timestamp to Date
                    const dueDateFormatted = todoData.dueDate instanceof Firestore.Timestamp
                        ? todoData.dueDate.toDate()
                        : new Date(todoData.dueDate);

                    const createdDateFormatted = todoData.createdDate instanceof Firestore.Timestamp
                        ? todoData.createdDate.toDate()
                        : new Date(todoData.createdDate);

                    // Fetch tags and assignedUsers collection for this todo
                    const [tags, assignedUsers] = await Promise.all([
                        getTodoTags(todoDoc),
                        getTodoAssignedUsers(todoDoc)
                    ])

                    // Combine todo data with its nested collections
                    todoList.push({
                        ...todoData,
                        id: todoDoc.id,
                        dueDate: dueDateFormatted,
                        createdDate: createdDateFormatted,
                        tags,
                        assignedUsers
                    } as unknown as IToDoIssue)
                }

                // Create the complete project object with nested data
                const project: Project = {
                    ...projectData,
                    id: projectDoc.id,
                    todoList,
                    finishDate: (projectData.finishDate as unknown as Firestore.Timestamp).toDate()
                }
                projects.push(project)
            }
            return projects

        } catch (error) {
            console.error("Error retrieving projects:", {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            throw new Error(`Failed to load projects: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 5000, // Increased timeout due to nested data fetching
        baseDelay: 1000
    })
}



async function getTodoTags(todoDoc: Firestore.QueryDocumentSnapshot) {
    const tagsRef = Firestore.collection(todoDoc.ref, 'tags');
    const tagsSnapshot = await Firestore.getDocs(tagsRef);
    return tagsSnapshot.docs.map(tagDoc => ({
        ...tagDoc.data(),
        id: tagDoc.id
    }));
}

async function getTodoAssignedUsers(todoDoc: Firestore.QueryDocumentSnapshot) {
    const assignedUsersRef = Firestore.collection(todoDoc.ref, 'assignedUsers');
    const assignedUsersSnapshot = await Firestore.getDocs(assignedUsersRef);
    return assignedUsersSnapshot.docs.map(userDoc => ({
        ...userDoc.data(),
        id: userDoc.id
    }))
}





//Delete a document from Firebase
export async function deleteDocument(
    path: string,
    name: string
) {
    return withRetry(async () => {
        try {
            //Look for a doc with a field name specific and returns its id inside Firestore
            const collectionRef = await getCollection(path);
            const q = Firestore.query(collectionRef, Firestore.where("name", "==", name));

            const querySnapshot = await Firestore.getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const docId = doc.id;
                const docRef = Firestore.doc(firestoreDB, `${path}/${docId}`)

                await Firestore.deleteDoc(docRef)

                console.log(`Document deleted successfully at ${path}/${docId}`);
                toast.success(`Document deleted successfully at ${path}/${docId}`)
                return docId
            }
            toast.success('Document deleted successfully', {
                description: `ID: ${querySnapshot.docs[0].id} at ${path}`
            })
            console.log(`No document found with name: ${name} in ${path}`);
            return null;
        } catch (error) {
            toast.error('Error deleting document. Try again later.', {
                description: error.message
            })
            console.error("Error deleting document:", error);
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 3000,
        baseDelay: 500
    });
}



//Delete a document by ID from Firebase
export async function deleteDocumentByID(
    path: string,
    id: string
) {
    return withRetry(async () => {
        try {
            const docRef = Firestore.doc(firestoreDB, `${path}/${id}`)

            // Verify document exists before attempting to delete
            const docSnap = await Firestore.getDoc(docRef);
            if (!docSnap.exists()) {
                throw new Error(`Document not found at path: ${path}/${id}`);
            }

            await Firestore.deleteDoc(docRef)

            toast.success('Document deleted successfully', {
                description: `ID: ${id} at ${path}`
            })
            console.log(`Document deleted successfully at ${path}/${id}`) 
        } catch (error) {
            toast.error('Error deleting document. Try again later.', {
                description: error.message
            })
            console.error("Error deleting document by ID:", error);
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 3000,
        baseDelay: 500
    })
}


export async function deleteProjectWithSubcollections(projectId: string): Promise<void> {
    return withRetry(async () => {
        try {
            // Get reference to project document        
            //const projectRef = Firestore.doc(firestoreDB, `projects/${projectId}`);

            // Get reference to todoList collection
            const todoListRef = await getCollection(`projects/${projectId}/todoList`)
            // const todoListRef = Firestore.collection(
            //     firestoreDB, 
            //     `projects/${projectId}/todoList`
            // );

            // Get all todos
            const todoSnapshot = await Firestore.getDocs(todoListRef);

            // Delete each todo and its subcollections
            const deleteTodoPromises = todoSnapshot.docs.map(async (todoDoc) => {
                // Delete tags subcollection
                const tagsRef = Firestore.collection(todoDoc.ref, 'tags');
                const tagsSnapshot = await Firestore.getDocs(tagsRef);
                await Promise.all(
                    tagsSnapshot.docs.map(tagDoc => Firestore.deleteDoc(tagDoc.ref))
                );

                // Delete assignedUsers subcollection
                const usersRef = Firestore.collection(todoDoc.ref, 'assignedUsers');
                const usersSnapshot = await Firestore.getDocs(usersRef);
                await Promise.all(
                    usersSnapshot.docs.map(userDoc => Firestore.deleteDoc(userDoc.ref))
                );

                // Delete the todo document
                return Firestore.deleteDoc(todoDoc.ref);
            });

            // Wait for all todos to be deleted
            await Promise.all(deleteTodoPromises);

            // Finally delete the project document
            //await Firestore.deleteDoc(projectRef)
            await deleteDocumentByID(`projects`, projectId);

            toast.success('Proyect deleted successfully', {
                description: `ID: ${projectId} at projects/`
            })

        } catch (error) {
            toast.error('Error deleting project and subcollections. Try again later.', {
                description: error.message
            })
            console.error("Error deleting project and subcollections:", error);
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 5000, // Should increased timeout due to multiple operations
        baseDelay: 1000
    });
}

export async function deleteToDoWithSubcollections(
    projectId: string,
    todoId: string
): Promise<void> {
    return withRetry(async () => {
        try {
            // Get reference to todo document
            const todoDocRef = Firestore.doc(
                firestoreDB,
                `projects/${projectId}/todoList/${todoId}`
            );

            // Delete tags subcollection
            const tagsRef = Firestore.collection(todoDocRef, 'tags');
            const tagsSnapshot = await Firestore.getDocs(tagsRef);
            await Promise.all(
                tagsSnapshot.docs.map(tagDoc => Firestore.deleteDoc(tagDoc.ref))
            );

            // Delete assignedUsers subcollection
            const usersRef = Firestore.collection(todoDocRef, 'assignedUsers');
            const usersSnapshot = await Firestore.getDocs(usersRef);
            await Promise.all(
                usersSnapshot.docs.map(userDoc => Firestore.deleteDoc(userDoc.ref))
            );

            // Finally delete the todo document
            await Firestore.deleteDoc(todoDocRef);

            toast.success('To-Do deleted successfully', {
                description: `ID: ${todoId} at projects/${projectId}/todoList/${todoId}`
            })
            console.log(`Todo and its subcollections deleted successfully at projects/${projectId}/todoList/${todoId}`);

        } catch (error) {
            toast.error('Error deleting To-Do and subcollections. Try again later.', {
                description: error.message
            })
            console.error("Error deleting todo and subcollections:", error);
            throw new Error(`Failed to delete todo: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 5000,
        baseDelay: 500
    });
}





//Get a document from Firebase knowing its name.
export async function getDocumentIdByName(
    collectionPath: string,
    name: string
): Promise<string | null> {
    return withRetry(async () => {

        const collectionRef = await getCollection(collectionPath); // Obtén la referencia de la colección
        const q = Firestore.query(collectionRef, Firestore.where("name", "==", name)); // Crea la consulta

        const querySnapshot = await Firestore.getDocs(q); // Ejecuta la consulta

        if (!querySnapshot.empty) {
            // Si hay documentos que coinciden, devuelve el 'id' del primer documento
            const doc = querySnapshot.docs[0];
            return doc.id; // Devuelve el id del documento
        }

        return null; // Si no se encuentra, devuelve null
    }, {
        maxRetries: 3,
        timeout: 5000,
        baseDelay: 500
    });
}




export async function createDocument<T extends Record<string, any>>(
    path: string,
    data: T
) {
    return withRetry(async () => {

        // Create a clean copy of the data without arrays that will become subcollections
        const dataToSave = Object.entries(data).reduce<Record<string, any>>((acc, [key, value]) => {
            // Skip arrays that will be subcollections
            if (key === 'todoList' || key === 'tags' || key === 'assignedUsers') {
                return acc;
            }

            //Handle special cases for dates
            if (value instanceof Date) {
                acc[key] = Firestore.Timestamp.fromDate(value)
            } else if (key === 'name' && path.includes('/assignedUsers')) {
                // Special handling for user data in assignedUsers collection
                acc['name'] = value
                acc['createdAt'] = Firestore.Timestamp.fromDate(new Date())
            } else if (key === 'title' && path.includes('/tags')) {
                // Special handling for tag data in tags collection
                acc['title'] = value
                acc['createdAt'] = Firestore.Timestamp.fromDate(new Date())

            } else {
                acc[key] = value;
            }
            return acc;
        }, {})



        const collectionRef = await getCollection(path);

        // Only add createdAt if it's not already present and not a subcollection document

        if (!dataToSave.createdAt && !path.includes('/tags') && !path.includes('/assignedUsers')) {
            dataToSave.createdAt = Firestore.Timestamp.fromDate(new Date());
        }

        // Verify collection exists
        try {
            await Firestore.getDocs(collectionRef);
        } catch (error) {
            throw new Error(`Collection not found at path: ${path}`);
        }

        try {

            const createdDoc = await Firestore.addDoc(collectionRef, dataToSave)

            toast.success('Document created successfully ', {
                description: `ID: ${createdDoc.id} en ${path}`
            });
            console.log(`Document created at ${path} with ID:`, createdDoc.id);
            return createdDoc
        } catch (error) {
            toast.error('Error creating the document. Try again later', {
                description: error.message
            });
            throw error;
        }

    }, {
        maxRetries: 3,
        timeout: 3000,
        baseDelay: 500
    });
}

// //Manage tags and assignedUsers documents from Firebase

// async function handleArraySubcollection(
//     basePath: string,
//     parentId: string,
//     todoId: string,
//     subcollection: 'tags' | 'assignedUsers',
//     newItems: any[]
// ) {
//     // Get current items in subcollection
//     const subcollectionRef = await getCollection(`${basePath}/${parentId}/todoList/${todoId}/${subcollection}`);
//     const currentSnapshot = await Firestore.getDocs(subcollectionRef);
//     const currentItems = currentSnapshot.docs.map(doc => ({
//         ...doc.data(),
//         id: doc.id
//     }));

//     // Process each new item
//     const processedItems = await Promise.all(newItems.map(async (item) => {
//         // Check if item has a temporary ID
//         if (item.id.startsWith('temp-')) {
//             // Create new document
//             const newDocData = subcollection === 'tags'
//                 ? { title: item.title }
//                 : { name: item.name };

//             const createdDoc = await createDocument(
//                 `${basePath}/${parentId}/todoList/${todoId}/${subcollection}`,
//                 newDocData
//             );

//             return {
//                 ...item,
//                 id: createdDoc.id
//             };
//         }
//         return item;
//     }));

//     // Delete items that no longer exist
//     await Promise.all(currentItems.map(async (currentItem) => {
//         const stillExists = processedItems.some(item => item.id === currentItem.id);
//         if (!stillExists) {
//             await deleteDocumentByID(
//                 `${basePath}/${parentId}/todoList/${todoId}/${subcollection}`,
//                 currentItem.id
//             );
//         }
//     }));

//     return processedItems;
// }

// Helper function to get items from a subcollection
async function getSubcollectionItems(subcollectionPath: string) {
    const subcollectionRef = await getCollection(subcollectionPath);
    const subcollectionSnapshot = await Firestore.getDocs(subcollectionRef);
    return subcollectionSnapshot.docs.map(doc => {
        const data = doc.data()
        if (data) {
            return {
                ...data,
                id: doc.id
            }
        } else {
            console.warn(`Document data is undefined for document ID: ${doc.id} in path: ${subcollectionPath}`);
            return { id: doc.id }; // Return a minimal object with just the ID
        }
    })
}


//Update a document from Firebase
export async function updateDocument<T extends Record<string, any> | Array<any>>(
    id: string,
    data: T,
    options: UpdateDocumentOptions = {}
): Promise<boolean> {
    return withRetry(async () => {
        try {
            const {
                basePath = 'projects',
                subcollection,
                parentId,
                todoId,
                isArrayCollection = false
            } = options

            // Build the document path
            let fullPath = '';

            if (!subcollection) {
                // Updating project document
                fullPath = `${basePath}/${id}`;
            } else if (subcollection === 'todoList') {
                // Updating todo document
                fullPath = `${basePath}/${parentId}/${subcollection}/${id}`;
            } else if (subcollection === 'tags' || subcollection === 'assignedUsers') {
                // Updating tags or assignedUsers subcollections within a todo
                if (!todoId) {
                    throw new Error(`todoId is required for updating ${subcollection}`);
                }
                // Handle tags and assignedUsers subcollections
                const subcollectionPath = `${basePath}/${parentId}/todoList/${todoId}/${subcollection}`;
                const newItems = data as (ITag | IAssignedUsers)[];

                // Delete all existing documents in the subcollection
                const currentItems = await getSubcollectionItems(subcollectionPath);
                await Promise.all(currentItems.map(item => deleteDocumentByID(subcollectionPath, item.id)));

                // Create new documents for each item in the array
                const createPromises = newItems.map(async (item) => {
                    const newDocData = 'title' in item
                        ? { title: item.title }
                        : { name: item.name };

                    const createdDoc = await createDocument(subcollectionPath, newDocData);
                    // Replace the temporary ID with the real ID
                    item.id = createdDoc.id;
                    return item;
                });

                // Wait for all new documents to be created
                await Promise.all(createPromises);

                console.log(`Subcollection ${subcollection} updated successfully at ${subcollectionPath}`);
                return true;
            
            }


            console.log('Updating document at path:', fullPath);
            const docRef = Firestore.doc(firestoreDB, fullPath);


            // Process the data before updating for solving date issues
            let processedData: Record<string, any>;

            if (isArrayCollection && Array.isArray(data)) {
                // Handle array collections (tags, assignedUsers)
                processedData = {
                    items: data.map(item => ({
                        ...item,
                        createdAt: item.createdAt instanceof Date
                            ? Firestore.Timestamp.fromDate(item.createdAt)
                            : item.createdAt
                    }))
                };
            } else if (Array.isArray(data)) {
                // Handle regular arrays
                processedData = data.map(item =>
                    item instanceof Date ? Firestore.Timestamp.fromDate(item) : item
                );
            } else {
                // Handle regular objects
                processedData = Object.entries(data).reduce<Record<string, any>>(
                    (acc, [key, value]) => {
                        if (value instanceof Date) {
                            acc[key] = Firestore.Timestamp.fromDate(value);
                        } else if (Array.isArray(value)) {
                            acc[key] = value.map(item =>
                                item instanceof Date
                                    ? Firestore.Timestamp.fromDate(item)
                                    : item
                            );
                        } else {
                            acc[key] = value;
                        }
                        return acc;
                    },
                    {}
                );
            }

            // Add updatedAt timestamp
            processedData.updatedAt = Firestore.Timestamp.fromDate(new Date())

            await Firestore.updateDoc(docRef, processedData);

            toast.success('Document updated successfully', {
                description: `ID: ${id} at ${fullPath}`
            })
            console.log(`Document updated successfully at ${fullPath}`);

            return true
        } catch (error) {
            toast.error('Error creating the document. Try again later', {
                description: error.message,
                duration:6000,
            })
            console.error("Error updating document:", error);
            throw error
        }
        // After successful update, get the full updated document
        //const docSnap = await Firestore.getDoc(docRef);
        //if (docSnap.exists()) {
        //    // Return the updated document data
        //    return docSnap.data() as T;
        //}

    }, {
        maxRetries: 3,
        timeout: 5000,
        baseDelay: 500
    });
}

// CONSULTA PARA EL TODO KANBAN
export async function getSortedTodosForColumn(projectId: string, status: string): Promise<IToDoIssue[]> {
    return withRetry(async () => { // Usando tu helper withRetry
        try {
            const todoListPath = `projects/${projectId}/todoList`;
            const todoListRef = Firestore.collection(firestoreDB, todoListPath);

            // --- AQUÍ ES DONDE USARÍAS LA CONSULTA COMBINADA ---

            //  consulta útil para optimizar la carga de datos, especialmente para vistas tipo Kanban.En lugar de cargar todos los ToDos de un proyecto y luego filtrarlos / ordenarlos en el cliente, podrías hacer consultas separadas a Firebase para cada columna.
            const q = Firestore.query(
                todoListRef,
                Firestore.where("statusColumn", "==", status), // Filtra por la columna específica
                Firestore.orderBy("sortOrder", "asc")         // Ordena por sortOrder ascendente
            );
            // ----------------------------------------------------

            const querySnapshot = await Firestore.getDocs(q);

            const todos: IToDoIssue[] = [];
            for (const todoDoc of querySnapshot.docs) {
                const todoData = todoDoc.data();
                // ... (tu lógica para convertir Timestamps a Date, etc.)
                const dueDateFormatted = todoData.dueDate instanceof Firestore.Timestamp
                    ? todoData.dueDate.toDate()
                    : new Date(todoData.dueDate);
                const createdDateFormatted = todoData.createdDate instanceof Firestore.Timestamp
                    ? todoData.createdDate.toDate()
                    : new Date(todoData.createdDate);

                // ¡OJO! Necesitarías cargar tags y assignedUsers si los necesitas aquí también
                // const [tags, assignedUsers] = await Promise.all([ ... ]);
                // Fetch tags and assignedUsers for this todo. SI QUE LOS NECESITO
                const [tags, assignedUsers] = await Promise.all([
                    getTodoTags(todoDoc),
                    getTodoAssignedUsers(todoDoc)
                ])

                todos.push({
                    ...todoData,
                    id: todoDoc.id,
                    dueDate: dueDateFormatted,
                    createdDate: createdDateFormatted,
                    tags: tags,
                    assignedUsers: assignedUsers
                    // tags: tags, // Descomentar si cargas subcolecciones
                    // assignedUsers: assignedUsers // Descomentar si cargas subcolecciones
                    

                } as IToDoIssue); // Asegúrate que el tipo coincida
            }
            console.log(`Fetched ${todos.length} todos for project ${projectId}, column ${status}`);
            return todos;

        } catch (error) {
            console.error(`Error fetching todos for column ${status}:`, error);
            toast.error(`Error fetching To-Dos for column ${status}.`, {
                description: error.message
            });
            throw new Error(`Failed to load todos for column ${status}: ${error.message}`);
        }
    });
}

// El Índice Compuesto:

// Cuándo se necesita: Precisamente cuando ejecutas una consulta como la del ejemplo anterior, que tiene una cláusula where sobre un campo(statusColumn) y una cláusula orderBy sobre otro campo(sortOrder).
// Por qué: Firestore necesita un índice especial(compuesto) para poder realizar eficientemente este tipo de consultas combinadas.Sin él, la consulta fallaría o sería muy lenta.
// Cómo se crea: La primera vez que tu aplicación intente ejecutar esa consulta combinada(por ejemplo, llamando a la función getSortedTodosForColumn del ejemplo), Firestore detectará que falta el índice.En la consola de errores de tu navegador(o en los logs si es backend), verás un mensaje de error de Firestore que incluirá un enlace directo a la consola de Firebase para crear el índice necesario automáticamente.Solo tienes que hacer clic en ese enlace y confirmar la creación.
// Conclusión para tu caso: Como tu código actual no ejecuta esa consulta combinada específica para los ToDos, no has olvidado incluir nada respecto al índice compuesto en tus archivos.El índice se crea en la consola de Firebase, no en tu código TypeScript.Solo necesitarás crearlo si decides implementar una estrategia de carga de datos más granular como la del ejemplo getSortedTodosForColumn.
// En resumen: la consulta combinada where / orderBy se aplicaría en funciones que buscan obtener listas de ToDos ya filtradas y ordenadas desde Firebase(lo cual no haces actualmente para los ToDos).Si implementas eso, Firebase te pedirá crear el índice compuesto necesario a través de un enlace en el mensaje de error.

