import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"

import { reactive, html } from "@arrow-js/core";

import {
    dragAndDrop,
    DragAndDrop,
    ParentConfig,
    NodeDragEventData,
    NodeTouchEventData,
    DragState,
    TouchState,
    multiDrag,
    animations,
    selections,
    swap,
    place,} from "@formkit/drag-and-drop";

import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage } from "./ToDoManager";
import { ToDoIssue, IToDoIssue } from "./ToDoIssue"

interface DraggableTodoItem extends IToDoIssue {
    id: string;
    ui: HTMLDivElement;
    statusColumn: string;
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
export  async function setUpToDoBoard(selectedProjectId?) {
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
        await organizeToDoIssuesByStatusColumns(storedProjectId)
        initializeDragAndDrop()// Initialize drag and drop
    }

    //Listen when the user change the Project inside the ToDo Board

    selectProjectForToDoBoard.addEventListener("change", async () => {
        const changedProjectId = selectProjectForToDoBoard.value
                
        //Save the Id of the selected project in the local storage
        localStorage.setItem("selectedProjectId", changedProjectId)
        
        // Ahora puedes utilizar la variable selectedProjectIdse actualiza usando la función setUpToDoBoard 
        console.log("selectedProjectId", changedProjectId)

        

        //Get the list of todoIssue from the project an organize it
        await organizeToDoIssuesByStatusColumns(changedProjectId)
        initializeDragAndDrop();  // Reinitialize drag and drop
        //Render the columns of Issues
        
    })


    //Create diferents arrays of todoIssues according to the statusColum value

