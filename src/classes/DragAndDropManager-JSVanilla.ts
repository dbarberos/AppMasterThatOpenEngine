import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"

import { reactive, html } from "@arrow-js/core";
import { ParentConfig, NodeRecord, BaseDragState, NodeDragEventData,} from "@formkit/drag-and-drop";

import { DragEvent } from '@arrow-js/core'
import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage } from "./ToDoManager";
import { ToDoIssue, IToDoIssue } from "./ToDoIssue"


interface ParentConfig<T> {
    dragHandle: string;
    draggable: (child: HTMLElement) => boolean;
    accepts: (targetParentData: any, initialParentData: any, currentParentData: any, state: any) => boolean;
    performSort: (data: { parent: any, draggedNodes: HTMLElement[], targetNode: HTMLElement }) => void;
    performTransfer: (data: { currentParent: any, targetParent: any, draggedNodes: HTMLElement[] }) => void;
    handleDragstart: (data: NodeDragEventData<T>) => void;
    handleDragend: (data: NodeDragEventData<T>) => void;
    handleNodeDrop: (data: NodeDragEventData<T>) => void;
    handleParentDragover: (data: DragEvent, state: any) => void;
    handleEnd: (state: any) => void;
    handleNodeTouchstart: (data: any, state: any) => void;
    handleNodeDragover: (data: any, state: any) => void;
    root: Document | ShadowRoot;
    scrollBehavior: { x: number; y: number };
    sortable: boolean;
}



// Definición local del tipo NodeTouchEventData si no está disponible
type NodeTouchEventData<T> = {
    e: TouchEvent; // El evento de toque
    node: T; // El nodo relacionado (asegúrate de que T sea del tipo correcto)
    // Agrega otras propiedades según lo necesites
};

// Definición del tipo ParentDragEventData basada en lo que podría incluir
type ParentDragEventData<T> = {
    preventDefault: () => void; // Método para prevenir el comportamiento por defecto
    targetData: {
        node: T; // El nodo relacionado (asegúrate de que T sea del tipo correcto)
        // Otras propiedades necesarias según la definición del paquete
    };
    // Agrega otras propiedades según lo necesites
}




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

    if (selectProjectForToDoBoard) {
        selectProjectForToDoBoard.innerHTML = ""

        // Add a default option to select a project
        const option = document.createElement("option");
        option.value = "";
        option.text = "Select a project"
        // option.disabled = true
        option.style.color = "var(--color-fontbase-dark)"
        selectProjectForToDoBoard.appendChild(option);

        // Populate the select element with project options
        projectsList.forEach((project) => {
            const option = document.createElement("option");
            option.value = project.id;
            option.text = project.name;
            selectProjectForToDoBoard.appendChild(option)

            // Get the stored project ID and project from local storage
            const storedProjectId = localStorage.getItem("selectedProjectId");
            

            // Select the project corresponding to the stored project ID
            if (storedProjectId) {
                selectProjectForToDoBoard.value = storedProjectId
                // selectedProject = projectsList.find((project) => project.id === storedProjectId)
            }
        })

    } else {
        console.log("Error in getting the select ToDo Board")
    }

    

    //Clean the columns of previous ToDo Issues 
    const columnas = document.querySelectorAll(".todo-column-list");
    columnas.forEach((column) => {
        column.innerHTML = ""
    })
    

    //*** Get the list of todoIssue from the project an organize it ***
    // Get the stored project ID and project from local storage
    const storedProjectId = localStorage.getItem("selectedProjectId");
    if (storedProjectId) {        
        organizeToDoIssuesByStatusColumns(storedProjectId)
    }

    //Listen when the user change the Project inside the ToDo Board

    selectProjectForToDoBoard.addEventListener("change", () => {
        const changedProjectId = selectProjectForToDoBoard.value
                
        //Save the Id of the selected project in the local storage
        localStorage.setItem("selectedProjectId", changedProjectId)
        
        // Ahora puedes utilizar la variable selectedProjectIdse actualiza usando la función setUpToDoBoard 
        console.log("selectedProjectId", changedProjectId)

        

        //Get the list of todoIssue from the project an organize it
        organizeToDoIssuesByStatusColumns(changedProjectId)
        //Render the columns of Issues
        
    })


    //Create diferents arrays of todoIssues according to the statusColum value

    function organizeToDoIssuesByStatusColumns(projectId) {
        
        const projectObject = projectsList.find((project) => project.id === projectId)
        if (projectObject) {
            console.log("I am inside organize and render todolist")
            console.log("ProjectId", projectId)
            const toDoIssues = projectObject.todoList

            //Clean the columns of previous ToDo Issues 
            // const columns = document.querySelectorAll(".todo-column-list");
            // columns.forEach((column) => {
            //     column.innerHTML = ""
            // })
        
            // Create an object to store the arrays for each status column
            const statusColumns = {}
            // Iterate over the todoList and group them by status column
            toDoIssues.forEach((toDoIssue) => {
                // Check if statusColumn is null, undefined, or empty
                const status = toDoIssue.statusColumn === null ? "notassigned" : toDoIssue.statusColumn;
                // If the array for the status column doesn't exist, create it
                if (!statusColumns[status]) {
                    statusColumns[status] = [];
                }

                // Add the toDoIssue to the array for its status column
                statusColumns[status].push(toDoIssue);
            })

            console.log("Organized ToDoIssues by statusColumns: ", statusColumns)

            // Render the UI for each toDoIssue in its respective column
            // Object.keys(statusColumns).forEach((status) => {
            //     const columnId = `todo-column-${status.toLowerCase()}`;
            //     const column = document.getElementById(columnId);
            //     if (!column) {return}
            //     statusColumns[status].forEach((toDoIssue) => {
            //         renderToDoIssueListInsideProject(toDoIssue)
            //         column.appendChild(toDoIssue.ui);
            //     });
            // });

            // Render or update the UI for each toDoIssue in its respective column
            Object.keys(statusColumns).forEach((status) => {
                const columnId = `todo-column-${status.toLowerCase()}`;
                const column = document.getElementById(columnId);
                if (!column) { return }
                statusColumns[status].forEach((toDoIssue) => {
                    const existingTodo = column.querySelector(`[data-todo-id="${toDoIssue.id}"]`);
                    if (!existingTodo) {
                        // Add new todo
                        renderToDoIssueListInsideProject(toDoIssue)
                        column.appendChild(toDoIssue.ui);
                    } else {
                        // Update existing todo
                        updateTodoVisualUI(toDoIssue);
                    
                        
                    }
                });

                // Remove todos that are no longer in this column
                const existingTodos = column.querySelectorAll('[data-todo-id]');
                existingTodos.forEach(todo => {
                    const todoId = todo.getAttribute('data-todo-id');
                    if (!statusColumns[status].some(t => t.id === todoId)) {
                        todo.remove();
                    }
                });
            });




            // Emitir el evento personalizado al finalizar la función par alanzar el draganddrop
            const event = new CustomEvent('todoIssuesOrganized', {
                detail: { projectId, statusColumns }
            });
            document.dispatchEvent(event);

        } else {
            console.error("project not found for ID:", projectId )
        }

        // Set the data-projectId attribute with the unique ID of the proyect in the button of new To-Do
        const projectToDoDatasetAttributeId = document.getElementById("new-todo-issue-btn2")
        
        if (projectToDoDatasetAttributeId) {
            projectToDoDatasetAttributeId.dataset.projectId = projectId
        }

        






    }
}


