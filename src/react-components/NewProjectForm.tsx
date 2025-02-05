import React, { useState } from 'react';


import { MessagePopUp } from '../react-components';
import * as Firestore from 'firebase/firestore';
import { firebaseDB } from '../services/Firebase';
import { getCollection } from '../services/Firebase';

import { BusinessUnit, IProject, Project, ProjectStatus, UserRole } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { closeModal, toggleModal } from '../classes/UiManager';


//import { MessagePopUp } from '../classes/MessagePopUp';


interface NewProjectFormProps {
    onClose: () => void;
    projectsManager?: ProjectsManager;
    updateProject?: Project | null;
    onUpdatedProject?: (updatedProject: Project) => void
}

const projectsCollection = getCollection<IProject>("/projects")


export function NewProjectForm({ onClose, projectsManager, updateProject = null, onUpdatedProject }: NewProjectFormProps) {

    const [formData, setFormData] = React.useState<IProject | null>(null);
    const [MessagePopUpProject, setMessagePopUpProject] = React.useState<React.ReactNode | null>(null)
    const [showMessage, setShowMessage] = useState(false);



    const handleMessagePopUp = (options: {
        type: 'error' | 'warning' | 'info' | 'success' | 'update' | 'message' | 'clock' | 'arrowup';
        title: string;
        message: string | React.ReactNode;
        actions?: string[]; //The interrogation symbol make actions optional
        messageHeight?: string;
        callbacks?: Record<string, () => void>;  // Callbacks for actions
    }) => {
        console.log("Showing message popup with options:", options); // Debugging line
        try {
            setMessagePopUpProject( //Set the React element to the state
                <MessagePopUp
                    type={options.type}
                    title={options.title}
                    message={options.message}
                    actions={options.actions || []}
                    messageHeight={options.messageHeight}
                    onActionClick={(action) => {
                        console.log("Action clicked:", action); // Debugging line
                        options.callbacks?.[action]?.(); //Call the appropriate callback
                        setShowMessage(false); //Close the message after action
                    }}


                    onClose={() => {
                        console.log("Popup closed"); // Debugging line
                        setShowMessage(false); //Close the message popup
                    }}  //Close the dialog if no actions or just closed}

                />
            );
            setShowMessage(true); // Show the message popup

            console.log("After change the state"); // Debugging line
        } catch (err) {
            console.error("Error showing message popup:", err); // Log any errors
        }
    }






    React.useEffect(() => {
        if (updateProject) {
            setFormData(updateProject)

            /* *** AMEND THE FORM INPUTS FOR UPDATE DETAILS ON AN EXISTING PROJECT *** */
            console.dir("updatedProject", updateProject)
            // *** Set Edit Mode ***
            // Update Modal Title                    
            const modalProjectTitle = document.getElementById("modal-project-title");
            if (modalProjectTitle) {
                modalProjectTitle.textContent = "Update Project";
            }

            // Update Buttons Text
            const submitButton = document.getElementById("accept-project-btn");
            if (submitButton) {
                submitButton.textContent = "Save Changes";
            }
            const discardButton = document.getElementById("cancel-project-btn");
            if (discardButton) {
                discardButton.textContent = "Discard Changes";
            }
            //Create delete-project button                    

            // CHeck if the button already exist
            const existingDeleteButton = document.getElementById("delete-project-btn");
            if (!existingDeleteButton) {

                //Create delete-project button

                const parentDeleteBtn = document.getElementById("titleModalNewProject")

                const deleteProjectButton = document.createElement("button");
                deleteProjectButton.className = "message-btn";
                deleteProjectButton.type = "button";
                deleteProjectButton.setAttribute("id", "delete-project-btn");
                deleteProjectButton.className = "todo-icon-edit";
                deleteProjectButton.style.borderRadius = "var(--br-circle)"
                deleteProjectButton.style.aspectRatio = "1"
                deleteProjectButton.style.padding = "0px"
                deleteProjectButton.style.justifyContent = "center"

                const svgTrash = document.createElement("svg");
                const deleteButtonIconSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                deleteButtonIconSVG.setAttribute("class", "todo-icon-edit");
                deleteButtonIconSVG.setAttribute("role", "img");
                deleteButtonIconSVG.setAttribute("aria-label", "trash");
                deleteButtonIconSVG.setAttribute("width", "30px");
                deleteButtonIconSVG.setAttribute("height", "30px");
                deleteButtonIconSVG.setAttribute("fill", "#08090a");
                deleteButtonIconSVG.setAttribute("id", "delete-project-btn-svg");
                deleteProjectButton.appendChild(deleteButtonIconSVG);

                const deleteButtonIconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                deleteButtonIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#trash");
                deleteButtonIconUse.setAttributeNS("http://www.w3.org/2000/svg", "xlink:href", "#trash");
                deleteButtonIconSVG.appendChild(deleteButtonIconUse);

                parentDeleteBtn?.appendChild(deleteProjectButton)
            }

            // Populate the form fields with project data
            ProjectsManager.populateProjectDetailsForm(updateProject)
            // Populate the form fields with projectToEdit data
            // ... your existing form population logic ...
            console.log("Form populated", document.getElementById("new-project-form"));

        } else {
            setFormData(null)

            // *** RESET THE FORM ***
            // 1. Target specific input types
            const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
            const inputsToReset = projectForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');

            // 2. Loop through and reset each element
            inputsToReset.forEach(element => {
                (element as HTMLInputElement).value = ''; // Reset to empty string

                // Additional handling for select elements:
                if (element instanceof HTMLSelectElement) {
                    element.selectedIndex = 0; // Reset to the first option
                }
            });


            // Set Modal in case previously we updated a project
            // Update Modal Title
            const modalProjectTitle = document.getElementById("modal-project-title");
            if (modalProjectTitle) {
                modalProjectTitle.textContent = "New Project";
            }
            // Update Buttons Text 
            const submitButton = document.getElementById("accept-project-btn");
            if (submitButton) {
                submitButton.textContent = "Accept"
            }
            const discardButton = document.getElementById("cancel-project-btn");
            if (discardButton) {
                discardButton.textContent = "Cancel";
            }
            //Remove the delete project button from the modal in case previously we updated a project
            const parentDeleteBtn = document.getElementById("titleModalNewProject")
            if (parentDeleteBtn) {
                const deleteButton = document.getElementById("delete-project-btn")
                if (deleteButton) {
                    parentDeleteBtn.removeChild(deleteButton)
                }
            }
        }
    }, [])




    const handleClose = () => {
        onClose();
    };






    const handleNewProjectFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const projectForm = document.getElementById("new-project-form")

        if (!(projectForm && projectForm instanceof HTMLFormElement)) { return }

        const formDataProject = new FormData(projectForm)
        //const checkProjectID = updateProject.id

        if (projectForm.checkValidity()) {

            // Form is valid, proceed with data processing
            if (updateProject === null) {
                //When the form is for a new Project

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
                // Now you can safely use finishProjectDate as a Date object


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
                };

                try {
                    Firestore.addDoc(projectsCollection, projectDetails)
                    const project = projectsManager?.newProject(projectDetails);
                    //if (project !== undefined && onUpdatedProject) {
                    //    onUpdatedProject(project)
                    //}

                    onCloseNewProjectForm(e)

                } catch (err) {
                    const errorPopUp = document.querySelector(".message-popup")
                    const contentError = {
                        contentDescription: err.message,
                        contentTitle: "Error",
                        contentClass: "popup-error",
                        contentIcon: "report"
                    }
                    if (errorPopUp) {
                        const text = errorPopUp.querySelector("#message-popup-text p")
                        const title = errorPopUp.querySelector("#message-popup-text h5")
                        const icon = errorPopUp.querySelector("#message-popup-icon span")

                        if (text) text.textContent = contentError.contentDescription
                        if (title) title.textContent = contentError.contentTitle
                        if (icon) icon.textContent = contentError.contentIcon

                        errorPopUp?.classList.add(contentError.contentClass)
                        toggleModal("message-popup")
                    }
                    const closePopUp: Element | null = document.querySelector(".btn-popup")
                    if (closePopUp) {
                        const closePopUpHandler = () => {
                            toggleModal("message-popup");
                            closePopUp.removeEventListener("click", closePopUpHandler);
                        }
                        closePopUp.addEventListener("click", closePopUpHandler);
                    }
                }

            } else {
                //When the form is for update an existing Project

                console.log("Button submit clicked in the edit project mode");
                e.preventDefault()

                //const formDataToUpdate = new FormData(projectForm)

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

                const projectDetailsToUpdate = new Project({
                    name: formDataProject.get("name") as string,
                    acronym: formDataProject.get("acronym") as string,
                    businessUnit: BusinessUnit[formDataProject.get("businessUnit") as keyof typeof BusinessUnit],
                    description: formDataProject.get("description") as string,
                    status: formDataProject.get("status") as ProjectStatus,
                    userRole: formDataProject.get("userRole") as UserRole,
                    finishDate: finishProjectDate as Date,
                    cost: formDataProject.get("cost") ? parseFloat(formDataProject.get("cost") as string) : 0,
                    todoList: updateProject.todoList,
                })
                projectDetailsToUpdate.id = updateProject.id as string

                projectDetailsToUpdate.progress = updateProject.progress as number
                projectDetailsToUpdate.backgroundColorAcronym = Project.calculateBackgroundColorAcronym(updateProject.businessUnit)

                console.log("proyect detail to update", projectDetailsToUpdate)
                console.log("proyect to be updated", updateProject)
                /* ASK FOR CONFIRMATION OF THE CHANGES */


                const changesInProject = getChangedProjectDataForUpdate(updateProject, projectDetailsToUpdate);
                if (Object.keys(changesInProject).length > 0) {
                    const messageContent = createMessageContent(changesInProject);

                    // Calculate the number of rows in the messageContent table
                    const messageRowsCount = Object.keys(changesInProject).length
                    // Calculate the desired message height
                    const messageHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`; // 3.5rem per row + 5rem for the title

                    handleMessagePopUp({
                        type: "info",
                        title: "Confirm Project Update",
                        message: messageContent,
                        messageHeight: messageHeight,
                        actions: ["Confirm update", "Cancel"],
                        callbacks: {
                            "Confirm update": () => {
                                if (projectDetailsToUpdate !== undefined && onUpdatedProject) {
                                    onUpdatedProject(projectDetailsToUpdate);
                                }
                                handleClose();
                                setMessagePopUpProject(null)
                            },
                            "Cancel": () => {
                                console.log("User  cancelled the update.");
                                setMessagePopUpProject(null)
                            },
                        },
                    });
                    setShowMessage(true);
                    //onCloseNewProjectForm(e)
                } else {

                    handleMessagePopUp({
                        type: "info",
                        title: "No Changes Detected",
                        message: "No changes were detected in the project details.",
                        actions: ["Got it"],
                        callbacks: {
                            "Got it": () => {
                                console.log("No changes to update in the project.");
                                setMessagePopUpProject(null);
                            }
                        }

                    });
                    setShowMessage(true);
                }


                // if (projectDetailsToUpdate !== undefined && onUpdatedProject) {
                //     onUpdatedProject(projectDetailsToUpdate)
                // }

            }

        } else {

            // Form is invalid, let the browser handle the error display
            projectForm.reportValidity()
        }
        // }   

        //onCloseNewProjectForm(e);
    }



    const onCloseNewProjectForm = (e: React.FormEvent) => {
        const projectForm = document.getElementById("new-project-form") as HTMLFormElement
        e.preventDefault()
        projectForm.reset()
        // Delete the data-projectId attribute with the unique ID of the proyect in the button of "Save Changes"
        //const projectDatasetAttributeIdInForm = document.getElementById("accept-project-btn")
        //if (projectDatasetAttributeIdInForm) {
        //    projectDatasetAttributeIdInForm.dataset.projectId = ""
        //}
        //toggleModal("new-project-modal");
        onClose() // Close the form after the accept button is clicked
    }




    const createMessageContent = (changes: Record<string, [any, any]>) => {
        return (
            <React.Fragment>  {/* Use a Fragment to return multiple elements */}
                The following project details will be updated:<br /><br />
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '1px solid #ccc' }}>Property</th>
                            <th style={{ borderBottom: '1px solid #ccc' }}>Changes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(changes).map(([key, [oldValue, newValue]]) => (
                            <tr key={key}>
                                <td style={{ borderBottom: '1px solid #ccc' }}><b>{key}</b></td>
                                <td style={{ borderBottom: '1px solid #ccc' }}>
                                    From: <i>{oldValue}</i><br />
                                    To: <i style={{ color: 'var(--popup-warning)' }}>{newValue}</i>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </React.Fragment>
        );
    }





    const getChangedProjectDataForUpdate = (existingProject: Project | null, updatedProject: Project): Record<string, [any, any]> => {
        const changedData: { [key: string]: [string, string] } = {};

        if (!existingProject) return changedData;

        for (const key in existingProject) {
            // Excluir la propiedad 'backgroundColorAcronym' de la comparación
            if (key === "backgroundColorAcronym") {
                continue;
            }

            const currentProjectValue = existingProject[key];
            const valueToUpdate = updatedProject[key];

            console.log(`Comparing ${key}:`, currentProjectValue, valueToUpdate); // Línea de depuración

            // Comparar y almacenar la diferencia (manejando las fechas adecuadamente)
            if (key === "finishDate" && currentProjectValue instanceof Date && valueToUpdate instanceof Date) {
                if (currentProjectValue.getTime() !== valueToUpdate.getTime()) {
                    changedData[key] = [currentProjectValue.toLocaleDateString(), valueToUpdate.toLocaleDateString()];
                }
            } else if (currentProjectValue !== valueToUpdate) {
                changedData[key] = [String(currentProjectValue), String(valueToUpdate)];
            }
        }

        console.log("Changed Data:", changedData); // Línea de depuración
        return changedData;
    };



    React.useEffect(() => {
        console.log("Estado de showMessagePopUp actualizado:", showMessage);
    }, [showMessage]);


    return (
        <div className="dialog-container">
            <div className="custom-backdrop">
                <dialog id="new-project-modal" open>
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
                            <div id="titleModalNewProject" />
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
            {showMessage && MessagePopUpProject}
        </div >

    )
}

export default NewProjectForm;