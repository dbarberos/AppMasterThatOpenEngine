import { v4 as uuidv4 } from 'uuid'

export interface IToDoIssue {
    title: string
    description: string
    statusColumn: string
    tags: string[]
    assignedUsers: string[]
    dueDate: Date
    todoProject: string
    createdDate: Date
    todoUserOrigin: string
}

export class ToDoIssue implements IToDoIssue {
    title: string
    description: string
    statusColumn: string
    tags: string[]
    assignedUsers: string[]
    dueDate: Date
    todoProject: string
    createdDate: Date
    todoUserOrigin: string

    // Class internals
    id: string
    ui: HTMLDivElement
    backgroundColorColumn: string

    constructor(data:) {
        for (const key in data) {

            if (key === "dueDate") {
                this[key] = new Date(data.dueDate)
            } else if (key === "createdDate") {
                this[key] = new Date(data.createdDate)
            } else {
                this[key] = data[key]
            }
        } 

        this.backgroundColorColumn = ToDoIssue.calculateBackgroundColorColumn(this.statusColumn)
        this.setUi();
        if (!this.id) { this.id = uuidv4() } //In order to not change the ID if the option of import toDoIssues is implemented
        console.log(data);
    }

    static calculateBackgroundColorColumn(statusColumn: string): string {
        switch (statusColumn) {
            case "backlog":
                return "#05478a";
            case "wip":
                return "#c24914";
            case "qa":
                return "#f2c464";
            case "completed":
                return "#005e38";
            default:
                return "#7a288a";
        }
    }

    setUi() {
        if (this.ui && this.ui instanceof HTMLElement) { return }
        this.ui = document.createElement("div")
        this.ui.className = "todo-item"
        this.ui.dataset.projectId = this.id

        this.ui.innerHTML = `
            <div class="todo-color-column"></div>

            <div  class="todo-card" style="display: flex; flex-direction: column; border: 5px solid border-left-color: ${this.backgroundColorColumn}; ">
                <div class="todo-taks" >
                    <div class="todo-tags-list">
                        <span class="todo-tags">${this.tags}</span>
                        <span class="todo-tags">${this.tags}</span>
                        <span class="todo-tags">${this.tags}</span>
                        <span class="todo-tags">${this.tags}</span>
                        <span class="todo-tags">${this.tags}</span>
                        <span class="todo-tags">${this.tags}</span>
                    </div>
                    <button class="todo-task-move">
                        <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                            <use href="#drag-indicator"></use>
                        </svg>

                    </button>
                </div>
                <div class="todo-title">
                    <h5 style="overflow-wrap: break-word; margin-left: 15px">${this.title}</h5>
                </div>
                <div class="todo-stats">
                    <span style="text-wrap: nowrap; margin-left: 10px" class="todo-task-move">
                        <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                            <use href="#flag"></use>
                        </svg>
                        ${this.dueDate}
                    </span>
                    <span style="text-wrap: nowrap; margin-left: 10px" class="todo-task-move">
                        <svg class="todo-icon" role="img" aria-label="edit" width="24" height="24">
                            <use href="#chat-bubble"></use>
                        </svg>
                        ${this.assignedUsers}
                    </span>
                </div>
            </div>
        `
    }


}