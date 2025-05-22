import { v4 as uuidv4 } from 'uuid'
import { IToDoIssue } from "../types"
import { ToDoIssue } from "./ToDoIssue"
import * as Firestore from 'firebase/firestore'


export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

interface FirebaseTimestamp {
    seconds: number;
    nanoseconds: number;
}

export interface IProject {
    name: string
    acronym: string
    businessUnit: BusinessUnit
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date | string 
    cost: number
    progress?: number 
    //todoList: IToDoIssue[]
    id?: string
    todoList?: IToDoIssue[]
    createdAt?: Date | FirebaseTimestamp; // Añadir esta línea
    updatedAt?: Date | FirebaseTimestamp; // Añadir esta línea
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
    createdAt: Date;
    updatedAt: Date;

    

    constructor(data: IProject, idString?:string ) {
        // const projectKeys = Object.keys(dummyProject)
        for (const key in data) {
            
            if (key === "businessUnit") {
                this[key] = data[key] as BusinessUnit
            
            } else if (key === "finishDate") {
                if (data.finishDate) {
                    if (data.finishDate instanceof Date) {
                        const date = new Date(data.finishDate);
                        date.setHours(12, 0, 0, 0);
                        this.finishDate = date;
                    } else if (typeof data.finishDate === 'string') {
                        // Handle string date format (DD/MM/YYYY or ISO string)
                        const parsedDate = new Date(data.finishDate);
                        parsedDate.setHours(12, 0, 0, 0);
                        this.finishDate = parsedDate;
                    } else {
                        // Default date with noon time
                        const defaultDate = new Date();
                        defaultDate.setHours(12, 0, 0, 0);
                        this.finishDate = defaultDate;
                    }
                } else {
                    // Set default date with noon time if no date provided
                    const defaultDate = new Date();
                    defaultDate.setHours(12, 0, 0, 0);
                    this.finishDate = defaultDate;
                }

                // this.finishDate = data.finishDate instanceof Date
                //     ? data.finishDate
                // : new Date(data.finishDate);
                // if (isNaN(this.finishDate.getTime())) {
                //     console.error("Invalid date provided for finishDate:", data.finishDate);
                //     this.finishDate = new Date(); // Set a default valid date
                // }

            } else if (key === "createdAt") {
                this.createdAt = data.createdAt instanceof Date
                    ? data.createdAt
                    : new Date();
            } else if (key === "updatedAt") {
                this.updatedAt = data.updatedAt instanceof Date
                    ? data.updatedAt
                    : new Date();

            } else {
                this[key] = data[key]
            }
        }

        this.backgroundColorAcronym = Project.calculateBackgroundColorAcronym(this.businessUnit)

        // // Handle todoList and todoList.todoIssue.ui

        if (data.todoList && Array.isArray(data.todoList)) {
            // Si data.todoList existe, mapea sus elementos a instancias de ToDoIssue
            this.todoList = data.todoList.map(todoData => {
                // Si ya es una instancia, úsala; si no, créala
                return todoData instanceof ToDoIssue
                    ? todoData
                    : new ToDoIssue(todoData); // Usa el constructor robusto de ToDoIssue
            });
        } else {
            // Si no viene data.todoList, se queda con el valor inicial []
            this.todoList = [];
        }
        //this.todoList=[]


        if (idString) {
            this.id = idString
        }
        
        //if (!this.id) { this.id = idString } //In order to not change the ID when we import projects from JSON file
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