import * as Firestore from "firebase/firestore"
import { initializeApp } from "firebase/app";

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
export const firebaseDB = Firestore.getFirestore()

//Get a collection with a Master function
export function getCollection<T>(path: string) {
    const projectCollection = Firestore.collection(firebaseDB, path) as Firestore.CollectionReference<T>
    return projectCollection
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
        
        const docRef = Firestore.doc(firebaseDB, `${path}/${docId}`)

        await Firestore.deleteDoc(docRef)

        return docId
    }
    return null;
    
}


//Delete a document from Firebase knowing its name.
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

export async function createDocument(path: string, data) {
    const collectionRef = getCollection(path);
    const docRef = {...data}
    await Firestore.addDoc(collectionRef, docRef)
}


//Delete a document from Firebase
export async function updateDocument <T extends Record<string, any>>(path: string, id: string, data : T) {

    const docRef = Firestore.doc(firebaseDB, `${path}/${id}`)

    await Firestore.updateDoc(docRef, data)

}