import { Project, IProject, ProjectStatus, UserRole } from "./Project"


export class ProjectsManager {
    list: Project[] = []
    ui: HTMLElement
    defaultProjectCreated: boolean = false

    constructor(container: HTMLElement) {
        this.ui = container
        this.defaultProjectCreated = false
        this.createDefaultProject()
    }

    newProject(data: IProject) {
        const project = new Project(data)
        this.ui.append(project.ui)
        this.list.push(project)
        this.removeDefaultProject();
        return project
    }
    createDefaultProject() {
        if (this.defaultProjectCreated) { return }
        const defaultData = {
                name: "John Do Building",
                description: "A Big Building",
                status: "Active" as ProjectStatus,
                userRole: "Developer" as UserRole,
                finishDate: new Date("2022-02-03"),
                cost: 0,
                progress: 1
        }
        
        const defaultProject = new Project(defaultData)
        defaultProject.ui.classList.add("default-project") //making the default special for easy removing 
        this.ui.append(defaultProject.ui)
        this.list.push(defaultProject)
        this.defaultProjectCreated = true
    }
    removeDefaultProject() {
        if (this.defaultProjectCreated && this.list.length > 1) {
            // Remove the defautl project from the Ui and from the array list
            const defaultProjectUI = this.ui.querySelector(".default-project");
            if (defaultProjectUI) {
                this.ui.removeChild(defaultProjectUI);
            }
            this.list = this.list.filter(project => project.ui !== defaultProjectUI)
            this.defaultProjectCreated = false;
        }
    }
}



