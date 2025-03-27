import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { IProject, Project } from "../../classes/Project";
import { ToDoIssue } from "../../classes/ToDoIssue";
import { ProjectsManager } from "../../classes/ProjectsManager";
import { IToDoIssue } from '../../Types'


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
                return docId
            }
            console.log(`No document found with name: ${name} in ${path}`);
            return null;
        } catch (error) {
            console.error("Error deleting document:", error);
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 5000,
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
            console.log(`Document deleted successfully at ${path}/${id}`);
        } catch (error) {
            console.error("Error deleting document by ID:", error);
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }, {
        maxRetries: 3,
        timeout: 5000,
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



        } catch (error) {
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
            console.log(`Todo and its subcollections deleted successfully at projects/${projectId}/todoList/${todoId}`);

        } catch (error) {
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

        const createdDoc = await Firestore.addDoc(collectionRef, dataToSave)
        console.log(`Document created at ${path} with ID:`, createdDoc.id);
        return createdDoc

    }, {
        maxRetries: 3,
        timeout: 5000,
        baseDelay: 500
    });
}





//Update a document from Firebase
export async function updateDocument<T extends Record<string, any> | Array<any>>(
    id: string,
    data: T,
    options: UpdateDocumentOptions = {}
): Promise<boolean> {
    return withRetry(async () => {

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
            fullPath = `${basePath}/${parentId}/todoList/${todoId}/${subcollection}/${id}`;
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
        console.log(`Document updated successfully at ${fullPath}`);
        return true;

    }, {
        maxRetries: 3,
        timeout: 5000,
        baseDelay: 500
    });
}

