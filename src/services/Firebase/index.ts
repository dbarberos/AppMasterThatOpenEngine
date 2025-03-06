import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { IProject, Project } from "../../classes/Project";
import { IToDoIssue, ToDoIssue } from "../../classes/ToDoIssue";
import { ProjectsManager } from "../../classes/ProjectsManager";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestoreDB = Firestore.getFirestore()

//Get a collection with a Master function
export function getCollection<T>(path: string) {
    const projectCollection = Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>
    return projectCollection
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
export const getProjectsFromDB = async () => {
    // await ensureFirebaseAuth();
    try {
        const projectsCollection = getCollection<IProject>("/projects")
        const q = Firestore.query(projectsCollection, Firestore.orderBy('name', 'asc'))

        // Add permission check
        const permissionsCheck = await Firestore.getDocs(projectsCollection).catch(error => {
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
}

async function getTodoTags(todoDoc: Firestore.QueryDocumentSnapshot) {
    const tagsRef = Firestore.collection(todoDoc.ref, 'tags');
    const tagsSnapshot = await Firestore.getDocs(tagsRef);
    return tagsSnapshot.docs.map(tagDoc => tagDoc.data());
}

async function getTodoAssignedUsers(todoDoc: Firestore.QueryDocumentSnapshot) {
    const assignedUsersRef = Firestore.collection(todoDoc.ref, 'assignedUsers');
    const assignedUsersSnapshot = await Firestore.getDocs(assignedUsersRef);
    return assignedUsersSnapshot.docs.map(userDoc => userDoc.data());
}




//Delete a document from Firebase
export async function deleteDocument(path: string, name: string) {

    //Look for a doc with a field name specific and returns its id inside Firestore
    const collectionRef = getCollection(path);
    const q = Firestore.query(collectionRef, Firestore.where("name", "==", name));

    const querySnapshot = await Firestore.getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const docId = doc.id;

        const docRef = Firestore.doc(firestoreDB, `${path}/${docId}`)

        await Firestore.deleteDoc(docRef)

        return docId
    }
    return null;
}

//Delete a document by ID from Firebase
export async function deleteDocumentByID(path: string, id: string) {

    const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
    Firestore.deleteDoc(doc)
    
}


//Get a document from Firebase knowing its name.
export async function getDocumentIdByName(collectionPath: string, name: string): Promise<string | null> {
    const collectionRef = getCollection(collectionPath); // Obtén la referencia de la colección
    const q = Firestore.query(collectionRef, Firestore.where("name", "==", name)); // Crea la consulta

    const querySnapshot = await Firestore.getDocs(q); // Ejecuta la consulta

    if (!querySnapshot.empty) {
        // Si hay documentos que coinciden, devuelve el 'id' del primer documento
        const doc = querySnapshot.docs[0];
        return doc.id; // Devuelve el id del documento
    }

    return null; // Si no se encuentra, devuelve null
}

export async function createDocument<T extends Record<string, any>>(path: string, data: T) {
    try {
        // Create a clean copy of the data without arrays that will become subcollections
        const dataToSave = Object.entries(data).reduce((acc, [key, value]) => {
            // Skip arrays that will be subcollections
            if (key === 'todoList' || key === 'tags' || key === 'assignedUsers') {
                return acc;
            }

            // Handle special cases for dates
            if (value instanceof Date) {
                acc[key] = Firestore.Timestamp.fromDate(value);
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} )



        const collectionRef = getCollection(path);
        const docRef = { ...data, createdAt: Firestore.serverTimestamp() }
        const createdDoc = await Firestore.addDoc(collectionRef, docRef)

        console.log(`Document created at ${path} with ID:`, createdDoc.id);
        return createdDoc
    } catch (error) {
        console.error(`Error creating document at ${path}:`, error);
        throw error;
    }
}








//Update a document from Firebase
export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {

    const docRef = Firestore.doc(firestoreDB, `${path}/${id}`)
    
    try {
        await Firestore.updateDoc(docRef, data)
    } catch (error) {
        console.error("Error updating document:", error);
        throw error
    }
    

}