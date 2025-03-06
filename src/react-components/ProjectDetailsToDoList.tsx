import * as React from 'react';
import * as Router from 'react-router-dom';

import { ToDoCard, NewToDoIssueForm,} from '../react-components';
import { AddIcon, SearchIcon } from './icons';

import { Project } from '../classes/Project';
import { ToDoIssue, IToDoIssue } from '../classes/ToDoIssue';
//import { ProjectsManager } from '../classes/ProjectsManager';
//import { ToDoManager } from '../classes/ToDoManager';
//import { showModal } from '../classes/UiManager';



interface Props {
    project: Project
    onUpdatedProject: (updatedProject: Project) => void
    onCreatedToDoIssue: (createdNewToDoIssue: ToDoIssue) => void
}

export function ProjectDetailsToDoList({ project, onUpdatedProject, onCreatedToDoIssue }: Props) {
    console.log('ProjectDetailsToDoList rendering with todos:', project.todoList);


    const [isNewToDoIssueFormOpen, setIsNewToDoIssueFormOpen] = React.useState(false)
    const [isTodoDetailsWindowOpen, setIsTodoDetailsWindowOpen] = React.useState(false)

    const [todoList, setTodoList] = React.useState<IToDoIssue[]>(project.todoList)

    //const [updateProject, setUpdateProject]= React.useState(project)

    // ToDoManager.onToDoIssueCreated = () => { setTodoList([...props.project.todoList]) }
    // ToDoManager.onToDoIssueDeleted = () => { setTodoList([...props.project.todoList]) }


    // const handleUpdateToDoList = (newToDo: ToDoIssue) => {
    //     const updatedToDoList = [...project.todoList, newToDo];
    //     const updatedProject = { ...project, todoList: updatedToDoList }
    //     onUpdatedProject(updatedProject) // Pass the NEW project object to the parent
    // }



    const handleCloseForm = () => {
        // Cierra el formulario
        setIsNewToDoIssueFormOpen(false);
        console.table(todoList);
    };


    const onNewToDoIssueClick = () => {
        setIsNewToDoIssueFormOpen(true)

    }

    const handleClickOpenToDo = () => {
        setIsTodoDetailsWindowOpen(true)
    }

    const handleCreatedToDoIssue = (createdNewToDoIssue: ToDoIssue) => {
        onCreatedToDoIssue(createdNewToDoIssue)
        setIsNewToDoIssueFormOpen(false);
    }


    const toDoCardsList = project.todoList.map((toDoIssue) => {
        console.log('Rendering ToDoCard with issue:', toDoIssue);
        return (
            <ToDoCard
                key={toDoIssue.id}
                toDoIssue={toDoIssue}
                handleClickOpenToDoDetailsWindow={() => {
                    console.log('ToDoCard clicked:', toDoIssue)
                    handleClickOpenToDo
                }} //This should open de window todo page not the new todo form
            />
        );
    });

    //Open the form for a new todo issue
    const newToDoIssueForm = isNewToDoIssueFormOpen ? (
        <NewToDoIssueForm
            onClose={handleCloseForm}
            project={project}
            onCreatedNewToDo={handleCreatedToDoIssue} />
    ) : null;

    //Open the detail page of an existing todo issue  **************** PENDIENTE DE TERMINAR ***************

    const updateToDoDetailsForm = isTodoDetailsWindowOpen
        ? (
            <ToDoDetailsWindow
                onClose={handleCloseForm}
                updateProject={project}
                onCreatedProject={handleCreatedProject}
                onUpdatedProject={handleUpdatedProject}
                projectsManager={projectsManager} />
        ) : null




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
        </div>



    )
}
