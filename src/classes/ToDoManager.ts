import { IToDoIssue, ToDoIssue } from "./ToDoIssue"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"

import { DragAndDrop } from '@formkit/drag-and-drop';
import { MessagePopUp } from "./MessagePopUp"
import { v4 as uuidv4 } from 'uuid'



export function newToDoIssue(projectId: string, toDoList: IToDoIssue[], data: IToDoIssue): ToDoIssue | undefined {
    const toDoTitles = toDoList.map((toDoIssue) => {
        return toDoIssue.title
    })
    if (toDoTitles.includes(data.title)) {
        console.log(`A issue with the name [ ${data.title} ] already exists`);
        //Create a Confirmation Modal to prompt the user about the duplication and offer options
        return new Promise<ToDoIssue | undefined>((resolve) => {// Return a Promise
            const popupDuplicateToDoIssue = new MessagePopUp(
                document.body,
                "warning",
                `A issue with the name "${data.title}" already exist`,

                `<b><u>Overwrite:</b></u> Replace the existing issue with the imported data.<br>
                <b><u>Skip:</b></u> Do nothing with the new Issue.<br>
                <b><u>Rename:</b></u> Create de Issue with a new name.`,
                ["Overwrite", "Skip", "Rename"],
            )

            // Define ALL your button callbacks for the messagePopUp created
            const buttonCallbacks = {
                "Overwrite": () => {
                    console.log("Overwrite button clicked!");
                    popupDuplicateToDoIssue.closeMessageModal();

                    // Find and remove the existing project from the ui & list since you are going to use it later
                    const existingProjectIndex = toDoList.findIndex(project => data.title === data.title);
                    if (existingProjectIndex !== -1) {

                        // 1. Remove the existing issue's UI from the display
                        toDoList.ui.removeChild(toDoList[existingProjectIndex].ui);
                        console.log("Old issue removed fromthe UI");

                        // 2. Remove the existing project from the list
                        toDoList = toDoList.filter((toDoIssue) => toDoIssue.title !== data.title);
                        console.log("Removed the oLd Issue name from the List of names");


                        // 3. Create a new issue with the imported data
                        const newToDoIssue = new ToDoIssue(data);
                        newToDoIssue.ui.addEventListener("click", () => {

                            //EVENTO QUE SICEDE CUANDO SE HACE CLICK SOBRE UNA DE LAS ETIQUETAS DE TODO
                            //LA IDEA ES QUE SALGA UNA TARGETA DE LA IZQUIERDA TAPANDO EL ASIDE Y EL PROYECTO SUSTITUYENDOLOS POR LOS DATOS. DEJANDO A LA VISTA EL VISUALIZADOR DE IFC 

                            showPageContent("todo-details", "flex")
                            this.setDetailsIssuePage(newToDoIssue)
                            console.log(" details pages set in the new window");
                        })
                        // 4. Add the new project to the list and UI
                        this.list.push(newToDoIssue);
                        console.log("Added new project to the List of names")
                        this.ui.append(newToDoIssue.ui)
                        console.log("Added new project to the UI")

                        // 5. Resolve with the newly created project
                        resolve(newToDoIssue);

                    } else {
                        // Handle the case where the project is not found (shouldn't happen, just in case
                        console.error("Project to overwrite not found in the list.")
                        resolve(undefined); // Or resolve with an appropriate error value
                    }
                },
                "Skip": () => {
                    console.log("Skip button clicked!")
                    popupDuplicateToDoIssue.closeMessageModal()
                    resolve(undefined); // Resolve with undefined to indicate skipping
                },
                "Rename": () => {
                    console.log("Rename button clicked!")
                    // **Get the issue name BEFORE creating the dialog**
                    const toDoIssueToRename = toDoList.find((toDoIssue) => toDoIssue.title === data.title);
                    const existingToDoIssueName = toDoIssueToRename ? toDoIssueToRename.title : "ToDOIssue Title";

                    // 1. Create the rename dialog
                    const renameDialog = document.createElement("dialog");
                    // renameDialog.id = id;
                    renameDialog.className = "popup-default";
                    document.body.insertBefore(renameDialog, document.body.lastElementChild);

                    const box = document.createElement("div");
                    box.className = "message-content toast toast-popup-default";
                    renameDialog.appendChild(box);

                    const renameIcon = document.createElement("div");
                    renameIcon.className = "message-icon";
                    box.appendChild(renameIcon);

                    const renameIconSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    renameIconSVG.setAttribute("class", "message-icon-svgDark");
                    renameIconSVG.setAttribute("role", "img");
                    renameIconSVG.setAttribute("aria-label", "rename");
                    renameIconSVG.setAttribute("width", "24px");
                    renameIconSVG.setAttribute("height", "24px");
                    renameIconSVG.setAttribute("fill", "#08090a");
                    renameIcon.appendChild(renameIconSVG);

                    const renameIconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                    renameIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#rename");
                    renameIconUse.setAttributeNS("http://www.w3.org/2000/svg", "xlink:href", "#rename");
                    renameIconSVG.appendChild(renameIconUse);


                    const content = document.createElement("div");
                    content.className = "toast-column";
                    box.appendChild(content);


                    const text = document.createElement("div");
                    text.className = "message-text";
                    content.appendChild(text);

                    const renameTitle = document.createElement("h5");
                    renameTitle.className = "message-text-title";
                    renameTitle.textContent = "Project name";
                    text.appendChild(renameTitle);


                    const renameSubtitle = document.createElement("p");
                    renameSubtitle.className = "message-text-message";
                    renameSubtitle.textContent = "Select the text field and populate it with a new name";
                    text.appendChild(renameSubtitle);

                    const boxInput = document.createElement("div");
                    boxInput.className = "message-text";
                    content.appendChild(boxInput);


                    const renameInputName = document.createElement("input");
                    renameInputName.className = "toast-input-text";
                    renameInputName.type = "text";
                    renameInputName.setAttribute("id", "newToDoIssueName");
                    renameInputName.setAttribute("placeholder", existingToDoIssueName);
                    renameInputName.setAttribute("autofocus", "");
                    renameInputName.setAttribute("required", "");
                    renameInputName.setAttribute("minlength", "5");
                    renameInputName.setAttribute("autocomplete", "off");
                    boxInput.appendChild(renameInputName);


                    const renameInputLabel = document.createElement("label");
                    renameInputLabel.className = "toast-input-text";
                    renameInputLabel.textContent = existingToDoIssueName
                    renameInputLabel.setAttribute("autofocus", "false");
                    boxInput.appendChild(renameInputLabel);


                    const renameBtns = document.createElement("div");
                    renameBtns.className = "message-btns";
                    box.appendChild(renameBtns);

                    const rBtnA = document.createElement("button");
                    rBtnA.className = "message-btn";
                    rBtnA.type = "button";
                    rBtnA.setAttribute("id", "confirmRename");
                    renameBtns.appendChild(rBtnA)

                    const rBtnText = document.createElement("span");
                    rBtnText.className = "message-btn-text";
                    rBtnText.textContent = "Do it";
                    rBtnA.appendChild(rBtnText);

                    const rBtnC = document.createElement("button");
                    rBtnC.className = "message-btn";
                    rBtnC.type = "button";
                    rBtnC.setAttribute("id", "cancelRename");
                    renameBtns.appendChild(rBtnC)

                    const btnTextC = document.createElement("span");
                    btnTextC.className = "message-btn-text";
                    btnTextC.textContent = "Cancel";
                    rBtnC.appendChild(btnTextC);



                    // 2. Append the dialog to the body and show it
                    document.body.appendChild(renameDialog)
                    renameDialog.showModal()

                    // 3. Handle Confirm and Cancel buttons
                    const confirmRenameBtn = renameDialog.querySelector('#confirmRename')
                    const cancelRenameBtn = renameDialog.querySelector('#cancelRename')
                    const newToDoIssueTitleInput = renameDialog.querySelector('#newToDoIssueName') as HTMLInputElement;

                    if (confirmRenameBtn && cancelRenameBtn && newToDoIssueTitleInput) {
                        confirmRenameBtn.addEventListener('click', () => {
                            const newTitle = newToDoIssueTitleInput.value.trim()

                            // Basic validation: Check if the title is empty
                            if (newTitle === "") {
                                const popupEnterNewTitle = new MessagePopUp(
                                    document.body,
                                    "error",
                                    `A project with a empty name is not allow`,

                                    "Please enter a valid project name.",
                                    ["Got it"],
                                )
                                // Define ALL your button callbacks for the messagePopUp created
                                const buttonCallbacks = {
                                    "Got it": () => {
                                        console.log("Got it button clicked!")
                                        popupEnterNewTitle.closeMessageModal()
                                    },
                                }
                                popupEnterNewTitle.showNotificationMessage(buttonCallbacks);

                                return;
                            }

                            // Validation: Check if the minimun length is 5 characters
                            if (newTitle.length < 5) {
                                const popupEnter5CharactersName = new MessagePopUp(
                                    document.body,
                                    "error",
                                    "Invalid Project Name",
                                    "Please enter a project name that is at least 5 characters long.",
                                    ["Got it"],
                                )
                                // Define ALL your button callbacks for the messagePopUp created
                                const buttonCallbacks = {
                                    "Got it": () => {
                                        console.log("Got it button clicked!")
                                        popupEnter5CharactersName.closeMessageModal()
                                    },
                                }
                                popupEnter5CharactersName.showNotificationMessage(buttonCallbacks);

                                return;
                            }

                            // Update the issue name
                            data.title = newTitle;

                            // Create the new project and resolve the Promise
                            const newToDoIssue = new ToDoIssue(data);

                            // ATTACH THE EVENT LISTENER HERE
                            newToDoIssue.ui.addEventListener("click", () => {
                                showPageContent("todo-details", "flex")
                                this.setDetailsIssuePage(newToDoIssue)
                                console.log("Details page set in a new window");
                            });

                            toDoList.push(newToDoIssue)
                            toDoList.forEach((toDoIssue) => {
                                (toDoIssue as any).ui.appendChild(newToDoIssue.ui)
                            })                            
                            resolve(newToDoIssue)

                            // Close the dialog
                            renameDialog.close()
                        });

                        cancelRenameBtn.addEventListener('click', () => {
                            renameDialog.close()
                            resolve(undefined); // Resolve as undefined to indicate renaming was cancelled
                        });
                    }
                    popupDuplicateToDoIssue.closeMessageModal()
                }
            }
            popupDuplicateToDoIssue.showNotificationMessage(buttonCallbacks);
        })
    } else {
        // No duplicate, create the issue
        const toDoIssue = new ToDoIssue(data)
        toDoIssue.ui.addEventListener("click", () => {
            showPageContent("todo-details", "flex")//this should show the banner with the data of only one ISSUE not de board
            setDetailsIssuePage(toDoIssue) //for the new windows (todo-detalis)where the data of the todo issue is shown. From that place is where you can edit the content of the todoIssue
            console.log("Details pages set in a new window");

        })
        // toDoIssue.ui.append(toDoIssue.ui)
        setIssueInsideDetailsProjectPage(toDoIssue)
        toDoList.push(toDoIssue)
        return toDoIssue
    }
}

