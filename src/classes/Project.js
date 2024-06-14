export class Project {
    name
    description
    userRole
    status
    finishDate

    constructor(data) {
        this.name = data.name,
        this.description = data.description,
        this.userRole = data.userRole,
        this.status = data.status,
        this.finishDate = data.finishDate
    }
}