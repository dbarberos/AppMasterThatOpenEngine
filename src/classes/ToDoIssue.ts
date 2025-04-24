import { v4 as uuidv4 } from 'uuid'
import * as Firestore from 'firebase/firestore'
import { IAssignedUsers, ITag, IToDoIssue, type StatusColumnKey } from '../types'
import { TODO_STATUSCOLUMN } from '../const'

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
    sortOrder: number;

    // Class internals
    id: string
    //ui: HTMLDivElement
    backgroundColorColumn: string
    

    constructor(data: IToDoIssue, idString?: string) {
        for (const key in data) {

            if (key === "createdDate") {
                this[key] = this.parseAndValidateDate(data.createdDate)
                // this[key] = data.createdDate instanceof Date
                //     ? data.createdDate
                //     : new Date(data.createdDate)
            } else if (key === "dueDate") {
                this[key] = this.parseAndValidateDate(data.dueDate)
            } else if (key === "statusColumn") {
                this[key] = data.statusColumn || "notassigned"
            } else if (key === "tags") {
                this.tags = data.tags || []
            } else if (key === "assignedUsers") {
                this.assignedUsers = data.assignedUsers || []
            } else if (key === "sortOrder") {
                this.sortOrder = data.sortOrder ?? 0
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
    }

    private parseAndValidateDate(rawValue: any): Date {
        let dateValue: Date;

        if (rawValue instanceof Date) {
            dateValue = rawValue;
        } else if (rawValue instanceof Firestore.Timestamp) {
            dateValue = rawValue.toDate();
        } else if (typeof rawValue === 'string' || typeof rawValue === 'number') {
            // Intentar parsear, incluso strings vacíos (que darán Invalid Date)
            if (typeof rawValue === 'string' && rawValue.trim() === '') {
                dateValue = new Date(NaN); // Forzar Invalid Date para strings vacíos
            } else {
                dateValue = new Date(rawValue);
            }
        } else {
            // Para null, undefined u otros tipos, forzar Invalid Date
            dateValue = new Date(NaN);
        }

        // Validación final: si es inválida, usar fecha actual
        return isNaN(dateValue.getTime()) ? new Date() : dateValue;
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

    // static getStatusColumnText(statusColumn: StatusColumnKey): string {
    //     switch (statusColumn) {
    //         case "backlog":
    //             return "Task Ready"
    //         case "wip":
    //             return "In Progress"
    //         case "qa":
    //             return "In Review"
    //         case "completed":
    //             return "Done"
    //         default:
    //             return "Not Assigned"
    //     }
    // }

    // Método estático para obtener el texto del estado
    static getStatusColumnText(status: StatusColumnKey): string {
        return TODO_STATUSCOLUMN[status] || 'Not Assigned';
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
            backgroundColorColumn: data.backgroundColorColumn,
            sortOrder: data.sortOrder
        });

        return todoIssue;
    }


}