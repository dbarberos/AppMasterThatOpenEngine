import * as React from 'react';
import * as Router from 'react-router-dom';

import { ToDoCard, NewToDoIssueForm, ToDoDetailsWindow, toggleSidebar } from '../react-components';
import { AddIcon, SearchIcon } from './icons';

import { type Project } from '../classes/Project';
import { ToDoIssue, type IToDoIssue } from '../classes/ToDoIssue';
import { log } from 'three/examples/jsm/nodes/Nodes.js';
//import { ProjectsManager } from '../classes/ProjectsManager';
//import { ToDoManager } from '../classes/ToDoManager';
//import { showModal } from '../classes/UiManager';



interface Props {
    project: Project
    onUpdatedProject: (updatedProject: Project) => void
    onCreatedToDoIssue: (createdNewToDoIssue: ToDoIssue) => void
}

export function ProjectDetailsToDoList({ project, onUpdatedProject, onCreatedToDoIssue }: Props) {


    
    const [isNewToDoIssueFormOpen, setIsNewToDoIssueFormOpen] = React.useState(false)
    const [isTodoDetailsWindowOpen, setIsTodoDetailsWindowOpen] = React.useState(false)
    const [selectedToDo, setSelectedToDo] = React.useState<ToDoIssue | null>(null);
    const [initialSidebarState, setInitialSidebarState] = React.useState<boolean | null>(null);

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
                willOpenWindow: true,
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

    const handleDeleteToDoIssue = () => {
        console.log("Delete ToDo Issue funtion launched for  todo:", selectedToDo!.id)

    }


    // ***ESTA FUNCION HAY QUE PASARLA AL TODOMANAGER  *** 

    const handleUpdateToDoIssue = (updatedTodo: ToDoIssue) => {
        if (!project.id) return;

        const updatedTodoList = project.todoList.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo
        );

        const updatedProject = { ...project, todoList: updatedTodoList };
        onUpdatedProject(updatedProject);
    };


    // Memorize the todo cards list to prevent unnecessary re-renders
    const toDoCardsList = React.useMemo(() =>
        project.todoList.map((todoItem) => {
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
        [project.todoList] // Only re-run if todoList changes
    )


    // Console.log wrapped in useEffect to avoid double logging
    React.useEffect(() => {
        console.log('ProjectDetailsToDoList - States:', {
            isDetailsWindowOpen: isTodoDetailsWindowOpen,
            selectedTodo: selectedToDo,
            projectTodos: project.todoList
        });
    }, [isTodoDetailsWindowOpen, selectedToDo, project.todoList]);

    // Store initial sidebar state when mounting ToDoDetailsWindow
    React.useEffect(() => {
        if (isTodoDetailsWindowOpen && initialSidebarState === null) {
            const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
            setInitialSidebarState(sidebarCheckbox?.checked || false);
            toggleSidebar.collapse();
        }

        // Cleanup restore initial state when unmounting
        return () => {
            if (!isTodoDetailsWindowOpen && initialSidebarState !== null) {
                const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
                if (sidebarCheckbox) {
                    sidebarCheckbox.checked = initialSidebarState;
                }
                setInitialSidebarState(null);
            }
        };
    }, [isTodoDetailsWindowOpen, , initialSidebarState]);



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
                        style={{ display: "flex", alignItems: "center", columnGap: 15 }}
                    >
                        <SearchIcon size={24} className="todo-icon-plain" color="var(--color-fontbase)" />                        
                        <input
                            id="todo-search-in-Project-Details"
                            type="search"
                            placeholder="Search inside To-Do"
                        />
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            columnGap: 5
                        }}
                    >
                        <div id="todolist-search-counter">Counter</div>
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
                        </button>
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