export function setIssueInsideDetailsProjectPage(toDoIssue: ToDoIssue) { 
    //Get the target element
    const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement

    // Append the new div to the todoListContainer
    projectListToDosUI.appendChild(toDoIssue.ui);

}


export function setDetailsIssuePage(toDoIssue: ToDoIssue) {
    // Set the details page for the issue  
    const detailPage = document.getElementById("todo-details")
    if (!detailPage) { return }

    for (const key in toDoIssue) {
        const dataElement = detailPage.querySelectorAll(`[data-todo-info="${key}"]`)
        if (dataElement) {
            if (key === "dueDate") {
                const formattedDate = toDoIssue.dueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                dataElement.forEach(element => {
                    element.textContent = formattedDate
                })
            } else if (key === "createdDate") {
                const formattedDate = toDoIssue.createdDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                dataElement.forEach(element => {
                    element.textContent = formattedDate
                })
            } else {
                dataElement.forEach((element) => {
                    element.textContent = toDoIssue[key]
                })
            }
        }
    }
    // Update the background color of the todo-card in the todo-details-page
    const columnElement = detailPage.querySelector('[data-todo-info="statusColumn"]') as HTMLElement
    if (columnElement) {
        columnElement.style.backgroundColor = toDoIssue.backgroundColorColumn;
    }

    // Set the data-projectId attribute with the unique ID of the proyect 
    const projectDatasetAttributeId = document.getElementById("edit-todo-details")
    if (projectDatasetAttributeId) {
        projectDatasetAttributeId.dataset.projectId = toDoIssue.id.toString()
    }
}


