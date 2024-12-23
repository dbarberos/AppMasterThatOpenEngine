// import { updateAsideButtonsState } from "../index.tsx"
import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"
import { updateAsideButtonsState } from "./HTMLUtilities.ts";

import dragula from 'dragula';

import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage, deleteToDoIssue, searchTodoIssues, clearSearchAndResetList, updateTodoCounter, resetSearchState, } from "./ToDoManager";

import { ToDoIssue, IToDoIssue } from "./ToDoIssue"
import { MessagePopUp } from "./MessagePopUp"



localStorage.setItem("selectedProjectId", "")
//Recover the selectedProjectForToDoBoard fom the localstorage for set up the ToDo Board.
document.addEventListener("DOMContentLoaded", () => {
    const storedProjectId = localStorage.getItem("selectedProjectId");

    if (storedProjectId) {
        const selectProjectForToDoBoard = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement;
        const selectProjectForUsersPage = document.getElementById("projectSelectedUsersPage") as HTMLSelectElement;
        if (selectProjectForToDoBoard && selectProjectForUsersPage) {
            const projectManager = ProjectsManager.getInstance();
            const projectsList = projectManager.list;
            const valueInsideSelectedProject = projectsList.find((project) => project.id === storedProjectId)
            if (valueInsideSelectedProject) {                
                selectProjectForToDoBoard.value = storedProjectId;
                selectProjectForUsersPage.value = storedProjectId
                console.log("Project Recover:", storedProjectId)

            }
        }
    }
})

//Select a project for the ToDoBoard with the select input element inside the header
export function setUpToDoBoard(selectedProjectId?) {
    // Get the project list
    const projectManager = ProjectsManager.getInstance()
    const projectsList = projectManager.list
    const storedProject = projectsList.find((project) => project.id === selectedProjectId)

    const selectProjectForToDoBoard = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement

    setupProjectSelect(projectsList, selectedProjectId, )    
    
    //*** Get the list of todoIssue from the project an organize it ***
    // Get the stored project ID and project from local storage
    const storedProjectId = localStorage.getItem("selectedProjectId");
    if (storedProjectId) {
        console.log("Organizing ToDo issues");
        organizeToDoIssuesByStatusColumns(storedProjectId)
        console.log("ToDo issues organized, initializing drag and drop")
        initializeDragAndDrop();// Initialize drag and drop after organizing
    }
}


function setupProjectSelect(projectsList: Project[], selectedProjectId?: string) {
    const select = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement;

    if (!select) {
        console.log("Error in getting the select ToDo Board")
        return
    }

    select.innerHTML = ""

    // Add a default option to select a project
    const option = document.createElement("option");
    option.value = "";
    option.text = "Select a project"
    // option.disabled = true
    option.style.color = "var(--color-fontbase-dark)"
    select.appendChild(option);

    // Populate the select element with project options
    projectsList.forEach((project) => {
        const option = document.createElement("option");
        option.value = project.id;
        option.text = project.name;
        select.appendChild(option)

        // Get the stored project ID and project from local storage
        const storedProjectId = localStorage.getItem("selectedProjectId");


        // Select the project corresponding to the stored project ID
        if (storedProjectId) {
            select.value = storedProjectId
            // selectedProject = projectsList.find((project) => project.id === storedProjectId)
        }
    })

    //Clean the columns of previous ToDo Issues 
    const columnas = document.querySelectorAll(".todo-column-list");
    columnas.forEach((column) => {
        column.innerHTML = ""
    })

    //Listen when the user change the Project inside the ToDo Board

    select.addEventListener("change", () => {
        const changedProjectId = select.value

        // Reset the number of task in the counter of todo Issues 
        const counterElementTodoPage = document.getElementById('todolist-search-counter-ToDoPage') as HTMLElement
        
        if (counterElementTodoPage) {
            resetSearchState(counterElementTodoPage)
        }        

        //Clean the search input
        clearSearchAndResetList()

        //Save the Id of the selected project in the local storage
        localStorage.setItem("selectedProjectId", changedProjectId)
        updateAsideButtonsState()
        

        // Ahora puedes utilizar la variable selectedProjectIdse actualiza usando la función setUpToDoBoard 
        console.log("selectedProjectId", changedProjectId)


        
        //Get the list of todoIssue from the project an organize it
        console.log("Organizing ToDo issues");
        organizeToDoIssuesByStatusColumns(changedProjectId)


                //Render the columns of Issues
        console.log("ToDo issues organized, initializing drag and drop")
        initializeDragAndDrop();
    })
}