    async function organizeToDoIssuesByStatusColumns(projectId) {
        
        const projectObject = projectsList.find((project) => project.id === projectId)
        if (!projectObject) {
            console.error("Project not found for ID:", projectId)
            return
        }
        
        if (projectObject) {
            console.log("I am inside organize and render todolist")
            console.log("ProjectId", projectId)
            const toDoIssues = projectObject.todoList

            //Clean the columns of previous ToDo Issues 
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
            // and Esperar a que se complete el renderizado
            await Promise.all(Object.keys(statusColumns).map(async(status) => {
                const columnId = `todo-column-${status.toLowerCase()}`;
                const column = document.getElementById(columnId);
                if (!column) { return }
                
                await Promise.all(statusColumns[status].map(async(toDoIssue) => {
                    const existingTodo = column.querySelector(`[data-todo-id="${toDoIssue.id}"]`);
                    if (!existingTodo) {
                        // Add new todo
                        renderToDoIssueListInsideProject(toDoIssue)
                        column.appendChild(toDoIssue.ui);
                    } else {
                        // Update existing todo
                        updateTodoVisualUI(toDoIssue);                    
                        
                    }
                }));

                // Remove todos that are no longer in this column
                // const existingTodos = column.querySelectorAll('[data-todo-id]');
                // existingTodos.forEach(todo => {
                //     const todoId = todo.getAttribute('data-todo-id');
                //     if (!statusColumns[status].some(t => t.id === todoId)) {
                //         todo.remove();
                //     }
                // });
            }));

            await new Promise(resolve => requestAnimationFrame(resolve));




            // Emitir el evento personalizado al finalizar la función para lanzar el draganddrop
            // const event = new CustomEvent('todoIssuesOrganized', {
            //     detail: { projectId, statusColumns }
            // });
            // document.dispatchEvent(event);

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

function initializeDragAndDrop() {
    const todoContent = document.getElementById("todo-content")
    if (!todoContent) {
        console.warn('Todo content not found');
        return
    }
    const todoItems = todoContent.querySelectorAll('.todo-item');
    if (!todoItems.length) {
        console.warn('No todo items found');
        return;
    }

    // Limpiar cualquier instancia previa
    const columns = todoContent.querySelectorAll('.todo-column-list');
    columns.forEach(column => {
        column.innerHTML = column.innerHTML;
    });



    const dragAndDropConfig: DragAndDrop<DraggableTodoItem> = {
        parent: todoContent,
        getValues: (parent: HTMLElement) => {
            // Obtener todos los todo items de las columnas
            const items = Array.from(parent.querySelectorAll('.todo-item'));
            console.log('Found items:', items.length); // Debug
            
            return items.map(element => {
                const todoEl = element as HTMLDivElement;
                const column = todoEl.closest('.todo-column-list');
                const projectId = todoEl.dataset.projectId || '';
                const todoId = todoEl.dataset.todoId || '';

                // Obtener la columna actual
                


                // Obtener la instancia del todo desde el ProjectManager
                // const project = ProjectsManager.getInstance().getProject(projectId);
                // const todoInstance = project?.todoList.find(todo => todo.id === todoId);

                // if (!todoInstance) {
                //     console.warn(`Todo item not found: ${todoId}`);
                //     // Retornar un objeto mínimo válido en lugar de lanzar error
                //     return {
                //         id: todoId,
                //         ui: todoEl,
                //         statusColumn: statusColumn,
                //         todoProject: projectId,
                //     } as DraggableTodoItem;

                // }
                return {                    
                    id: todoId,
                    ui: todoEl,
                    statusColumn: column ? column.id.replace('todo-column-', '') : 'notassigned',
                    todoProject: projectId


                    // Otros campos necesarios de IToDoIssue
                } as DraggableTodoItem;
            });
        },
        setValues: (values: DraggableTodoItem[], parent: HTMLElement) => {
            console.log('Setting values:', values.length); // Debug

            values.forEach(todo => {
                const targetColumn = parent.querySelector(`#todo-column-${todo.statusColumn}`);
                if (!targetColumn) {
                    console.warn(`Target column not found for status: ${todo.statusColumn}`);
                    return;
                }

                if (!todo.ui) {
                    console.warn(`UI element missing for todo: ${todo.id}`);
                    return;
                }


                if (targetColumn && todo.ui) {
                    // Actualizar la UI
                    // Actualizar posición en el DOM
                    targetColumn.appendChild(todo.ui);
                    updateTodoVisualUI(todo)

                    // // Actualizar el color de la columna y otros estilos
                    // const colorColumn = todo.ui.querySelector('.todo-color-column') as HTMLElement;
                    // if (colorColumn) {
                    //     colorColumn.style.backgroundColor = ToDoIssue.calculateBackgroundColorColumn(todo.statusColumn);
                    // }

                    // // Actualizar el borde de la tarjeta
                    // const todoCard = todo.ui.querySelector('.todo-card') as HTMLElement;
                    // if (todoCard) {
                    //     todoCard.style.borderLeftColor = ToDoIssue.calculateBackgroundColorColumn(todo.statusColumn);
                    // }

                    // // Actualizar el color del tag de statusColumn
                    // const statusTag = todo.ui.querySelector('.todo-tags[style*="background-color"]') as HTMLElement;
                    // if (statusTag) {
                    //     statusTag.style.backgroundColor = ToDoIssue.calculateBackgroundColorColumn(todo.statusColumn);;
                    //     statusTag.textContent = ToDoIssue.getStatusColumnText(todo.statusColumn);
                    // }
                    

                }
                // Actualizar el estado en el ProjectManager
                try {
                    const project = ProjectsManager.getInstance().getProject(todo.todoProject);
                    if (project) {
                        const todoIndex = project.todoList.findIndex(t => t.id === todo.id);
                        if (todoIndex !== -1) {
                            project.todoList[todoIndex].statusColumn = todo.statusColumn
                            ProjectsManager.getInstance().updateProject(todo.todoProject, project);
                        }
                        
                    }
                } catch (error) {
                    console.error('Error updating todo status:', error);
                }
                
            });

            
        },
        config: {
            dragHandle: '.handler-move',
            draggingClass: 'todo-dragging',
            dropZoneClass: 'todo-dropzone',
            plugins: [
                multiDrag({
                    draggingClass: 'todo-multi-dragging',
                    touchDraggingClass: 'todo-touch-dragging',
                }),
                animations({
                    duration: 300,
                    yScale: 0.3
                }),
                selections({
                    selectedClass: 'todo-selected',
                    clickawayDeselect: true
                }),
                swap(),
                place()
            ],
            handleDragstart: (data: NodeDragEventData<DraggableTodoItem>) => {
                console.log('Todo drag started:', data);
                const todoEl = data.targetData.node.el as HTMLElement;
                todoEl.classList.add('todo-dragging');
                todoEl.style.opacity = '0.5';
                todoEl.style.cursor = 'grabbing';
            },
            handleEnd: (data: NodeDragEventData<DraggableTodoItem> | NodeTouchEventData<DraggableTodoItem>) => {
                console.log('Todo drag ended:', data);
                const todoEl = data.targetData.node.el as HTMLElement;
                todoEl.classList.remove('todo-dragging');
                todoEl.style.opacity = '1';
                todoEl.style.cursor = 'grab';

                // Actualizar el estado del todo
                const newColumn = todoEl.closest('.todo-column-list');
                if (newColumn) {
                    const newStatus = newColumn.id.replace('todo-column-', '');
                    const todoInstance = data.targetData.node.data.value;

                    // Actualizar el estado del todo
                    const project = ProjectsManager.getInstance().getProject(todoInstance.todoProject);
                    if (project) {
                        const todo = project.todoList.find(t => t.id === todoInstance.id);
                        if (todo) {
                            todo.statusColumn = newStatus;
                            ProjectsManager.getInstance().updateProject(todoInstance.todoProject, project);
                        }
                    }
                    
                }
            },
            handleDrop: (data) => {
                const { dropZone, elements } = data;
                if (dropZone && elements.length > 0) {
                    const newStatus = dropZone.id.replace('todo-column-', '');
                    elements.forEach(element => {
                        const todoId = element.dataset.todoId;
                        const projectId = element.dataset.projectId;
                        updateToDoStatus(todoId, newStatus, projectId);
                    });
                }
            },
            
            accepts: (dropZone, element) => {
                return dropZone.classList.contains('todo-column-list');
            },
            root: document,
            scrollBehavior: {
                x: 0.9,
                y: 0.9,
                scrollOutside: true
            },
            sortable: true,
            dropZones: '.todo-column-list', // Especifica las zonas de drop
        } as Partial<ParentConfig<DraggableTodoItem>>
    };

    // Inicializar drag and drop
    try {
        const instance = dragAndDrop(dragAndDropConfig);
        console.log('Drag and drop initialized successfully');
        return instance;
    } catch (error) {
        console.error('Error initializing drag and drop:', error);
    }
}



    //Inicializar cuando el DOM esté listo
    // document.addEventListener('DOMContentLoaded', () => {
    //     const todoContent = document.getElementById("todo-content")
    //     if (todoContent) {
    //         initializeDragAndDrop();
    //     }
    // });



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
