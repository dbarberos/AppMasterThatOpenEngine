import { updateAsideButtonsState } from "../index.ts"
import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"

import dragula from 'dragula';

import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage } from "./ToDoManager";
import { ToDoIssue, IToDoIssue } from "./ToDoIssue"
import { MessagePopUp } from "./MessagePopUp"


localStorage.setItem("selectedProjectId", "")
//Recover the selectedProjectForToDoBoard fom the localstorage for set up the ToDo Board.
document.addEventListener("DOMContentLoaded", () => {
    const storedProjectId = localStorage.getItem("selectedProjectId");

    if (storedProjectId) {
        const selectProjectForToDoBoard = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement;
        if (selectProjectForToDoBoard) {
            const projectManager = ProjectsManager.getInstance();
            const projectsList = projectManager.list;
            const valueInsideSelectedProject = projectsList.find((project) => project.id === storedProjectId)
            if (valueInsideSelectedProject) {
                const selectProjectForToDoBoard = document.getElementById("projectSelectedToDoBoard") as HTMLSelectElement
                selectProjectForToDoBoard.value = storedProjectId;
                console.log("Project Recover:", storedProjectId);
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

    setupProjectSelect(projectsList, selectedProjectId)
    
    
    //*** Get the list of todoIssue from the project an organize it ***
    // Get the stored project ID and project from local storage
    const storedProjectId = localStorage.getItem("selectedProjectId");
    if (storedProjectId) {
        console.log("Organizing ToDo issues");
        organizeToDoIssuesByStatusColumns(storedProjectId)
        console.log("ToDo issues organized, initializing drag and drop")
        initializeDragAndDrop();// Inicializar drag and drop después de organizar
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

function organizeToDoIssuesByStatusColumns(projectId) {
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
    // Si ya existe una instancia, destruirla
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
        accepts: (el, target) => {
            return true;
        },
        direction: 'vertical',
        revertOnSpill: true
    });

    console.log("Dragula instance created:", dragulaInstance)

    // Evento drop
    dragulaInstance.on('drop', (el, target, source) => {
        console.log('Drop event triggered');
        console.log('Before update - todos in board:', document.querySelectorAll('[data-todo-id]').length);

        if (!target) return;

        const todoId = el.getAttribute('data-todo-id');
        const newColumnId = target.id;

        if (todoId && newColumnId) {   
            console.log('Getting current board state...');
            // Obtener una "foto" del estado actual del tablero
            const currentBoardState = getCurrentBoardState();
            console.log('Board state captured. Updating todo...');
            
            // Actualizar el estado del todo movido y la UI
            updateToDoStatusAndUI(todoId, newColumnId);
            console.log('Todo updated. Restoring board state...');

            // Restaurar los otros todos
            restoreBoardState(currentBoardState, todoId);
            console.log('Board state restored.');

            // Remover cualquier duplicado existente antes de actualizar
            setTimeout(() => {
                removeDuplicateTodos(todoId);
            }, 0);

            

        }
        console.log('After update - todos in board:', document.querySelectorAll('[data-todo-id]').length);
        logBoardState();
    });

    // Eventos para efectos visuales
    dragulaInstance.on('drag', (el) => {
        el.classList.add('is-dragging');
    });

    dragulaInstance.on('dragend', (el) => {
        el.classList.remove('is-dragging');
    });
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
                        // Encontrar el todo correspondiente en el proyecto
                        const todoData = project.todoList.find(t => t.id === todoId);
                        if (todoData) {
                            // Agregar event listeners antes de añadir el elemento
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
        // Encontrar el elemento más reciente (el que está en la nueva columna)
        const updatedTodo = todos.find(todo => {
            const parent = todo.parentElement;
            if (!parent) return false;

            // Verificar si el todo está en la columna correcta según su estado visual
            const statusSpan = todo.querySelector('.todo-tags[style*="background-color"]') as HTMLElement;
            if (!statusSpan) return false;

            const currentColumn = parent.id;
            const statusText = statusSpan.textContent?.toLowerCase() || '';
            return currentColumn.includes(statusText) || statusText.includes(currentColumn.replace('todo-column-', ''));
        });

        if (updatedTodo) {
            // Eliminar todos los elementos excepto el actualizado
            todos.forEach(todo => {
                if (todo !== updatedTodo && todo.parentNode) {
                    todo.parentNode.removeChild(todo);
                    console.log(`Removed outdated instance of todo ${todoId}`);
                }
            });
        } else {
            // Si no podemos identificar el elemento actualizado, mantener el último
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

function verifyAndCorrectTodoPositions() {
    const projectId = localStorage.getItem("selectedProjectId");
    if (!projectId) return;

    const projectManager = ProjectsManager.getInstance();
    const project = projectManager.getProject(projectId);
    if (!project) return;

    let projectUpdated = false;

    // Primero, eliminar todos los elementos todo del DOM
    document.querySelectorAll('[data-todo-id]').forEach(el => el.remove());

    // Luego, recrear todos los todos en sus columnas correctas
    project.todoList.forEach((todoData: IToDoIssue) => {
        if (!todoData) {
            console.warn(`Todo inválido encontrado en el proyecto`);
            return;
        }

        if (!todoData.statusColumn) {
            console.warn(`Todo sin statusColumn: ${JSON.stringify(todoData)}`);
            todoData.statusColumn = "notassigned";
            todoData.backgroundColorColumn = ToDoIssue.calculateBackgroundColorColumn("notassigned");
            projectUpdated = true;
        }

        const columnId = `todo-column-${todoData.statusColumn.toLowerCase()}`;
        const column = document.getElementById(columnId);

        if (column) {
            const todo = new ToDoIssue(todoData);
            if (todo.ui instanceof HTMLElement) {
                column.appendChild(todo.ui);
            } else {
                console.error(`UI element not created for todo ${todo.id}`);
            }
        } else {
            console.warn(`Columna no encontrada para el todo ${todoData.id}`);
        }
    });

    if (projectUpdated) {
        projectManager.updateProject(projectId, project);
        console.log('Proyecto actualizado debido a todos corregidos');
    }

    console.log('Todos verificados y corregidos');
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
    if (!todo) return;

    try {
        // Actualizar el estado del todo
        const newStatus = newColumnId.replace('todo-column-', '');
        if (!newStatus) {
            console.error('Invalid column ID format:', newColumnId);
            return;
        }

        todo.statusColumn = newStatus;
        todo.backgroundColorColumn = ToDoIssue.calculateBackgroundColorColumn(newStatus);

               // Actualizar el proyecto
        projectManager.updateProject(projectId, project);

        // Actualizar la UI del todo
        const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`) as HTMLElement;
        if (todoElement) {
            updateTodoVisuals(todoElement, todo);

            // Mover el elemento a la nueva columna
            const newColumn = document.getElementById(newColumnId);
            if (newColumn) {
                newColumn.appendChild(todoElement);
            }
            // Volver a agregar los event listeners al elemento
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
        colorColumn.style.backgroundColor = todo.backgroundColorColumn;
    }

    const todoCard = todoElement.querySelector('.todo-card') as HTMLElement;
    if (todoCard) {
        todoCard.style.borderLeftColor = todo.backgroundColorColumn;
    }

    const statusSpan = todoElement.querySelector('.todo-tags[style*="background-color"]') as HTMLElement;
    if (statusSpan) {
        statusSpan.style.backgroundColor = todo.backgroundColorColumn;
        statusSpan.textContent = ToDoIssue.getStatusColumnText(todo.statusColumn);
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


function updateToDoStatus(todoId: string, newColumnId: string) {
    const projectId = localStorage.getItem("selectedProjectId");
    if (!projectId) {
        console.error('No selected project ID found in localStorage')
        return
    }

    const projectManager = ProjectsManager.getInstance();
    const project = projectManager.getProject(projectId);

    if (project) {
        const todo = project.todoList.find(todo => (todo as any).id === todoId);
        if (todo) {
            //Update statusColumn
            const newStatus = newColumnId.replace('todo-column-', '');
            todo.statusColumn = newStatus;

            //Calculate and update backgroundColorColumn
            (todo as any).backgroundColorColumn = ToDoIssue.calculateBackgroundColorColumn(newStatus);

            //Update the project
            projectManager.updateProject(projectId, project);
            console.log(`Updated todo ${todoId}:`);
            console.log(`- Status: ${todo.statusColumn}`);
            console.log(`- Background Color: ${todo.backgroundColorColumn}`);

            // Actualizar solo el todo que cambió
            const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
            if (todoElement) {
                updateTodoVisualUI(todo);
            }


        } else {
            console.error(`Todo with ID ${todoId} not found in the project.`)
        }

    } else {
        console.error('No selected project ID found in localStorage')
    }
}


function updateSingleTodoUI(todo: IToDoIssue, newColumnId: string) {
    const todoElement = document.querySelector(`[data-todo-id="${todo.id}"]`);
    if (!todoElement) {
        console.error(`Element for todo ${todo.id} not found`);
        return;
    }

    // Actualizar estilos
    const colorColumn = todoElement.querySelector('.todo-color-column') as HTMLElement;
    if (colorColumn) {
        colorColumn.style.backgroundColor = todo.backgroundColorColumn;
    }

    const todoCard = todoElement.querySelector('.todo-card') as HTMLElement;
    if (todoCard) {
        todoCard.style.borderLeftColor = todo.backgroundColorColumn;
    }

    const statusSpan = todoElement.querySelector('.todo-tags[style*="background-color"]') as HTMLElement;
    if (statusSpan) {
        statusSpan.style.backgroundColor = todo.backgroundColorColumn;
        statusSpan.textContent = ToDoIssue.getStatusColumnText(todo.statusColumn);
    }

    // Mover el elemento a la nueva columna
    const newColumn = document.getElementById(newColumnId);
    if (newColumn) {
        newColumn.appendChild(todoElement);
    }

    console.log(`UI updated for todo ${todo.id}`);
}




// Función auxiliar para actualizar la UI del todo (si es necesario)
function updateTodoVisualUI(todo: any) {
    const todoElement = document.querySelector(`[data-todo-id="${todo.id}"]`) as HTMLElement;
    if (!todoElement) {
        console.error(`UI element for todo ${todo.id} not found`);
        return;
    }


    // if (todo.ui instanceof HTMLElement) {
    const newBackgroundColor = ToDoIssue.calculateBackgroundColorColumn(todo.statusColumn);
    // Actualizar el color de fondo de la columna
    const colorColumn = todo.ui.querySelector('.todo-color-column') as HTMLElement;
    if (colorColumn) {
        colorColumn.style.backgroundColor = newBackgroundColor;
    }

    // Actualizar el borde del todo-card
    const todoCard = todo.ui.querySelector('.todo-card') as HTMLElement;
    if (todoCard) {
        todoCard.style.borderLeftColor = newBackgroundColor;
    }

    // Actualizar el texto  y color de fondo del estado
    const statusSpan = todo.ui.querySelector('.todo-tags[style*="background-color"]') as HTMLElement;
    if (statusSpan) {
        statusSpan.style.backgroundColor = newBackgroundColor;
        statusSpan.textContent = ToDoIssue.getStatusColumnText(todo.statusColumn);
    }

    console.log(`Visual UI updated for todo ${todo.id} with new background color: ${newBackgroundColor}`);

    // } else {
    //     console.error(`UI element for todo ${todo.id} is not an HTMLElement`);
    // }
}

// Función para actualizar la UI con el nuevo contenido
function updateUIWithNewContent(todo: IToDoIssue) {

    // Crear un clon del todo para generar el nuevo contenido
    const tempTodo = { ...todo, ui: null };

    // Generar nuevo contenido
    renderToDoIssueListInsideProject(tempTodo);

    if (tempTodo.ui instanceof HTMLElement) {
        // Capturar el contenido HTML generado
        const newContent = tempTodo.ui.innerHTML;

        // Actualizar el contenido del todo original
        if (todo.ui instanceof HTMLElement) {
            todo.ui.innerHTML = newContent;

            // Volver a añadir los event listeners
            todo.ui.addEventListener("click", () => {
                showPageContent("todo-details", "flex");
                setDetailsIssuePage(todo);
                console.log("Details page set in a new window");
            });


        } else {
            // Si todo.ui no es un HTMLElement, crear uno nuevo
            todo.ui = tempTodo.ui;
        }

        console.log(`UI content updated for todo ${todo.id}`);
    } else {
        console.error(`Failed to generate new UI content for todo ${todo.id}`);
    }


}

