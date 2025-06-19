// import { updateAsideButtonsState } from "../index.tsx"
import { ProjectsManager } from "./ProjectsManager";
import { Project } from "./Project"
import { showModal, closeModal, toggleModal, closeModalProject, changePageContent, showPageContent, hidePageContent } from "./UiManager"
//import { updateAsideButtonsState } from "./HTMLUtilities.ts";

import { renderToDoIssueListInsideProject, renderToDoIssueList, getProjectByToDoIssueId, setDetailsIssuePage, deleteToDoIssue } from "./ToDoManager";
import { ToDoIssue} from "./ToDoIssue"
import { IToDoIssue } from '../types'
import { MessagePopUp } from "./MessagePopUp"
import { User } from "../classes/User.ts";



export class UsersManager {

    list: User[] = []
    //ui: HTMLElement
    onUserCreated = (user: User) => { }
    onUserDeleted = (email: string) => { }
    onUserUpdated = (id: string) => { }
    //onToDoUpdated = (projectId: string, todoId: string) => { }
    onAssignedProjectTeamDeleted = (assignedProjectTeamId: string) => { }

    //Select a project for the ToDoBoard with the select input element inside the header
    // setUpUserPage(selectedProjectId?) {
    //     // Get the project list
    //     const projectManager = ProjectsManager.getInstance()
    //     const projectsList = projectManager.list
    //     const storedProject = projectsList.find((project) => project.id === selectedProjectId)

    //     const selectProjectForUsersPage = document.getElementById("projectSelectedUsersPage") as HTMLSelectElement

    //     setupProjectSelectUsersPage(projectsList, selectedProjectId)
    // }


    newUser(data: User, id?: string): User | undefined {
        const UsersEmails = this.list.map((user) => {
            return user.email
        })

        if (UsersEmails.includes(data.email)) {
            // Find and remove the existing user list since you are going to use it later
            // This checking is because you are going to use this methodwhen recover de user from the database
            const existingUserIndex = this.list.findIndex((user) =>
                user.email === data.email)
            if (existingUserIndex !== -1) {
                //It is clare that there is an index, since there is a user with that email
                // 1. Remove the existing project from the list
                this.list = this.list.filter((user) => user.email !== data.email);

                //2.Create anew user with the imported data
                const newUser = new User(data, id)

                // 3.Add the new project to the list
                this.list.push(newUser)
                this.onUserCreated(newUser)
                return newUser
            } else {
                console.error("User to overwrite not found in the list.")
                return undefined
            }
        } else {
            // 1.Create anew user with the imported data
            const newUser = new User(data, id)
            // 2.Add the new project to the list
            this.list.push(newUser)
            this.onUserCreated(newUser)
            return newUser
        }
    }

    filterUsers(email: string) {
        const filteredUsers = this.list.filter((user) => {
            return user.email.toLowerCase().includes(email.toLowerCase())
        })
        return filteredUsers
    }

    /* USED INSIDE INDEX.TSX */
    updateReactUsers(dataToUpdate: User) {
        const userIndex = this.list.findIndex(p => p.id === dataToUpdate.id)
        
        if (userIndex !== -1) {
            //Preserve the original ID
            dataToUpdate.id = this.list[userIndex].id
            
            //CReate a new list with the updated project
            const updatedUsersList = this.list.map((user, index) =>
                index === userIndex ? new User({
                    ...user, // Keep existing properties
                    ...dataToUpdate // Add new properties
                }) : user
            )
            //Update the list reference
            this.list = updatedUsersList

            //Return the entire updated list of projects
            return updatedUsersList

        } else {
            console.error("User not found in the list!")
            return false
        }
    }


    /* USED INSIDE NEWUSERFORM.TSX */

    updateUser(userId: string, dataToUpdate: User) {
        console.log("UsersManager.ts: updateUser called", { userId, dataToUpdate })

        const userIdString = userId.toString().trim()
        const userIndex = this.list.findIndex(u => u.id?.toString().trim() === userIdString) //Convert to string and trim for the comparing the same type of data

        if (userIndex !== -1) {
            //  Create new user instance with ipdated data
            const currentUser = this.list[userIndex]
            const updatedUser = new User({
                ...currentUser,
                ...dataToUpdate,
                id: userId,
                // accountCreatedAt: dataToUpdate.accountCreatedAt instanceof Date
                //     ? dataToUpdate.accountCreatedAt
                //     : new Date(dataToUpdate.accountCreatedAt),
                // lastLoginAt: dataToUpdate.lastLoginAt instanceof Date
                //     ? dataToUpdate.lastLoginAt
                //     : new Date(dataToUpdate.lastLoginAt),
            })

            // Update the list
            this.list[userIndex] = updatedUser

            //trigger update callback
            if (this.onUserUpdated) {
                this.onUserUpdated(userId)
            }

            this.updateLocalStorage()

            // Return the updated user
            return updatedUser
            
        } else {
            console.error("User not found in the list!")
            return null
        }
    }

