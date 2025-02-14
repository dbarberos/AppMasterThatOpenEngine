import * as React from 'react';
import * as Firestore from 'firebase/firestore';
import { createDocument, getCollection } from '../services/Firebase';

import { useMessagePopUp, useRenameProject } from '../hooks'

import { Project, IProject } from '../classes/Project'
import { ProjectsManager } from '../classes/ProjectsManager'

interface Props {
  projectsManager: ProjectsManager
  onUpdateNewProject: (updateProject: Project) => void
  setShowMessage: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageContent: React.Dispatch<React.SetStateAction<any>>;
}

const projectsCollection = getCollection<IProject>("/projects")
/*
export function useNewProjectCreation({ projectsManager, onUpdateNewProject, setShowMessage, setMessageContent }: Props) {

  const { handleMessagePopUp, messagePopUp, showMessage, messageContent } = useMessagePopUp()
  const { isRenaming, initiateRename, currentProjectName, handleProjectRename, cancelRename } = useRenameProject(projectsManager, onUpdateNewProject)



  function createNewProject(data: IProject) {
    const projectNames = projectsManager.list.map(project => project.name);
    const existingProject = projectNames.find(existingName => existingName.toLowerCase() === data.name.toLowerCase())

    if (existingProject) {

      console.log(`A project with the name [ ${data.name} ] already exists`)
      //Create a Confirmation Modal to prompt the user about the duplication and offer options
      handleMessagePopUp({
        type: "warning",
        title: `A project with the name "${data.name}" already exist`,
        message: `<b><u>Overwrite:</b></u> Replace the existing project with the new data.<br>
                <b><u>Skip:</b></u> Do not create a new project.<br>
                <b><u>Rename:</b></u> Enter a new name for the new project.`,
        actions: ["Overwrite", "Skip", "Rename"],
        callbacks: {
          "Overwrite": () => {
            console.log("Overwrite button clicked!");

            //AQUI FALTA LA LÓGICA PARA BORRA DE FIREBASE EL PROYECTO E INTRODUCIR EL NUEVO
            //AQUI SE SOBREESCRIBEN LOS DATOS CON LO QUE SEA AL CREAR EL NUEVO

            const newProject = new Project(data)
            onUpdateNewProject(newProject)
            setShowMessage(false)

          },
          "Skip": () => {
            console.log("Skip button clicked!")
            setShowMessage(false)
          },
          "Rename": () => {
            console.log("Rename button clicked!");

            //SE CREA UN ARCHIVO NUEVO PERO CAMBIAMOS EL NOMBRE ANTES DE AÑADIRLO 

            initiateRename(data.name)
            setShowMessage(false)

          }
        }
      })

    } else {

      //try {
      // No duplicate, create the project
      const newProject = new Project(data)
      console.log(newProject)
      
      createDocument("/projects", newProject)
      
      console.log("data transfered to DB")

      //projectsManager.onProjectCreated(newProject)
      console.log("project created")

      onUpdateNewProject(newProject)
      console.log("project adde to the list")
      //}
      //catch {
      //  console.error("error in the creation of a new Project")
      //}
    }

  }

  return { createNewProject }

}


*/