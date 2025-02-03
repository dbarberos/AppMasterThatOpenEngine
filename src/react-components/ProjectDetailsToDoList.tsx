import * as React from 'react';
import * as Router from 'react-router-dom';

import { ToDoDetailsCard, NewToDoIssueForm } from '../react-components';


import { Project } from '../classes/Project';
import { ToDoIssue, IToDoIssue } from '../classes/ToDoIssue';
//import { ProjectsManager } from '../classes/ProjectsManager';
//import { ToDoManager } from '../classes/ToDoManager';
//import { showModal } from '../classes/UiManager';



interface Props {   
    project: Project
    onUpdatedProject: (updatedProject: Project) => void
}

export function ProjectDetailsToDoList({project, onUpdatedProject}:  Props) {

    const [isNewToDoIssueFormOpen, setIsNewToDoIssueFormOpen] = React.useState(false)

    const [todoList, setTodoList] = React.useState<IToDoIssue[]>(project.todoList)

    //const [updateProject, setUpdateProject]= React.useState(project)

    // ToDoManager.onToDoIssueCreated = () => { setTodoList([...props.project.todoList]) }
    // ToDoManager.onToDoIssueDeleted = () => { setTodoList([...props.project.todoList]) }


    const handleUpdateToDoList = (newToDo: ToDoIssue) => {
        const updatedToDoList = [...project.todoList, newToDo];
        const updatedProject = {...project, todoList: updatedToDoList}
        onUpdatedProject(updatedProject) // Pass the NEW project object to the parent
    }


    const handleCloseForm = () => {
        // Cierra el formulario
        setIsNewToDoIssueFormOpen(false);
        console.table(todoList);
    };


    const onNewToDoIssueClick = () => {

        setIsNewToDoIssueFormOpen(true)

        
        //const checkProjectId = (btnNewToDoIssue as HTMLElement)?.dataset.projectId ?? ""
        //console.log(checkProjectId)
        const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement
    
        if (toDoIssueForm && toDoIssueForm instanceof HTMLFormElement) {
    
            // *** RESET THE FORM BEFORE OPEN IT***
            // 1. Target specific input types
            const inputsToReset = toDoIssueForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea, select');
    
            // 2. Loop through and reset each element
            inputsToReset.forEach(element => {
                (element as HTMLInputElement).value = ''; // Reset to empty string
    
                // Additional handling for select elements:
                if (element instanceof HTMLSelectElement) {
                    element.selectedIndex = 0; // Reset to the first option
                }
            })
    
            //3.Delete de tags stored in the form
            const tagsListToReset = document.getElementById("todo-tags-list") as HTMLElement
            while (tagsListToReset.children.length > 0) {
                tagsListToReset.removeChild(tagsListToReset.children[0])
            }
    
            //4.Delete de assignedUsers stored in the form
            const assignedUsersListToReset = document.querySelector("#todo-assignedUsers-list") as HTMLElement
            while (assignedUsersListToReset.children.length > 0) {
                assignedUsersListToReset.removeChild(assignedUsersListToReset.children[0])
            }
    
            // 5.Set Modal in case previously we updated a To-Do Issue
            // Update Modal Title
            const modalToDoIssueTitle = document.getElementById("modal-todoIssue-title");
            if (modalToDoIssueTitle) {
                modalToDoIssueTitle.textContent = "New To-Do Issue";
            }
            // Update Button Text
            const submitButton = document.getElementById("accept-todo-btn");
            if (submitButton) {
                submitButton.textContent = "Accept";
            }
            const discardButton = document.getElementById("cancel-todo-btn");
            if (discardButton) {
                discardButton.textContent = "Cancel";
            }

            /* Set the data-projectId attribute with the unique ID of the proyect in the button of submit new To-Do
    
            // Set the data-projectId attribute with the unique ID of the proyect in the button of submit new To-Do
            const projectToDoDatasetAttributeId = document.getElementById("accept-todo-btn")
            if (checkProjectId !== undefined && projectToDoDatasetAttributeId) {
                projectToDoDatasetAttributeId.dataset.projectId = checkProjectId.toString()
            }
            //Completed the data fixed for this new ToDoIssu as create date or Origin Project (Origin User sould be amended later)
            const todoProjectElement = document.querySelector('span[id="todo-project-name"]');
            const createDateElement = document.querySelector('span[id="todo-creation-date"]');
            
    
            if (checkProjectId) {
                const project = projectManager.getProject(checkProjectId)
                if (project && todoProjectElement) {
                    todoProjectElement.textContent = project?.name; // Mostrar nombre del proyecto
                } else {
                    console.error(`Project not found with ID ${checkProjectId} or todoProjectEleemnt is null`)
                }
    
                const currentDate = new Date()
                if (createDateElement) {
                    createDateElement.textContent = currentDate.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                    }).replace(/\//g, "-");
                } else {
                    console.error("createDataElement is null")
                }
    
            }
            */
        }    
        //showModal("new-todo-card-modal")//**Old call to the Form**

    }


    const newToDoIssueForm = isNewToDoIssueFormOpen ? (
        <NewToDoIssueForm onClose={handleCloseForm} project={project} onUpdateToDoList={handleUpdateToDoList} />
    ) : null;

    
    const toDoCardsList = project.todoList.map((toDoIssue) => {
        return (
            <Router.Link to={`/project/${toDoIssue.id}`} key={toDoIssue.id}>
                <ToDoDetailsCard toDoIssue ={toDoIssue} />
            </Router.Link>
            
        );
    });



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
                        <span className="material-icons-round">add</span>
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
                    <span className="material-icons-round">search</span>
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
                    }}>{toDoCardsList}
                    </div>
                </div>
            </div>
            {newToDoIssueForm}
        </div>
        


    )
}
    