//Create diferents arrays of todoIssues according to the statusColum value

export function organizeToDoIssuesByStatusColumns(projectId) {
    const projectManager = ProjectsManager.getInstance();
    const project = projectManager.getProject(projectId);
    
    if (!project) {
        console.error("project not found for ID:", projectId)
        return
    }
    
    console.log("I am inside organize and render todolist")
    console.log("ProjectId", projectId)
    const toDoIssues = project.todoList

    // Clean the columns of previous ToDo Issues solo si es necesario
    const columns = document.querySelectorAll(".todo-column-list");
    columns.forEach((column) => {
        column.innerHTML = ""
    })

    // Create an object to store the arrays for each status column
    const statusColumns = {}
    // Iterate over the todoList and group them by status column
    toDoIssues.forEach((toDoIssue) => {
        // Check if statusColumn is null, undefined, or empty
        const status = toDoIssue.statusColumn === null ? "notassigned" : toDoIssue.statusColumn;
        if (status) {
            const columnId = `todo-column-${status.toLowerCase()}`;
            const column = document.getElementById(columnId)

            // If the array for the status column doesn't exist, create it
            if (!statusColumns[status]) {
                statusColumns[status] = [];
            }
        

            if (column) {
                // const existingTodo = column.querySelector(`[data-todo-id="${toDoIssue.id}"]`);
                // if (!existingTodo) {
                renderToDoIssueListInsideProject(toDoIssue);
                if (toDoIssue.ui instanceof HTMLElement) {
                    column.appendChild(toDoIssue.ui);
                }
                // } else {
                //     updateSingleTodoUI(toDoIssue, columnId);
                // }
            }
        }
    })

    console.log("Organized ToDoIssues by statusColumns: ", statusColumns)

    // Set the data-projectId attribute with the unique ID of the proyect in the button of new To-Do
    const projectToDoDatasetAttributeId = document.getElementById("new-todo-issue-btn2")

    if (projectToDoDatasetAttributeId) {
        projectToDoDatasetAttributeId.dataset.projectId = projectId
    }
}

let dragulaInstance: dragula.Drake | null = null

export function initializeDragAndDrop() {
    console.log("Initializing Drag and Drop");
    // If an instance already exists, destroy it
    if (dragulaInstance) {
        console.log("Destroying previous Dragula instance");
        dragulaInstance.destroy();
    }

    const columns = [
        'todo-column-backlog',
        'todo-column-wip',
        'todo-column-qa',
        'todo-column-completed',
        'todo-column-notassigned'
    ].map(id => {
        const el = document.getElementById(id)
        console.log(`Column ${id}:`, el);
        return el;
    }).filter((el): el is HTMLElement => el !== null);

    const trashBtn = document.getElementById('trash-drop-btn');
    if (trashBtn) {
        columns.push(trashBtn);
    }
    console.log("Columns found:", columns.length)

    dragulaInstance = dragula(columns, {
        moves: (el, container, handle) => {
            console.log('Move check started');
            if (!handle) {
                console.log('Handle is undefined');
                return false;
            }

            const moveHandler = handle.closest('.handler-move');
            console.log('Found move handler:', moveHandler);

            return moveHandler !== null;
        },
        accepts: (el, target, source, sibling) => {
            // Allow dropping on the trash button
            if (target && target.id === 'trash-drop-btn') {
                return true;
            }
            // Allow dropping on the trash button
            return true;
        },
        direction: 'vertical',
        revertOnSpill: true,
        // Add these options to improve the visual experience
        mirrorContainer: document.body,
        removeOnSpill: false

    });

    console.log("Dragula instance created:", dragulaInstance)

    // Event drop
    dragulaInstance.on('drop', (el, target, source) => {
        console.log('Drop event triggered');
        console.log('Before update - todos in board:', document.querySelectorAll('[data-todo-id]').length);

        if (!target) return;

        if (target.id === "trash-drop-btn") {
            handleTodoDelete(el) 
            return
        }

        const todoId = el.getAttribute('data-todo-id');
        const newColumnId = target.id;

        if (todoId && newColumnId) {   
            console.log('Getting current board state...');
            // Get a "snapshot" of the current board state
            const currentBoardState = getCurrentBoardState();
            console.log('Board state captured. Updating todo...');
            
            // Update the state of the moved todo and the UI
            updateToDoStatusAndUI(todoId, newColumnId);
            console.log('Todo updated. Restoring board state...');

            // Restore the other todos
            restoreBoardState(currentBoardState, todoId);
            console.log('Board state restored.');

            // Remove any existing duplicates before updating
            setTimeout(() => {
                removeDuplicateTodos(todoId);
            }, 0);

            

        }
        console.log('After update - todos in board:', document.querySelectorAll('[data-todo-id]').length);
        logBoardState();
    });

    // Events for visual effects
    dragulaInstance.on('drag', (el) => {
        el.classList.add('is-dragging');
    });

    dragulaInstance.on('dragend', (el) => {
        el.classList.remove('is-dragging');
    });
    dragulaInstance.on('over', (el, container, source) => {
        if (container.id === 'trash-drop-btn') {
            container.classList.add('drag-over');
        }
    });

    dragulaInstance.on('out', (el, container, source) => {
        if (container.id === 'trash-drop-btn') {
            container.classList.remove('drag-over');
        }
    });   




}

