import { IToDoIssue, ToDoIssue } from "./ToDoIssue"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"
import { Project } from "./Project"
import { ProjectsManager } from "./ProjectsManager";
import { sanitizeHtml } from "./HTMLUtilities"

import { MessagePopUp } from "./MessagePopUp"
import { v4 as uuidv4 } from "uuid"
import { organizeFilteredToDoIssuesByStatusColumns, setUpToDoBoard, organizeToDoIssuesByStatusColumns } from "./DragAndDropManager";


// export function onTodoIssueCreated (toDoIssue: ToDoIssue) => { }
// export function onTodoIssueUpdated = (toDoIssue: ToDoIssue) => { }
// export function onTodoIssueDeleted = (toDoIssue: ToDoIssue) => { }

export function newToDoIssue(toDoList: IToDoIssue[], data: IToDoIssue, id?: string) {
    const toDoIssueNames = toDoList.map((toDoIssue) => {
        return toDoIssue.title
    })
    if (toDoIssueNames.includes(data.title)) {
        // Find and remove the existing todo from the list since you are going to use it later
        const existingToDoIndex = toDoList.findIndex(todo => todo.title === data.title);
        if(existingToDoIndex !== -1) {
            //It is clare that there is an index, since there is a todo with that name
            // 1. Remove the existing todo from the list
            toDoList = toDoList.filter((todo) => todo.title !== data.title);
        

            // 2. Create a new todo with the imported data
            const newToDoCreated = new ToDoIssue(data, id);

            // 3. Process tag an assignedUsers???
            // if (data.todoList && Array.isArray(data.todoList)) {
            //     newProject.todoList = data.todoList.map(todoData => {
            //         return ToDoIssue.createFromData({
            //             ...todoData,
            //             todoProject: newProject.id || ''
            //         });
            //     });
            // }

            // 4. Add the new project to the list
            toDoList.push(newToDoCreated);
            this.onToDoIssueCreated(newToDoCreated);
            return newToDoCreated;

        } else {
            console.error("ToDo Issue to overwrite not found in the list.")
            return undefined
        }
    }
}



/* OLD newToDoIssue
export function CreatenewToDoIssue(toDoList: IToDoIssue[], data: IToDoIssue onUpdateToDoList: (newToDoList: IToDoIssue[]) => void) {
    // Check if the issue already exists
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
                        return toDoIssue.title === data.title
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
                                // const existingToDoIssue = toDoList[existingToDoIssueIndex];
                                // (existingToDoIssue as any).ui.remove();
                                // console.log("Old issue removed fromthe UI");

                                //Update the ToDoIssue in theproject´s ToDoList
                                const newToDoIssue = new ToDoIssue(data);
                                project.todoList[existingToDoIssueIndex] = newToDoIssue

                                                                
                                // newToDoIssue.ui.addEventListener("click", () => {

                                //     //Event that happens when clicking on one of the TODO tags
                                //     //The idea is to have a card come out from the left covering the ASIDE and the project, replacing them with the data. Leaving the IFC viewer visible

                                //     showPageContent("todo-details", "flex")
                                //     setDetailsIssuePage(newToDoIssue)
                                //     console.log(" details pages set in the new window");
                                // })
                                toDoList.push(newToDoIssue)

                                // const storedPageWIP = localStorage.getItem("pageWIP")
                                // if (storedPageWIP === "todo-page") {
                                //     renderToDoIssueList(project.todoList); 
                                //     setUpToDoBoard(project.todoList);
                                    
                                // } else if (storedPageWIP === "project-details") {

                                //     //  Update the ToDoOssue in the project´s toDoListnd UI
                                //     //Get the target element
                                //     const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement
                                //     projectListToDosUI.appendChild((newToDoIssue as any).ui)

                                // }
                                
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
                                    `A issue with the name "${newTitle}" already exist`,
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

                            //Give a new Id to the New ToDoIssue
                            data.id = uuidv4()

                            // Create the new project and resolve the Promise
                            const newToDoIssue = new ToDoIssue(data);

                            // ATTACH THE EVENT LISTENER HERE
                            
                            newToDoIssue.ui.addEventListener("click", () => {

                                //Event that happens when clicking on one of the TODO tags
                                //The idea is to have a card come out from the left covering the ASIDE and the project, replacing them with the data. Leaving the IFC viewer visible

                                showPageContent("todo-details", "flex")
                                setDetailsIssuePage(newToDoIssue)
                                console.log("Details page set in a new window");
                            });

                            toDoList.push(newToDoIssue)

                            const storedPageWIP = localStorage.getItem("pageWIP")
                            if (storedPageWIP === "todo-page") {
                                renderToDoIssueList(toDoList);
                                setUpToDoBoard(toDoList);


                                // setIssueInsideToDoPage(newToDoIssue)
                                // toDoList.push(newToDoIssue)

                            } else if (storedPageWIP === "project-details") {
                            
                                //  Update the ToDoOssue in the project´s toDoListnd UI
                                const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement
                                projectListToDosUI.appendChild((newToDoIssue as any).ui)
                            }

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
        //toDoList.push(toDoIssue)
        return toDoIssue

         EVENT LISTENER FOR THE TO-DO ISSUE CARD
        //toDoIssue.ui.addEventListener("click", () => {
            showPageContent("todo-details", "flex")//this should show the banner with the data of only one ISSUE not de board
            setDetailsIssuePage(toDoIssue) //for the new windows (todo-detalis)where the data of the todo issue is shown. From that place is where you can edit the content of the todoIssue
            console.log("Details pags set in a new window");

        //})

        
        
        const storedPageWIP = localStorage.getItem("pageWIP")
        if (storedPageWIP === "todo-page") {
            setIssueInsideToDoPage(toDoIssue)
            toDoList.push(toDoIssue)
            //onUpdateToDoList([...toDoList]);
            return toDoIssue

        } else {
            setIssueInsideDetailsProjectPage(toDoIssue)
            toDoList.push(toDoIssue)
            //onUpdateToDoList([...toDoList]);
            return toDoIssue
        }

        
    }
}
*/