function initializeDragAndDrop(rootElement: HTMLElement) {
    const root = rootElement.getRootNode() as Document | ShadowRoot;
    console.log('DragAndDropManager initialized with root element:')

    const parentConfig: ParentConfig<any> = {
        dragHandle: '.handler-move', // Selector para el controlador de arrastre
        draggable: (child) => child.classList.contains('todo-item'), // Solo los elementos con la clase 'todo-item' son arrastrables
        accepts: (targetParentData, initialParentData, currentParentData, state) => {
            // Lógica para determinar si el nodo puede ser aceptado
            return true; // Permitir todos los movimientos (ajustar según tu lógica)
        },
        performSort: ({ parent, draggedNodes, targetNode }) => {
            // Lógica para reordenar nodos
            console.log('Sorting nodes', draggedNodes, 'into', targetNode);
            // Aquí puedes implementar la lógica para actualizar el estado de la lista
        },
        performTransfer: ({ currentParent, targetParent, draggedNodes }) => {
            // Lógica para transferir nodos entre padres
            console.log('Transferring nodes', draggedNodes, 'from', currentParent, 'to', targetParent);
            // Aquí puedes implementar la lógica para actualizar el estado de la lista
        },
        handleDragstart: (data: NodeDragEventData<any>) => {
            console.log('Drag started', data);
            // Puedes agregar clases o estilos para resaltar el elemento arrastrado
        },
        handleDragend: (data: NodeDragEventData<any>) => {
            console.log('Drag ended', data);
            // Aquí puedes limpiar el estado o realizar otras acciones necesarias
        },
        handleNodeDrop: (data: NodeDragEventData<any>) => {
            console.log('Node dropped', data);
            // Actualiza tu lista de tareas aquí
        },
        handleParentDragover: (data: DragEvent, state: any) => {
            data.preventDefault(); // Permitir que el elemento se suelte
        },
        handleEnd: (state) => {
            console.log('Drag operation ended', state);
        },
        handleNodeTouchstart: (data, state) => {
            console.log('Touch started', data);
        },

        handleNodeDragover: (data, state) => {
            console.log('Drag over node', data);
        },
        root: root, // El elemento raíz para el drag and drop
        scrollBehavior: {
            x: 0.9, // Iniciar el desplazamiento cuando el elemento arrastrado está al 90% horizontalmente
            y: 0.9 // Iniciar el desplazamiento cuando el elemento arrastrado está al 90% verticalmente
        },
        sortable: true // Permitir ordenar nodos dentro del mismo padre
    }
    console.log('Initializing drag and drop for:' , rootElement);

    const draggables = rootElement.querySelectorAll('.todo-item');
    console.log('Found draggable elements:', draggables.length);
    draggables.forEach(draggable => {
        draggable.setAttribute("dragable", "true")
        draggable.addEventListener('dragstart', (e: DragEvent) => {
            e.preventDefault
            if (e.target instanceof HTMLElement) {
                const todoId = e.target.getAttribute('data-todo-id');
                console.log('Initializing draggable with ID:', todoId)
                if (todoId) {
                    e.dataTransfer?.setData('text/plain', todoId);
                    console.log('Drag started with todo ID:', todoId);
                } else {
                    console.error('Todo ID not found on draggable element');
                }
            }
        });

    // Maneja el evento de arrastre
    rootElement.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault(); // Necesario para permitir el drop
        parentConfig.handleParentDragover(event as DragEvent, {});
    });
    
    // Manejo del evento drop
    rootElement.addEventListener('drop', (event: Event) => {
        event.preventDefault();

        // Aquí puedes manejar la lógica de colocación
        console.log('Dropped:', event);
        try {
            const dragEvent = event as DragEvent // Verifica que sea un DragEvent
            const draggedToDoId = dragEvent.dataTransfer?.getData("text/plain")
            console.log('Dragged element ID:', draggedToDoId);

            if (draggedToDoId) {
                let targetColumn = event.target as HTMLElement;
                while (targetColumn && !targetColumn.classList.contains("todo-column-list")) {
                    targetColumn = targetColumn.parentElement as HTMLElement;
                }

                if (targetColumn) {
                    const draggedElement = document.querySelector(`[data-todo-id="${draggedToDoId}"]`);
                    console.log('Found draggedElement:', draggedElement);
                    if (draggedElement) {
                        // Lógica para mover el elemento
                        targetColumn.appendChild(draggedElement);

                        // Aquí deberías actualizar el estado de tu aplicación
                        updateToDoStatus(draggedToDoId, targetColumn.id);
                        console.log('Drop event target:', event.target);
                        console.log('Dragged element:', draggedElement);
                        console.log('Target column:', targetColumn);

                    } else {
                        console.error('Dragged element not found with todo ID:', draggedToDoId);
                    }

                } else {
                    console.error('Dragged todo ID not found. Please check if it is set correctly in dragstart.');
                }
            }
        } catch (error) {
            console.error ("error during drop operation:", error)
        }
    })
        
        
        
    });

    
}



