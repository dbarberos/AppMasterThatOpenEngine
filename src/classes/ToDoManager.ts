import { IToDoIssue, ToDoIssue } from "./ToDoIssue"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"
import { Project } from "./Project"
import { ProjectsManager } from './ProjectsManager';

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
                <b><u>Rename:</b></u> Create the Issue with a new name.`,
                ["Overwrite", "Skip", "Rename"],
            )

            // Define ALL your button callbacks for the messagePopUp created
            const self = this;
            const buttonCallbacks = {
                "Overwrite": () => {
                    console.log("Overwrite button clicked!");
                    popupDuplicateToDoIssue.closeMessageModal();

                    // Find the project that contains the ToDoIssue to overwrite
                    const toDoIssueIds = toDoList.map((toDoIssue) => {
                        return { id: (toDoIssue as any).id, title: toDoIssue.title }
                    })

                    const toDoIssueIdWithTitle = toDoIssueIds.find((toDoIssue) => {
                        return toDoIssue.title ===data.title
                    })

                    if (toDoIssueIdWithTitle) {


                        const project = getProjectByToDoIssueId(toDoIssueIdWithTitle.id)
                        console.log(toDoIssueIdWithTitle.id)
                        console.log("Project", project)
                    

                        if (project) {
                            // Find and remove the existing ToDoIssue from the ui & list since you are going to use it later
                            const existingToDoIssueIndex = toDoList.findIndex(toDoIssue => toDoIssue.title === data.title);
                            if (existingToDoIssueIndex !== -1) {

                                //Remove the existing issue's UI from the display 
                                const existingToDoIssue = toDoList[existingToDoIssueIndex];
                                (existingToDoIssue as any).ui.remove();
                                console.log("Old issue removed fromthe UI");

                                //Update the ToDoIssue in theproject´s ToDoList
                                const newToDoIssue = new ToDoIssue(data);
                                project.todoList[existingToDoIssueIndex] = newToDoIssue

                                                                
                                newToDoIssue.ui.addEventListener("click", () => {

                                    //EVENTO QUE SUCEDE CUANDO SE HACE CLICK SOBRE UNA DE LAS ETIQUETAS DE TODO
                                    //LA IDEA ES QUE SALGA UNA TARGETA DE LA IZQUIERDA TAPANDO EL ASIDE Y EL PROYECTO SUSTITUYENDOLOS POR LOS DATOS. DEJANDO A LA VISTA EL VISUALIZADOR DE IFC 

                                    showPageContent("todo-details", "flex")
                                    setDetailsIssuePage(newToDoIssue)
                                    console.log(" details pages set in the new window");
                                })

                                //  Update the ToDoOssue in the project´s toDoListnd UI
                                //Get the target element
                                const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement
                                projectListToDosUI.appendChild((newToDoIssue as any).ui);

                                
                                console.log("Added new project to the UI")
                                console.dir("New toDoList:", toDoList)
                            }

                            // Resolve with the newly created toDoIssue
                            resolve(newToDoIssue)

                        } else {
                            // Handle the case where the project is not found (shouldn't happen, just in case
                            console.error("Project to overwrite not found in the list.")
                            resolve(undefined); // Or resolve with an appropriate error value
                        }
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

                            //Validation do not repeat title for the ToDoIssue

                            if (toDoTitles.includes(newTitle)) {
                                console.log(`A issue with the name [ ${newTitle} ] already exists`);
                                const popupTitleToDoIssueRepited = new MessagePopUp(
                                    document.body,
                                    "error",
                                    `A issue with the name "${ newTitle }" already exist`,
                                    "Please enter a diferent title.",
                                    ["Got it"],
                                )
                                // Define ALL your button callbacks for the messagePopUp created
                                const buttonCallbacks = {
                                    "Got it": () => {
                                        console.log("Got it button clicked!")
                                        popupTitleToDoIssueRepited.closeMessageModal()
                                    },
                                }
                                popupTitleToDoIssueRepited.showNotificationMessage(buttonCallbacks);

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

                                //EVENTO QUE SUCEDE CUANDO SE HACE CLICK SOBRE UNA DE LAS ETIQUETAS DE TODO
                                //LA IDEA ES QUE SALGA UNA TARGETA DE LA IZQUIERDA TAPANDO EL ASIDE Y EL PROYECTO SUSTITUYENDOLOS POR LOS DATOS. DEJANDO A LA VISTA EL VISUALIZADOR DE IFC

                                showPageContent("todo-details", "flex")
                                setDetailsIssuePage(newToDoIssue)
                                console.log("Details page set in a new window");
                            });

                            toDoList.push(newToDoIssue)
                            
                            //  Update the ToDoOssue in the project´s toDoListnd UI
                            const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement
                            projectListToDosUI.appendChild((newToDoIssue as any).ui)

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
            console.log("Details pags set in a new window");

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
    projectListToDosUI.appendChild(toDoIssue.ui)
}



export function setDetailsIssuePage(toDoIssue: ToDoIssue) {
    // Set the details page for the issue  
    const detailPage = document.getElementById("todo-details")
    if (!detailPage) { return }

    for (const key in toDoIssue) {
        const dataElement = detailPage.querySelectorAll(`[data-todo-info="${key}"]`)
        if (dataElement) {
            if (key === "dueDate") {
                const dueDate = new Date(toDoIssue.dueDate)
                const formattedDate = dueDate.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
                dataElement.forEach(element => {
                    element.textContent = formattedDate
                })
            } else if (key === "createdDate") {
                const createdDate = new Date(toDoIssue.createdDate)
                const formattedDate = createdDate.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })
                dataElement.forEach(element => {
                    element.textContent = formattedDate
                })
            } else if (key === "todoProject") {
                const projectsManager = ProjectsManager.getInstance()
                const project = projectsManager.list.find(project => project.id === toDoIssue[key])
                if (project) {
                    dataElement.forEach(element => {
                        element.textContent = project.name
                    })
                }
            } else if (key === "statusColumn") {
                dataElement.forEach(element => {                
                    element.textContent = ToDoIssue.getStatusColumnText(toDoIssue.statusColumn);
                    (element as HTMLElement).style.backgroundColor = toDoIssue.backgroundColorColumn
                })
            } else if (key === "tags") {
                const tagListDetailPage = document.getElementById("todo-tags-list-details-page")
                toDoIssue.tags.forEach((tag) => {
                    const tagElement = document.createElement('li');
                    tagElement.textContent = tag;
                    tagElement.classList.add('todo-tags');
                    tagListDetailPage?.appendChild(tagElement);
                })

            } else {
                dataElement.forEach((element) => {
                    element.textContent = toDoIssue[key]
                })
            }
        }
    }


    //Change the color or the Due Date if the date is > of today date
    const dueDate = new Date(toDoIssue.dueDate)
    const todayDate = new Date()

    const checkDueDate = detailPage.querySelector(`[data-todo-info="dueDate"]`)
    if (dueDate < todayDate) {
        if (checkDueDate instanceof HTMLElement) {
            checkDueDate.style.color = "var(--popup-warning)"
            checkDueDate.textContent += " - Due date exceeded"
        }
        
    } else {
        //keep the original style for the dueDate        
        if (checkDueDate instanceof HTMLElement) {
            const rightdueDate = dueDate.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })

            const formattedDate = detailPage.querySelector(`[data-todo-info="dueDate"]`)
            if (formattedDate instanceof HTMLElement) {
                formattedDate.style.color = "var(--color-fontbase)"
                formattedDate.textContent = rightdueDate
            }        
        }
    }


    

    //Update the backgroundColor of the acronym symbol
    const nameAndColorOfAcronym = detailPage.querySelector(`[data-todo-info="acronym"]`) as HTMLElement
    const projectsManager = ProjectsManager.getInstance()
    const project = projectsManager.list.find(project => project.id === toDoIssue["todoProject"])
    if (project && nameAndColorOfAcronym !== null) {
        nameAndColorOfAcronym.textContent = project.acronym
        nameAndColorOfAcronym.style.backgroundColor = project.backgroundColorAcronym
    }

    // Update the background color of the todo-card in the todo-details-page
    const columnElement = detailPage.querySelector('[data-todo-info="statusColumn"]') as HTMLElement
    if (columnElement) {
        columnElement.style.backgroundColor = toDoIssue.backgroundColorColumn;
    }

    // Set the data-projectId attribute with the unique ID of the proyect 
    const projectDatasetAttributeId = document.querySelectorAll("#todo-details .todo-icon-edit")
    if (projectDatasetAttributeId) {
        projectDatasetAttributeId.forEach((element) => {
            if (element instanceof HTMLElement) {
                element.dataset.toDoIssueId = toDoIssue.id.toString()
            }
        })       
    }

    // Activate the checkbox sidebar-active (reduce the width) in order to reduce the width os the sidebar
    const sidebarActiveCheckbox = document.getElementById('sidebar-active') as HTMLInputElement;
    if (!sidebarActiveCheckbox.checked) {
        sidebarActiveCheckbox.checked = true
        localStorage.setItem("sidebar-active","")
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
    const dueDate = new Date(toDoIssue.dueDate)
    const dueDateFormatted = dueDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).replace(/\//g, "-")

    toDoIssue.ui.innerHTML = `
        <div class="todo-color-column" style="background-color: ${(toDoIssue as any).backgroundColorColumn}"></div>

        <div  class="todo-card" style="display: flex; flex-direction: column; border: 5px solid border-left-color: ${(toDoIssue as any).backgroundColorColumn}; ">
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
                <span style="text-wrap: nowrap; margin-left: 5px" class="todo-task-move">
                    <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                        <use href="#chat-bubble"></use>
                    </svg>
                    ${toDoIssue.assignedUsers.length} assigned
                </span>                
                <span class="todo-task-move todo-tags" style="textwrap: nowrap; margin-left:5px; color: var(--background) !important; background-color:${(toDoIssue as any).backgroundColorColumn};font-size: var(--font-base)" >
                    ${ToDoIssue.getStatusColumnText(toDoIssue.statusColumn)}
                </span>
            </div>
        </div>
    `
    toDoIssue.ui.addEventListener("click", () => {
        showPageContent("todo-details", "flex")//this should show the banner with the data of only one ISSUE not de board
        setDetailsIssuePage(toDoIssue) //for the new windows (todo-detalis)where the data of the todo issue is shown. From that place is where you can edit the content of the todoIssue
        console.log("Details page set in a new window")

    })
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

function getProjectByToDoIssueId(toDoIssueId: string): Project | undefined {
    const projectManager = ProjectsManager.getInstance();
    const projects = projectManager.list

    for (const project of projects) {
        const todoIssues = project.todoList
        for (const todoIssue of todoIssues) {
            if ((todoIssue as any).id === toDoIssueId) {
                return project
            }
        }    

    }
    return undefined;
}



//  Introduce and store tags for the To-DO Input element

handleTagsInput("todo-tags-input", "todo-tags-list");
handleTagsInput("todo-tags-detail-input", "todo-tags-list-details-page");

function handleTagsInput(tagsInputId, tagsListId) {
    const tagsInput = document.getElementById(tagsInputId);
    const tagsList = document.getElementById(tagsListId);

    if (tagsInput) {
        tagsInput.addEventListener("keydown", (e) => {
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
            
        })
    }

    if (tagsList) {
        tagsList.addEventListener("click", (e) => {
            e.stopPropagation()
            if (e.target instanceof HTMLElement) {
                const target = e.target
                if (target.tagName === "LI") {
                    const tag = e.target
                    // Check the Input element is visible. Because we use this fiunction in several parts of the app
                    if (tagsInput && (tagsInput.style.display === "block" || !tagsInput.style.display)) {
                        tag.remove()                        
                    }
                }
            }

        })
    }
}


//close de detail To-Do page when the cross button us clicked
const btnCloseToDoIssueDetailsPage = document.querySelector("#close-todoIssue-details-btn")
if (btnCloseToDoIssueDetailsPage) {
    btnCloseToDoIssueDetailsPage.addEventListener("click", (e) => {

        console.log("Close button press")
        // Delete the data-todoIssueId attribute with the unique ID from the buttons
        const projectDatasetAttributeId = document.querySelectorAll(".todo-icon-edit")
        if (projectDatasetAttributeId) {
            projectDatasetAttributeId.forEach((element) => {
                if (element instanceof HTMLElement) {
                    element.dataset.toDoIssueId = ""
                }
            })
        }

        //Delete the data from the "todo-tags-list-details-page" <ul> element to clean up for avoiding add extra tags to the next todo Detail
        const deleteTagsListFromDetail = document.getElementById("todo-tags-list-details-page")
        // Clear any existing content in the container 
        if (deleteTagsListFromDetail) {
            while (deleteTagsListFromDetail.firstChild) {
                deleteTagsListFromDetail.removeChild(deleteTagsListFromDetail.firstChild);
            }
        }

        hidePageContent("todo-details")

        //Return the checkbox for managing the width of the sidebar to its original state before showing the todo-Details page
        const sidebarActiveCheckbox = document.getElementById("sidebar-active") as HTMLInputElement
        const sidebarActiveState = localStorage.getItem("sidebar-active")
        if (sidebarActiveCheckbox !== null) {
            if (sidebarActiveState === "active") {
                sidebarActiveCheckbox.checked = true
                localStorage.setItem("sidebar-active", "active")
            } else if (sidebarActiveState === "") {
                sidebarActiveCheckbox.checked = false
                localStorage.setItem("sidebar-active", "")

            }
        }
    })    
}


//Edit the continent of a container in the todo-details page when press de edit button

//Add event "click" to the edit button of the todo-details page
const editButtons = document.querySelectorAll('#todo-details .todo-icon-edit.svg-edit');
editButtons.forEach(button => {
    
    // Check if the click event that saves the input information is being listened to
    button.addEventListener("click", (e) => {

        // Verify that the aria-label attribute of the child svg element has the value "edit""
        const svgInsideBtnElement = button.querySelector("svg")
        if (svgInsideBtnElement && svgInsideBtnElement.getAttribute("aria-label") === "edit") {
            button.removeEventListener('click', handleSaveToDoIssueBtnClick);
            button.addEventListener('click', handleEditToDoIssueBtnClick);
        }
    })
    
})



//Function for managing data when edit-todo-field button is clicked
function handleEditToDoIssueBtnClick(e) {
    e.stopPropagation()
    console.log("target of the click:", e.target)
    const buttonEditOrSave = e.currentTarget
    

    //Get the edit buttton clicked(there are severals)
    const targetToDoIssueBtn = e.target.closest(".todo-icon-edit.svg-edit")    
    console.log('Button edit clicked:', targetToDoIssueBtn)


    const svgInsideEditBtnElement = targetToDoIssueBtn.querySelector("svg")
    if (svgInsideEditBtnElement && svgInsideEditBtnElement.getAttribute("aria-label") === "edit") {


        if (targetToDoIssueBtn) {
            //Get the parent element of the edit button that contain the button, the input and the element with the todo data
            const parentToDoIssueElement = targetToDoIssueBtn.parentElement
            console.log('Parent element:', parentToDoIssueElement)
            //Obtaining the key of the data is going to be updated (title, description, etc)
            const toDoIssueDataKey = parentToDoIssueElement.dataset.todoInfoBtn
            console.log('Data key:', toDoIssueDataKey)

            //Get the element displaying the current toDo data inside the parent element
            const elementToDoFieldToUpdate = parentToDoIssueElement.querySelector(`[data-todo-info="${toDoIssueDataKey}"]`)
            console.log('Element to update:', elementToDoFieldToUpdate)

            //Obtain the current elements of the elementToDoFieldToUpdate to update the HTML to the original state
            let originalToDoIssueListItems
            if (elementToDoFieldToUpdate.tagName === "UL") {
                originalToDoIssueListItems = Array.from(elementToDoFieldToUpdate.children)
                console.log(originalToDoIssueListItems)
            }

            // Get the element with the input field  where to introduce the updated data
            const inputToDoFieldForUpdate = parentToDoIssueElement.querySelector(`[data-todo-info-origin="${toDoIssueDataKey}"]`)
            console.log('Input field:', inputToDoFieldForUpdate)

            // Modify the SVG icon
            const svgElement = targetToDoIssueBtn.querySelector('svg')
            svgElement.setAttribute('aria-label', 'save')
            svgElement.innerHTML = '<use href="#save"></use>'

            //Manage event listeners
            buttonEditOrSave.removeEventListener("click", handleEditToDoIssueBtnClick)
            buttonEditOrSave.addEventListener("click", handleSaveToDoIssueBtnClick)


            // store the original elements inside elementToDoFieldToUpdate in the case of "tags" and "assignedUsers" in order to restore them when you click outside the input and not save the changes
            if (elementToDoFieldToUpdate.tagName === "UL") {
                const originalToDoIssueListItems = Array.from(elementToDoFieldToUpdate.children)
                console.log(originalToDoIssueListItems)
            }
    
            if (!elementToDoFieldToUpdate || !inputToDoFieldForUpdate) {
                return
            } else {

                console.log('Hiding element:', elementToDoFieldToUpdate)
                console.log('Showing input field:', inputToDoFieldForUpdate)

                //Hide the current element with the todo Data and show the input field to update the date
                elementToDoFieldToUpdate.style.display = "none"
                inputToDoFieldForUpdate.style.display = "block"
                //Focus the atention in the input element
                inputToDoFieldForUpdate.focus()

                // What happend if someone click outside the input element
                // Add a click event to the document to blur and change the display of elements
                document.addEventListener('click', (e) => {
                    if (e.target !== inputToDoFieldForUpdate && !inputToDoFieldForUpdate.contains(e.target) && e.target !== elementToDoFieldToUpdate && !elementToDoFieldToUpdate.contains(e.target)) {
                        inputToDoFieldForUpdate.blur();
                        inputToDoFieldForUpdate.style.display = 'none';
                        elementToDoFieldToUpdate.style.display = 'block';
                        // Modify the SVG icon
                        svgElement.setAttribute('aria-label', 'edit')
                        svgElement.innerHTML = '<use href="#edit"></use>'
                        const todoField = document.querySelector('.father-todoissue-textarea')
                        if (todoField instanceof HTMLElement) {
                            todoField.style.minHeight = `0px`
                        }

                        //Restore the border of fieldset to transparent
                        const todoFieldset = document.querySelector('.father-todoissue-textarea-fielset') as HTMLElement
                        if (todoFieldset) {
                            todoFieldset.style.border = '1.5px dotted var(--color-fontbase-dark)'
                        }



                        //Restore the continent of elementToDoFieldToUpdate to the original state
                        if (elementToDoFieldToUpdate.tagName === "UL") {
                            elementToDoFieldToUpdate.innerHTML = ""
                            originalToDoIssueListItems.forEach((item) => {
                                elementToDoFieldToUpdate.appendChild((item as HTMLElement).cloneNode(true))
                            })
                        }

                        //Manage eventListeners
                        editButtons.forEach(button => {
                            button.addEventListener('click', handleEditToDoIssueBtnClick);
                            button.removeEventListener('click', handleSaveToDoIssueBtnClick);
                        });


                    }
                })

                // Modify the SVG icon
                const svgElement = targetToDoIssueBtn.querySelector('svg')
                svgElement.setAttribute('aria-label', 'save')
                svgElement.innerHTML = '<use href="#save"></use>'


                //Obtain the current value of the todo field to update in order to show this data inside the input field
                const currentToDoIssueValue = elementToDoFieldToUpdate.textContent


                //Set the data above in the input field 
                if (inputToDoFieldForUpdate.tagName === "INPUT" && inputToDoFieldForUpdate.type === "date") {
                    //Parse the chain of text in a date
                    const dateParts = currentToDoIssueValue.split(' de ');
                    const dayParse = parseInt(dateParts[0]);
                    const monthParse = getMonthFromString(dateParts[1]);
                    const yearParse = parseInt(dateParts[2]);

                    const dateToDoValue = new Date(yearParse, monthParse - 1, dayParse + 1);

                    //format the date if it is a date input
            
                    inputToDoFieldForUpdate.value = dateToDoValue.toISOString().slice(0, 10)

                } else if (inputToDoFieldForUpdate.nodeName === "TEXTAREA") {
                    const todoField = document.querySelector('.father-todoissue-textarea');
                    
                    console.log("father of the textarea:", todoField)
                    if (todoField instanceof HTMLElement) {
                        const textarea = todoField.querySelector('[data-todo-info-origin="description"]');
                        console.log("textarea Element:", textarea)
                        if (textarea) {
                            // textarea.addEventListener('input', () => {
                            // Calculate the height of the textarea
                            const textareaHeights = 100
                            console.log("height of the textarea:", textareaHeights)
                            const textareaHeightscroll = (textarea as HTMLElement).scrollHeight;
                            console.log("height of the textarea:", textareaHeightscroll)

                            // Set the parent element's height to match the textarea's height
                            const textareaHeightTaken = textareaHeights > textareaHeightscroll ? textareaHeights : textareaHeightscroll;
                            console.log("height of the textarea:", textareaHeightTaken)
                            todoField.style.minHeight = `${textareaHeightTaken}px`
                            // });

                            //Set the border of fieldset to transparent
                            const todoFieldset = document.querySelector('.father-todoissue-textarea-fielset') as HTMLElement
                            if (todoFieldset) {
                                todoFieldset.style.border = 'none'
                            }

                        }
                    }

                    inputToDoFieldForUpdate.value = currentToDoIssueValue
        
                } else if (inputToDoFieldForUpdate.tagName === "INPUT" && inputToDoFieldForUpdate.type === "text" && inputToDoFieldForUpdate.dataset.todoInfoOrigin === "tags") {
                    console.log("we are in tags")

                    // Display again the task list directly
                    elementToDoFieldToUpdate.style.display = "block"

                    //Manage the addition or substraction of tags inside the ToDo Issue
                    // calling function handleTagsInput with the correct elements IDs
            
                    handleTagsInput("todo-tags-detail-input", "todo-tags-list-details-page")

                    // Clear the input field, it is not neccesary the currentToDoIssueValue
                    // inputToDoFieldForUpdate.value = ""; 
            

                } else if (inputToDoFieldForUpdate.tagName === "SELECT") {
                    const statusTextConversion = currentToDoIssueValue
                    let statusValue = ""
                    
                    switch (statusTextConversion) {
                        case "Task Ready":
                            statusValue = "backlog"
                            break
                        case "In Progress":
                            statusValue = "wip"
                            break
                        case "Needs Review":
                            statusValue = "qa"
                            break
                        case "Done":
                            statusValue = "completed"
                            break
                        default:
                            statusValue = "Not Assigned"
                    }
                    inputToDoFieldForUpdate.value = statusValue

                } else {
                inputToDoFieldForUpdate.value = currentToDoIssueValue
                }


                
        
                targetToDoIssueBtn.addEventListener('click', (e) => {
                    e.stopPropagation()
                    console.log("target save btn clicked:", targetToDoIssueBtn)

                    // Verify that the aria-label attribute of the child svg element has the value "save""
                    const svgInsideBtnElement = targetToDoIssueBtn.querySelector("svg")
                    if (svgInsideBtnElement && svgInsideBtnElement.getAttribute("aria-label") === "save") {


                        handleSaveToDoIssueBtnClick(parentToDoIssueElement, inputToDoFieldForUpdate, toDoIssueDataKey, elementToDoFieldToUpdate)
                    }
                }, { once: true })
            }
        }
    }
}



// Function to parse a text string and extract the month component
function getMonthFromString(monthString) {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    if (typeof monthString !== "string" || monthString.trim() === "") {
        throw new Error ("Invalid month")
    }
    const monthIndex = months.indexOf(monthString);
    if (monthIndex !== -1) {
        return monthIndex + 1
    } else {
        throw new Error(`Month missing: ${monthString}`);
    }
}



// Function for managing data when save-todo-field button is clicked
function handleSaveToDoIssueBtnClick(parentElement?, inputField?, dataKey?, originalElement?) { 

    console.log('Save button clicked:', parentElement, inputField, dataKey, originalElement)

    //Manage eventListeners
    editButtons.forEach(button => {
        button.addEventListener('click', handleEditToDoIssueBtnClick);
        button.removeEventListener('click', handleSaveToDoIssueBtnClick);
    });

    //Restore the border of fieldset to transparent
    const todoFieldset = document.querySelector('.father-todoissue-textarea-fielset') as HTMLElement
    if (todoFieldset) {
        todoFieldset.style.border = '1.5px dotted var(--color-fontbase-dark)'
    }

    //Obtain the value of the input todo field
    const newToDoIssueFieldValue = inputField.value.trim()
    console.log('New value for newToDoIssueFieldValue:', newToDoIssueFieldValue)

    //Validate the value of the new data


    //(añade tu lógica aquí)

    //Check the input is not empty
    if (newToDoIssueFieldValue.trim() === "") {
        const popupToDoDataFieldInvalid = new MessagePopUp(
            document.body,
            "error",
            "The field is empty",
            "Please fill in the field or click outside the field if you do not need to update the data.",
            ["Got it"]
        )
        // Define button callback
        const buttonCallbacks = {
            "Got it": () => {
                popupToDoDataFieldInvalid.closeMessageModal();
            }
        }
        popupToDoDataFieldInvalid.showNotificationMessage(buttonCallbacks);
    }
    


    // if title check does not exist a previous Issue with the same name
    if (dataKey === "title") {
        //Obtain the ID ToDo Issue
        const todoIssueId = parentElement.querySelector(".todo-icon-edit.svg-edit").dataset.toDoIssueId;
        console.log("todoIssueId:", todoIssueId)

        //Look for the todo Issue in the project List
        // const projectManager = ProjectsManager.getInstance()
        const project = getProjectByToDoIssueId(todoIssueId)
        const todoIssueList = project ? project.todoList : []
        console.log("Project:", project)

        //Chech if the title issue already exist
        const existingToDoIssue = todoIssueList.find(
            (issue) => issue.title === newToDoIssueFieldValue && issue.id !== todoIssueId
        );

        if (existingToDoIssue) {
            // Mostrar mensaje de error
            const popupTitleExists = new MessagePopUp(
                document.body,
                "error",
                "Title already exists",
                "A ToDo Issue with this title already exists in this project. Please choose another title.",
                ["Got it"]
            );
            popupTitleExists.showNotificationMessage({
                "Got it": () => {
                    popupTitleExists.closeMessageModal();
                }
            });
            return; // Detener la ejecución si el título ya existe
        }
    }
    
   

    // Formatea la fecha si es un campo de fecha
    if (inputField.tagName === 'INPUT' && inputField.type === 'date') {
        const newToDoIssueDateFieldValue = new Date(newToDoIssueFieldValue).toLocaleDateString();
        originalElement.textContent = newToDoIssueDateFieldValue;
    } else {

        // Replace the original element's value with the new one
        originalElement.textContent = newToDoIssueFieldValue;
        console.log('Updated element:', originalElement)

    }


    //TextArea remove the height of the element created to displace elements below
    const todoField = document.querySelector('.father-todoissue-textarea')
    if (todoField instanceof HTMLElement) {
        todoField.style.minHeight = `0px`
    }


    // Hide the input field and show the original element
    inputField.blur()
    inputField.style.display = 'none';
    originalElement.style.display = 'block';
    // Modify the SVG icon
    const svgElement = parentElement.querySelector('svg')
    svgElement.setAttribute('aria-label', 'edit')
    svgElement.innerHTML = '<use href="#edit"></use>'

    



    // Guarda el nuevo valor en tu estructura de datos


    // updateTodoData(dataKey, newValue);
}





// Función para actualizar los datos de la tarea
function updateTodoData(dataKey, newValue) {
    // Encuentra la tarea en tu estructura de datos
    const todoToUpdate = // ... (tu lógica para encontrar la tarea)

        // Actualiza el valor de la propiedad correspondiente
        todoToUpdate[dataKey] = newValue;

    // Guarda la estructura de datos actualizada (local storage, base de datos, etc.)
    // ... (tu lógica para guardar los datos)
}

// ... (tu código existente)

