import * as React from 'react';


import { MessagePopUp } from '../react-components';


import { Project } from '../classes/Project';
import { IToDoIssue, ToDoIssue } from '../classes/ToDoIssue';
import { newToDoIssue } from '../classes/ToDoManager';


interface NewToDoIssueFormProps {
    onClose: () => void;
    project: Project;
    onUpdateToDoList: (newToDo: ToDoIssue) => void;

}


export function NewToDoIssueForm({ onClose, project, onUpdateToDoList }: NewToDoIssueFormProps) {

    const [tags, setTags] = React.useState<string[]>([]); 
    const [assignedUsers, setAssignedUsers] = React.useState<string[]>([]);
    const [showMessagePopUp, setShowMessagePopUp] = React.useState<React.ReactElement | null>(null);




    const handleMessagePopUp = (options: {
        type: 'error' | 'warning' | 'info' | 'success' | 'update' | 'message' | 'clock' | 'arrowup';
        title: string;
        message: string;
        actions?: string[]; //The interrogation symbol make actions optional
        messageHeight?: string;
        callbacks?: Record<string, () => void>;  // Callbacks for actions

    }) => {
        setShowMessagePopUp( // Set the React element to the state
            <MessagePopUp
            type={options.type}
            title={options.title}
            message={options.message}
            actions={options.actions || []}
                messageHeight={options.messageHeight || "200"}
                onActionClick={(action) => {
                    options.callbacks?.[action]?.(); //Call the appropriate callback
                    setShowMessagePopUp(null); //Close the message after action
                }}
            onClose={() => setShowMessagePopUp(null)} // Close the dialog if no actions or just closed
            />            
        );
    }





    const handleNewToDoIssueFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation() // Prevent event from bubbling up
        //Obtaining data from the form via giving an id to the form and using FormToDoData
        //const cancelToDoForm: Element | null = document.getElementById("cancel-todo-btn");
        const submitToDoFormButton = document.getElementById("accept-todo-btn")
        const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement
        
        
        if (!(toDoIssueForm && toDoIssueForm instanceof HTMLFormElement)) { return }

        // const checkProjectId = submitToDoFormButton?.dataset.projectId
        //submitToDoFormButton?.addEventListener("click", (e) => {
        
        console.log("submitToDoFormButton press")
        const formToDoData = new FormData(toDoIssueForm)
        console.log(formToDoData)
        const checkToDoId = (submitToDoFormButton as HTMLButtonElement)?.dataset.toDoIssueId
        //const checkProjectId = (submitToDoFormButton as HTMLButtonElement)?.dataset.projectId
        const checkProjectId = project.id
        // console.log(checkToDoId)
        //console.log("checkProjectId",checkProjectId)

        if (toDoIssueForm.checkValidity()) {
            //Form is valid, proceed with data processing

            // If checkToDoId is empty is because the user is not updating data in the form, so we are going to create a new todoIssue.
            if (!checkToDoId) {
                //When the form is for a new To-Do Issue not an update

                // *** Get the dueDate from the form data ***
                let dueDateToDoForm: Date | null = null // Allow null initially
                const dueDateToDoFormString = formToDoData.get("dueDate") as string
                // Try to create a Date object, handling potential errors
                if (dueDateToDoFormString) {
                    dueDateToDoForm = new Date(dueDateToDoFormString)
                    // Check if the Date object is valid
                    if (isNaN(dueDateToDoForm.getTime())) {
                        // Handle invalid date input (e.g., show an error message)
                        console.error("Invalid date input:", dueDateToDoFormString);
                        dueDateToDoForm = null; // Reset to null if invalid
                    }
                }
                // Set to current date if no valid date was provided
                if (!dueDateToDoForm) {
                    dueDateToDoForm = new Date("2025-12-31"); // Create a new Date object for today
                }
                console.log("dueDateToDoFormString",dueDateToDoFormString)
                
                
                // Get the current Date as the Created Date
                const currentDate = new Date();
                //Get the value of the statusColumn and assign a default value if necessary.
                const statusColumnValue = formToDoData.get("statusColumn") as string || "notassigned"


                const toDoIssueDetails: IToDoIssue = {
                    title: formToDoData.get("title") as string,
                    description: formToDoData.get("description") as string,
                    statusColumn: statusColumnValue,
                    tags: tags,
                    assignedUsers: assignedUsers,
                    dueDate: dueDateToDoForm,
                    todoProject: checkProjectId as string,
                    createdDate: currentDate,
                    todoUserOrigin: formToDoData.get("todoUserOrigin") as string,
                }

                try {
                    //if (!checkProjectId) {
                        const toDoListInProject = project.todoList; 
                        const newToDo = newToDoIssue(toDoListInProject, toDoIssueDetails)
                        //const newToDoList = [...toDoListInProject, newToDo]
                        onUpdateToDoList(newToDo)
                    
                    
                        onCloseNewToDoIssueForm(e)
                        //toDoIssueForm.reset()
                        //closeModal("new-todo-card-modal")

                        // setUpToDoBoard(checkProjectId) //Testing updatin the todoList inside todo-apge

                        // Log the project details                        
                        //console.log("Project details:", project);
                
                    //}

                } catch (err) {
                    const errorPopUp = document.querySelector(".message-popup")
                    const contentError = {
                        contentDescription: err.message,
                        contentTitle: "Error",
                        contentClass: "popup-error",
                        contentIcon: "report"
                    }
                    if (err) {
                        const text = document.querySelector("#message-popup-text p")
                        if (text) {
                            text.textContent = contentError.contentDescription
                        }
                        const title = document.querySelector("#message-popup-text h5")
                        if (title) {
                            title.textContent = contentError.contentTitle
                        }
                        const icon = document.querySelector("#message-popup-icon span")
                        if (icon) {
                            icon.textContent = contentError.contentIcon
                        }
                        errorPopUp?.classList.add(contentError.contentClass)
                        toggleModal("message-popup")
                    }
                    const closePopUp: Element | null = document.querySelector(".btn-popup")
                    if (closePopUp) {
                        const closePopUpHandler = () => {
                            toggleModal("message-popup");
                            closePopUp.removeEventListener("click", closePopUpHandler);
                        }
                        closePopUp.addEventListener("click", closePopUpHandler);
                    }
                }
            }

        } else {
            // Form is invalid, let the browser handle the error display
            toDoIssueForm.reportValidity()

        }
        //})
        //onCloseNewToDoIssueForm(e);
    
    }






    const onCloseNewToDoIssueForm = (e: React.FormEvent) => {
        const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement
        e.preventDefault()
        e.stopPropagation() // Prevent event from bubbling up
        toDoIssueForm.reset()
        // Delete the data-ToDoIssueId attribute with the unique ID of the ToDoIssue in the button of "Save Changes"
        const toDoIssueDatasetAttributeIdInForm = document.getElementById("accept-todo-btn")
            if (toDoIssueDatasetAttributeIdInForm) {
                toDoIssueDatasetAttributeIdInForm.dataset.projectId = ""
            }
        console.log("Close the form")
        //toggleModal("new-todo-card-modal");
        onClose() // Close the form after the accept button is clicked
    }





    

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const inputValue = (e.target as HTMLInputElement).value.trim()
        if (e.key === "Enter" && inputValue) {
            e.preventDefault()
            const newTags = inputValue.split(/[,]+/).filter(tag => tag !== "");

            newTags.forEach(tagText => {
                // Check if the tag already exists in the status list
                const tagExist = tags.some(tag => tag.toLowerCase() === tagText.toLowerCase());

                if (tagExist) {
                    // Tag already exists, show error message
                    handleMessagePopUp({
                        type: "warning",
                        title: "Duplicated Tag",
                        message: `The tag "${tagText}" already exists.`,
                        actions: ["Got it"],
                        callbacks: {
                            "Got it": () => {
                                setShowMessagePopUp(null);
                            }
                        }
                    })

                    /* OLD CODE
                    const existTagPopup = new MessagePopUp(
                    document.body,
                            "warning",
                            "Duplicate Tag",
                            `The tag "${tagText}" already exists.`,
                            ["Got it"]
                    );
                    // Define button callback
                    const buttonCallbacks = {
                        "Got it": () => {
                            existTagPopup.closeMessageModal();
                        }
                    }
                    existTagPopup.showNotificationMessage(buttonCallbacks);
                    */
                    
                } else {
                    // Tag is new, add it to the list
                    setTags(prevTags => [...prevTags, tagText]);
                    
                }
            });
            (e.target as HTMLInputElement).value = ""; // Clean the input
        }
    }


    const removeTag = (tagToRemove: string) => {
        setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove))
    };







    const handleAssignedUsersInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const inputValue = (e.target as HTMLInputElement).value.trim()
        if (e.key === "Enter" && inputValue) {
            e.preventDefault()
            const newAssignedUser = inputValue.split(/[,]+/).filter(assignedUsers => assignedUsers !== "");

            newAssignedUser.forEach(assignedUsersText => {
                // Check if the tag already exists in the status list
                const assignedUserExist = assignedUsers.some(assignedUsers => assignedUsers.toLowerCase() === assignedUsersText.toLowerCase());

                if (assignedUserExist) {
                    // AssignedUser already exists, show error message
                    handleMessagePopUp({
                        type: "warning",
                        title: "Duplicated assigned user",
                        message: `User ${assignedUsersText} already exists in the assigned users list.`,
                        actions: ["Got it"],
                        callbacks: {
                            "Got it": () => {
                                setShowMessagePopUp(null);
                            }
                        },
                    })
                    
                    
                    /*OLD CODE
                    const existAssignedUserPopup = new MessagePopUp(
                        document.body,
                        "warning",
                        "Duplicate Tag",
                        `The tag "${assignedUsersText}" already exists.`,
                        ["Got it"],
                        "200"
                    );
                    // Define button callback
                    const buttonCallbacks = {
                        "Got it": () => {
                            existAssignedUserPopup.closeMessageModal();
                        }
                    }
                    existAssignedUserPopup.showNotificationMessage(buttonCallbacks);
                */
                } else {
                    // Tag is new, add it to the list
                    setAssignedUsers(prevAssignedUsers => [...prevAssignedUsers, assignedUsersText]);
                    
                }
            });
            (e.target as HTMLInputElement).value = ""; // Clean the input
        }
    }




    const removeAssignedUsers = (assignedUserToRemove: string) => {
        setAssignedUsers(prevAssignedUsers => prevAssignedUsers.filter(assignedUsers => assignedUsers !== assignedUserToRemove));
    };







    return (
        <div className="dialog-container">
            <div className="custom-backdrop">
                <dialog id="new-todo-card-modal" open>
                    <form onSubmit={(e) => {
                        handleNewToDoIssueFormSubmit(e);
                    }}
                        id="new-todo-form"
                        action=""
                        name="new-todo-form"
                        method="post"
                        className="todo-form"
                        encType="multipart/form-data"
                    >
                        <h2 id="modal-todoIssue-title">New To-Do Issue</h2>
                        <h3 style={{}} id="todo-title">
                            <input
                                data-form-todo-value="title"
                                name="title"
                                className="title-todo-card"
                                type="text"
                                size={30}
                                placeholder="Please enter a title for the issue."
                                required
                                minLength={5}
                            />
                            <svg
                                className="todo-icon"
                                role="img"
                                aria-label="edit"
                                width={20}
                                height={20}
                            >
                                <use href="#edit" />
                            </svg>
                        </h3>
                        <div className="todo-content">
                            <fieldset
                                className="data-mandatory"
                                style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                    padding: 20,
                                height: "95%"
                                }}
                            >
                                <legend>Issue notes and comments</legend>
                                <div className="form-field-container">
                                    <textarea
                                        data-form-todo-value="description"
                                        name="description"
                                        id="textarea-editor"
                                        style={{ resize: "vertical", scrollbarWidth: "none" }}
                                        cols={45}
                                        rows={22}
                                        placeholder="Leave a comment"
                                        defaultValue={""}
                                    />
                                </div>
                                <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "90px"
                                }}
                                >
                                    <div className="todo-tags-input">
                                        <div>Assigned to</div>
                                        <ul
                                        data-form-todo-value="assignedUsers"
                                        //name="assignedUsers"
                                        id="todo-assignedUsers-list"
                                        className="todo-form-field-container"
                                        >
                                            {assignedUsers.map((assignedUser, index) => (
                                                <li key={index}
                                                    className="todo-tags"
                                                    onClick={() => { removeAssignedUsers(assignedUser) }}
                                                    style ={{cursor: "pointer" }}
                                                >
                                                    {assignedUser}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "50px"
                                }}
                                >
                                    
                                    <div className="todo-tags-input" style={{ maxHeight: "100%" }}>
                                        <div>Tags</div>
                                        <ul
                                        data-form-todo-value="tags"
                                        //name="tags"
                                        id="todo-tags-list"
                                        className="todo-form-field-container"
                                        style={{}}
                                        >
                                            {tags.map((tag, index) => (
                                                <li key={index}
                                                    className="todo-tags"
                                                    onClick={() => removeTag(tag)}
                                                    style ={{cursor: "pointer" }}
                                                >
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                </div>
                            </fieldset>
                            <fieldset style={{ border: "none", height: "100%" }} className="data-optional">
                                <legend>Issue details:</legend>
                                <div style={{ display: "flex", flexDirection: "column", rowGap: 20, height: "100%", justifyContent: "space-Between" }}>
                                    <div className="form-field-container">
                                        <div className="form-field-container">
                                            {/* Funcionalidad: Allow the user to select the column where the task will be located..
                                                                Implementación: U "We will use another dropdown menu (select) that will be populated with the column options. */}
                                            <label>
                                                <span className="material-icons-round">view_column</span>Stage
                                            </label>
                                            <select
                                                data-form-todo-value="statusColumn"
                                                name="statusColumn"
                                                id="todo-stage-column"
                                            >
                                                <option value="notassigned" hidden>
                                                Select a stage
                                                </option>
                                                <option label="Task ready" value="backlog" />
                                                <option label="In progress" value="wip" />
                                                <option label="In review" value="qa" />
                                                <option label="Done" value="completed" />
                                            </select>
                                        </div>

                                        <div className="form-field-container todo-tags-input">
                                        <div className="todo-tags-input">
                                            <label>
                                            <span className="material-icons-round">label</span>Tags
                                            </label>
                                            <input
                                                    type="text"
                                                    id="todo-tags-input"
                                                    placeholder="Tag your comment + Enter key"
                                                    size={24}
                                                    onKeyDown={handleTagInput}
                                            />
                                        </div>
                                        </div>
                                            
                                        <div className="form-field-user-container">
                                                
                                            {/* Function: Allows user to select a regular user from "users-page".
                                                                Implementatión: We will use a dropdown menu (select) that will be populated with the available users. */}
                                            <label>
                                                <span className="material-icons-round">person</span>Assignees
                                            </label>
                                            <input
                                                data-form-todo-value="assignedUsers"
                                                name="assignedUsers"
                                                type="text"
                                                list="assignees"
                                                style={{ width: "100%" }}
                                                placeholder="Type assigned user + Enter key"
                                                size={24}
                                                    onKeyDown={handleAssignedUsersInput}

                                            />
                                            <datalist id="todo-assigned-user">
                                                <option value="" />
                                                {/* this place for update the users from the "users-page" */}
                                            </datalist>
                                            </div>
                                            
                                        <div className="form-field-user-container">
                                            <label>
                                                <span className="material-icons-round">calendar_today</span>
                                                Finish issue date
                                            </label>
                                            <input
                                                data-form-todo-value="dueDate"
                                                name="dueDate"
                                                type="date"
                                                id="todo-dueDate"
                                                style={{ width: "100%" }}
                                                min="2024-01-01"
                                            />
                                        </div>
                                            
                                        <div id="form-project-teams-included">
                                            <label>
                                                <span className="material-icons-round">article</span>Issue data
                                            </label>
                                            <div className="todo-footer" style={{ rowGap: "10px", width: "100%", display: "flex", flexDirection: "column" }}>
                                                <p data-form-todo-value="todoProject">
                                                Project: <span id="todo-project-name" >{project.name}</span>
                                                </p>
                                                <p data-form-todo-value="createdDate">
                                                Creation date: <span id="todo-creation-date">{new Date().toLocaleDateString()}</span>
                                                </p>
                                                <p data-form-todo-value="todoUserOrigin">
                                                Originator: <span id="todo-created-by" />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                        
                                    <div id="buttonEndRight">
                                        <button id="cancel-todo-btn" type="button" className="buttonC" onClick={onCloseNewToDoIssueForm}>
                                        Cancel
                                        </button>
                                        <button id="accept-todo-btn" type="submit" className="buttonB">
                                        Accept
                                        </button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </form>
                </dialog>
            </div>
            {showMessagePopUp}
        </div >

    )
}

export default NewToDoIssueForm;