// Uso del DragAndDropManager
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('todoIssuesOrganized', (event: Event) => {
        const customEvent = event as CustomEvent // Hacer un cast a CustomEvent
        const { projectId, statusColumns } = customEvent.detail; //Acceder a detail
        console.log(`ToDo issues organized for project ID: ${projectId}`, statusColumns)

        // Seleccionar todos los elementos de las columnas de tareas
        const todoListElements = document.querySelectorAll('.todo-column-list')
        if (todoListElements.length > 0) {
            todoListElements.forEach(todoListElement => {
                initializeDragAndDrop(todoListElement as HTMLElement); // Inicializar cada lista de tareas
            });
        } else {
            console.error('The .todo-column-list elements were not found in the DOM.');
        }
    })
    document.addEventListener('todoIssuesOrganized', (event: Event) => {
        const customEvent = event as CustomEvent
        const { projectId, statusColumns } = customEvent.detail;
        console.log(`ToDo issues organized for project ID: ${projectId}`, statusColumns);
        // No necesitas reinicializar aquí, solo actualizar el contenido de las columnas
    });
})

function updateToDoStatus(todoId: string, newColumnId: string) {
    const projectId = localStorage.getItem("selectedProjectId");
    if (projectId) {
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
                
                // Actualizar la variable ui utilizando ToDoManager
                updateUIWithNewContent(todo);
                
                //Update the project
                projectManager.updateProject(projectId, project);
                console.log(`Updated todo ${todoId}:`);
                console.log(`- Status: ${todo.statusColumn}`);
                console.log(`- Background Color: ${todo.backgroundColorColumn}`);

                // Llamar a setUpToDoBoard para actualizar toda la UI
                // setUpToDoBoard(projectId);

                // Actualizar la UI si es necesario
                updateTodoVisualUI(todo);

            } else {
                console.error(`Todo with ID ${todoId} not found in the project.`)
            }
        } else {
            console.error(`Project with ID ${projectId} not found.`)
        }
    } else {
        console.error('No selected project ID found in localStorage')
    }
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
