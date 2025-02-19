import React, { useState } from 'react';
import * as Router from 'react-router-dom';
import { createDocument, updateDocument, deleteDocument } from '../services/Firebase';

import { DeleteProjectBtn, RenameElementMessage, DiffContentProjectsMessage, MessagePopUp, MessagePopUpProps } from '../react-components';
import { usePrepareProjectForm } from '../hooks';

import { BusinessUnit, IProject, Project, ProjectStatus, UserRole } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { log } from 'three/examples/jsm/nodes/Nodes.js';

interface NewProjectFormProps {
    onClose: () => void;
    projectsManager: ProjectsManager;
    updateProject?: Project | null;
    onCreatedProject?: (createdProject: Project) => void;
    onUpdatedProject?: (updatedProject: Project) => void;

}

export function NewProjectForm({ onClose, projectsManager, updateProject = null, onCreatedProject, onUpdatedProject }: NewProjectFormProps) {

    const navigateTo = Router.useNavigate()
    const [showMessagePopUp, setShowMessagePopUp] = useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = useState<MessagePopUpProps | null>(null)

    const [newProjectName, setNewProjectName] = useState<string | null>(null);
    const [projectNameToConfirm, setProjectNameToConfirm] = useState<string | null>(null);
    const [projectDetailsToRename, setProjectDetailsToRename] = useState<IProject | null>(null);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [currentProjectName, setCurrentProjectName] = React.useState('');

    // const { isRenaming, initiateRename, currentProjectName, handleProjectRename, cancelRename, setOnRename } = useRenameProject(projectsManager)
    //const updateDataProject = useUpdateExistingProject({ projectsManager, onUpdateExistingProject: onCreatedProject || (() => { }) });
    usePrepareProjectForm(updateProject, projectsManager)


    const onCloseNewProjectForm = () => {
        const projectForm = document.getElementById("new-project-form") as HTMLFormElement
        if (projectForm) {
            projectForm.reset()
        }
        onClose() // Close the form after the accept button is clicked
    }

    const handleRenameConfirmation = React.useCallback(async (renamedProjectName: string, projectDetailsToRename: IProject) => {
        //setNewProjectName(renamedProjectName);
        const projectToCreate = { ...projectDetailsToRename, name: renamedProjectName }
        const newProject = new Project(projectToCreate);
        console.log("project created with the new name", newProject)

        try {

            const docRef = await createDocument("/projects", newProject)
            newProject.id = docRef.id
            console.log("data transfered to DB")

            projectsManager.newProject(new Project(newProject, newProject.id))
            console.log("project added to the list", projectsManager.list)

            onCreatedProject && onCreatedProject(newProject)
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
    }, [onCreatedProject])


    
    async function handleUpdateDataProjectInDB (projectDetailsToUpdate: Project, simplifiedChanges: Record<string, any>) {
        
        if (!projectDetailsToUpdate.id) return
        await updateDocument<Partial<Project>>("/projects", projectDetailsToUpdate.id, simplifiedChanges)
        console.log("data transfered to DB")

        console.log("projectDetailsToUpdate.id", projectDetailsToUpdate.id)
        console.log("projectDetailsToUpdate", projectDetailsToUpdate)
        console.log("Projects in manager:", projectsManager.list.map(p => p.id))
        //const updatedProject = projectsManager.updateProject(projectDetailsToUpdate.id, projectDetailsToUpdate)
       
        
            onUpdatedProject && onUpdatedProject(projectDetailsToUpdate)

        
        projectsManager.onProjectUpdated(projectDetailsToUpdate.id)   
    }


    async function handleCreateProjectInDB(projectDetails: IProject) {

        const newProject = new Project(projectDetails)
        console.log(newProject)
        try {

            const newProjectDoc = await createDocument("/projects", newProject)
            newProject.id = newProjectDoc.id
            console.log("data transfered to DB", newProject)

            projectsManager.newProject(newProject, newProject.id)
            

            onCreatedProject && onCreatedProject({ ...newProject, id: newProjectDoc.id })

            console.log("project added to the list", projectsManager.list)
        } catch (error) {
            console.error("Error creating project in DB:", error);
            
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
            setShowMessagePopUp(true);
        }

    }



    async function handleNewProjectFormSubmit(e: React.FormEvent) {
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
                        message: (
                            <React.Fragment>
                                    <b>
                                        <u>Overwrite:</u>
                                    </b>{" "}
                                    Replace the existing project with the new data.
                                    <br />
                                    <b>
                                        <u>Skip:</u>
                                    </b>{" "}
                                    Do not create a new project.
                                    <br />
                                    <b>
                                        <u>Rename:</u>
                                    </b>{" "}
                                    Enter a new name for the new project.
                                
                            </React.Fragment>),
                        actions: ["Overwrite", "Skip", "Rename"],
                        onActionClick: {
                            "Overwrite": async () => {
                                console.log("Overwrite button clicked!");

                                //Logic inside newProject already delete if is found a project with the same name
                                //so, we overwrite the project usin create newProject
                                const originalDataProject = projectsManager.getProjectByName(projectDetails.name)
                                console.log("originalDataProject", originalDataProject);

                                if (!originalDataProject) return
                                const newProject = new Project({
                                    ...projectDetails,
                                    id: originalDataProject.id,
                                })
                                console.log(newProject);

                                await deleteDocument("/projects", originalDataProject.name)
                                await createDocument("/projects", newProject)


                                // await updateDocument<Project>("/projects", originalDataProject.id, newProject)
                                console.log("data transfered to DB created")

                                onUpdatedProject && onUpdatedProject(newProject)
                                //Because newProject manage the overwrite as well
                                projectsManager.newProject(newProject)

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

                                setCurrentProjectName(projectDetails.name);
                                setIsRenaming(true)


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
                    try {
                        handleCreateProjectInDB(projectDetails)
                    } catch (error) {
                        console.error("Error creating project in DB:", error)
                        throw error
                    }
                    
                    onCloseNewProjectForm(); // Close the form for new projects only after creation
                }


            } else {
                //When the form is for UPDATE AN EXISTING PROJECT

                //HAY QUE COMPROBAR SI LOS DATOS QUE SE CAPTAN DEL FORMULARIO HAY QUE COGER LOS DATOS QUE NO ESTAN EN IProyect.
                const projectDetailsToUpdate = new Project({
                    ...projectDetails,
                    id: updateProject.id,
                    progress: updateProject.progress,
                    // backgroundColorAcronym: Project.calculateBackgroundColorAcronym(updateProject.businessUnit),
                    todoList: updateProject.todoList,
                })


                const changesInProject = ProjectsManager.getChangedProjectDataForUpdate(updateProject, projectDetailsToUpdate)
                const simplifiedChanges: Record<string, any> = {}
                for (const key in changesInProject) {
                    if (changesInProject.hasOwnProperty(key)) { //Variant of the for...in loop that avoids iterating over inherited properties.
                        simplifiedChanges[key] = changesInProject[key][1]; // Onlytakes the second value
                    }
                }
                console.log("simplifiedChanges for DB", simplifiedChanges)

                if (Object.keys(simplifiedChanges).length > 0) {
                    const messageContent = <DiffContentProjectsMessage changes={changesInProject} />
                    // Calculate the number of rows in the messageContent table
                    const messageRowsCount = Object.keys(simplifiedChanges).length
                    // Calculate the desired message height
                    const messageHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`; // 3.5rem per row + 5rem for the title
        
                    setMessagePopUpContent({
                        type: "info",
                        title: "Confirm Project Update",
                        message: messageContent,
                        messageHeight: messageHeight,
                        actions: ["Confirm update", "Cancel update"],
                        onActionClick: {
                            "Confirm update": async () =>  {
                                try {
                                    await handleUpdateDataProjectInDB(projectDetailsToUpdate, simplifiedChanges)
                                    navigateTo("/")
                                    
                                    setShowMessagePopUp(false)
        
                                } catch (error) {
                                    console.error("Error updating project in callback throw App till index.ts", error)
                                    throw error                                    
                                }  
                            },
                            "Cancel update": () => {
                                console.log("User  cancelled the update.")
                                setShowMessagePopUp(false)
                            }
                        },
                        onClose: () => setShowMessagePopUp(false)
                    })
                    setShowMessagePopUp(true)
                    e.preventDefault()
                    return
        
                } else {
                    setMessagePopUpContent({
                        type: "info",
                        title: "No Changes Detected",
                        message: "No changes were detected in the project details.",
                        actions: ["Got it"],
                        onActionClick: {
                            "Got it": () => {
                                console.log("No changes to update in the project.");
                                setShowMessagePopUp(false)
                            }
                        },
                        onClose: () => setShowMessagePopUp(false)
                    })
                    setShowMessagePopUp(true)
                    e.preventDefault()
                    return
                }




                // try {
                //     await handleUpdateDataProjectInDB(projectDetailsToUpdate, simplifiedChanges)
                //     navigateTo("/")
                    

                // } catch (error) {
                //     console.error("Error updating project in callback throw App till index.ts", error);
                //     throw error
                // }
            }
            onCloseNewProjectForm()
        } else {
            // Form is invalid, let the browser handle the error display
            projectForm.reportValidity();
        }
    }


    React.useEffect(() => {
        if (projectDetailsToRename && projectNameToConfirm) { 
            handleRenameConfirmation(projectNameToConfirm, projectDetailsToRename)
                .then(() => {
                    setProjectDetailsToRename(null)
                    setProjectNameToConfirm(null) // Reset after use
                    onCloseNewProjectForm() // Close the form
                });
        }
    }, [projectDetailsToRename, projectNameToConfirm, handleRenameConfirmation, onCloseNewProjectForm]);


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
            {isRenaming && <RenameElementMessage
                projectsManager={projectsManager}
                elementTitle="Project"
                previousElementName={currentProjectName}
                onRename={(newName) => {
                    setProjectNameToConfirm(newName)
                    setIsRenaming(false)
                }}
                onCancel={() => {
                    //setRenameConfirmationPending(false);
                    setIsRenaming(false)
                    setProjectDetailsToRename(null)

                    setNewProjectName(null)
                    setProjectNameToConfirm(null)
                }} />}
        </div >

    )
}