export function setIssueInsideDetailsProjectPage(toDoIssue: ToDoIssue) { 
    //Get the target element
    const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement
    // check the issue have the attibute "data-todo-id" assigned. 
    toDoIssue.ui.dataset.todoId = toDoIssue.id

    // Append the new div to the todoListContainer
    projectListToDosUI.appendChild(toDoIssue.ui)
}

export function setIssueInsideToDoPage(toDoIssue: ToDoIssue) {
    // Get the status column from the toDoIssue
    const status = toDoIssue.statusColumn || "notassigned" // Default to "notassigned" if status is null or undefined

    // Construct the column ID based on the status
    const columnId = `todo-column-${status.toLowerCase()}`

    // Get the target column element
    const column = document.getElementById(columnId)

    if (column) {
        // check the issue have the attibute "data-todo-id" assigned. 
        toDoIssue.ui.dataset.todoId = toDoIssue.id
        
        // Append the UI of the toDoIssue to the correct column
        column.appendChild(toDoIssue.ui);
    } else {
        console.error(`Column with ID ${columnId} not found.`);
    }



}


export function setDetailsIssuePage(toDoIssue: ToDoIssue) {
    // Set the details page for the issue  
    const detailPage = document.getElementById("todo-details")
    if (!detailPage) { return }

    //Delete the data from the "todo-tags-list-details-page" <ul> element to clean up for avoiding add extra tags to the next todo Detail
    const deleteTagsListFromDetail = document.getElementById("todo-tags-list-details-page")
    // Clear any existing content in the container 
    if (deleteTagsListFromDetail) {
        while (deleteTagsListFromDetail.firstChild) {
            deleteTagsListFromDetail.removeChild(deleteTagsListFromDetail.firstChild);
        }
    }
    //Delete the data from the "todo-assignedUsers-list-detail-page" <ul> element to clean up for avoiding add extra tags to the next todo Detail
    const deleteAssignedUsersListFromDetail = document.getElementById("todo-assignedUsers-list-detail-page")
    // Clear any existing content in the container 
    if (deleteAssignedUsersListFromDetail) {
        while (deleteAssignedUsersListFromDetail.firstChild) {
            deleteAssignedUsersListFromDetail.removeChild(deleteAssignedUsersListFromDetail.firstChild);
        }
    }


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

    //hide the save data Field button 
    const saveBtns = document.querySelectorAll('#todo-details .todo-icon-edit.svg-save')
    saveBtns.forEach((btn) => {
        (btn as HTMLElement).style.display = "none"
    })

    //Show the edit data Field button
    const editBtns = document.querySelectorAll('#todo-details .todo-icon-edit.svg-edit')
    editBtns.forEach((btn) => {
        (btn as HTMLElement).style.display = "block"
    })





    // Activate the checkbox sidebar-active (reduce the width) in order to reduce the width os the sidebar
    const sidebarActiveCheckbox = document.getElementById('sidebar-active') as HTMLInputElement;
    if (!sidebarActiveCheckbox.checked) {
        sidebarActiveCheckbox.checked = true
        localStorage.setItem("sidebar-active","")
    }
}





