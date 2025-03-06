import { v4 as uuidv4 } from 'uuid'
import { IToDoIssue } from "./ToDoIssue"


export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

export interface IProject {
    name: string
    acronym: string
    businessUnit: BusinessUnit
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date
    cost: number
    progress?: number 
    //todoList: IToDoIssue[]
    id?: string
    
}

export enum BusinessUnit {
    Edification = "Edification",
    Civil = "Civil",
    Transport = "Transport",
    Bridge = "Bridge",
    Other = "Other"}


export class Project implements IProject {
    // To satisfy IProject
    name: string
    acronym: string
    businessUnit: BusinessUnit
    description: string
    status: "Pending" | "Active" | "Finished"
    userRole: "Architect" | "Engineer" | "Developer"
    finishDate: Date
    cost: number = 0
    progress?: number = 0
    

    // Class internals
    todoList: IToDoIssue[] = []
    id?: string
    //ui: HTMLDivElement    
    backgroundColorAcronym?: string
    

    

    constructor(data: IProject, idString?:string ) {
        // const projectKeys = Object.keys(dummyProject)
        for (const key in data) {  
            
            if (key === "businessUnit") {
                this[key] = data[key] as BusinessUnit
            } else if (key === "finishDate") {
                this.finishDate = new Date(data.finishDate)
            } else {
                this[key] = data[key]
            }
        }

        this.backgroundColorAcronym = Project.calculateBackgroundColorAcronym(this.businessUnit)
        // // Handle todoList and todoList.todoIssue.ui
        this.todoList = data.todoList || []
        if (idString) {
            this.id = idString
        }
        //if (!this.id) { this.id = idString } //In order to not change the ID when we import projects from JSON file
        console.log(data);

        // lets create the ui for the list of todo ISssue if the proyect is imported. I mean exist todoIssue data but does not exist ui variable

    }

    //calculateBackgroundColorAcronym
    static calculateBackgroundColorAcronym(businessUnit: BusinessUnit): string {
        switch (businessUnit) {
            case BusinessUnit.Edification:
                return "#f08080"; // Light red
            case BusinessUnit.Civil:
                return "#90ee90"; // Light green
            case BusinessUnit.Transport:
                return "#add8e6"; // Light blue
            case BusinessUnit.Bridge:
                return "#c8a2c8"; // Light yellow
            case BusinessUnit.Other:
                return "#d3d3d3"; // Light grey
            default:
                return "#ca8134"; // Default color
        }
    }

}