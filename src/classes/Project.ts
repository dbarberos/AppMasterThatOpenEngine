export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"


export interface IProject {
    name: string
    description: string
    status: ProjectStatus
    userRole: UserRole
    finishDate: Date
}



export class Project implements IProject {
    // To satisfy IProject
    name: string
    description: string
    status: "Pending" | "Active" | "Finished"
    userRole: "Architect" | "Engineer" | "Developer"
    finishDate: Date
 
    // Class internals
    ui: HTMLDivElement
    cost: number = 0
    progress: number = 0

    constructor(data: IProject) {
        this.name = data.name
        this.description = data.description
        this.userRole = data.userRole
        this.status = data.status
        this.finishDate = data.finishDate
        this.setUi ()
    }

    setUi() {
       if (this.ui) {return}
       this.ui = document.createElement("div")
       this.ui.className = "project-card"
       this.ui.innerHTML = `
            <div class="card-header">
                <p style="background-color: #ca8134; padding: 10px; border-radius: 8px; aspect-ratio: 1; ">HC</p>
                <div>
                    <h5>${this.name}</h5>
                    <p>${this.description}</p>
                </div>
            </div>
            <div class="card-content">
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.status}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.userRole}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>$${this.cost}</p>
                </div>
                <div class="card-property">
                    <p style="color: #969696;">Status</p>
                    <p>${this.progress * 100}%</p>
                </div>
            </div>
                    `
    }

}