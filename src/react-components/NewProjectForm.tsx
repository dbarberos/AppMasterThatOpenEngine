import React, { useState } from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from 'firebase/firestore';
import { getCollection, firebaseDB, createDocument } from '../services/Firebase';

import { DeleteProjectBtn, RenameElementMessage, DiffContentProjectsMessage, MessagePopUp, MessagePopUpProps } from '../react-components';
import { useUpdateExistingProject, useRenameProject, usePrepareProjectForm } from '../hooks';

import { BusinessUnit, IProject, Project, ProjectStatus, UserRole } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { v4 as uuidV4 } from 'uuid';


interface NewProjectFormProps {
    onClose: () => void;
    projectsManager: ProjectsManager;
    updateProject?: Project | null;
    onUpdatedProject?: (updatedProject: Project) => void;
}

const projectsCollection = getCollection<IProject>("/projects")

export function NewProjectForm({ onClose, projectsManager, updateProject = null, onUpdatedProject, }: NewProjectFormProps) {

    const [showMessagePopUp, setShowMessagePopUp] = useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = useState<MessagePopUpProps | null>(null)
    const [newProjectName, setNewProjectName] = useState<string | null>(null);
    const [renameConfirmationPending, setRenameConfirmationPending] = useState(false);
    const [projectDetailsToRename, setProjectDetailsToRename] = useState<IProject | null>(null);



    const { isRenaming, initiateRename, currentProjectName, handleProjectRename, cancelRename, setOnRename } = useRenameProject(projectsManager)
    const updateDataProject = useUpdateExistingProject({ projectsManager, onUpdateExistingProject: onUpdatedProject || (() => { }) });
    usePrepareProjectForm(updateProject, projectsManager)



    const handleRenameConfirmation = React.useCallback(async (renamedProjectName: string, projectDetails: IProject) => {
        //setNewProjectName(renamedProjectName);
        const projectToCreate = { ...projectDetails, name: renamedProjectName }
        const newProject = new Project(projectToCreate);
        console.log("project created with the new name", newProject)
        try {
            await createDocument("/projects", newProject)
            console.log("data transfered to DB")
            onUpdatedProject && onUpdatedProject(newProject)
        } catch (error) {
            console.error("Error creating project in Firestore:", error);

            setMessagePopUpContent({
                type: "error",
                title: "Error Creating Project",
                message: "There was a problem saving the project. Please try again later.",
                actions: ["OK"],
                onActionClick: {
                    "OK": () => setShowMessagePopUp(false),
                },
                onClose: () => setShowMessagePopUp(false),
            });
            setShowMessagePopUp(true)
            error.preventDefault()
        }
    }, [onUpdatedProject])


    function handleNewProjectFormSubmit(e: React.FormEvent) {
        e.preventDefault()
        const projectForm = document.getElementById("new-project-form")

        if (!(projectForm && projectForm instanceof HTMLFormElement)) { return }

        const formDataProject = new FormData(projectForm)
        //const checkProjectID = updateProject.id




        if (projectForm.checkValidity()) {
            // Form is valid, proceed with data processing
            // *** Get the finishDate from the form data ***
            let finishProjectDate: Date | null = null // Allow null initially
            const finishProjectDateString = formDataProject.get("finishDate") as string
            // Try to create a Date object, handling potential errors
            if (finishProjectDateString) {
                finishProjectDate = new Date(finishProjectDateString)
                // Check if the Date object is valid
                if (isNaN(finishProjectDate.getTime())) {
                    // Handle invalid date input (e.g., show an error message)
                    console.error("Invalid date input:", finishProjectDateString);
                    finishProjectDate = null; // Reset to null if invalid
                }
            }
            // Set to current date if no valid date was provided
            if (!finishProjectDate) {
                finishProjectDate = new Date("2026-12-31"); // Create a new Date object for today
            }

            const projectDetails: IProject = {
                name: formDataProject.get("name") as string,
                acronym: formDataProject.get("acronym") as string,
                businessUnit: BusinessUnit[formDataProject.get("businessUnit") as keyof typeof BusinessUnit],
                description: formDataProject.get("description") as string,
                status: formDataProject.get("status") as ProjectStatus,
                userRole: formDataProject.get("userRole") as UserRole,
                finishDate: finishProjectDate,
                cost: formDataProject.get("cost") ? parseFloat(formDataProject.get("cost") as string) : 0,
                todoList: []
            }
            if (updateProject === null) {
                //When the form is for a NEW PROJECT
                //createNewProject(projectDetails)
                const projectNames = projectsManager.list.map(project => project.name);
                const existingProject = projectNames.find(existingName => existingName.toLowerCase() === projectDetails.name.toLowerCase())

                if (existingProject) {
                    console.log(`A project with the name [ ${projectDetails.name} ] already exists`)
                    console.log("Setting messagePopUpContent state...");    // Log before setting state
                    //Create a Confirmation Modal to prompt the user about the duplication and offer options
                    setMessagePopUpContent({
                        type: "warning",
                        title: `A project with the name "${projectDetails.name}" already exist`,
                        message: `<b><u>Overwrite:</b></u> Replace the existing project with the new data.<br>
                                    <b><u>Skip:</b></u> Do not create a new project.<br>
                                    <b><u>Rename:</b></u> Enter a new name for the new project.`,
                        actions: ["Overwrite", "Skip", "Rename"],
                        onActionClick: {
                            "Overwrite": () => {
                                console.log("Overwrite button clicked!");

                                //AQUI FALTA LA LÓGICA PARA BORRA DE FIREBASE EL PROYECTO E INTRODUCIR EL NUEVO
                                //AQUI SE SOBREESCRIBEN LOS DATOS CON LO QUE SEA AL CREAR EL NUEVO

                                const newProject = new Project(projectDetails)
                                onUpdatedProject && onUpdatedProject(newProject)
                                setShowMessagePopUp(false)
                                onCloseNewProjectForm()

                            },
                            "Skip": () => {
                                console.log("Skip button clicked!")
                                setShowMessagePopUp(false)
                            },
                            "Rename": () => {
                                console.log("Rename button clicked!");
                                setProjectDetailsToRename(projectDetails)

                                //SE CREA UN ARCHIVO NUEVO PERO CAMBIAMOS EL NOMBRE ANTES DE AÑADIRLO 
                                initiateRename(projectDetails.name)
                                setRenameConfirmationPending(true)


                                setShowMessagePopUp(false)

                            },

                        },
                        onClose: () => setShowMessagePopUp(false)
                    })
                    setShowMessagePopUp(true)
                    console.log("showMessagePopUp state:", showMessagePopUp);  // Log state *after* setting it.  Will still be false!
                    console.log("messagePopUpContent state:", messagePopUpContent); // Log content after setting it.
                    e.preventDefault()
                    return

                } else {
                    // No duplicate, create the project
                    const newProject = new Project(projectDetails)
                    console.log(newProject)

                    createDocument("/projects", newProject)
                    console.log("data transfered to DB")

                    //projectsManager.onProjectCreated(newProject)
                    console.log("project created")
                    onUpdatedProject && onUpdatedProject(newProject)
                    console.log("project adde to the list")
                    onCloseNewProjectForm(); // Close the form for new projects only after creation
                }

                //onCloseNewProjectForm(e)


            } else {
                //When the form is for UPDATE AN EXISTING PROJECT

                //HAY QUE COMPROBAR SI LOS DATOS QUE SE CAPTAN DEL FORMULARIO HAY QUE COGER LOS DATOS QUE NO ESTAN EN IProyect.
                const projectDetailsToUpdate = new Project({
                    ...projectDetails,
                    id: updateProject.id,
                    progress: updateProject.progress,
                    backgroundColorAcronym: Project.calculateBackgroundColorAcronym(updateProject.businessUnit),
                    todoList: updateProject.todoList,
                })
                const changesInProject = ProjectsManager.getChangedProjectDataForUpdate(updateProject, projectDetailsToUpdate)
                

                
                if (onUpdatedProject) {
                    onUpdatedProject(projectDetailsToUpdate)

                    updateDataProject(updateProject, projectDetailsToUpdate)
                }
            }

            onCloseNewProjectForm()
        } else {
            // Form is invalid, let the browser handle the error display
            projectForm.reportValidity();
        }
    }

    const onCloseNewProjectForm = () => {
        const projectForm = document.getElementById("new-project-form") as HTMLFormElement
        //preventDefault()
        if (projectForm) {
            projectForm.reset()
        }
        onClose() // Close the form after the accept button is clicked
    }



    // Effect to handle rename confirmation after rename is complete
    React.useEffect(() => {
        if (!isRenaming && renameConfirmationPending && projectDetailsToRename && newProjectName) {
            handleRenameConfirmation(newProjectName, projectDetailsToRename)
                .then(() => {
                    setRenameConfirmationPending(false);
                    setProjectDetailsToRename(null);
                    setNewProjectName(null); // Reset after use.
                    onCloseNewProjectForm() // Close the form.
                })
        }
    }, [isRenaming, renameConfirmationPending, projectDetailsToRename, newProjectName, handleRenameConfirmation, onCloseNewProjectForm]);




    return (
        <div className="dialog-container">
            <div className="custom-backdrop">
                <dialog id="new-project-modal" style={{ overflow: "visible" }} open> {/*HERE THE SECRET FOR SHOWINHG ON IT MESSAGESPOPUP*/}
                    <form onSubmit={(e) => { handleNewProjectFormSubmit(e) }} id="new-project-form" action="" name="new-project-form" method="post" >
                        <h2
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div id="modal-project-title">New Project</div>
                            <div id="titleModalNewProject" >
                                {updateProject ? <DeleteProjectBtn updateProject={updateProject} projectsManager={projectsManager} /> : null}
                            </div>

                        </h2>
                        <div className="input-list">
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">apartment</span>Name
                                </label>
                                <input
                                    data-form-value="name"
                                    name="name"
                                    type="text"
                                    size={30}
                                    placeholder="What´s the name of your project"
                                    required={true}
                                    minLength={5}
                                    title="Please enter at least 5 characters"
                                    autoComplete="off"
                                />
                                <details>
                                    <summary>Tip</summary>
                                    <p>Give it a short name</p>
                                </details>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">text_fields</span>Acronym
                                </label>
                                <input
                                    data-form-value="acronym"
                                    name="acronym"
                                    type="text"
                                    size={30}
                                    placeholder="Enter a brief acronym for the project"
                                    required={true}
                                    maxLength={5}
                                    data-uppercase="acronym"
                                    title="Please do not enter more than 5 characters"
                                    autoComplete=""
                                />
                                <details>
                                    <summary>Tip</summary>
                                    <p>No more than five characters</p>
                                </details>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">article</span>Decription
                                </label>
                                <textarea
                                    data-form-value="description"
                                    name="description"
                                    id=""
                                    cols={50}
                                    rows={5}
                                    placeholder="Give your project a nice description! So people is jealous about it"
                                    defaultValue={""}
                                />
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">engineering</span>Business Unit
                                </label>
                                <select data-form-value="businessUnit" name="businessUnit">
                                    <option value="Edification">Edification</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Bridge">Bridge</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round"></span>Rol
                                </label>
                                <select data-form-value="userRole" name="userRole">
                                    <option>Architect</option>
                                    <option>Engineer</option>
                                    <option>Developer</option>
                                </select>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">not_listed_location</span>
                                    Status
                                </label>
                                <select data-form-value="status" name="status">
                                    <option>Pending</option>
                                    <option>Active</option>
                                    <option>Finished</option>
                                </select>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">paid</span>Cost
                                </label>
                                <input
                                    data-form-value="cost"
                                    name="cost"
                                    type="number"
                                    size={30}
                                    placeholder="Enter the budget for the project"
                                    inputMode="numeric"
                                    title="Please enter only numbers"
                                    autoComplete="off"
                                />
                                <details>
                                    <summary>Tip</summary>
                                    <p>Only allow numbers</p>
                                </details>
                            </div>
                            <div className="form-field-container">
                                <label>
                                    <span className="material-icons-round">calendar_month</span>Finish
                                    Date
                                </label>
                                <input
                                    data-form-value="finishDate"
                                    name="finishDate"
                                    type="date"
                                    id="finisProjecthDate"
                                    placeholder="Enter a Finish date for the project"
                                />
                            </div>
                        </div>
                        <div id="buttonEndRight">
                            <button id="cancel-project-btn" type="button" className="buttonC" onClick={onCloseNewProjectForm}>
                                Cancel
                            </button>
                            <button id="accept-project-btn" type="submit" className="buttonB">
                                Accept
                            </button>
                        </div>
                    </form>
                </dialog>
            </div>
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
            {isRenaming && <RenameElementMessage elementTitle="Project" previousElementName={currentProjectName} onRename={(newName) => { setNewProjectName(newName); handleProjectRename(newName) }} onCancel={() => { cancelRename(); setRenameConfirmationPending(false); setProjectDetailsToRename(null) }} />}
        </div >

    )
}