function handleTodoDelete(el: Element) {
    const todoId = el.getAttribute('data-todo-id');
    if (todoId) {
        // Create and show the MessagePopUp for confirmation
        const popupDeleteToDoIssueConfirmation = new MessagePopUp(
            document.body,
            "warning",
            "Confirm ToDo Deletion",
            "Are you sure you want to delete this ToDo Issue? This action cannot be undone.",
            ["Yes, delete", "Cancel"]
        );

        const buttonCallbacks = {
            "Yes, delete": () => {
                const projectId = localStorage.getItem("selectedProjectId");
                if (projectId) {
                    const projectManager = ProjectsManager.getInstance();
                    const project = projectManager.getProject(projectId);
                    if (project) {
                        // Remove the todoIssue from the project
                        project.todoList = deleteToDoIssue(project.todoList, todoId);

                        // Update the project in the ProjectManager
                        projectManager.updateProject(project.id, project);

                        // Remove the visual element
                        el.remove();

                        // Update the board UI
                        setUpToDoBoard(projectId);

                        // Reset the counter after deletion
                        const counterElement = document.getElementById('todolist-search-counter-ToDoPage') as HTMLElement;
                        if (counterElement) {
                            resetSearchState(counterElement);
                        }
                    }
                }
                popupDeleteToDoIssueConfirmation.closeMessageModal();
            },
            "Cancel": () => {
                console.log("User cancelled the deletion.");
                // Return the element to its original column
                setUpToDoBoard(localStorage.getItem("selectedProjectId") || "");
                popupDeleteToDoIssueConfirmation.closeMessageModal();
            }
        };

        popupDeleteToDoIssueConfirmation.showNotificationMessage(buttonCallbacks);
    }
}



function getCurrentBoardState() {
    const state = new Map();
    const columns = document.querySelectorAll('.todo-column-list');
    columns.forEach(column => {
        const todos = Array.from(column.querySelectorAll('[data-todo-id]'));
        state.set(column.id, todos.map(todo => todo.cloneNode(true) as HTMLElement));
    });
    return state;
}

function restoreBoardState(state: Map<string, HTMLElement[]>, excludeTodoId: string) {
    const projectManager = ProjectsManager.getInstance();
    const projectId = localStorage.getItem("selectedProjectId");
    const project = projectManager.getProject(projectId || '');

    if (!project) return;

    state.forEach((todos, columnId) => {
        const column = document.getElementById(columnId);
        if (column) {
            todos.forEach(todo => {
                const todoId = todo.getAttribute('data-todo-id');
                if (todoId !== excludeTodoId) {
                    const existingTodo = column.querySelector(`[data-todo-id="${todoId}"]`);
                    if (!existingTodo) {
                        // Find the corresponding todo in the project
                        const todoData = project.todoList.find(t => t.id === todoId);
                        if (todoData) {
                            // Add event listeners before adding the element
                            todo.addEventListener("click", () => {
                                showPageContent("todo-details", "flex");
                                setDetailsIssuePage(todoData);
                            });
                        }
                        column.appendChild(todo);
                    }
                }
            });
        }
    });
}