export function renderToDoIssueListInsideProject(toDoIssue: IToDoIssue) {
    console.log('Rendering ToDo Issue:', toDoIssue);
        
    if (toDoIssue.ui && toDoIssue.ui instanceof HTMLElement) {
        return
    }
    toDoIssue.ui = document.createElement("div")
    toDoIssue.ui.className = "todo-item"    
    toDoIssue.ui.dataset.projectId = toDoIssue.todoProject
    toDoIssue.ui.dataset.todoId = toDoIssue.id
    toDoIssue.ui.setAttribute("draggable", "true")
    const dueDate = new Date(toDoIssue.dueDate)
    const dueDateFormatted = dueDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).replace(/\//g, "-")

    toDoIssue.ui.innerHTML = `
        <div class="todo-color-column" style="background-color: ${(toDoIssue as any).backgroundColorColumn}"></div>

        <div  class="todo-card" style="display: flex; flex-direction: column; border-left-color: ${(toDoIssue as any).backgroundColorColumn}; ">
            <div class="todo-taks" >
                <div class="todo-tags-list">
                    ${toDoIssue.tags.map(tag => `<span class="todo-tags">${tag}</span>`).join('')}
                </div>
                <button class="todo-task-move handler-move">
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
        newUiElement.dataset.todoId = toDoIssueToUpdateTheUi.id
        newUiElement.setAttribute("draggable", "true")
        const dueDate = new Date(toDoIssueToUpdateTheUi.dueDate)
        const dueDateFormatted = dueDate.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).replace(/\//g, "-")

        newUiElement.innerHTML = `
            <div class="todo-color-column" style="background-color: ${(toDoIssueToUpdateTheUi as any).backgroundColorColumn}"></div>

        <div  class="todo-card" style="display: flex; flex-direction: column; border-left-color: ${(toDoIssueToUpdateTheUi as any).backgroundColorColumn}; ">
            <div class="todo-taks" >
                <div class="todo-tags-list">
                    ${toDoIssueToUpdateTheUi.tags.map(tag => `<span class="todo-tags">${tag}</span>`).join('')}
                </div>
                <button class="todo-task-move handler-move">
                    <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                        <use href="#drag-indicator"></use>
                    </svg>

                </button>
            </div>
            <div class="todo-title">
                <h5 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;; margin-left: 15px">${toDoIssueToUpdateTheUi.title}</h5>
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
                    ${toDoIssueToUpdateTheUi.assignedUsers.length} assigned
                </span>                
                <span class="todo-task-move todo-tags" style="textwrap: nowrap; margin-left:5px; color: var(--background) !important; background-color:${(toDoIssueToUpdateTheUi as any).backgroundColorColumn};font-size: var(--font-base)" >
                    ${ToDoIssue.getStatusColumnText(toDoIssueToUpdateTheUi.statusColumn)}
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

export function renderToDoIssueList(toDoList: IToDoIssue[]): void {

    console.log("Inside render function List of to-dos´:", toDoList)
    const toDoIssueListUiElements = document.getElementById("details-page-todo-list");
    if (toDoIssueListUiElements) {
        console.log("List of original ToDo´sin the DOM:", toDoIssueListUiElements)

        // Clear the existing elements inside the #project-list div
        // toDoIssueListUiElements.innerHTML = ""
        while (toDoIssueListUiElements.firstChild) {
            toDoIssueListUiElements.removeChild(toDoIssueListUiElements.firstChild);
            }
        console.log("What is left inside the list after removing:", toDoIssueListUiElements)

        // Re-render the issue list with the updated data
        toDoList.forEach(todoIssue => {
            renderToDoIssueListInsideProject(todoIssue);
            toDoIssueListUiElements.appendChild(todoIssue.ui);

            // Attach the click listener 
            // todoIssue.ui.addEventListener("click", () => {
            //     showPageContent("todo-details", "flex");
            //     setDetailsIssuePage(todoIssue);
            //     console.log("Details page set in a new window");
            // });
        });
    } else {
        console.error("The father element of the Todo list was not found")
    }
}

export function getToDoIssue(toDoList: ToDoIssue[], id: string) {
    const toDoIssue = toDoList.find((currentToDoIssue) => {
        return currentToDoIssue.id === id
    })
    return toDoIssue
}

// *** USED INSIDE NewToDoIssueForm ***
export function getToDoIssueByTitle(toDoList: ToDoIssue[], title: string) {
    const toDoIssue = toDoList.find((project) => {
        return toDoIssue.title.toLowerCase() === title.toLowerCase()
    })
    return toDoIssue
}

export function deleteToDoIssue(toDoList: IToDoIssue[], id: string) {

    const toDoIssue = getToDoIssue(toDoList, id)
    if (!toDoIssue || !toDoIssue.ui) { return toDoList }
    toDoIssue.ui.remove()

    // return toDoList.filter((toDoIssue) => toDoIssue.id !== id)

    const remain = toDoList.filter((toDoIssue) => {
        return toDoIssue.id !== id
    })
    return remain    
}

export function getProjectByToDoIssueId(toDoIssueId: string): Project | undefined {
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


/*store tags for the To-DO Input element
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
*/


//close de detail To-Do page when the cross button us clicked
const btnCloseToDoIssueDetailsPage = document.querySelector("#close-todoIssue-details-btn")

if (btnCloseToDoIssueDetailsPage) {
    btnCloseToDoIssueDetailsPage.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("Close button press")        
        closeToDoIssueDetailPage()
        
    })
}

export function closeToDoIssueDetailPage () {
    
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

    // Recover the localStorage value for pageWIP  and manage wich page reload in the app
    const pageWIP = localStorage.getItem("pageWIP")

    if (pageWIP === "project-details") {

        //Reload the page instead of just close de detail page because to update de todoIssue changed data
        // hidePageContent("todo-details")
        changePageContent("project-details", "flex")
        
    } if (pageWIP === "todo-page") {
        changePageContent("todo-page", "flex")
    }

    clearSearchAndResetList()

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
}

let isEditModeInToDoIssue = false
let clickOutsideElementsEvent: ((e: MouseEvent) => void) | null = null

//Edit the continent of a container in the todo-details page when press de edit button

//Add event "click" to the edit button of the todo-details page
const editButtons = document.querySelectorAll('#todo-details .todo-icon-edit.svg-edit')
editButtons.forEach(button => {
    
    // Check if the click event that saves the input information is being listened to
    button.addEventListener("click", (e) => {

        // Verify that the aria-label attribute of the child svg element has the value "edit""
        const svgInsideBtnElement = button.querySelector("svg")
        if (!isEditModeInToDoIssue && svgInsideBtnElement && svgInsideBtnElement.getAttribute("aria-label") === "edit") {
            
            handleEditToDoIssueBtnClick(e)
            // button.removeEventListener('click', handleSaveToDoIssueBtnClick);
            // button.addEventListener('click', handleEditToDoIssueBtnClick);
        }
    })
    
})