export function renderToDoIsuueListInsideProject(toDoIssue: IToDoIssue) {
        
    if (toDoIssue.ui && toDoIssue.ui instanceof HTMLElement) {
        return
    }
    toDoIssue.ui = document.createElement("div")
    toDoIssue.ui.className = "todo-item"
    toDoIssue.ui.dataset.projectId = toDoIssue.todoProject
    toDoIssue.ui.dataset.todoId = toDoIssue.id   
    const dueDateFormatted = toDoIssue.dueDate ? new Date(toDoIssue.dueDate): new Date()

    toDoIssue.ui.innerHTML = `
        <div class="todo-color-column" style="background-color: ${toDoIssue.backgroundColorColumn}"></div>

        <div  class="todo-card" style="display: flex; flex-direction: column; border: 5px solid border-left-color: ${toDoIssue.backgroundColorColumn}; ">
            <div class="todo-taks" >
                <div class="todo-tags-list">
                    ${toDoIssue.tags.map(tag => `<span class="todo-tags">${tag}</span>`).join('')}
                </div>
                <button class="todo-task-move">
                    <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                        <use href="#drag-indicator"></use>
                    </svg>

                </button>
            </div>
            <div class="todo-title">
                <h5 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;; margin-left: 15px">${toDoIssue.title}</h5>
            </div>
            <div class="todo-stats">
                <span style="text-wrap: nowrap; margin-left: 10px" class="todo-task-move">
                    <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                        <use href="#flag"></use>
                    </svg>
                    ${dueDateFormatted}
                </span>
                <span style="text-wrap: nowrap; margin-left: 10px" class="todo-task-move">
                    <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                        <use href="#chat-bubble"></use>
                    </svg>
                    ${toDoIssue.assignedUsers.length} assigned
                </span>
            </div>
        </div>
    `    
    } 