    private updateLocalStorage(): void {
        try {
            console.log('Updating: Stating updateLocalStorage, thislist contain:',
                this.list.map(u => ({ id: u.id, projectsCount: u.projectsAssigned?.length ?? 'N/A' }))
            )
            // Process projects before storing
            const processedUsers = this.list.map(user => {
                const processedProjectAssigned = user.projectsAssigned?.map(project => {
                    // *** Simplificación: Llamar directamente a toISOString() ***
                    const processedAssignedDate = project.assignedDate.toISOString();

                    return {
                        ...project,
                        assignedDate: processedAssignedDate,
                    };
                });

                let processedAccountCreatedAt: string | null = null
                if (user.accountCreatedAt instanceof Date) {
                    if (!isNaN(user.accountCreatedAt.getTime())) {
                        processedAccountCreatedAt = user.accountCreatedAt.toISOString()

                    } else {
                        console.warn('Update - User ${user.id}: Invalid accountCreatedAt value')
                        processedAccountCreatedAt = null
                    }
                } else if (user.accountCreatedAt !== null && user.accountCreatedAt !== undefined) {
                    processedAccountCreatedAt = user.accountCreatedAt as string
                }
                    

                let processedLastLoginAt: string | null = null
                if (user.lastLoginAt instanceof Date) {
                    if (!isNaN(user.lastLoginAt.getTime())) {
                        processedLastLoginAt = user.lastLoginAt.toISOString()
                    } else {
                        console.warn('Update - User ${user.id}: Invalid lastLoginAt value')
                        processedLastLoginAt = null
                    }
                } else if (user.lastLoginAt !== null && user.lastLoginAt !== undefined) {
                    processedLastLoginAt = user.lastLoginAt as string
                }
                return {
                    ...user,
                    projectsAssigned: processedProjectAssigned,
                    accountCreatedAt: processedAccountCreatedAt,
                    lastLoginAt: processedLastLoginAt
                }
            })
                

            //CAMBIAR  EN COSNTANTES
            localStorage.setItem('users', JSON.stringify(processedUsers))
            localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString)
        
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }




    








    setupProjectSelectUsersPage(projectsList: Project[], selectedProjectId?: string) {
        const select = document.getElementById("projectSelectedUsersPage") as HTMLSelectElement;

        if (!select) {
            console.log("Error in getting the select ToDo Board")
            return
        }

        select.innerHTML = ""

        // Add a default option to select a project
        const option = document.createElement("option");
        option.value = "";
        option.text = "Select a project"
        // option.disabled = true
        option.style.color = "var(--color-fontbase-dark)"
        select.appendChild(option);

        // Populate the select element with project options
        projectsList.forEach((project) => {
            const option = document.createElement("option");
            option.value = project.id;
            option.text = project.name;
            select.appendChild(option)

            // Get the stored project ID and project from local storage
            const storedProjectId = localStorage.getItem("selectedProjectId");


            // Select the project corresponding to the stored project ID
            if (storedProjectId) {
                select.value = storedProjectId
                // selectedProject = projectsList.find((project) => project.id === storedProjectId)
            }
        })

            
        //Listen when the user change the Project inside the ToDo Board

        select.addEventListener("change", () => {
            const changedProjectId = select.value

            //Save the Id of the selected project in the local storage
            localStorage.setItem("selectedProjectId", changedProjectId)
            updateAsideButtonsState()


            // Now you can use the selectedProjectId variable, it is updated using the setUpToDoBoard function
            console.log("selectedProjectId", changedProjectId)
        })
    }



    //  *** USED INSIDE NewUserForm *** 
    static populateUserDetailsForm (user: User) {
        const userDetailsForm = document.getElementById("new-user-form")
        if (!userDetailsForm) { return }


        for (const key in user) {
            const inputField = userDetailsForm.querySelectorAll(`[data-form-value="${key}"]`)
            if (inputField.length > 0) {
                inputField.forEach(element => {
                    // Handle different input types                        
                    if (element instanceof HTMLInputElement) {
                        if (user[key] !== undefined && user[key] !== null) {
                            element.value = user[key] // For text, date inputs
                        }
                    } else if (element instanceof HTMLTextAreaElement) {
                        if (user[key] !== undefined && user[key] !== null) {
                            element.value = user[key] // For textareas
                        }
                    } else if (element instanceof HTMLSelectElement) {
                        if (user[key] !== undefined && user[key] !== null) {
                            // For select elements, set the selected option
                            const options = element.options
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].value === user[key]) {
                                    options[i].selected = true
                                    break
                                }
                            }
                        }
                    }
                })
            }
        }        
    }


    getUser(id: string) {
        const user = this.list.find((user) => {
            return user.id === id
        })
        return user
    }

    getUserByNickname(nickname: string) {
        const user = this.list.find((user) => {
            return user.nickName.toLowerCase() === nickname.toLowerCase()
        })
        return user
    }



    


}