//Function for managing data when edit-todo-field button is clicked
function handleEditToDoIssueBtnClick(e) {
    e.stopPropagation()
    console.log("target of the click:", e.target)
    isEditModeInToDoIssue = true
    const buttonEditOrSave = e.currentTarget
    

    //Get the edit buttton clicked(there are severals)
    const targetToDoIssueBtn = e.currentTarget

    // const targetToDoIssueBtn = e.target.closest('.todo-icon-edit.svg-edit')
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
            let elementToDoFieldToUpdate = parentToDoIssueElement.querySelector(`[data-todo-info="${toDoIssueDataKey}"]`)
            console.log('Element to update:', elementToDoFieldToUpdate)

            // Get the element with the input field  where to introduce the updated data
            const inputToDoFieldForUpdate = parentToDoIssueElement.querySelector(`[data-todo-info-origin="${toDoIssueDataKey}"]`)
            console.log('Input field:', inputToDoFieldForUpdate)

            //Get the child button with the save icon
            const saveToDoFieldBtnToUpdate = parentToDoIssueElement.querySelector('.todo-icon-edit.svg-save')
            console.log("Save Btn:", saveToDoFieldBtnToUpdate)
            
            //The child button with the edit icon is collected above with the name "targetToDoIssueBtn".
            



            //Store the original elements inside elementToDoFieldToUpdate in the case of "tags" and "assignedUsers" in order to restore them in the HTML when you click outside the input and not save the changes
            let originalToDoIssueListItems
            if (elementToDoFieldToUpdate.tagName === "UL") {
                originalToDoIssueListItems = Array.from(elementToDoFieldToUpdate.children)
                console.log("originalToDoIssueListItems", originalToDoIssueListItems)
            }
            
            //Obtain the original textarea text element of the elementToDoFieldToUpdate to update the HTML to the original state
            let originalToDoIssueTextareaItem 
            if (inputToDoFieldForUpdate.tagName === "TEXTAREA") {
                originalToDoIssueTextareaItem = elementToDoFieldToUpdate.innerHTML    
                console.log("originalToDoIssueTextareaItem", originalToDoIssueTextareaItem)
            }
            
            //Obtain the original statusColumn element of the elementToDoFieldToUpdate to update the HTML to the original state
            let originalToDoIssueTitle
            if (elementToDoFieldToUpdate.tagName === "H2") {
                originalToDoIssueTitle = elementToDoFieldToUpdate.innerHTML
                console.log("originalToDoIssueTitle", originalToDoIssueTitle)
            }

            //Obtain the original statusColumn element of the elementToDoFieldToUpdate to update the HTML to the original state
            let originalToDoIssueStatusColumn
            if (inputToDoFieldForUpdate.tagName === "SELECT") {
                originalToDoIssueStatusColumn = elementToDoFieldToUpdate.innerHTML
                console.log("originalToDoIssueStatusColumn", originalToDoIssueStatusColumn)
            }
            //Obtain the original due date of the elementToDoFieldToUpdate to update the HTML to the original state
            let originalToDoDueDate
            if (inputToDoFieldForUpdate.tagName === "INPUT" && inputToDoFieldForUpdate.type === "date") {
                const originalToDoIssueDueDateFormatted = elementToDoFieldToUpdate.innerHTML

                //Parse the chain of text in a date
                const dateParts = originalToDoIssueDueDateFormatted.split(' de ');
                const dayParse = parseInt(dateParts[0]);
                const monthParse = getMonthFromString(dateParts[1]);
                const yearParse = parseInt(dateParts[2]);

                originalToDoDueDate = new Date(yearParse, monthParse - 1, dayParse + 1);
                console.log("originalToDoDueDate", originalToDoDueDate)

                //format the date if it is a date input
                //********************************************************
                // inputToDoFieldForUpdate.value = dateToDoValue.toISOString().slice(0, 10)
            }
            


    
            if (!elementToDoFieldToUpdate || !inputToDoFieldForUpdate) {
                return
            } else {                

                //Calculation of the textarea rendered element height before hiddding for using when blur the input
                let elementToDoFieldUpdateHeight
                const textareaBoundingBoxHeight = document.querySelector(`[data-todo-info="description"]`)
                if (textareaBoundingBoxHeight instanceof HTMLElement) {
                    const elementToDoFieldUpdateRect = textareaBoundingBoxHeight.getBoundingClientRect()
                    elementToDoFieldUpdateHeight = elementToDoFieldUpdateRect.height;
                }

                //Hide the edit button and show the save button
                targetToDoIssueBtn.style.display = "none"
                saveToDoFieldBtnToUpdate.style.display = "block"
                

                //Hide the current element with the todo Data and show the input field to update the date
                elementToDoFieldToUpdate.style.display = "none"                
                inputToDoFieldForUpdate.style.display = "block"
                console.log('Hiding element:', elementToDoFieldToUpdate)
                console.log('Showing input field:', inputToDoFieldForUpdate)

                //Focus the atention in the input element
                inputToDoFieldForUpdate.focus()
                
                //Set the data above in the input field for known what is the original data

                if (inputToDoFieldForUpdate.tagName === "INPUT" && inputToDoFieldForUpdate.type === "date") {
                                
                    inputToDoFieldForUpdate.value = originalToDoDueDate.toISOString().slice(0, 10)

                } else if (inputToDoFieldForUpdate.nodeName === "TEXTAREA") {
                    //for this case hide the father of the elementToDoFieldTo Update to render properly
                    elementToDoFieldToUpdate.parentElement.style.display = "none"

                    //Manage the heights of textarea display
                    const todoField = document.querySelector('.father-todoissue-textarea');                    
                    console.log("father of the textarea:", todoField)
                    if (todoField instanceof HTMLElement) {
                        const textarea = todoField.querySelector('[data-todo-info-origin="description"]');
                        console.log("textarea Element:", textarea)
                        if (textarea) {
                            
                            // Calculate the height of the textarea
                            const textareaHeights = 300
                            console.log("height of the textarea:", textareaHeights)
                            const textareaHeightscroll = (textarea as HTMLElement).scrollHeight;
                            console.log("height of the SCROLL textarea:", textareaHeightscroll)
                            
                            console.log("height of the element rendered:", elementToDoFieldUpdateHeight)

                            
                            // Set the parent element's height to match the textarea's height
                            const textareaHeightTaken = textareaHeights > elementToDoFieldUpdateHeight ? textareaHeights : elementToDoFieldUpdateHeight;
                            console.log("height of the textarea:", textareaHeightTaken)

                            const minHeighForElement = Math.min(textareaHeightTaken, textareaHeights)
                            todoField.style.minHeight = `${minHeighForElement}px`
                            

                            //Set the border of fieldset to transparent
                            const todoFieldset = document.querySelector('.father-todoissue-textarea-fielset') as HTMLElement
                            if (todoFieldset) {
                                todoFieldset.style.border = 'none'
                            }
                        }
                    }
                                        
                    const showedToDoIssueTextarea = originalToDoIssueTextareaItem.replace(/<br>/g, '\n')
                    inputToDoFieldForUpdate.value = showedToDoIssueTextarea
                    
                    //Make sure the element that will display the text preserves newlines and long spaces.
                    elementToDoFieldToUpdate.style.whiteSpace = "pre-wrap"
                    
                    //Updates the textarea's height to match its content.
                    const textareaHeightAfterUpdate = inputToDoFieldForUpdate.scrollHeight;
                    const maxHeightForToDoTextarea = 700
                    if (elementToDoFieldToUpdate.parentElement instanceof HTMLElement) {
                        elementToDoFieldToUpdate.parentElement.style.minHeight = `${Math.min(textareaHeightAfterUpdate, maxHeightForToDoTextarea)}px`;
                    }
        
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
                    const statusTextConversion = originalToDoIssueStatusColumn
                    let statusValue = ""
                    
                    switch (statusTextConversion) {
                        case "Task Ready":
                            statusValue = "backlog"
                            break
                        case "In Progress":
                            statusValue = "wip"
                            break
                        case "In Review":
                            statusValue = "qa"
                            break
                        case "Done":
                            statusValue = "completed"
                            break
                        case "Not Assigned":
                            statusValue = "notassigned"
                            break
                        default:
                            statusValue = "notassigned"
                    }
                    inputToDoFieldForUpdate.value = statusValue
                    // elementToDoFieldToUpdate.textContent = ToDoIssue.getStatusColumnText(statusValue)

                } else {
                    const currentToDoIssueValue = elementToDoFieldToUpdate.innerHTML
                    inputToDoFieldForUpdate.value = currentToDoIssueValue
                    
                }


                // *** What happend if someone click outside the input element***
                // Add a click event to the document to blur and change the display of elements

                if (clickOutsideElementsEvent) {
                    document.removeEventListener('click', clickOutsideElementsEvent);
                }

                // document.addEventListener('click', (e) => {
                clickOutsideElementsEvent = (e) => {
                    if (isEditModeInToDoIssue && e.target !== inputToDoFieldForUpdate && !inputToDoFieldForUpdate.contains(e.target) && e.target !== elementToDoFieldToUpdate && !elementToDoFieldToUpdate.contains(e.target)) {

                        console.log("You are inside click outside the input.Now we shoul close the edit mode and restore original data")
                        inputToDoFieldForUpdate.blur();
                        inputToDoFieldForUpdate.style.display = 'none';
                        elementToDoFieldToUpdate.style.display = 'block';

                        isEditModeInToDoIssue = false

                        //Hide the save button and show the edit button again
                        targetToDoIssueBtn.style.display = "block"
                        saveToDoFieldBtnToUpdate.style.display = "none"

                        //Restore the border of fieldset to transparent
                        const todoFieldset = document.querySelector('.father-todoissue-textarea-fielset') as HTMLElement
                        if (todoFieldset) {
                            todoFieldset.style.border = '1.5px dotted var(--color-fontbase-dark)'
                        }

                        //Restore the continent of elementToDoFieldToUpdate to the original state
                        if (inputToDoFieldForUpdate.tagName === "TEXTAREA") {
                            const showedToDoIssueTextarea = originalToDoIssueTextareaItem.replace(/<br>/g, '\n')                            
                            elementToDoFieldToUpdate.innerText = showedToDoIssueTextarea
                            elementToDoFieldToUpdate.style.whiteSpace = "pre-wrap"

                            elementToDoFieldToUpdate.parentElement.style.display = 'block'

                            const textareaHeightwhenblur = inputToDoFieldForUpdate.scrollHeight;
                            const maxHeightForToDoTextarea = 330
                            elementToDoFieldToUpdate.parentElement.style.minHeight = `${Math.min(textareaHeightwhenblur, maxHeightForToDoTextarea)}px`

                            const fatherTextAreatodoField = document.querySelector('.father-todoissue-textarea');
                            console.log("father of the textarea:", fatherTextAreatodoField)
                            if (fatherTextAreatodoField instanceof HTMLElement) {
                                fatherTextAreatodoField.style.minHeight = ''
                            }

                        }

                        if (elementToDoFieldToUpdate.tagName === "UL") {
                            elementToDoFieldToUpdate.innerHTML = ""
                            originalToDoIssueListItems.forEach((item) => {
                                elementToDoFieldToUpdate.appendChild((item as HTMLElement).cloneNode(true))
                            })
                        }

                        if (elementToDoFieldToUpdate.tagName === "H2") {
                            elementToDoFieldToUpdate.innerHTML = originalToDoIssueTitle
                        }

                        if (inputToDoFieldForUpdate.tagName === "SELECT") {
                            elementToDoFieldToUpdate.innerHTML = originalToDoIssueStatusColumn
                        }

                        if (inputToDoFieldForUpdate.tagName === "INPUT" && inputToDoFieldForUpdate.type === "date") {
                            elementToDoFieldToUpdate = new Date(originalToDoDueDate)
                        }
                    }
                }
                document.addEventListener('click', clickOutsideElementsEvent);



                // ***What happend if someone click the save button element
                if (isEditModeInToDoIssue && e.target !== inputToDoFieldForUpdate && !inputToDoFieldForUpdate.contains(e.target) && e.target !== elementToDoFieldToUpdate && !elementToDoFieldToUpdate.contains(e.target))

                    saveToDoFieldBtnToUpdate.addEventListener('click', (e) => {
                        e.stopPropagation()
                        console.log("target save btn clicked:", saveToDoFieldBtnToUpdate)                        
                        handleSaveToDoIssueBtnClick(parentToDoIssueElement, inputToDoFieldForUpdate, toDoIssueDataKey, elementToDoFieldToUpdate)
                        isEditModeInToDoIssue = false
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


    //Restore the border of fieldset to transparent
    const todoFieldset = document.querySelector('.father-todoissue-textarea-fielset') as HTMLElement
    if (todoFieldset) {
        todoFieldset.style.border = '1.5px dotted var(--color-fontbase-dark)'
    }

    //Obtain the value of the input todo field
    let newToDoIssueFieldValue

    if (inputField) {

        if (inputField instanceof HTMLInputElement) {
            newToDoIssueFieldValue = inputField.value.trim()
        } else if (inputField instanceof HTMLTextAreaElement) {
            newToDoIssueFieldValue = inputField.value.trim()
        } else if (inputField instanceof HTMLSelectElement) {
            if (inputField.multiple) {
                newToDoIssueFieldValue = Array.from(inputField.selectedOptions).map(option => option.value)
            } else {
                newToDoIssueFieldValue = inputField.value
                if (!newToDoIssueFieldValue) {
                    newToDoIssueFieldValue ="notassigned"
                }
            }
        } else if (inputField instanceof HTMLFormElement) {
            newToDoIssueFieldValue = inputField.value.trim()
        } else {
            newToDoIssueFieldValue = inputField.value || inputField.textContent.trim()
        }
    
        console.log('New value for newToDoIssueFieldValue:', newToDoIssueFieldValue)
    } else {
        console.error("inputField is undefined")
    }

    //***Validate the value of the new data***

    //Check the input is not empty
    if (newToDoIssueFieldValue.trim() === "" && !["tags", "assignedUsers"].includes(dataKey)) {
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
            // Show error message
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
            return; // Stop the running if the title already exist
        }
    }



    // Format the date if it's a date field.
    if (inputField.tagName === 'INPUT' && inputField.type === 'date') {
        const newToDoIssueDateFieldValue = new Date(newToDoIssueFieldValue).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
        originalElement.textContent = newToDoIssueDateFieldValue;
        originalElement.style.color = "var(--color-fontbase)"


    } else if (inputField.tagName === 'TEXTAREA') {
        //TextArea remove the height of the element created to displace elements below
        const todoField = document.querySelector('.father-todoissue-textarea')
        if (todoField instanceof HTMLElement) {
            todoField.style.minHeight = `0px`
        }
        //And in Textarea show the father of the elementToDoIssueToUpdate
        originalElement.parentElement.style.display = "block"

        // Replace the original element's value with the new one
        const newToDoIssueFieldValue = sanitizeHtml(inputField.value.trim())
        const newToDoIssueFieldValueWithBr = newToDoIssueFieldValue.replace(/\n/g, '<br>');
        originalElement.innerHTML = newToDoIssueFieldValueWithBr

    } else if (inputField.tagName === 'SELECT') {
        console.log("Esto es lo tomado del select", newToDoIssueFieldValue)

        originalElement.textContent = ToDoIssue.getStatusColumnText(newToDoIssueFieldValue.trim())
        originalElement.style.backgroundColor = ToDoIssue.calculateBackgroundColorColumn(newToDoIssueFieldValue.trim())

    } else if (inputField.tagName === 'INPUT' && inputField.type === 'text' && dataKey ==='tags') {
        //Obtain the elements of the originalElement to update the HTML to the updated version of the tags
        
        let finalToDoIssueListItems
        if (originalElement.tagName === "UL") {
            finalToDoIssueListItems = Array.from(originalElement.children)
            console.log(finalToDoIssueListItems)
        }
        //Add the Li tags to the DOM
        finalToDoIssueListItems.forEach((liElement) => {
        originalElement.appendChild(liElement)            
        })
    
    } else {

        // Replace the original element's value with the new one
        originalElement.textContent = newToDoIssueFieldValue;
        console.log('Updated element:', originalElement)

    }

    // Hide the input field and show the original element
    inputField.blur()
    inputField.style.display = 'none'
    originalElement.style.display = 'block'

    //Hide the save button and and show the edit button
    const saveToDoFieldBtnToUpdate = parentElement.querySelector('.todo-icon-edit.svg-save')
    console.log("Save Btn:", saveToDoFieldBtnToUpdate)
    saveToDoFieldBtnToUpdate.style.display = "none"

    const editToDoFieldBtnToUpdate = parentElement.querySelector('.todo-icon-edit.svg-edit')
    console.log("Edit Btn:", editToDoFieldBtnToUpdate)
    editToDoFieldBtnToUpdate.style.display = "block"

    //*** Store the new value inside your data structure ***

    // Get the ToDoIssueId of the updated element. It is stored in the button element inside the parentElement
    const todoIssueId = parentElement.querySelector(".todo-icon-edit.svg-edit").dataset.toDoIssueId;

    // Look for the project that contain this ToDoIssue Id. We will take advantage of the singleton designed pattern for ProjectList
    const project = getProjectByToDoIssueId(todoIssueId);
    console.log("project", project)

    // Update ToDoIssue data 
    if (project) {
        const todoList = project.todoList;
        const todoIssueIndex = todoList.findIndex((todoIssue) => (todoIssue as any).id === todoIssueId);

        if (todoIssueIndex !== -1) {
            const todoIssueDataKeyToUpdate = todoList[todoIssueIndex]
            //Updates the data of the ToDo Issue based on the type of field being updated. 
            switch (dataKey) {
                case "title":
                    todoIssueDataKeyToUpdate.title = newToDoIssueFieldValue;
                    break;
                case "description":
                    todoIssueDataKeyToUpdate.description = newToDoIssueFieldValue;
                    break;
                case "dueDate":
                    todoIssueDataKeyToUpdate.dueDate = new Date(newToDoIssueFieldValue);
                    break;
                case "statusColumn":
                    todoIssueDataKeyToUpdate.statusColumn = newToDoIssueFieldValue;

                    //Update as well the value of the backgroundColorColumn insise the todoIssue
                    (todoIssueDataKeyToUpdate as any).backgroundColorColumn = ToDoIssue.calculateBackgroundColorColumn(newToDoIssueFieldValue);
                    break;


                    break;
                case "tags":
                    // Actualiza la lista de tags
                    todoIssueDataKeyToUpdate.tags = Array.from(originalElement.children).map((tag) => tag.textContent);
                    break;
                default:
                    console.log("No se ha implementado la actualización para este campo");
            }

            // Actualiza la lista de ToDo Issues del proyecto
            project.todoList[todoIssueIndex] = todoIssueDataKeyToUpdate;
            console.log("todoIssueDataKeyToUpdate", todoIssueDataKeyToUpdate)
            console.log("todoIssueIndex", todoIssueIndex)
            console.log("todoList", todoList)
        }

        // Update the UI (re-render todolist in the ProjectDetailPage)
        const toDoIssue = getToDoIssue(todoList, todoIssueId)
        console.log("toDoIssue:", toDoIssue)
        if (toDoIssue) {
            const newUiToDoIssueElement = updateToDoIssueUi(toDoIssue)
            console.log("newUiToDoIssueElement:", newUiToDoIssueElement)
            const todoIssueOriginal = todoList[todoIssueIndex]
            todoIssueOriginal.ui = newUiToDoIssueElement            
        }
        // Update the rendered list of Ui List inside the project detail page
        const pageWIP = localStorage.getItem("pageWIP")
        if (pageWIP === "project-details") {

            renderToDoIssueList(project.todoList)
        } else if (pageWIP === "todo-page") {
            renderToDoIssueList(project.todoList)
            setUpToDoBoard(project.todoList)
        }
    }
}




// Search funcionality for TodoIssues inside todoList

let filteredTodos: ToDoIssue[] = [];
let currentSearchIndex: number = -1;


export function searchTodoIssues(searchText: string): void {
    // Get active project
    const selectedProjectId = localStorage.getItem("selectedProjectId");
    if (!selectedProjectId) return;

    const projectManager = ProjectsManager.getInstance();
    const activeProject = projectManager.getProject(selectedProjectId);
    if (!activeProject) return;

    const searchLower = searchText.toLowerCase();

    // Filter by title/description/tags/assignedUsers/statusColumn
    filteredTodos = activeProject.todoList.filter(todo =>
        todo.title.toLowerCase().includes(searchLower) ||
        todo.description.toLowerCase().includes(searchLower) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        todo.assignedUsers.some(user => user.toLowerCase().includes(searchLower)) ||
        ToDoIssue.getStatusColumnText(todo.statusColumn).toLowerCase().includes(searchLower)
    );


    const currentPage = localStorage.getItem("pageWIP");

    if (currentPage === "project-details") {
        currentSearchIndex = -1;
        updateTodoSearchResults();
    } else if (currentPage === "todo-page") {
        if (filteredTodos.length > 0) {
            organizeFilteredToDoIssuesByStatusColumns(filteredTodos);
        } else {
            // If no results, restore all ToDo Issues
            const columns = document.querySelectorAll('.todo-column-list');
            columns.forEach(column => {
                column.innerHTML = ''; // Clear all column items
            });
          
        }
    }
        
}


function updateTodoSearchResults(): void {
    const todoListContainer = document.getElementById('details-page-todo-list');
    if (!todoListContainer) return;

    // Clear the container
    todoListContainer.innerHTML = '';

    // Show filtered results
    filteredTodos.forEach((todo, index) => {
        const todoElement = todo.ui.cloneNode(true) as HTMLElement;
        if (index === currentSearchIndex) {
            todoElement.classList.add('selected');
            todoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Recreate the event listener for the todo
        todoElement.addEventListener('click', () => {
            showPageContent("todo-details", "flex");
            setDetailsIssuePage(todo);
        });

        todoListContainer.appendChild(todoElement);
    });

    // Update results counter
    const counterElement = document.getElementById('todolist-search-counter') as HTMLElement;
    if (counterElement) {
        updateTodoCounter(filteredTodos, counterElement )
        
    }
}


export function updateTodoCounter(filteredTodos: IToDoIssue[], counterElement: HTMLElement) {
    // Get the total number of todos for the current project
    const selectedProjectId = localStorage.getItem("selectedProjectId");
    
    // Check that selectedProjectId is not null
    if (!selectedProjectId) {
        throw new Error("No project selected")
        
    }

    const projectManager = ProjectsManager.getInstance();
    const activeProject = projectManager.getProject(selectedProjectId);
    const totalTodos = activeProject ? activeProject.todoList.length : 0;

    // Build the message with both numbers
    if (filteredTodos.length === 0 && totalTodos > 0) {
        counterElement.textContent = `${totalTodos} ${totalTodos === 1 ? 'Task' : 'Tasks'} in total`;
    } else {
        counterElement.textContent = `${filteredTodos.length} ${filteredTodos.length === 1 ? 'Task' : 'Tasks'} of ${totalTodos}`;
    }
}

export function navigateSearchResults(direction: 'up' | 'down'): void {
    if (filteredTodos.length === 0) return;

    if (direction === 'up') {
        currentSearchIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : filteredTodos.length - 1;
    } else {
        currentSearchIndex = currentSearchIndex < filteredTodos.length - 1 ? currentSearchIndex + 1 : 0;
    }

    updateTodoSearchResults();
}

export function selectCurrentSearchResult(): void {
    if (currentSearchIndex >= 0 && currentSearchIndex < filteredTodos.length) {
        const selectedTodo = filteredTodos[currentSearchIndex];
        showPageContent("todo-details", "flex");
        setDetailsIssuePage(selectedTodo);
        clearSearchAndResetList();
    }
}


// New function to reinitialize the search state
export function resetSearchState(counterElement: HTMLElement) {
    filteredTodos = [];
    currentSearchIndex = -1;

    // Update only the counter, showing the total number of tasks
    
    const selectedProjectId = localStorage.getItem("selectedProjectId");
    if (selectedProjectId) {
        const projectManager = ProjectsManager.getInstance();
        const activeProject = projectManager.getProject(selectedProjectId);
        const totalTodos = activeProject ? activeProject.todoList.length : 0;
        counterElement.textContent = `${totalTodos} ${totalTodos === 1 ? 'Task' : 'Tasks'} in total`;
    }
}

// Function to clear the search input and reset the list
export function clearSearchAndResetList() {
    const searchInputDetailsPage = document.getElementById('todo-search-in-Project-Details') as HTMLInputElement;
    const searchInputToDoPage = document.getElementById('todo-search-in-Todo-Page') as HTMLInputElement;
    if (searchInputDetailsPage) {
        searchInputDetailsPage.value = '';
    }
    if (searchInputToDoPage) {
        searchInputToDoPage.value = '';
    }
    searchTodoIssues('');
}

// Export the function to be able to call it from the aside button to open ProjectDetails
export function setupProjectDetailsSearch() {

    // Reinitialize only the search state
    const counterElement = document.getElementById('todolist-search-counter') as HTMLElement
    if (counterElement) {
        resetSearchState(counterElement);
    }

    const searchInput = document.getElementById('todo-search-in-Project-Details') as HTMLInputElement;
    const btnArrowUp = document.getElementById('btn-todo-arrowup');
    const btnArrowDown = document.getElementById('btn-todo-arrowdown');


    if (searchInput) {
        // Clear the input
        searchInput.value = '';

        // Remove previous listener if it exists
        const newSearchInput = searchInput.cloneNode(true) as HTMLInputElement;
        searchInput.parentNode?.replaceChild(newSearchInput, searchInput);

        // Add new listener for the search
        newSearchInput.addEventListener('input', (e) => {
            searchTodoIssues((e.target as HTMLInputElement).value);
        });

        // Add listener for navigation keys
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (newSearchInput.value.trim() === '') return; // Only if there is text in the search

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateSearchResults('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateSearchResults('down');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                selectCurrentSearchResult();
                
            }
        });
        // Add listeners for navigation buttons
        if (btnArrowUp) {
            btnArrowUp.addEventListener('click', () => {
                if (newSearchInput.value.trim() === '') return;
                navigateSearchResults('up');
            });
        }

        if (btnArrowDown) {
            btnArrowDown.addEventListener('click', () => {
                if (newSearchInput.value.trim() === '') return;
                navigateSearchResults('down');
            });
        }
    }
    // Add event listener for clicks on all issues
    const todoListContainer = document.getElementById('details-page-todo-list');
    if (todoListContainer) {
        todoListContainer.addEventListener('click', (e) => {
            const todoItem = (e.target as HTMLElement).closest('.todo-item');
            if (todoItem) {
                clearSearchAndResetList();
            }
        });
    }
}