export function updateToDoIssue(toDoList: ToDoIssue[], toDoIssueId: string, dataToUpdate: ToDoIssue) { 
    const toDoIssueIndex = toDoList.findIndex(p => p.id === toDoIssueId)
    if (toDoIssueIndex !== -1) {
        //Preserve the original ID
        dataToUpdate.id = toDoList[toDoIssueIndex].id
        // Update the Project Data in the Array.
        toDoList[toDoIssueIndex] = {
            ...toDoList[toDoIssueIndex], // Keep existing properties
            ...dataToUpdate // Update with new values
        }
        setDetailsIssuePage(toDoList[toDoIssueIndex])
        return toDoList[toDoIssueIndex]
    } else {
        console.error("Issue not found in the list!")
        return false
    }
}

export function updateToDoIssueUi(toDoIssueToUpdateTheUi: ToDoIssue): HTMLDivElement {
    // Update the UI.
    // Ensure toDoIssueToUpdate.ui is defined
    if (toDoIssueToUpdateTheUi.ui) {
        // Create a new UI element with updated content
        const newUiElement = document.createElement('div')
        newUiElement.className = "todo-item"
        newUiElement.dataset.projectId = toDoIssueToUpdateTheUi.id
        newUiElement.innerHTML = `
            <div class="todo-color-column"></div>

            <div  class="todo-card" style="display: flex; flex-direction: column; border: 5px solid border-left-color: ${toDoIssueToUpdateTheUi.backgroundColorColumn}; ">
                <div class="todo-taks" >
                    <div class="todo-tags-list">
                        <span class="todo-tags">${toDoIssueToUpdateTheUi.tags}</span>
                        <span class="todo-tags">${toDoIssueToUpdateTheUi.tags}</span>
                        <span class="todo-tags">${toDoIssueToUpdateTheUi.tags}</span>
                        <span class="todo-tags">${toDoIssueToUpdateTheUi.tags}</span>
                        <span class="todo-tags">${toDoIssueToUpdateTheUi.tags}</span>
                        <span class="todo-tags">${toDoIssueToUpdateTheUi.tags}</span>
                    </div>
                    <button class="todo-task-move">
                        <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                            <use href="#drag-indicator"></use>
                        </svg>

                    </button>
                </div>
                <div class="todo-title">
                    <h5 style="overflow-wrap: break-word; margin-left: 15px">${toDoIssueToUpdateTheUi.title}</h5>
                </div>
                <div class="todo-stats">
                    <span style="text-wrap: nowrap; margin-left: 10px" class="todo-task-move">
                        <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                            <use href="#flag"></use>
                        </svg>
                        ${toDoIssueToUpdateTheUi.dueDate}
                    </span>
                    <span style="text-wrap: nowrap; margin-left: 10px" class="todo-task-move">
                        <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                            <use href="#chat-bubble"></use>
                        </svg>
                        ${toDoIssueToUpdateTheUi.assignedUsers}
                    </span>
                </div>
            </div>
        `
        // Return the updated UI element
        return newUiElement
    } else {
        throw new Error("Project UI element not found for update!")
    }
}

