import React from 'react'
import * as Firestore from 'firebase/firestore';
import { getCollection } from '../services/Firebase';

import { useRenameProject } from '../hooks'
import { DiffContentProjectsMessage, MessagePopUp, MessagePopUpProps } from '../react-components'

import { Project, IProject } from '../classes/Project'
import { ProjectsManager } from '../classes/ProjectsManager'

interface Props {  
    projectsManager: ProjectsManager
    onUpdateExistingProject: (updateProject: Project) => void
}

const projectsCollection = getCollection<IProject>("/projects")


// export function useUpdateExistingProject({ projectsManager, onUpdateExistingProject }: Props) {
    
    
//     const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
//     const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)
    

//     function updateDataProject(existingProject: Project, projectDetailsToUpdate: Project) {

//         const changesInProject = ProjectsManager.getChangedProjectDataForUpdate(existingProject, projectDetailsToUpdate)

//         if (Object.keys(changesInProject).length > 0) {
//             const messageContent = <DiffContentProjectsMessage changes={changesInProject} />
//             // Calculate the number of rows in the messageContent table
//             const messageRowsCount = Object.keys(changesInProject).length
//             // Calculate the desired message height
//             const messageHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`; // 3.5rem per row + 5rem for the title

//             setMessagePopUpContent({
//                 type: "info",
//                 title: "Confirm Project Update",
//                 message: messageContent,
//                 messageHeight: messageHeight,
//                 actions: ["Confirm update", "Cancel update"],
//                 onActionClick: {
//                     "Confirm update": () => {
//                         try {
//                             // Delete the existing project from Firestore
//                             // const projectDocRef = Firestore.doc(projectsCollection, existingProject.id);
//                             // await Firestore.deleteDoc(projectDocRef);

//                             // Add the updated project to Firestore
//                             // const newProjectDocRef = Firestore.doc(projectsCollection, projectDetailsToUpdate.id);
//                             // await Firestore.setDoc(newProjectDocRef, projectDetailsToUpdate);
//                             //AQUI FALTA LA LÓGICA PARA BORRA DE FIREBASE EL PROYECTO E INTRODUCIR EL NUEVO
//                             //AQUI SE SOBREESCRIBEN LOS DATOS CON LO QUE SEA AL CREAR EL NUEVO

//                             onUpdateExistingProject(projectDetailsToUpdate);
//                             setShowMessagePopUp(false)

//                         } catch (error) {
//                             console.error("Errror updating project:", error);
//                             setShowMessagePopUp(false)
//                         }  
//                     },
//                     "Cancel update": () => {
//                         console.log("User  cancelled the update.")
//                         setShowMessagePopUp(false)
//                     }
//                 },
//                 onClose: () => setShowMessagePopUp(false)
//             })

//         } else {
//             setMessagePopUpContent({
//                 type: "info",
//                 title: "No Changes Detected",
//                 message: "No changes were detected in the project details.",
//                 actions: ["Got it"],
//                 onActionClick: {
//                     "Got it": () => {
//                         console.log("No changes to update in the project.");
//                         setShowMessagePopUp(false)
//                     }
//                 },
//                 onClose: () => setShowMessagePopUp(false)
//             })
//         }
//     }
//     return (updateDataProject)

//     ///NO seria necesario un return para mostrar los mensajes del messagePOPUp??
// }


