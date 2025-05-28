import * as React from 'react';
//import { deleteToDoWithSubcollections, updateDocument, UpdateDocumentOptions } from '../services/firebase';

import { ToDoCard, MessagePopUp, type MessagePopUpProps } from '../react-components'

import { IToDoIssue, StatusColumnKey } from '../types';
import { TODO_STATUSCOLUMN } from '../const';
import { ToDoIssue } from '../classes/ToDoIssue';
import { Project } from '../classes/Project';


import {
    //KeyboardSensor,
    //PointerSensor,
    useDroppable,
    //useSensor,
    //useSensors,
    //type DragStartEvent,
    //type DragEndEvent,
} from '@dnd-kit/core';
import {    
    //sortableKeyboardCoordinates,
    //arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'




interface Props {
    columnId: string
    todos: ToDoIssue[]
    project: Project | null
    isDndEnabled: boolean
    onUpdatedProject: (updatedProject: Project) => void
    onCreatedToDoIssue: (createdNewToDoIssue: ToDoIssue) => void
    onUpdatedToDoIssue: (updatedTodo: ToDoIssue) => void
    //onDeletedToDoIssue: (deletedTodo: ToDoIssue) => void
    onClickOpenToDoDetailsWindow: (todo: ToDoIssue) => void; 
}

export function ToDoBoardColumn({
    columnId,
    todos,
    project,
    isDndEnabled,
    onUpdatedProject,
    onCreatedToDoIssue,
    onUpdatedToDoIssue,
    onClickOpenToDoDetailsWindow

}: Props) {

    const { setNodeRef, isOver } = useDroppable({
        id: columnId,
        disabled: !isDndEnabled,
        data: {
            type: 'column',
            columnId: columnId,
            isEmpty: todos.length === 0
        }
    });

    //const [isNewToDoIssueFormOpen, setIsNewToDoIssueFormOpen] = React.useState(false)
    //const [isTodoDetailsWindowOpen, setIsTodoDetailsWindowOpen] = React.useState(false)
    //const [selectedToDo, setSelectedToDo] = React.useState<ToDoIssue | null>(null)

    //const [searchTerm, setSearchTerm] = React.useState('');
    //const [activeTodo, setActiveTodo] = React.useState<ToDoIssue | null>(null) // Para DragOverlay
    
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)

    const columns = Object.keys(TODO_STATUSCOLUMN) as StatusColumnKey[];
    

    // Debugging
    React.useEffect(() => {
        console.log(`Column ${columnId} state:`, {
            isDndEnabled,
            isOver,
            isEmpty: todos.length === 0,
            todosCount: todos.length
        });
    }, [columnId, isDndEnabled, isOver, todos.length]);





    // const handleCloseNewToDoForm = () => {
    //     // Cierra el formulario
    //     setIsNewToDoIssueFormOpen(false)
    // }

    // const onNewToDoIssueClick = () => {
    //     setIsNewToDoIssueFormOpen(true)
    // }

    // const handleCreatedToDoIssue = (createdNewToDoIssue: ToDoIssue) => {
    //     onCreatedToDoIssue(createdNewToDoIssue)
    //     setIsNewToDoIssueFormOpen(false);
    // }


    // const handleClickOpenToDo = (toDoIssue) => {
    //     try {
    //         console.log('handleClickOpenToDo called with:', toDoIssue)
    //         // Verify todo is valid
    //         if (!toDoIssue || !toDoIssue.id) {
    //             console.error('Invalid todo object:', toDoIssue);
    //             return;
    //         }

    //         setSelectedToDo(toDoIssue)
    //         setIsTodoDetailsWindowOpen(true)
    //         console.log('States after update:', {                
    //             selectedTodo: isNewToDoIssueFormOpen
    //         });
    //     } catch (error) {
    //         console.error('Error in handleClickOpenToDo:', error)
    //     }
    // }

    // const handleCloseToDoDetailsWindow = () => {
    //     console.log('Closing ToDoDetailsWindow')
    //     setIsTodoDetailsWindowOpen(false)
    //     setSelectedToDo(null)
    // }

    // const handleDeleteToDoIssue = async (projectId: string, todoId: string) => {
    //     console.log("Delete ToDo Issue funtion launched for  todo:", selectedToDo!.id)
    //     if (!project) { // <-- Comprobar si el proyecto existe
    //         console.error("Cannot delete ToDo: Project data is not available.");
    //         return;
    //     }
    //     try {
    //         // Update the local data project  removing the todo
    //         const updatedTodoList = todos.filter(todo => todo.id !== todoId)
            
    //         const updatedProject = { ...project, todoList: updatedTodoList }

    //         // Notifica al componente padre del cambio
    //         onUpdatedProject(updatedProject);

    //         setIsTodoDetailsWindowOpen(false)
    //         setSelectedToDo(null)
    //     } catch (error) {
    //         console.error('ProjectDetailsTodOList: Error deleting todo from projects.Manager:', error);
    //     }

    // }

    // const handleUpdateToDoIssue = (updatedTodo: ToDoIssue) => {
    //     if (!project) { // <-- Comprobar si el proyecto existe
    //         console.error("Cannot update ToDo: Project data is not available.");
    //         return;
    //     }
    //     console.log('ProjectDetailsToDoList - handleUpdateToDoIssue:', {
    //         todoId: updatedTodo.id,
    //         updates: updatedTodo
    //     })
    
    //     // Create new todoList with updated todo
    //     const updatedTodoList = todos.map(todo =>
    //         todo.id === updatedTodo.id ? updatedTodo : todo
    //     )
    
    //     // Create new project with updated todoList
    //     const updatedProject = {
    //         ...project,
    //         todoList: updatedTodoList
    //     }
    
    //     // Update parent state
    //     onUpdatedProject(updatedProject)
    
    //     // Update local state
    //     //setTodoList(updatedTodoList) // El estado 'todos' viene de props, no se modifica aquí
    
    //     //Notify the parent todo object to trigger the rerender.
    //     onUpdatedToDoIssue(updatedTodo)    

    // }



    // Memorize the todo cards list to prevent unnecessary re-renders
    // --- DEBUGGING ---
    console.log(`ToDoBoardColumn [${columnId}] Props:`, {
      isDndEnabled // Esta prop es (Page.isDndEnabled && !Page.isSearching)
    });

    const toDoCardsList = React.useMemo(() => {
        console.log(`ToDoBoardColumn [${columnId}]: Recalculating cards. isDndEnabled: ${isDndEnabled}`)
        return todos.map(todoItem => {
            // Ensure we have a ToDoIssue instance
            const todoInstance = todoItem instanceof ToDoIssue
                ? todoItem
                : new ToDoIssue(todoItem);

            return (
                <ToDoCard
                    key={todoInstance.id} //La key va en el elemento raíz del map
                    toDoIssue={todoInstance}
                    isDndEnabled={isDndEnabled}
                    onClickOpenToDoDetailsWindow={onClickOpenToDoDetailsWindow} 
                    isSortable={isDndEnabled} // <-- isDndEnabled ya incluye !isSearching
                />
            )
        })
    }, [todos, isDndEnabled, onClickOpenToDoDetailsWindow]) // Dependency on local todoList state
    
    





    return (
        <div
            ref={setNodeRef} // Importante para que dnd-kit reconozca esta columna como "droppable"
            id={`todo-board-column-${columnId}`} // ID más específico y único por columna
            //id="details-page-todo-maincontainer"
            className={`board-column todo-column ${isOver ? 'column-is-over' : ''}`}
            data-column-id={columnId} // Para depuración o estilos
            data-droppable={isDndEnabled}
            data-is-empty={todos.length === 0}
            style={{
                minHeight: '200px', // Asegurar altura mínima
                backgroundColor: isOver ? 'rgba(0, 120, 255, 0.1)' : undefined,
                transition: 'background-color 0.2s',
                overflow: 'visible',
                // display: 'flex',
                // flexDirection: 'column',

                // flex: 1,
                // padding: '10px',
                // gap: '10px',

            }}

        >
            <div
                id={`details-page-todo-secondcontainer-${columnId}`}
                    // style={{
                    //     overflowY: 'auto', // Permitir scroll si hay muchas tareas
                    // }}
                
                >
                <div
                    className="todo-column-head"
                    style={{
                        borderRadius: '10px',
                        backgroundImage: 'radial-gradient(var(--color-light) 2px, transparent 2px), radial-gradient(var(--color-light) 2px, transparent 2px)',
                        backgroundPosition: '2 2, 20px 20px',             // offset the two gradients
                        backgroundSize: '7px 7px',                      // define pattern size to show repeated pattern
                        margin: '0 0 15px 0',
                        
                    }}
                >
                    {/* <h4>{columnId.charAt(0).toUpperCase() + columnId.slice(1)}</h4> */}
                    <h4>{TODO_STATUSCOLUMN[columnId as keyof typeof TODO_STATUSCOLUMN]}</h4>
                </div>
                <SortableContext 
                    items={todos.map(t => t.id!)} // IDs de las tareas en esta columna
                    strategy={verticalListSortingStrategy}
                    disabled={!isDndEnabled } // El contexto de ordenamiento se deshabilita si dnd no está activo
                >
                    <div
                        id={`todo-column-${columnId}`}
                        className="todo-column-list details-page-todo-list"
                        style={{
                            padding: 25,
                            display: "flex",
                            flexDirection: "column",
                            rowGap: 15,
                            alignContent: "center",
                            //overflow: 'visible', // Permitir que los elementos se desborden si es necesario

                            //minHeight: '100%', // Asegura altura mínima
                            height: 'fit-content',    // Permite crecer según el contenido
                            flex: 1,          // Toma el espacio disponible
                            overflow: 'visible',

                            backgroundAttachment: 'local', // Importante: hace que el background se desplace con el contenido
                            scrollSnapType: 'y mandatory', // Para snap de los TodoCards




                    }}>
                        {toDoCardsList.length > 0 ? (
                            toDoCardsList
                            ) : (
                            <div
                                    style={{
                                        padding: 10,
                                        textAlign: 'center',
                                        color: 'var(--color-fontbase)',
                                        backdropFilter: 'blur(2px) saturate(150%)',
                                        backgroundColor: 'rgba(17, 25, 40, 0.01)',
                                        borderRadius: '20px',
                                        height: 'auto',
                                        
                                        // backgroundColor: 'var(--color-bg)',
                                        // backdropFilter: 'blur(0.5px)',
                                        // WebkitBackdropFilter: 'blur(0.5px)',
                                    }}>
                                {/* Mensaje opcional si la columna está vacía y se está arrastrando sobre ella */}
                                {/* {isOver && <p>Drop here</p>} */}
                                {!isDndEnabled && <h5>Drag & Drop is disabled.</h5>}
                                {isDndEnabled && <h5>No To-Do Issues. Drag items here.</h5>}
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>

    )
}

// Add display name for debugging purposes
ToDoBoardColumn.displayName = 'ToDoBoardColumn'