export function populateToDoIssueDetailsForm(toDoIssue: ToDoIssue) {
    // Get the form elements
    const toDoIssueDetailsForm = document.getElementById("todo-issue-form");
    if (!toDoIssueDetailsForm) { return }

    for (const key in toDoIssue) {
        const inputField = toDoIssueDetailsForm.querySelectorAll(`[data-form-value="${key}"]`)
        if (inputField.length > 0) {
            if (key === "dueDate") {
                // Format date for input type="date"
                const formattedDate = toDoIssue.dueDate.toISOString().split('T')[0]
                inputField[key].value = formattedDate
                console.log(`${toDoIssue[key]}`)
            } else if (key === "createdDate") {
                // Format date for input type="date"
                const formattedDate = toDoIssue.createdDate.toISOString().split('T')[0]
                inputField[key].value = formattedDate
                console.log(`${toDoIssue[key]}`)
            } else {
                inputField.forEach(element => {
                    // Handle different input types                        
                    if (element instanceof HTMLInputElement) {
                        element.value = toDoIssue[key] // For text, date inputs
                    } else if (element instanceof HTMLTextAreaElement) {
                        element.value = toDoIssue[key] // For textareas
                    } else if (element instanceof HTMLSelectElement) {
                        // For select elements, set the selected option
                        const options = element.options
                        for (let i = 0; i < options.length; i++) {
                            if (options[i].value === toDoIssue[key]) {
                                options[i].selected = true
                                break
                            }
                        }
                    }
                    console.log(`${toDoIssue[key]}`);
                })
            }
        }
    }
}


export function getChangedToDoIssueDataForUpdate(toDoIssueOrigin: ToDoIssue, toDoIssueToUpdate: IToDoIssue) {

    //Create a object to hold the key - value pairs of changed data between toDoIssueOrigin and toDoIssueToUpdate:
    const changedFields: { [key: string]: [string, string] } = {};
    for (const key in toDoIssueOrigin) {

        // Exclude the 'ui' property from comparison
        if (key === "ui") {
            continue
        } else if (key === "backgroundColorColumn") {
            continue
        } else if (key === "createdDate") {
            continue
        } else if (key === "todoUserOrigin") {
            continue
        } else if (key === "ui") {
            continue
        } else if (key === "todoProject") {
            continue
        }

        const currentToDoIssueValue = toDoIssueOrigin[key];
        const valueToUpdate = toDoIssueToUpdate[key];

        // Compare and store the difference (handling dates appropriately)
        if (key === "dueDate" && currentToDoIssueValue instanceof Date && valueToUpdate instanceof Date) {
            if (currentToDoIssueValue.getTime() !== valueToUpdate.getTime()) {
                changedFields[key] = [currentToDoIssueValue.toLocaleDateString(), valueToUpdate.toLocaleDateString()];
            }
        } else if (key === "description" && !currentToDoIssueValue) {
            if (currentToDoIssueValue !== valueToUpdate) {
                changedFields[key] = ["Original description", "New description"];
            }

        } else if (currentToDoIssueValue !== valueToUpdate) {
            changedFields[key] = [String(currentToDoIssueValue), String(valueToUpdate)];
        }
    }
    return changedFields
}

