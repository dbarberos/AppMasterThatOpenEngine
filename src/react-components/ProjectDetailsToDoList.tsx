import * as React from 'react';
import * as Router from 'react-router-dom';

import { ToDoCard, NewToDoIssueForm, ToDoDetailsWindow, SearchToDoBox, CounterBox } from '../react-components';
import { AddIcon, SearchIcon } from './icons';

import { type Project } from '../classes/Project';
import { ToDoIssue, } from '../classes/ToDoIssue';
import { type IToDoIssue } from '../types';
import { log } from 'three/examples/jsm/nodes/Nodes.js';
//import { ProjectsManager } from '../classes/ProjectsManager';
//import { ToDoManager } from '../classes/ToDoManager';
//import { showModal } from '../classes/UiManager';

import {
    DndContext,
    closestCorners, // O considera rectIntersection según tu layout
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent,
    closestCenter
} from '@dnd-kit/core'
import {
    sortableKeyboardCoordinates,
    arrayMove,
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'



interface Props {
    project: Project
    onUpdatedProject: (updatedProject: Project) => void
    onCreatedToDoIssue: (createdNewToDoIssue: ToDoIssue) => void
    onUpdatedToDoIssue: (updatedTodo: ToDoIssue) => void
    //onDeletedToDoIssue: (deletedTodo: ToDoIssue) => void
    onTodoListReordered: (reorderedList: ToDoIssue[]) => void
}



// --- FUNCIÓN HELPER PARA CALCULAR sortOrder ---
function calculateNewSortOrder(
    list: ToDoIssue[],
    oldIndex: number,
    newIndex: number
): number | null {
    if (oldIndex === newIndex) return null; // No change

    // Crear una copia temporal de la lista *antes* del movimiento para obtener vecinos correctos
    const currentList = [...list];
    const movedItem = currentList[oldIndex]; // El item que se mueve

    let beforeSortOrder: number | null = null;
    let afterSortOrder: number | null = null;

    if (newIndex === 0) {
        // Mover al principio
        const firstItem = currentList.find((_, i) => i !== oldIndex); // Encuentra el primer item *que no sea el movido*
        afterSortOrder = firstItem ? firstItem.sortOrder : null;
    } else if (newIndex >= currentList.length - 1) { // >= para cubrir el caso de mover al final desde cualquier posición
        // Mover al final
        // Encuentra el último item *que no sea el movido*
        const potentialLastItems = currentList.filter((_, i) => i !== oldIndex);
        beforeSortOrder = potentialLastItems.length > 0 ? potentialLastItems[potentialLastItems.length - 1].sortOrder : null;

    } else {
        // Mover entre dos items
        // Necesitamos encontrar los vecinos en la lista *como quedaría después del movimiento*
        // Es más fácil obtener los índices de los vecinos en la lista *original*
        const itemBeforeIndex = newIndex > oldIndex ? newIndex : newIndex - 1;
        const itemAfterIndex = newIndex < oldIndex ? newIndex : newIndex + 1;

        // Asegurarse de que los índices no sean el del item movido
        const realItemBefore = currentList[itemBeforeIndex === oldIndex ? itemBeforeIndex - 1 : itemBeforeIndex];
        const realItemAfter = currentList[itemAfterIndex === oldIndex ? itemAfterIndex + 1 : itemAfterIndex];


        beforeSortOrder = realItemBefore ? realItemBefore.sortOrder : null;
        afterSortOrder = realItemAfter ? realItemAfter.sortOrder : null;
    }


    // --- Cálculo del nuevo sortOrder ---
    if (beforeSortOrder !== null && afterSortOrder !== null) {
        // Entre dos items
        return (beforeSortOrder + afterSortOrder) / 2;
    } else if (beforeSortOrder !== null) {
        // Al final
        return beforeSortOrder + 1.0; // Añadir incremento
    } else if (afterSortOrder !== null) {
        // Al principio
        return afterSortOrder / 2; // Dividir por 2
    } else {
        // Lista vacía o solo un elemento (este caso no debería ocurrir si hay drag)
        return 1.0; // Valor base
    }
}



export function ProjectDetailsToDoList({
    project,
    onUpdatedProject,
    onCreatedToDoIssue,
    onUpdatedToDoIssue,
    //onDeletedToDoIssue
    onTodoListReordered
}: Props) {
    
    const [isNewToDoIssueFormOpen, setIsNewToDoIssueFormOpen] = React.useState(false)
    const [isTodoDetailsWindowOpen, setIsTodoDetailsWindowOpen] = React.useState(false)
    const [selectedToDo, setSelectedToDo] = React.useState<ToDoIssue | null>(null)

    // TodoList state to track changes
    const [todoList, setTodoList] = React.useState<ToDoIssue[]>(project.todoList)
    const originalTodoListRef = React.useRef<ToDoIssue[]>(project.todoList)
    const [searchTerm, setSearchTerm] = React.useState('')

    const [isDragging, setIsDragging] = React.useState(false);

    const [activeTodo, setActiveTodo] = React.useState<ToDoIssue | null>(null) // Para DragOverlay

    // Sensores para dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
            delay: 400,
            tolerance: 5
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    //  Ref para trackear si el reordenamiento fue iniciado por el usuario para evitar loops de useEffect en el renderizado inicial
    const isUserReordering = React.useRef(false)
    
    


    // Update useEffect to sync with project changes
    React.useEffect(() => {
        console.log('ProjectDetailsToDoList - Project todoList changed:', {
            projectId: project.id,
            todoListLength: project.todoList.length,
            todoListIds: todoList.map(todo => todo.id)
        })
        const sortedList = [...project.todoList].sort((a, b) => a.sortOrder - b.sortOrder)
        // Update both the current todoList and the original reference
        originalTodoListRef.current = sortedList
        // Solo actualiza si no hay término de búsqueda activo
        if (!searchTerm.trim()) {
            setTodoList(sortedList)
        }
        // Resetear el flag al recibir nuevas props
        isUserReordering.current = false
        // Si hay búsqueda, la lista filtrada se maneja en el otro useEffect
    }, [project.todoList, , searchTerm])

  

    //const [updateProject, setUpdateProject]= React.useState(project)

    // ToDoManager.onToDoIssueCreated = () => { setTodoList([...props.project.todoList]) }
    // ToDoManager.onToDoIssueDeleted = () => { setTodoList([...props.project.todoList]) }


    const handleCloseNewToDoForm = () => {
        // Cierra el formulario
        setIsNewToDoIssueFormOpen(false)
    }

    const onNewToDoIssueClick = () => {
        setIsNewToDoIssueFormOpen(true)
    }

    const handleCreatedToDoIssue = (createdNewToDoIssue: ToDoIssue) => {
        onCreatedToDoIssue(createdNewToDoIssue)
        setIsNewToDoIssueFormOpen(false);
    }

    const handleClickOpenToDo = (toDoIssue) => {
        try {
            console.log('handleClickOpenToDo called with:', toDoIssue)
            // Verify todo is valid
            if (!toDoIssue || !toDoIssue.id) {
                console.error('Invalid todo object:', toDoIssue);
                return;
            }

            setSelectedToDo(toDoIssue)
            setIsTodoDetailsWindowOpen(true)
            console.log('States after update:', {                
                selectedTodo: isNewToDoIssueFormOpen
            });
        } catch (error) {
            console.error('Error in handleClickOpenToDo:', error)
        }
    }

    const handleCloseToDoDetailsWindow = () => {
        console.log('Closing ToDoDetailsWindow')
        setIsTodoDetailsWindowOpen(false)
        setSelectedToDo(null)
    }

    const handleDeleteToDoIssue = async (projectId: string, todoId: string) => {
        console.log("Delete ToDo Issue funtion launched for  todo:", selectedToDo!.id)
        try {
            // Update the local data project  removing the todo
            const updatedTodoList = project.todoList.filter(todo => todo.id !== todoId)
            const updatedProject = { ...project, todoList: updatedTodoList }

            // Notifica al componente padre del cambio
            onUpdatedProject(updatedProject);

            setIsTodoDetailsWindowOpen(false)
            setSelectedToDo(null)
        } catch (error) {
            console.error('ProjectDetailsTodOList: Error deleting todo from projects.Manager:', error);
        }

    }


    // ***ESTA FUNCION HAY QUE PASARLA AL TODOMANAGER  ??*** 

    const handleUpdateToDoIssue = (updatedTodo: ToDoIssue) => {
        console.log('ProjectDetailsToDoList - handleUpdateToDoIssue:', {
            todoId: updatedTodo.id,
            updates: updatedTodo
        })

        // Create new todoList with updated todo
        const updatedTodoList = todoList.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo
        )

        // Create new project with updated todoList
        const updatedProject = {
            ...project,
            todoList: updatedTodoList
        }

        // Update parent state
        onUpdatedProject(updatedProject)

        // Update local state
        setTodoList(updatedTodoList)

        //Notify the parent todo object to trigger the rerender.
        onUpdatedToDoIssue(updatedTodo)

    }


    // Modify the search handler to use useEffect for state updates
    const onToDoIssueSearch = React.useCallback((value: string) => {
        console.log('Search triggered with value:', value);
        setSearchTerm(value);
    }, [])




    // Add useEffect to handle todoList updates when searchTerm changes
    React.useEffect(() => {
        console.log('Filtering with searchTerm:', searchTerm);

        if (!searchTerm.trim()) {
            console.log('Empty search, restoring original list');
            setTodoList(originalTodoListRef.current)
            return
        }

        const searchLower = searchTerm.toLowerCase()
        const filtered = originalTodoListRef.current.filter((todoIssue) => {
            const tags = Array.isArray(todoIssue.tags) ? todoIssue.tags : []
            const users = Array.isArray(todoIssue.assignedUsers) ? todoIssue.assignedUsers : []


            // // Format date to match possible search patterns (DD-MM-YYYY or DD/MM/YYYY)
            // const formattedDate = todoIssue.dueDate instanceof Date
            //     ? todoIssue.dueDate.toLocaleDateString('es-ES', {
            //         year: 'numeric',
            //         month: '2-digit',
            //         day: '2-digit'
            //     })
            //     : '';

            return (
                todoIssue.title.toLowerCase().includes(searchLower) ||
                todoIssue.description.toLowerCase().includes(searchLower) ||
                tags.some(tag => tag.title?.toLowerCase().includes(searchLower)) ||
                users.some(user => user.name?.toLowerCase().includes(searchLower)) ||
                ToDoIssue.getStatusColumnText(todoIssue.statusColumn).toLowerCase().includes(searchLower) 
                //formattedDate.includes(searchLower)
            );
        });

        console.log('Filtered results:', filtered.length);
        setTodoList(filtered);
    }, [searchTerm, originalTodoListRef.current]);



    // --- Lógica de Drag and Drop ---
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const todo = todoList.find(t => t.id === active.id);
        setActiveTodo(todo || null);
        setIsDragging(true);
    }

    const handleDragEnd =(event: DragEndEvent) => {
        setActiveTodo(null); // Limpiar el overlay
        setIsDragging(false)
        const { active, over } = event;

        if (over && active.id !== over.id) {
            isUserReordering.current = true // Marcar como reordenamiento real
            setTodoList((currentList) => {
                // Usar una función de actualización para obtener el estado más reciente
                const oldIndex = currentList.findIndex((item) => item.id === active.id);
                const newIndex = currentList.findIndex((item) => item.id === over.id);

                if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                    return currentList; // No hacer nada si no se encuentran los índices
                }

                // --- Calcular el nuevo sortOrder ANTES de mover ---
                const newSortOrder = calculateNewSortOrder(currentList, oldIndex, newIndex);

                if (newSortOrder === null) {
                    console.warn("Sort order calculation resulted in no change.");
                    return currentList; // No hubo cambio real de orden
                }

                // Mover el elemento en el array
                const reorderedListIntermediate = arrayMove(currentList, oldIndex, newIndex);

                // --- Actualizar el sortOrder del elemento movido ---
                const finalReorderedList = reorderedListIntermediate.map(todo => {
                    if (todo.id === active.id) {
                        // Crear una nueva instancia o clonar para inmutabilidad
                        return new ToDoIssue({ ...todo, sortOrder: newSortOrder });
                        // O si ToDoIssue no es una clase:
                        // return { ...todo, sortOrder: newSortOrder };
                    }
                    return todo;
                })

                //// Notificar al padre sobre el nuevo orden (con el sortOrder actualizado)
                //onTodoListReordered(finalReorderedList);
                // Desplazado a su propio useEffect para evitar el error de intentar renderizarse el padre antes de que termine el hijo. Mirar el use effect debajo de este.

                return finalReorderedList; // Actualizar el estado local
            });
        }
    }


    // --- NUEVO useEffect para notificar al padre DESPUÉS de actualizar el estado local ---
    React.useEffect(() => {
        if (!isUserReordering.current) return; // Solo procesar si fue un reordenamiento real

        // Comprobar si la lista local es diferente de la original que vino del proyecto
        // Esto evita llamadas innecesarias en la carga inicial o si no hubo cambios reales.
        // Puedría hacer una comparación más robusta si es necesario (ej. comparar IDs y sortOrders)
        const originalIds = originalTodoListRef.current.map(t => t.id).join(',');
        const currentIds = todoList.map(t => t.id).join(',');
        const originalSortOrders = originalTodoListRef.current.map(t => t.sortOrder).join(',');
        const currentSortOrders = todoList.map(t => t.sortOrder).join(',');

        // Solo notificar si el orden de IDs o los sortOrders han cambiado respecto a la lista original
        if (originalIds !== currentIds || originalSortOrders !== currentSortOrders) {
            console.log("ProjectDetailsToDoList: useEffect detecting change, calling onTodoListReordered");
            onTodoListReordered(todoList); // Llama a la prop del padre
            // Actualizar la referencia original para la próxima comparación
            originalTodoListRef.current = todoList;

            isUserReordering.current = false;// *** Resetea el flag DESPUÉS de notificar ***
        }
    }, [todoList, onTodoListReordered]); // Dependencias: el estado local y la función prop
    

    // --- Fin Lógica de Drag and Drop ---



    // Memorize the todo cards list to prevent unnecessary re-renders
    const toDoCardsList = React.useMemo(() =>
        todoList.map((todoItem) => {
            // Ensure we have a ToDoIssue instance
            const todoInstance = todoItem instanceof ToDoIssue
                ? todoItem
                : new ToDoIssue(todoItem);

            return (
                <ToDoCard
                    key={todoInstance.id} //La key va en el elemento raíz del map
                    toDoIssue={todoInstance}
                    onClickOpenToDoDetailsWindow={handleClickOpenToDo} 
                    isSortable={!searchTerm.trim()} // <-- Solo sorteable si no hay búsqueda activa
                    isDndEnabled={!searchTerm.trim()} // <-- Solo dnd si no hay búsqueda activa
                    isDragged={isDragging}
                />
            )
        }),
        [todoList, searchTerm, handleClickOpenToDo, isDragging, selectedToDo, isTodoDetailsWindowOpen] // Dependency on local todoList state
    )


    // Console.log wrapped in useEffect to avoid double logging
    React.useEffect(() => {
        console.log('ProjectDetailsToDoList - States:', {
            isDetailsWindowOpen: isTodoDetailsWindowOpen,
            selectedTodo: selectedToDo,
            projectTodos: project.todoList
        });
    }, [isTodoDetailsWindowOpen, selectedToDo, project.todoList]);


    //Open the form for a new todo issue
    const newToDoIssueForm = isNewToDoIssueFormOpen ? (
        <NewToDoIssueForm
            onClose={handleCloseNewToDoForm}
            project={project}
            onCreatedNewToDo={handleCreatedToDoIssue} />
    ) : null;
    

    //Open the detail page of an existing todo issue 
    const updateToDoDetailsWindow = isTodoDetailsWindowOpen && selectedToDo
        ? (            
            <ToDoDetailsWindow
                project={project}
                toDoIssue={selectedToDo}
                onClose={handleCloseToDoDetailsWindow}
                onUpdatedToDoIssue={handleUpdateToDoIssue}
                onDeleteToDoIssueButtonClick={handleDeleteToDoIssue}
                />
        )
        : null


    return (
        <div
            className="dashboard-card todo"
            style={{ flexBasis: 0, height: "80%", overflowY: "hidden" }}
        >
            <div
                style={{
                    padding: "10px 7px",
                    display: "flex",
                    flexDirection: "column",
                    rowGap: 20
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            columnGap: 10,
                            flexWrap: "wrap",
                            paddingLeft: 15,
                            alignItems: "baseline"
                        }}
                    >
                        {/* <button class="todo-button">                                    
                                        <svg class="todo-icon" role="img" aria-label="arrowleft" width="32" height="40">
                                            <use href="#arrowleft"></use>
                                        </svg>
                                    </button> */}
                        <h5>To-Do List :</h5>
                        <h4
                            id="todo-project-header-name"
                            style={{
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                wordBreak: "break-all",
                                maxWidth: "100%",
                                marginRight: 15
                            }}
                        />
                        {/* <button class="todo-button">
                                        <svg class="todo-icon" role="img" aria-label="arrowright" width="32" height="40">
                                            <use href="#arrowright"></use>
                                        </svg>
                                    </button> */}
                    </div>
                    <div>
                        <button onClick={onNewToDoIssueClick}
                            id="new-todo-issue-btn"
                            style={{
                                borderRadius: "var(--br-circle)",
                                aspectRatio: 1,
                                padding: 0,
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            <AddIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />                            
                        </button>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        columnGap: 15,
                        justifyContent: "space-between"
                    }}
                >
                    <div
                        style={{ display: "flex", alignItems: "center", columnGap: 10 }}
                    >
                        <SearchIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />
                        <SearchToDoBox onChange={onToDoIssueSearch} />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            columnGap: 5
                        }}
                    >
                        <CounterBox
                            filteredItemsNum={todoList.length > 0
                                ? todoList.length
                                : 0
                            }
                            totalItemsNum={originalTodoListRef.current.length > 0
                                ? originalTodoListRef.current.length
                                : 0
                            }
                        />
                    </div>
                </div>
            </div>
            <div id="details-page-todo-maincontainer">
                <div id="details-page-todo-secondcontainer">
                    {/* ENVOLVER LA LISTA CON DndContext y SortableContext */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter} //o closestCorners
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={todoList.map(t => t.id!)} // Array de IDs para la estrategia
                            strategy={verticalListSortingStrategy}
                            disabled={!!searchTerm.trim()} // Deshabilitar contexto si hay búsqueda
                        >
                            <div
                                id="details-page-todo-list"
                                style={{
                                    padding: "10px 7px 5px 7px",
                                    display: "flex",
                                    flexDirection: "column",
                                    rowGap: 15,
                                    alignContent: "center",
                                    overflowY: 'auto', // 'auto' Permitir scroll si la lista es larga
                                }}>
                                {toDoCardsList.length > 0 ? toDoCardsList : <h5 style={{ padding: 10 }}>No To-Do Issues</h5>}
                            </div>
                        </SortableContext>
                        {/* Opcional: Overlay para una mejor experiencia visual */}
                        <DragOverlay>
                            {activeTodo ? (
                                // Renderiza una ToDoCard normal, no la sortable, para el overlay
                                <ToDoCard
                                    toDoIssue={activeTodo}
                                    onClickOpenToDoDetailsWindow={() => { }} 
                                    isSortable={false} // El overlay nunca es sorteable
                                    isDndEnabled={false} // El overlay nunca es dnd
                                    isDragged={isDragging} // Para aplicar estilos de arrastre
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
            {newToDoIssueForm}
            {updateToDoDetailsWindow}
            
        </div>
    )
}


// Add display name for debugging purposes
ProjectDetailsToDoList.displayName = 'ProjectDetailsToDoList'