function removeDuplicateTodos(todoId: string) {
    const todos = Array.from(document.querySelectorAll(`[data-todo-id="${todoId}"]`));
    if (todos.length > 1) {
        console.log(`Found ${todos.length} instances of todo ${todoId}. Removing duplicates.`);
        // Find the most recent element (the one in the new column
        const updatedTodo = todos.find(todo => {
            const parent = todo.parentElement;
            if (!parent) return false;

            // Verify if the todo is in the correct column according to its visual state
            const currentColumn = parent.id;
            const statusSpan = todo.querySelector('.todo-tags[style*="background-color"]') as HTMLElement;

            if (!statusSpan) return false;
            
            const statusText = statusSpan.textContent?.toLowerCase() || '';
            
            // Special handling for "notassigned"
            if (currentColumn === 'todo-column-notassigned' || statusText === 'not assigned') {
                return true;
            }

            return currentColumn.includes(statusText) || statusText.includes(currentColumn.replace('todo-column-', ''));
        });

        if (updatedTodo) {
            // Remove all elements except the updated one
            todos.forEach(todo => {
                if (todo !== updatedTodo && todo.parentNode) {
                    todo.parentNode.removeChild(todo);
                    console.log(`Removed outdated instance of todo ${todoId}`);
                }
            });
        } else {
            // If we can't identify the updated element, keep the last one
            const lastTodo = todos[todos.length - 1];
            todos.forEach(todo => {
                if (todo !== lastTodo && todo.parentNode) {
                    todo.parentNode.removeChild(todo);
                    console.log(`Removed duplicate instance of todo ${todoId}`);
                }
            });
        }
    } else {
        console.log(`No duplicates found for todo ${todoId}`);
    }
}

