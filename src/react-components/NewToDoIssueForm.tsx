import * as React from 'react';
import { createDocument, updateDocument, deleteDocument } from '../services/firebase'

import { MessagePopUp, MessagePopUpProps, RenameElementMessage } from '../react-components';
import { usePrepareToDoForm } from '../hooks';


import { Project } from '../classes/Project';
import {  ToDoIssue } from '../classes/ToDoIssue';
import { getToDoIssueByTitle, newToDoIssue } from '../classes/ToDoManager';
import { IToDoIssue, ITag, IAssignedUsers, StatusColumnKey } from '../types';

import { QuillEditor, QuillEditorRef } from './QuillEditor'


interface NewToDoIssueFormProps {
    onClose: () => void;
    project: Project;
    onCreatedNewToDo: (newToDo: ToDoIssue) => void;
}


export function NewToDoIssueForm({ onClose, project, onCreatedNewToDo }: NewToDoIssueFormProps) {

    const [tags, setTags] = React.useState<ITag[]>([]); 
    const [assignedUsers, setAssignedUsers] = React.useState<IAssignedUsers[]>([]);
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)


    const [newToDoTitle, setNewToDoTitle] = React.useState<string | null>(null);
    const [toDoTitleToConfirm, setToDoTitleToConfirm] = React.useState<string | null>(null);
    const [toDoDetailsToRename, setToDoDetailsToRename] = React.useState<IToDoIssue | null>(null);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [currentToDoTitle, setCurrentToDoTitle] = React.useState('');
    //Managing the QuillEditor text
    const [descriptionToDoContent, setDescriptionToDoContent] = React.useState<string>('')
    const editorRef = React.useRef<QuillEditorRef | null>(null) //Referecnce to QuillEditor component

    usePrepareToDoForm(project)


    const handleDescriptionChange = (content: { html: string; delta: any }) => {
        setDescriptionToDoContent(content.html); // Actualiza el estado con el contenido HTML
    };



    const onCloseNewToDoIssueForm = (e: React.FormEvent) => {
        const toDoIssueForm = document.getElementById("new-todo-form") as HTMLFormElement
        e.preventDefault()
        e.stopPropagation() // Prevent event from bubbling up
        toDoIssueForm && toDoIssueForm.reset()
        console.log("Close the form")        
        onClose() // Close the form after the accept button is clicked
    }

    const handleRenameConfirmation = React.useCallback(async (renameToDoTitle: string, toDoDetailsToRename: IToDoIssue) => {
        try {
            const todoToCreate = {
                ...toDoDetailsToRename,
                title: renameToDoTitle
            }
            const newToDoIssueCreated = await handleCreateTodoIssueInDB(project, todoToCreate)
            
            if (newToDoIssueCreated) { 
                console.log("todo created with the new title", newToDoIssueCreated)

                onCreatedNewToDo && onCreatedNewToDo(newToDoIssueCreated)
                onClose()
            }
        } catch (error) {
            console.error("Error creating todo in Firestore:", error);

            setMessagePopUpContent({
                type: "error",
                title: "Error Creating ToDo",
                message: "There was a problem saving the To-Do. Please try again later.",
                actions: ["OK"],
                onActionClick: {
                    "OK": () => setShowMessagePopUp(false),
                },
                onClose: () => setShowMessagePopUp(false),
            });
            setShowMessagePopUp(true)
        } finally {
            // Reset rename states
            setToDoDetailsToRename(null);
            setNewToDoTitle(null);
            setToDoTitleToConfirm(null);
            setIsRenaming(false);
            setCurrentToDoTitle('');
        }
    }, [project, onCreatedNewToDo])
    



    async function handleCreateTodoIssueInDB(project: Project, toDoIssueDetails: IToDoIssue) {
        
        try {
            // Create the main todo document first
            //const ToDoIssueCreated = new ToDoIssue(toDoIssueDetails) Duplicado
            const todoPath = `projects/${project.id}/todoList`
            //console.log(ToDoIssueCreated)

            // Create the todo document and get its ID
            const newToDoIssueDoc = await createDocument(todoPath, toDoIssueDetails)
            const todoId = newToDoIssueDoc.id
            console.log("data transfered to DB", newToDoIssueDoc)
            
            
            // Create subcollections
            // Create tags and get their Firebase IDs
            const createdTags = await createTodoTags(todoPath, todoId, toDoIssueDetails.tags.map(t => t.title))
            
            const createdUsers = await createTodoAssignedUsers(todoPath, todoId, toDoIssueDetails.assignedUsers.map(u => u.name))

            
            // await Promise.all([
                
                
                
            // ]);

            // Create ToDoIssue instance with the new ID and created tags
            const ToDoIssueCreated = new ToDoIssue({
                ...toDoIssueDetails,
                id: todoId,
                tags: createdTags, // Use the tags with Firebase IDs
                assignedUsers: createdUsers
            });

            /*
            // Create tags collection and documents
            if (toDoIssueDetails.tags && toDoIssueDetails.tags.length > 0) {
                const tagsPath = `${todoPath}/${todoId}/tags`;

                // Create a document for each tag
                const tagPromises = toDoIssueDetails.tags.map(async (tag, index) => {
                    const tagData = {
                        id: `tag-${index}`,
                        title: typeof tag === 'string' ? tag : tag.title,
                        createdAt: new Date()
                    };
                    return createDocument(tagsPath, tagData);
                });

                await Promise.all(tagPromises);
            }

            // Create assignedUsers collection and documents
            if (toDoIssueDetails.assignedUsers && toDoIssueDetails.assignedUsers.length > 0) {
                const usersPath = `${todoPath}/${todoId}/assignedUsers`;

                // Create a document for each assigned user
                const userPromises = toDoIssueDetails.assignedUsers.map(async (userId, index) => {
                    const userData = {
                        id: `user-${index}`,
                        userId: userId,
                        assignedAt: new Date()
                    };
                    return createDocument(usersPath, userData);
                });

                await Promise.all(userPromises);
            }
            */
            
            //Debugging
            console.log("Todo created with nested collections in DB", {
                todoId,
                tagsCount: toDoIssueDetails.tags.length,
                usersCount: toDoIssueDetails.assignedUsers.length
            });
            // Update local state
            // project.todoList.push(ToDoIssueCreated); 
            // Don´t duplicate the todo, let the parent component handle the state update
            //newToDoIssue(project.todoList, ToDoIssueCreated);
            onCreatedNewToDo && onCreatedNewToDo(ToDoIssueCreated)

            return ToDoIssueCreated
            
        } catch (error) {
            
            console.error("Error creating new To-Do Issue in the database:", error)

            setMessagePopUpContent({
                type: "error",
                title: "Error Creating To-Do Issue",
                message: "There was a problem saving the ToDo Issue. Please try again later.",
                actions: ["Ok"],
                onActionClick: {
                    "Ok": () => setShowMessagePopUp(false),
                },
                onClose: () => setShowMessagePopUp(false),
            })
            setShowMessagePopUp(true)
            throw error
        }
    }

    async function createTodoTags(todoPath: string, todoId: string, tags: (string | ITag)[]) {
        try {
            const tagsPath = `${todoPath}/${todoId}/tags`;
            const createdTags = await Promise.all(
                tags.map(async (tagTitle) => {
                    const tagData = {
                        title: tagTitle,
                        createdAt: new Date()
                    };
                    const docRef = await createDocument(tagsPath, tagData);
                    return {
                        id: docRef.id, // Use Firebase-generated ID
                        title: tagTitle,
                        createdAt: new Date()
                    } as ITag
                })
            )
            console.log('Created tags with Firebase IDs:', createdTags)
            return createdTags;
        } catch (error) {
            console.error("Error creating tags:", error);
            throw error;
        }
    }

    async function createTodoAssignedUsers(todoPath: string, todoId: string, users: (string | IAssignedUsers)[]) {
        try {
            const usersPath = `${todoPath}/${todoId}/assignedUsers`
            const createdUsers =await Promise.all(            
                users.map(async (userName) => {
                    const userData = {
                        name: userName                        
                    }
                    const docRef = await createDocument(usersPath, userData)
                    return {
                        id: docRef.id, // Use Firebase-generated ID
                        name: userName,
                        createdAt: new Date()
                    } as IAssignedUsers
                })
            );
            return createdUsers;
        } catch (error) {
            console.error("Error creating assigned users:", error);
            throw error;
        }
        
    }






    const handleNewToDoIssueFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

        const checkProjectId = project.id
        // console.log(checkToDoId)
        //console.log("checkProjectId",checkProjectId)

        if (toDoIssueForm.checkValidity()) {
            //Form is valid, proceed with data processing

            // If checkToDoId is empty is because the user is not updating data in the form, so we are going to create a new todoIssue.
            //if (!checkToDoId) {
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
            console.log("dueDateToDoFormString", dueDateToDoFormString)
                
                
            // Get the current Date as the Created Date
            const currentDate = new Date();
            //Get the value of the statusColumn and assign a default value if necessary.
            const statusColumnValue = formToDoData.get("statusColumn") as StatusColumnKey


            const toDoIssueDetails: IToDoIssue = {
                title: formToDoData.get("title") as string,
                description: descriptionToDoContent, //Take the value of the useState
                statusColumn: statusColumnValue,
                tags: tags,
                assignedUsers: assignedUsers,
                dueDate: dueDateToDoForm,
                todoProject: checkProjectId as string,
                createdDate: currentDate,
                todoUserOrigin: formToDoData.get("todoUserOrigin") as string,
            }
            
            const ToDoExistingTitles = project.todoList.map(todoIssue => todoIssue.title);
            const existingToDoIssues = ToDoExistingTitles.some(existingTitle => existingTitle.toLowerCase() === toDoIssueDetails.title.toLowerCase())

            if (existingToDoIssues) {
                console.log(`A To-Do Issue with the title [ ${toDoIssueDetails.title} ] already exists`)
                console.log("Setting messagePopUpContent state...");
                //Create a Confirmation Modal to prompt the user about the duplication and offer options
                setMessagePopUpContent({
                    type: "warning",
                    title: `A project with the name "${toDoIssueDetails.title}" already exist`,
                    message: (
                        <React.Fragment>
                            <b>
                                <u>Overwrite:</u>
                            </b>{" "}
                            Replace the existing To-Do Issue with the new data.
                            <br />
                            <b>
                                <u>Skip:</u>
                            </b>{" "}
                            Do not create a new To-Do Issue.
                            <br />
                            <b>
                                <u>Rename:</u>
                            </b>{" "}
                            Enter a new title for the To-Do Issueproject.
                                                
                        </React.Fragment>),
                    actions: ["Overwrite", "Skip", "Rename"],
                    onActionClick: {
                        "Overwrite": async () => {
                            try {
                                console.log("Overwrite button clicked!");

                                //We will keep the logic of deleting a ToDo with an existing title and creating a new one inside newToDoIssue
                                
                                const originalDataToDoIssue = getToDoIssueByTitle(project.todoList, toDoIssueDetails.title)

                                console.log("originalDataToDoIssue", originalDataToDoIssue);

                                if (!originalDataToDoIssue) return
                                // const newToDoIssueCreated = new ToDoIssue({
                                //     ...toDoIssueDetails,
                                //     id: originalDataToDoIssue.id,
                                // })
                                // console.log(newToDoIssueCreated);

                                await deleteDocument(`/projects/${originalDataToDoIssue.id}/todoList`, originalDataToDoIssue.id)
                                await handleCreateTodoIssueInDB(project, toDoIssueDetails);
                                //await createDocument(`/projects/${originalDataToDoIssue.id}/todoList`, toDoIssueDetails)
                                console.log("data transfered to DB created")

                                //onCreatedNewToDo && onCreatedNewToDo(newToDoIssueCreated)

                                //newToDoIssue(project.todoList, newToDoIssueCreated)
                                setShowMessagePopUp(false)
                                onCloseNewToDoIssueForm(e)

                            } catch (error) {
                                console.log("Error overwiritng todo:", error)

                                setMessagePopUpContent({
                                    type: "error",
                                    title: "Error overwiritng To-Do Issue",
                                    message: "There was a problem saving the ToDo Issue. Please try again later.",
                                    actions: ["Ok"],
                                    onActionClick: {
                                        "Ok": () => setShowMessagePopUp(false),
                                    },
                                    onClose: () => setShowMessagePopUp(false),
                                })
                                setShowMessagePopUp(true)
                                throw error
                            }
                        },
                        "Skip": () => {
                            console.log("Skip button clicked!")
                            setShowMessagePopUp(false)
                        },
                        "Rename": () => {
                            console.log("Rename button clicked!")
                            setToDoDetailsToRename(toDoIssueDetails)
                            setCurrentToDoTitle(toDoIssueDetails.title)
                            setIsRenaming(true)

                            setShowMessagePopUp(false)
                        },
                    },
                    onClose: () => setShowMessagePopUp(false)
                })
                setShowMessagePopUp(true)

                e.preventDefault()
                return

            } else {
                // No duplicate, create the ToDoIssue
                try {
                    await handleCreateTodoIssueInDB(project, toDoIssueDetails)
                    onCloseNewToDoIssueForm(e);
                } catch (error) {
                    console.error("Error creating project in DB:", error)
                    throw error
                }

                //nCloseNewToDoIssueForm(e);
            }
        } else {
            // Form is invalid, let the browser handle the error display
            toDoIssueForm.reportValidity()

        }
    }
    

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const inputValue = (e.target as HTMLInputElement).value.trim()
        if (e.key === "Enter" && inputValue) {
            e.preventDefault()
            const newTags = inputValue.split(/[,]+/).filter(tag => tag !== "");

            newTags.forEach(tagText => {
                // Check if the tag already exists in the status list
                const tagExist = tags.some(tag => tag.title.toLowerCase() === tagText.toLowerCase());

                if (tagExist) {
                    // Tag already exists, show error message
                    setMessagePopUpContent({
                        type: "warning",
                        title: "Duplicated Tag",
                        message: `The tag "${tagText}" already exists.`,
                        actions: ["Got it"],
                        onActionClick: {
                            "Got it": () => {
                                setShowMessagePopUp(false);
                            }
                        },
                        onClose: () => setShowMessagePopUp(false)
                    })
                    setShowMessagePopUp(true)
                    e.preventDefault()
                    return
                } else {
                    // Update handleTagInput to create temporary IDs until Firebase creates the real ones
                    // Create new tag with temporary ID
                    const newTag: ITag = {
                        id: `temp-${Date.now()}-${tagText}`,
                        title: tagText,
                        createdAt: new Date()
                    };
                    // Tag is new, add it to the list
                    setTags(prevTags => [...prevTags, newTag]);
                    
                }
            });
            (e.target as HTMLInputElement).value = ""; // Clean the input
        }
    }

    // Update removeTag to work with ITag objects
    const removeTag = (tagToRemove: ITag) => {
        setTags(prevTags => prevTags.filter(tag => tag.id !== tagToRemove.id))
    }
    

    const handleAssignedUsersInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const inputValue = (e.target as HTMLInputElement).value.trim()
        if (e.key === "Enter" && inputValue) {
            e.preventDefault()
            const newAssignedUser = inputValue.split(/[,]+/).filter(assignedUsers => assignedUsers !== "");

            newAssignedUser.forEach(assignedUsersText => {
                // Check if the tag already exists in the status list
                const assignedUserExist = assignedUsers.some(assignedUsers => assignedUsers.name.toLowerCase() === assignedUsersText.toLowerCase());

                if (assignedUserExist) {
                    // AssignedUser already exists, show error message
                    setMessagePopUpContent({
                        type: "warning",
                        title: "Duplicated assigned user",
                        message: `User ${assignedUsersText} already exists in the assigned users list.`,
                        actions: ["Got it"],
                        onActionClick: {
                            "Got it": () => {
                                setShowMessagePopUp(false);
                            }
                        },
                        onClose: () => setShowMessagePopUp(false)
                    })
                    setShowMessagePopUp(true)
                    e.preventDefault()
                    return

                } else {
                    // Update handleTagInput to create temporary IDs until Firebase creates the real ones
                    // AssignedUser is new, add it to the list with temporary ID
                    const newAssignedUser: IAssignedUsers = {
                        id: `temp-${Date.now()}-${assignedUsersText}`,
                        name: assignedUsersText,
                        createdAt: new Date()
                    };
                    // assignedUser is new, add it to the list
                    setAssignedUsers(prevAssignedUsers => [...prevAssignedUsers, newAssignedUser]);
                }
            });
            (e.target as HTMLInputElement).value = ""; // Clean the input
        }
    }


    const removeAssignedUsers = (assignedUserToRemove: IAssignedUsers) => {
        setAssignedUsers(prevAssignedUsers => prevAssignedUsers.filter(assignedUsers => assignedUsers !== assignedUserToRemove));
    };


    React.useEffect(() => {
        if (toDoDetailsToRename && toDoTitleToConfirm) {
            handleRenameConfirmation(toDoTitleToConfirm, toDoDetailsToRename)
                .then(() => {
                    setToDoDetailsToRename(null)
                    setToDoTitleToConfirm(null)
                    onCloseNewToDoIssueForm
            })
        }    
    },[toDoDetailsToRename, toDoTitleToConfirm, handleRenameConfirmation, onCloseNewToDoIssueForm]  )



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
                                <div
                                    className="form-field-container"
                                    style={{
                                        resize: "vertical",
                                        //scrollbarWidth: "none",
                                        height: 'auto', 
                                        maxHeight: '30vh',
                                        overflowY: 'auto',
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: 'var(--primary-200)',
                                    }}
                                >
                                    <QuillEditor
                                        ref={editorRef} 
                                        initialValue={descriptionToDoContent} // Bind the editor value to the state
                                        onContentChange={handleDescriptionChange} // Handle changes
                                    />
                                    {/* <textarea
                                        data-form-todo-value="description"
                                        name="description"
                                        id="textarea-editor"
                                        style={{ resize: "vertical", scrollbarWidth: "none" }}
                                        cols={45}
                                        rows={22}
                                        placeholder="Leave a comment"
                                        defaultValue={""}
                                    /> */}
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
                                            {assignedUsers.map((assignedUser) => (
                                                <li key={assignedUser.id}
                                                    className="todo-tags"
                                                    onClick={() => { removeAssignedUsers(assignedUser) }}
                                                    style ={{cursor: "pointer" }}
                                                >
                                                    {assignedUser.name}
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
                                            {tags.map((tag) => (
                                                <li key={tag.id}
                                                    className="todo-tags"
                                                    onClick={() => removeTag(tag)}
                                                    style ={{cursor: "pointer" }}
                                                >
                                                    {tag.title}
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
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
            {isRenaming && <RenameElementMessage
                project={project}
                elementType="todo"
                elementTitle="To-Do"
                previousElementName={currentToDoTitle}
                onRename={(newName) => {
                    setToDoTitleToConfirm(newName)
                    //setIsRenaming(false)
                }}
                onCancel={() => {
                    //setRenameConfirmationPending(false);
                    setIsRenaming(false)
                    setToDoDetailsToRename(null)
                    setNewToDoTitle(null)
                    setToDoTitleToConfirm(null)                    
                }} />
            }
        </div >

    )
}

export default NewToDoIssueForm;