export function renderToDoIssueList(toDoList: ToDoIssue[]): void {
    const toDoIssueListUiElements = document.getElementById('todo-list');
    if (toDoIssueListUiElements) {

        // Clear the existing elements inside the #project-list div
        toDoIssueListUiElements.innerHTML = ""

        // Re-render the issue list with the updated data
        toDoList.forEach(project => {
            const toDoIssueUiElement = this.updateProjectUi(project);
            toDoIssueListUiElements.appendChild(toDoIssueUiElement);

            // // Remove any existing click listeners (optional but recommended)
            // projectUiElement.removeEventListener("click", this.handleProjectClick);

            // Attach the click listener 
            toDoIssueListUiElements.addEventListener("click", () => {
                showPageContent("todo-details", "flex");
                this.setDetailsPage(toDoIssue);
                console.log("Details page set in a new window");
            });
        });
    }
}

export function getToDoIssue(toDoList: ToDoIssue[], id: string) {
    const toDoIssue = toDoList.find((project) => {
        return toDoIssue.id === id
    })
    return toDoIssue
}

export function getToDoIssueByTitle(toDoList: ToDoIssue[], title: string) {
    const toDoIssue = toDoList.find((project) => {
        return toDoIssue.title === title
    })
    return toDoIssue
}

export function deleteToDoIssue(toDoList: ToDoIssue[], id: string) {
    const toDoIssue = getToDoIssue(toDoList, id)
    if (!toDoIssue) { return }
    toDoIssue.ui.remove()
    const remain = toDoList.filter((project) => {
        return toDoIssue.id !== id
    })
    toDoList = remain
}





// Introduce and store tags for the To-DO Input element
const tagsInput = document.getElementById('todo-tags-input');
const tagsList = document.getElementById('todo-tags-list');

if (tagsInput) {
    tagsInput.addEventListener('keydown', (e) => {
        const inputValue = (e.target as HTMLInputElement).value.trim()
        if ((e.key === "Enter") && inputValue) {
            e.preventDefault()
            const newTags = inputValue.split(/[,]+/).filter((tag) => tag !== "");
            if (Array.isArray(newTags)) {
                newTags.forEach(tagText => {
                    // Check if the tag already exists in the list
                    const existingTag = Array.from(tagsList?.children ?? []).find(child =>
                        child.textContent?.trim().toLowerCase() === tagText.toLowerCase()
                    );

                    if (existingTag) {
                        // Tag already exists, show error message
                        const existTagPopup = new MessagePopUp(
                            document.body,
                            "warning",
                            "Duplicate Tag",
                            `The tag "${tagText}" already exists.`,
                            ["Got it"]
                        );
                        // Define button callback
                        const buttonCallbacks = {
                            "Got it": () => {
                                existTagPopup.closeMessageModal();
                            }
                        }
                        existTagPopup.showNotificationMessage(buttonCallbacks);
                    } else {

                        // Tag is new, add it to the list
                        const tag = document.createElement('li')
                        tag.textContent = tagText
                        tag.classList.add("todo-tags")
                        if (tagsList) {
                            tagsList.appendChild(tag)
                        }
                    }
                })
            }
            console.log(tagsList);

            (e.target as HTMLInputElement).value = "" // Clear input after adding tags
        }
    });
}

if (tagsList) {
    tagsList.addEventListener('click', (e) => {
        if (e.target instanceof HTMLElement) {
            const target = e.target
            if (target.tagName === 'LI') {
                const tag = e.target
                tagsList.removeChild(tag)
            }
        }

    })
}



