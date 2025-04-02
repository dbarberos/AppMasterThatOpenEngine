import * as React from 'react';
import * as Router from 'react-router-dom';

import { ToDoCard, NewToDoIssueForm, ToDoDetailsWindow, toggleSidebar, SearchToDoBox, CounterBox } from '../react-components';
import { AddIcon, SearchIcon } from './icons';

import { type Project } from '../classes/Project';
import { ToDoIssue, } from '../classes/ToDoIssue';
import { type IToDoIssue } from '../Types';
import { log } from 'three/examples/jsm/nodes/Nodes.js';
//import { ProjectsManager } from '../classes/ProjectsManager';
//import { ToDoManager } from '../classes/ToDoManager';
//import { showModal } from '../classes/UiManager';



interface Props {
    project: Project
    onUpdatedProject: (updatedProject: Project) => void
    onCreatedToDoIssue: (createdNewToDoIssue: ToDoIssue) => void
    onUpdatedToDoIssue: (updatedTodo: ToDoIssue) => void
    //onDeletedToDoIssue: (deletedTodo: ToDoIssue) => void
}

export function ProjectDetailsToDoList({
    project,
    onUpdatedProject,
    onCreatedToDoIssue,
    onUpdatedToDoIssue,
    //onDeletedToDoIssue
}: Props) {
    
    const [isNewToDoIssueFormOpen, setIsNewToDoIssueFormOpen] = React.useState(false)
    const [isTodoDetailsWindowOpen, setIsTodoDetailsWindowOpen] = React.useState(false)
    const [selectedToDo, setSelectedToDo] = React.useState<ToDoIssue | null>(null);
    //const [initialSidebarState, setInitialSidebarState] = React.useState<boolean | null>(null);

    // TodoList state to track changes
    const [todoList, setTodoList] = React.useState<ToDoIssue[]>(project.todoList);



    //const [todoList, setTodoList] = React.useState<IToDoIssue[]>(project.todoList)

    //const [updateProject, setUpdateProject]= React.useState(project)

    // ToDoManager.onToDoIssueCreated = () => { setTodoList([...props.project.todoList]) }
    // ToDoManager.onToDoIssueDeleted = () => { setTodoList([...props.project.todoList]) }


    // const handleUpdateToDoList = (newToDo: ToDoIssue) => {
    //     const updatedToDoList = [...project.todoList, newToDo];
    //     const updatedProject = { ...project, todoList: updatedToDoList }
    //     onUpdatedProject(updatedProject) // Pass the NEW project object to the parent
    // }

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
            console.error('Error in handleClickOpenToDo:', error);
        }
    }

    const handleCloseToDoDetailsWindow = () => {
        console.log('Closing ToDoDetailsWindow');
        setIsTodoDetailsWindowOpen(false)
        setSelectedToDo(null)
    }

    const handleDeleteToDoIssue = async (projectId: string, todoId: string) => {
        console.log("Delete ToDo Issue funtion launched for  todo:", selectedToDo!.id)
        try {
            // Actualiza el proyecto local removiendo el todo
            const updatedTodoList = project.todoList.filter(todo => todo.id !== todoId);
            const updatedProject = { ...project, todoList: updatedTodoList };

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

    };


    // Update useEffect to sync with project changes
    React.useEffect(() => {
        console.log('ProjectDetailsToDoList - Project todoList changed:', {
            projectId: project.id,
            todoListLength: project.todoList.length,
            todoListIds: todoList.map(todo => todo.id)
        });
        setTodoList(project.todoList);
    }, [project.todoList])



    const onToDoIssueSearch = (value: string) => {
        const searchLower = value.toLowerCase()
        const filteredList = project.todoList.filter((todoIssue) => {
            // Safely check if arrays exist
            const tags = Array.isArray(todoIssue.tags) ? todoIssue.tags : [];
            const users = Array.isArray(todoIssue.assignedUsers) ? todoIssue.assignedUsers : [];

            return (
                // Check title and description
                todoIssue.title.toLowerCase().includes(searchLower) ||
                todoIssue.description.toLowerCase().includes(searchLower) ||
                // Check tags - looking for tag.title
                tags.some(tag =>
                    tag.title?.toLowerCase().includes(searchLower)
                ) ||
                // Check assigned users - looking for user.name
                users.some(user =>
                    user.name?.toLowerCase().includes(searchLower)
                ) ||
                // Check status column text
                ToDoIssue.getStatusColumnText(todoIssue.statusColumn).toLowerCase().includes(searchLower)
            );
        })
        setTodoList(filteredList)
    }


    // Memorize the todo cards list to prevent unnecessary re-renders
    const toDoCardsList = React.useMemo(() =>
        todoList.map((todoItem) => {
            // Ensure we have a ToDoIssue instance
            const todoInstance = todoItem instanceof ToDoIssue
                ? todoItem
                : new ToDoIssue(todoItem);

            return (
                <ToDoCard
                    key={todoInstance.id}
                    toDoIssue={todoInstance}
                    onClickOpenToDoDetailsWindow={ handleClickOpenToDo } 
                />
            )
        }),
        [todoList] // Dependency on local todoList state
    )


    // Console.log wrapped in useEffect to avoid double logging
    React.useEffect(() => {
        console.log('ProjectDetailsToDoList - States:', {
            isDetailsWindowOpen: isTodoDetailsWindowOpen,
            selectedTodo: selectedToDo,
            projectTodos: project.todoList
        });
    }, [isTodoDetailsWindowOpen, selectedToDo, project.todoList]);


    // // Add these state handlers using useCallback
    // const handleSidebarState = React.useCallback((isOpen: boolean) => {
    //     const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
    //     if (!sidebarCheckbox) return;

    //     if (isOpen) {
    //         // Store current state and collapse sidebar when opening
    //         setInitialSidebarState(sidebarCheckbox.checked);
    //         toggleSidebar.collapse();
    //     } else {
    //         // Restore state when closing
    //         if (initialSidebarState !== null) {
    //             sidebarCheckbox.checked = initialSidebarState;
    //             setInitialSidebarState(null);
    //         }
    //     }
    // }, [initialSidebarState]);

    // // Update the useEffect to use the callback
    // React.useEffect(() => {
    //     if (isTodoDetailsWindowOpen) {
    //         handleSidebarState(true);
    //     } else {
    //         handleSidebarState(false);
    //     }

    //     // Cleanup function
    //     return () => {
    //         if (!isTodoDetailsWindowOpen) {
    //             handleSidebarState(false);
    //         }
    //     };
    // }, [isTodoDetailsWindowOpen, handleSidebarState]);



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
                        <SearchToDoBox onChange={(value) => onToDoIssueSearch(value)} />                        
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
                            filteredItemsNum={todoList.length > 0 ? todoList.length : 0 }
                            totalItemsNum={project.todoList.length > 0 ?project.todoList.length :0}
                        />
                        {/*<div id="todolist-search-counter">Counter</div>
                         <button className="todo-icon-plain" id="btn-todo-arrowup">
                            <svg
                                className="todo-icon"
                                role="img"
                                aria-label="arrow-upward"
                                width={24}
                                height={24}
                            >
                                <use href="#arrow-upward" />
                            </svg>
                        </button>
                        <button className="todo-icon-plain" id="btn-todo-arrowdown">
                            <svg
                                className="todo-icon"
                                role="img"
                                aria-label="arrow-downward"
                                width={24}
                                height={24}
                            >
                                <use href="#arrow-downward" />
                            </svg>
                        </button> */}
                    </div>
                </div>
            </div>
            <div id="details-page-todo-maincontainer">
                <div id="details-page-todo-secondcontainer">
                    <div
                        id="details-page-todo-list"
                        style={{
                            padding: "10px 7px 5px 7px",
                            display: "flex",
                            flexDirection: "column",
                            rowGap: 15,
                            alignContent: "center"
                        }}>
                        {toDoCardsList}
                    </div>
                </div>
            </div>
            {newToDoIssueForm}
            {updateToDoDetailsWindow}
            {}
        </div>



    )
}
