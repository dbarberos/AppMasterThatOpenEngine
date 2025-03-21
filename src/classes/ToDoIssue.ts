import { v4 as uuidv4 } from 'uuid'
import * as Firestore from 'firebase/firestore'
import { IAssignedUsers, ITag, IToDoIssue, type StatusColumnKey } from '../Types'

export class ToDoIssue implements IToDoIssue {
    title: string
    description: string
    statusColumn: StatusColumnKey
    tags: ITag[]
    assignedUsers: IAssignedUsers[]
    dueDate: Date
    todoProject: string
    createdDate: Date
    todoUserOrigin: string

    // Class internals
    id: string
    //ui: HTMLDivElement
    backgroundColorColumn: string

    constructor(data: IToDoIssue, idString?: string) {
        for (const key in data) {

            if (key === "dueDate") {
                this[key] = data.dueDate instanceof Date
                    ? data.dueDate
                    : new Date(data.dueDate)
            } else if (key === "createdDate") {
                this[key] = data.createdDate instanceof Date
                    ? data.createdDate
                    : new Date(data.createdDate)
            } else if (key === "statusColumn") {
                this[key] = data.statusColumn || "notassigned"
            } else if (key === "tags") {
                this.tags = data.tags || []
            } else if (key === "assignedUsers") {
                this.assignedUsers = data.assignedUsers || []
            } else {
                this[key] = data[key]
            }
        }

        this.backgroundColorColumn = ToDoIssue.calculateBackgroundColorColumn(this.statusColumn)

        //this.setUi();

        if (idString) {
            this.id = idString
            }
        //if (!this.id) { this.id = uuidv4() } //In order to not change the ID if the option of import toDoIssues is implemented
        console.log(data);
    }

    static calculateBackgroundColorColumn(statusColumn: StatusColumnKey): string {
        switch (statusColumn) {
            case 'backlog':
                return "var(--color-backlog)";
            case "wip":
                return "var(--color-wip)";
            case "qa":
                return "var(--color-qa)";
            case "completed":
                return "var(--color-completed)";
            default:
                return "var(--color-notassigned)";
        }
    }

    static getStatusColumnText(statusColumn: StatusColumnKey): string {
        switch (statusColumn) {
            case "backlog":
                return "Task Ready"
            case "wip":
                return "In Progress"
            case "qa":
                return "In Review"
            case "completed":
                return "Done"
            default:
                return "Not Assigned"
        }
    }

    static createFromData(data: ToDoIssue) {
        const todoIssue = new ToDoIssue({
            title: data.title,
            description: data.description,
            statusColumn: data.statusColumn || "notassigned",
            tags: [...data.tags],
            assignedUsers: [...data.assignedUsers],
            dueDate: data.dueDate,
            todoProject: data.todoProject,
            createdDate: data.createdDate,
            todoUserOrigin: data.todoUserOrigin,
            id: data.id,
            backgroundColorColumn: data.backgroundColorColumn
        });

        return todoIssue;
    }


    /*SET UI
    // setUi() {
    //     if (this.ui && this.ui instanceof HTMLElement) { return }
    //     this.ui = document.createElement("div")
    //     this.ui.className = "todo-item"
    //     this.ui.dataset.projectId = this.todoProject
    //     this.ui.dataset.todoId = this.id
    //     this.ui.setAttribute("draggable", "true")
    //     const dueDateFormatted = this.dueDate.toLocaleDateString("es-ES", {
    //         year: "numeric",
    //         month: "2-digit",
    //         day: "2-digit"
    //     }).replace(/\//g, "-");

    //     this.ui.innerHTML = `
    //         <div class="todo-color-column" style="background-color: ${this.backgroundColorColumn}"></div>

    //         <div  class="todo-card" style="display: flex; flex-direction: column; border-left-color: ${this.backgroundColorColumn}; ">
    //             <div class="todo-taks" >
    //                 <div class="todo-tags-list">
    //                     ${this.tags.map(tag => `<span class="todo-tags">${tag}</span>`).join('')}
    //                 </div>
    //                 <button class="todo-task-move handler-move">
    //                     <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
    //                         <use href="#drag-indicator"></use>
    //                     </svg>

    //                 </button>
    //             </div>
    //             <div class="todo-title">
    //                 <h5 style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;; margin-left: 15px">${this.title}</h5>
    //             </div>
    //             <div class="todo-stats">
    //                 <span style="text-wrap: nowrap; margin-left: 10px" class="todo-task-move">
    //                     <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
    //                         <use href="#flag"></use>
    //                     </svg>
    //                     ${dueDateFormatted}
    //                 </span>
    //                 <span style="text-wrap: nowrap; margin-left: 5px" class="todo-task-move">
    //                     <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
    //                         <use href="#chat-bubble"></use>
    //                     </svg>
    //                     ${this.assignedUsers.length} assigned
    //                 </span>
    //                 <span class="todo-task-move todo-tags" style="textwrap: nowrap; margin-left:5px; color: var(--background) !important; background-color:${this.backgroundColorColumn};font-size: var(--font-base)" >
    //                     ${ToDoIssue.getStatusColumnText(this.statusColumn)}
    //                 </span>
    //             </div>
    //         </div>
    //     `
    // }
    */

}