function updateToDoStatusAndUI(todoId: string, newColumnId: string) {
    const projectId = localStorage.getItem("selectedProjectId");
    if (!projectId) {
        console.error('No selected project ID found in localStorage');
        return;
    }

    const projectManager = ProjectsManager.getInstance();
    const project = projectManager.getProject(projectId);

    if (!project) return;

    const todo = project.todoList.find(todo => todo.id === todoId);
    if (!todo) {
        console.error(`Todo with id ${todoId} not found in project`)
        return;
    }

    try {
        // Update the todo's status
        console.log(`Updating todo ${todoId}. Old status: ${todo.statusColumn}, New column: ${newColumnId}`)
        const newStatus = newColumnId.replace('todo-column-', '');
        if (!newStatus) {
            console.error('Invalid column ID format:', newColumnId);
            return;
        }

        todo.statusColumn = newStatus;
        (todo as any).backgroundColorColumn = ToDoIssue.calculateBackgroundColorColumn(newStatus);

        // Update the project
        projectManager.updateProject(projectId, project);

        // Update the todo's UI
        const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`) as HTMLElement;
        if (todoElement) {
            updateTodoVisuals(todoElement, todo);

            // Move the element to the new column
            const newColumn = document.getElementById(newColumnId);
            if (newColumn) {
                newColumn.appendChild(todoElement);
            }
            // Re-add the event listeners to the element
            todoElement.addEventListener("click", () => {
                showPageContent("todo-details", "flex");
                setDetailsIssuePage(todo);
            });
        }

        console.log(`Todo ${todoId} updated successfully in column ${newStatus}`);

    } catch (error) {
        console.error('Error updating todo:', error);
    }
    
}


function updateTodoVisuals(todoElement: HTMLElement, todo: IToDoIssue) {
    const colorColumn = todoElement.querySelector('.todo-color-column') as HTMLElement;
    if (colorColumn) {
        colorColumn.style.backgroundColor = (todo as any).backgroundColorColumn;
    }

    const todoCard = todoElement.querySelector('.todo-card') as HTMLElement;
    if (todoCard) {
        todoCard.style.borderLeftColor = (todo as any).backgroundColorColumn;
    }

    const statusSpan = todoElement.querySelector('.todo-tags[style*="background-color"]') as HTMLElement;
    if (statusSpan) {
        statusSpan.style.backgroundColor = (todo as any).backgroundColorColumn;
        statusSpan.textContent = ToDoIssue.getStatusColumnText((todo as any).statusColumn);
    }
}

// Función auxiliar para verificar el estado actual del tablero
function logBoardState() {
    const columns = document.querySelectorAll('.todo-column-list');
    columns.forEach(column => {
        const todos = column.querySelectorAll('[data-todo-id]');
        console.log(`Column ${column.id}: ${todos.length} todos`);
        todos.forEach(todo => {
            console.log(`- Todo ${todo.getAttribute('data-todo-id')}`);
        });
    });
}




// Search funcionality for TodoIssues inside todo-page

const searchToDoPageInput = document.getElementById('todo-search-in-Todo-Page') as HTMLInputElement;
if (searchToDoPageInput) {
    searchToDoPageInput.addEventListener('input', (e) => {
        const searchText = (e.target as HTMLInputElement).value.trim();
        setupTodoPageSearch(searchText);
    });
}

// Function to configure the search in the ToDo page

export function setupTodoPageSearch(searchText: string) {

    // Reinitialize only the search state
    const counterElement = document.getElementById('todolist-search-counter-ToDoPage') as HTMLElement
    if (counterElement) {
        resetSearchState(counterElement)
    }

    
    const projectManager = ProjectsManager.getInstance();
    const activeProjectId = localStorage.getItem("selectedProjectId");
    const project = projectManager.getProject(activeProjectId || '');
    if (project) {           

        if (searchText) {
            searchTodoIssues(searchText);
        } else {
            // If there is no text, reset the task list
            console.log("Restored all ToDo issues")
            organizeToDoIssuesByStatusColumns(activeProjectId); // Call with an empty text to show all ToDo Issues                
            
        }
    }  


    // Add event listener for clicks on todo issues
    const todoListContainer = document.getElementById('todo-content'); 
    if (todoListContainer) {
        todoListContainer.addEventListener('click', (e) => {
            const todoItem = (e.target as HTMLElement).closest('.todo-item');
            if (todoItem) {
                clearSearchAndResetList();
            }
        });
    }
}


export function organizeFilteredToDoIssuesByStatusColumns(filteredTodos: IToDoIssue[]) {
    // Clear previous task columns
    const columns = document.querySelectorAll('.todo-column-list');
    columns.forEach((column) => {
        column.innerHTML = "";
    });

    // Organize ToDo Issues filtered by their status
    // Create an object to store the arrays for each status column
    const statusColumns = {}
    // Iterate over the todoList and group them by status column
    filteredTodos.forEach((toDoIssue) => {
        // Check if statusColumn is null, undefined, or empty
        const status = toDoIssue.statusColumn === null ? "notassigned" : toDoIssue.statusColumn 
        if (status) {
            const columnId = `todo-column-${status.toLowerCase()}`;
            const column = document.getElementById(columnId);

            // If the array for the status column doesn't exist, create it
            if (!statusColumns[status]) {
                statusColumns[status] = [];
            }

            if (column) {
                renderToDoIssueListInsideProject(toDoIssue);
                if (toDoIssue.ui instanceof HTMLElement) {
                    column.appendChild(toDoIssue.ui);
                }
            }
        }
    });
    // Update result counter after organizing
    const counterElement = document.getElementById('todolist-search-counter-ToDoPage') as HTMLElement;
    if (counterElement) {
        updateTodoCounter(filteredTodos, counterElement)
    }
}


// Function to update the displayed task list
function updateTodoSearchResults(filteredTodos: IToDoIssue[]) {
    const todoListContainer = document.getElementById('todo-column-backlog'); 
    if (!todoListContainer) return;

    // Clear current container
    todoListContainer.innerHTML = '';

    // Render filtered ToDo Issues
    filteredTodos.forEach(todo => {
        renderToDoIssueListInsideProject(todo);
        todoListContainer.appendChild(todo.ui);
    });

    // Update results counter
    const counterElement = document.getElementById('todolist-search-counter') as HTMLElement;
    if (counterElement) {
        counterElement.textContent = `${filteredTodos.length} ${filteredTodos.length === 1 ? 'Task' : 'Tasks'} found`;
    }
}
