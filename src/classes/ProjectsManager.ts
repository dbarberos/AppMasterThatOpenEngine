import { Project, IProject, ProjectStatus, UserRole, BusinessUnit } from './Project'
import { showModal, closeModal, toggleModal, closeModalProject} from './UiManager'
import { MessagePopUp } from './MessagePopUp'
import { v4 as uuidv4 } from 'uuid'
import {  ToDoIssue } from "./ToDoIssue"
import { IToDoIssue, ITag, IAssignedUsers } from '../types'
import { newToDoIssue, clearSearchAndResetList, renderToDoIssueListInsideProject, resetSearchState } from './ToDoManager'
import { toast } from 'sonner'


import { useProjectsManager } from '../react-components/ProjectsManagerContext'

import { CACHE_TIMESTAMP_KEY, STORAGE_KEY, TODO_STATUSCOLUMN  } from '../const.ts'
import { createDocument, deleteToDoWithSubcollections, updateDocument, deleteAllTodosInProject, firestoreDB, getProjectsFromDB, replaceSubcollectionItems } from '../services/firebase'
import * as Firestore from 'firebase/firestore'

import { collection, doc, setDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore'


export class ProjectsManager {

    private _projects: Project[] = [];
    private unsubscribe: (() => void) | null = null; // Para desuscribirse del listener de Firestore
    private _isReady: boolean = false; // Nuevo estado para indicar si la carga inicial está completa
    private _readyCallbacks: (() => void)[] = []; // Callbacks para notificar cuando esté listo

    // Callbacks para que los componentes externos se suscriban a cambios
    public onProjectsListUpdated: (() => void) | null = null;

    // Callbacks específicos que se mantienen activos
    public onProjectCreated: ((project: Project) => void) | null = null;
    public onProjectDeleted: ((name: string) => void) | null = null;
    public onProjectUpdated: ((id: string) => void) | null = null;
    public onToDoUpdated: ((projectId: string, todoId: string) => void) | null = null; // Si este callback se usa
    public onToDoIssueDeleted: ((todoIssueId: string) => void) | null = null;

     /**
     * Constructor de ProjectsManager.
     * Inicializa el manager y configura el listener de Firestore para la sincronización en tiempo real.
     */
    constructor() {
        this.setupFirestoreListener(); // Inicia el listener de Firestore al construir la instancia
    }

    //get list(): Project[]
  
    // onProjectCreated = (project: Project) => { }
    // onProjectDeleted = (name: string) => { }
    // onProjectUpdated = (id: string) => { }
    // onToDoIssueDeleted = (todoIssueId: string) => { }



    /**
     * Configura el listener de Firestore para la colección 'projects'.
     * Se suscribe a los cambios en tiempo real y actualiza la lista interna de proyectos.
     */
    private setupFirestoreListener() {
        console.log('ProjectsManager: Configurando listener de Firestore...');
        if (this.unsubscribe) {
            this.unsubscribe(); // Limpiar el listener anterior si existe
            console.log('ProjectsManager: Listener de Firestore anterior desuscrito.');
        }

        const projectsCollectionRef = collection(firestoreDB, 'projects');
        this.unsubscribe = onSnapshot(projectsCollectionRef, (projectsSnapshot) => {
            console.log('ProjectsManager: onSnapshot disparado. Procesando cambios...');



            // // Mapea los datos base de los proyectos.
            // const projectDataList = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as IProject) }));

            // // Crea una promesa para cada proyecto que resolverá con el proyecto completo (incluyendo todos anidados).
            // const fullyPopulatedProjectPromises = projectDataList.map(async (projectData) => {

            //     // Nivel 2: Obtener la sub-colección 'todoList' para este proyecto.
            //     const todoListCollectionRef = collection(firestoreDB, 'projects', projectData.id, 'todoList');
            //     const todoListSnapshot = await Firestore.getDocs(Firestore.query(todoListCollectionRef));

            //     // Crea una promesa para cada 'todo' que resolverá con el 'todo' completo (incluyendo tags y usuarios).
            //     const fullyPopulatedTodoPromises = todoListSnapshot.docs.map(async (todoDoc) => {
            //         const todoData = todoDoc.data();
            //         const todoId = todoDoc.id;

            //         // Nivel 3: Obtener las sub-colecciones 'tags' y 'assignedUsers' en paralelo.
            //         const tagsCollectionRef = collection(firestoreDB, 'projects', projectData.id, 'todoList', todoId, 'tags');
            //         const usersCollectionRef = collection(firestoreDB, 'projects', projectData.id, 'todoList', todoId, 'assignedUsers');

            //         const [tagsSnapshot, usersSnapshot] = await Promise.all([
            //             Firestore.getDocs(Firestore.query(tagsCollectionRef)),
            //             Firestore.getDocs(Firestore.query(usersCollectionRef))
            //         ]);

            //         const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ITag));
            //         const assignedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IAssignedUsers));

            //         // Ensamblar el objeto ToDoIssue completo.
            //         return new ToDoIssue({
            //             ...todoData,
            //             id: todoId,
            //             dueDate: todoData.dueDate instanceof Timestamp ? todoData.dueDate.toDate() : new Date(todoData.dueDate),
            //             createdDate: todoData.createdDate instanceof Timestamp ? todoData.createdDate.toDate() : new Date(todoData.createdDate),
            //             tags,
            //             assignedUsers
            //         });
            //     });
            //     const todoList = await Promise.all(fullyPopulatedTodoPromises);

            //     // Ensamblar el objeto Project completo.
            //     return new Project({ ...projectData, todoList })



                // Usar docChanges() para procesar solo lo que ha cambiado, evitando la sobrescritura total.
            projectsSnapshot.docChanges().forEach(async (change) => {
                const doc = change.doc;
                const projectData = { id: doc.id, ...(doc.data() as IProject) };

                if (change.type === "added") {
                    console.log("ProjectsManager (onSnapshot): Nuevo proyecto añadido:", projectData.id);
                    const newProject = new Project(projectData);
                    // Cargar subcolecciones para el nuevo proyecto
                    await this.loadToDosForProject(newProject);
                    if (!this._projects.some(p => p.id === newProject.id)) {
                        this._projects.push(newProject);
                    }
                }

                if (change.type === "modified") {
                    console.log("ProjectsManager (onSnapshot): Proyecto modificado:", projectData.id);
                    const index = this._projects.findIndex(p => p.id === projectData.id);
                    if (index !== -1) {
                        // Fusiona los datos del documento principal, pero mantiene la todoList existente
                        // que se gestiona por separado para evitar el "salto".
                        const updatedProject = new Project({
                            ...this._projects[index], // Mantiene la todoList local actual
                            ...projectData,         // Sobrescribe los campos del documento principal (name, description, etc.)
                        });
                        this._projects[index] = updatedProject;
                    }
                }

                if (change.type === "removed") {
                    console.log("ProjectsManager (onSnapshot): Proyecto eliminado:", projectData.id);
                    this._projects = this._projects.filter(p => p.id !== projectData.id);
                }

                // Notificar a los suscriptores después de procesar cada lote de cambios
                if (this.onProjectsListUpdated) {
                    this.onProjectsListUpdated();
                }







            });
            // this._projects = newProjectsList; // Actualizar la lista interna del manager

            //this._projects = await Promise.all(fullyPopulatedProjectPromises);


            console.log('ProjectsManager: Lista interna de proyectos actualizada desde Firestore snapshot.', { count: this._projects.length });
            
            // Marcar como listo después de la primera instantánea
            if (!this._isReady) {
                this._isReady = true;
                console.log('ProjectsManager: Datos iniciales cargados. Notificando callbacks de listo.');
                this._readyCallbacks.forEach(cb => cb()); // Ejecutar callbacks pendientes
                this._readyCallbacks = []; // Limpiar callbacks después de notificar
            }
            
            // Notificar a los suscriptores que la lista ha cambiado (para actualizar UI y caché)
            if (this.onProjectsListUpdated) {
                console.log('ProjectsManager: Invocando onProjectsListUpdated.');
                this.onProjectsListUpdated();
            }

        }, (error) => {
            console.error('ProjectsManager: Error escuchando Firestore:', error);
            // Aquí podrías añadir lógica para manejar errores de conexión o permisos
        });
    }


    /**
     * Carga las subcolecciones (todoList, tags, users) para un proyecto dado.
     * @param {Project} project El proyecto para el cual cargar los To-Dos.
     */
    private async loadToDosForProject(project: Project) {
        const todoListCollectionRef = collection(firestoreDB, 'projects', project.id!, 'todoList');
        const todoListSnapshot = await Firestore.getDocs(todoListCollectionRef);

        const todoPromises = todoListSnapshot.docs.map(async (todoDoc) => {
            const todoData = todoDoc.data();
            const todoId = todoDoc.id;

            const tagsCollectionRef = collection(firestoreDB, 'projects', project.id!, 'todoList', todoId, 'tags');
            const usersCollectionRef = collection(firestoreDB, 'projects', project.id!, 'todoList', todoId, 'assignedUsers');

            const [tagsSnapshot, usersSnapshot] = await Promise.all([
                Firestore.getDocs(tagsCollectionRef),
                Firestore.getDocs(usersCollectionRef)
            ]);

            const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ITag));
            const assignedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IAssignedUsers));

            return new ToDoIssue({
                ...todoData,
                id: todoId,
                dueDate: todoData.dueDate instanceof Timestamp ? todoData.dueDate.toDate() : new Date(todoData.dueDate),
                createdDate: todoData.createdDate instanceof Timestamp ? todoData.createdDate.toDate() : new Date(todoData.createdDate),
                tags,
                assignedUsers
            });
        });

        project.todoList = await Promise.all(todoPromises);

        // Notificar que la lista de proyectos (y su contenido) ha sido actualizada.
        if (this.onProjectsListUpdated) {
            this.onProjectsListUpdated();
        }
    }











    /**
     * Devuelve una copia de la lista actual de proyectos.
     * @returns {Project[]} Una copia del array de proyectos.
     */
    get list(): Project[] {
        // CORRECCIÓN CRÍTICA: Asegura que se devuelve la lista interna _projects
        return [...this._projects]; 
    }

    /**
     * Indica si el manager ha completado su carga inicial desde Firestore.
     * @returns {boolean} True si está listo, false en caso contrario.
     */
    get isReady(): boolean {
        return this._isReady;
    }

    /**
     * Registra un callback para ser ejecutado cuando el manager esté listo.
     * Si ya está listo, el callback se ejecuta inmediatamente.
     * @param {() => void} callback La función a ejecutar.
     */
    onReady(callback: () => void) {
        console.log(`ProjectsManager: onReady llamado. isReady: ${this._isReady}`);
        if (this._isReady) {
            callback();
        } else {
            this._readyCallbacks.push(callback);
        }
    }



    /**
     * Obtiene un proyecto por su ID.
     * @param {string} id El ID del proyecto.
     * @returns {Project | undefined} El proyecto encontrado o undefined.
     */
    getProject(id: string): Project | undefined {
        console.log('ProjectsManager.ts: getProject llamado', { id });
        return this._projects.find(project => project.id === id);
    }

    /**
     * Obtiene un proyecto por su nombre.
     * @param {string} name El nombre del proyecto.
     * @returns {Project | undefined} El proyecto encontrado o undefined.
     */
    getProjectByName(name: string): Project | undefined {
        console.log('ProjectsManager.ts: getProjectByName llamado', { name });
        return this._projects.find(project => project.name === name);
    }




    /**
     * Añade un nuevo proyecto a la lista interna del manager.
     * Este método es para poblar la lista local, no para escribir en Firebase.
     * La escritura en Firebase debe hacerse a través de un método async separado.
     * @param {Project} data Los datos del proyecto a añadir/actualizar.
     * @param {string} [id] El ID opcional del proyecto.
     * @returns {Project | undefined} El proyecto añadido/actualizado o undefined si no se encontró para sobrescribir.
     */
    //ESTA FUCNION ESTA CREADA PARA LA CREACIÓN DE PROYECTOS AL RERENDERIZAR EL COMPONENTE DE REAC PROJECTPAGE
    newProject(data: Project, id?: string): Project | undefined {
        console.log('ProjectsManager: newProject llamado para añadir/actualizar en lista local.', { data, id });
        const projectNames = this.list.map((project) => {
            return project.name
        })

        if (projectNames.includes(data.name)) {
            // Find and remove the existing project from the list since you are going to use it later
            const existingProjectIndex = this.list.findIndex(project => project.name === data.name);
            if (existingProjectIndex !== -1) {
                //It is clare that there is an index, since there is a project with that name
                // 1. Remove the existing project from the list
                this._projects = this._projects.filter((project) => project.name !== data.name);

                // 2. Create a new project with the imported data
                const newProject = new Project(data, id);

                // 3. Process todo list if exists
                if (data.todoList && Array.isArray(data.todoList)) {
                    newProject.todoList = data.todoList.map(todoData => {

                        // Asegurarse de que las fechas se conviertan de Timestamp a Date si vienen de Firebase
                        const processedTodoData = {
                            ...todoData,
                            todoProject: newProject.id || '',
                            dueDate: todoData.dueDate instanceof Timestamp ? todoData.dueDate.toDate() : todoData.dueDate,
                            createdDate: todoData.createdDate instanceof Timestamp ? todoData.createdDate.toDate() : todoData.createdDate,
                        };
                        return ToDoIssue.createFromData(processedTodoData);
                    });
                }

                // 4. Add the new project to the list
                this._projects.push(newProject);
                this.updateLocalStorage(); // Actualizar localStorage
                if (this.onProjectCreated) { this.onProjectCreated(newProject); } // Notificar callback específico
                if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); } // Notificar callback general
                return newProject;

            } else {
                console.error("Project to overwrite not found in the list.")
                return undefined
            }

        } else {
            //Create a new proyect  
            const newProject = new Project(data, id)
            if (data.todoList && Array.isArray(data.todoList)) {
                newProject.todoList = data.todoList.map(todoData => {
                    // Asegurarse de que las fechas se conviertan de Timestamp a Date si vienen de Firebase
                    const processedTodoData = {
                        ...todoData,
                        todoProject: newProject.id || '',
                        dueDate: todoData.dueDate instanceof Timestamp ? todoData.dueDate.toDate() : todoData.dueDate,
                        createdDate: todoData.createdDate instanceof Timestamp ? todoData.createdDate.toDate() : todoData.createdDate,
                    };
                    return ToDoIssue.createFromData(processedTodoData);
                });
            }
            this._projects.push(newProject)
            this.updateLocalStorage(); // Actualizar localStorage
            if (this.onProjectCreated) { this.onProjectCreated(newProject); } // Notificar callback específico
            if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); } // Notificar callback general
            return newProject
        }
    }


    /*OLD NEWpROJECT FUNCTION
        OLDnewProject(data: IProject): Project | undefined {
            const projectNames = this.list.map((project) => {
                return project.name
            })
            if (projectNames.includes(data.name)) {
                console.log(`A project with the name [ ${data.name} ] already exists`)
                //Create a Confirmation Modal to prompt the user about the duplication and offer options
                return new Promise<Project | undefined>((resolve) => {// Return a Promise
                    const popupDuplicateProject = new MessagePopUp(
                        document.body,
                        "warning",
                        `A project with the name "${data.name}" already exist`,
    
                        `<b><u>Overwrite:</b></u> Replace the existing project with the imported data.<br>
                    <b><u>Skip:</b></u> Do not import the duplicated project.<br>
                    <b><u>Rename:</b></u> Enter a new name for the imported project.`,
                        ["Overwrite", "Skip", "Rename"],
                    )
    
                    // Define ALL your button callbacks for the messagePopUp created
                    const buttonCallbacks = {
                        "Overwrite": () => {
                            console.log("Overwrite button clicked!");
                            popupDuplicateProject.closeMessageModal();
    
                            // Find and remove the existing project from the ui & list since you are going to use it later
                            const existingProjectIndex = this.list.findIndex(project => project.name === data.name);
                            if (existingProjectIndex !== -1) {
    
                                // 1. Remove the existing project's UI from the display
                                this.ui.removeChild(this.list[existingProjectIndex].ui);
                                console.log("Old project removed fromthe UI");
    
                                // 2. Remove the existing project from the list
                                this.list = this.list.filter((project) => project.name !== data.name);
                                console.log("Removed the oLd Project name from the List of names");
    
    
                                // 3. Create a new project with the imported data
                                const newProject = new Project(data);
    
                                ATTACH THE EVENT LISTENER HERE
                                newProject.ui.addEventListener("click", () => {
                                    changePageContent("project-details", "flex")
    
                                    //Set the funcionality of search between todoIssues
                                    setupProjectDetailsSearch()
    
                                    // Set the localStorage value for pageWIP to "project-details"
                                    localStorage.setItem("pageWIP", "project-details")
                                    localStorage.setItem("selectedProjectId", newProject.id)
    
                                    ProjectsManager.setDetailsPage(newProject)
                                    console.log(" details pages set in a new window")
                                    
                                    updateAsideButtonsState()
                                })
                                
    
    
                                // 4. Add the new project to the list and UI
                                this.list.push(newProject);
                                this.onProjectCreated(newProject);
                                console.log("Added new project to the List of names")
                                // this.ui.append(newProject.ui)
                                //console.log("Added new project to the UI")
    
                                // 5. Resolve with the newly created project
                                resolve(newProject);
    
                            } else {
                                // Handle the case where the project is not found (shouldn't happen, just in case
                                console.error("Project to overwrite not found in the list.")
                                resolve(undefined); // Or resolve with an appropriate error value
                            }
                        },
                        "Skip": () => {
                            console.log("Skip button clicked!")
                            popupDuplicateProject.closeMessageModal()
                            resolve(undefined); // Resolve with undefined to indicate skipping
                        },
                        "Rename": () => {
                            console.log("Rename button clicked!")
                            // **Get the project name BEFORE creating the dialog**
                            const projectToRename = this.list.find((project) => project.name === data.name);
                            const existingProjectName = projectToRename ? projectToRename.name : "Project Name";
    
                            // 1. Create the rename dialog
                            const renameDialog = document.createElement("dialog");
                            // renameDialog.id = id;
                            renameDialog.className = "popup-default";
                            document.body.insertBefore(renameDialog, document.body.lastElementChild);
    
                            const box = document.createElement("div");
                            box.className = "message-content toast toast-popup-default";
                            renameDialog.appendChild(box);
    
                            const renameIcon = document.createElement("div");
                            renameIcon.className = "message-icon";
                            box.appendChild(renameIcon);
    
                            const renameIconSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                            renameIconSVG.setAttribute("class", "message-icon-svgDark");
                            renameIconSVG.setAttribute("role", "img");
                            renameIconSVG.setAttribute("aria-label", "rename");
                            renameIconSVG.setAttribute("width", "24px");
                            renameIconSVG.setAttribute("height", "24px");
                            renameIconSVG.setAttribute("fill", "#08090a");
                            renameIcon.appendChild(renameIconSVG);
    
                            const renameIconUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
                            renameIconUse.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#rename");
                            renameIconUse.setAttributeNS("http://www.w3.org/2000/svg", "xlink:href", "#rename");
                            renameIconSVG.appendChild(renameIconUse);
    
    
                            const content = document.createElement("div");
                            content.className = "toast-column";
                            box.appendChild(content);
    
    
                            const text = document.createElement("div");
                            text.className = "message-text";
                            content.appendChild(text);
    
                            const renameTitle = document.createElement("h5");
                            renameTitle.className = "message-text-title";
                            renameTitle.textContent = "Project name";
                            text.appendChild(renameTitle);
    
    
                            const renameSubtitle = document.createElement("p");
                            renameSubtitle.className = "message-text-message";
                            renameSubtitle.textContent = "Select the text field and populate it with a new name";
                            text.appendChild(renameSubtitle);
    
                            const boxInput = document.createElement("div");
                            boxInput.className = "message-text";
                            content.appendChild(boxInput);
    
    
                            const renameInputName = document.createElement("input");
                            renameInputName.className = "toast-input-text";
                            renameInputName.type = "text";
                            renameInputName.setAttribute("id", "newProjectName");
                            renameInputName.setAttribute("placeholder", existingProjectName);
                            renameInputName.setAttribute("autofocus", "");
                            renameInputName.setAttribute("required", "");
                            renameInputName.setAttribute("minlength", "5");
                            renameInputName.setAttribute("autocomplete", "off");
                            boxInput.appendChild(renameInputName);
    
    
                            const renameInputLabel = document.createElement("label");
                            renameInputLabel.className = "toast-input-text";
                            renameInputLabel.textContent = existingProjectName
                            renameInputLabel.setAttribute("autofocus", "false");
                            boxInput.appendChild(renameInputLabel);
    
    
                            const renameBtns = document.createElement("div");
                            renameBtns.className = "message-btns";
                            box.appendChild(renameBtns);
    
                            const rBtnA = document.createElement("button");
                            rBtnA.className = "message-btn";
                            rBtnA.type = "button";
                            rBtnA.setAttribute("id", "confirmRename");
                            renameBtns.appendChild(rBtnA)
    
                            const rBtnText = document.createElement("span");
                            rBtnText.className = "message-btn-text";
                            rBtnText.textContent = "Do it";
                            rBtnA.appendChild(rBtnText);
    
                            const rBtnC = document.createElement("button");
                            rBtnC.className = "message-btn";
                            rBtnC.type = "button";
                            rBtnC.setAttribute("id", "cancelRename");
                            renameBtns.appendChild(rBtnC)
    
                            const btnTextC = document.createElement("span");
                            btnTextC.className = "message-btn-text";
                            btnTextC.textContent = "Cancel";
                            rBtnC.appendChild(btnTextC);
    
    
    
                            // 2. Append the dialog to the body and show it
                            document.body.appendChild(renameDialog)
                            renameDialog.showModal()
    
                            // 3. Handle Confirm and Cancel buttons
                            const confirmRenameBtn = renameDialog.querySelector('#confirmRename')
                            const cancelRenameBtn = renameDialog.querySelector('#cancelRename')
                            const newProjectNameInput = renameDialog.querySelector('#newProjectName') as HTMLInputElement;
    
                            if (confirmRenameBtn && cancelRenameBtn && newProjectNameInput) {
                                confirmRenameBtn.addEventListener('click', () => {
                                    const newName = newProjectNameInput.value.trim()
    
                                    // Basic validation: Check if the name is empty
                                    if (newName === "") {
                                        const popupEnterNewName = new MessagePopUp(
                                            document.body,
                                            "error",
                                            `A project with a empty name is not allow`,
    
                                            "Please enter a valid project name.",
                                            ["Got it"],
                                        )
                                        // Define ALL your button callbacks for the messagePopUp created
                                        const buttonCallbacks = {
                                            "Got it": () => {
                                                console.log("Got it button clicked!")
                                                popupEnterNewName.closeMessageModal()
                                            },
                                        }
                                        popupEnterNewName.showNotificationMessage(buttonCallbacks);
    
                                        return;
                                    }
    
                                    // Validation: Check if the minimun length is 5 characters
                                    if (newName.length < 5) {
                                        const popupEnter5CharactersName = new MessagePopUp(
                                            document.body,
                                            "error",
                                            "Invalid Project Name",
                                            "Please enter a project name that is at least 5 characters long.",
                                            ["Got it"],
                                        )
                                        // Define ALL your button callbacks for the messagePopUp created
                                        const buttonCallbacks = {
                                            "Got it": () => {
                                                console.log("Got it button clicked!")
                                                popupEnter5CharactersName.closeMessageModal()
                                            },
                                        }
                                        popupEnter5CharactersName.showNotificationMessage(buttonCallbacks);
    
                                        return;
                                    }
    
                                    // Validation: Check if the mame does not exist
                                    const existingProject = projectNames.find(existingName => existingName.toLowerCase() === newName.toLowerCase())
    
                                    if (existingProject) {
                                        // Name already exists, show error message
                                        const existProjectName = new MessagePopUp(
                                            document.body,
                                            "error",
                                            "Duplicate Name",
                                            `A project named "${newName}" already exists. Please choose a different name.`,
                                            ["Got it"]
                                        );
                                        // Define button callback
                                        const buttonCallbacks = {
                                            "Got it": () => {
                                                existProjectName.closeMessageModal();
                                            }
                                        }
                                        existProjectName.showNotificationMessage(buttonCallbacks);
                                        const deleteNameInput = document.querySelector("#newProjectName") as HTMLInputElement | null
                                        if (deleteNameInput) {
                                            deleteNameInput.value = ""
                                        }
                                    } else {
    
    
    
                                        // Update the project name
                                        data.name = newName;
    
                                        //Assign a new Id to the project
                                        (data as any).id = uuidv4()
    
                                        //Assign a new id to each todoIssue 
                                        data.todoList.forEach((toDoIssue) => {
                                            toDoIssue.id = uuidv4()
                                        })
    
    
                                        // Create the new project and resolve the Promise
                                        const newProject = new Project(data);
    
                                        // ATTACH THE EVENT LISTENER HERE
                                        newProject.ui.addEventListener("click", () => {
                                            changePageContent("project-details", "flex")
    
                                            //Set the funcionality of search between todoIssues
                                            setupProjectDetailsSearch()
    
                                            // Set the localStorage value for pageWIP to "project-details"
                                            localStorage.setItem("pageWIP", "project-details")
                                            localStorage.setItem("selectedProjectId", newProject.id)
    
                                            ProjectsManager.setDetailsPage(newProject);
                                            console.log("Details page set in a new window");
                                            
                                            updateAsideButtonsState()
                                        });
                                        
    
                                        this.list.push(newProject)
                                        // this.ui.append(newProject.ui)
                                        this.onProjectCreated(newProject)
                                        resolve(newProject)
    
                                        // Close the dialog
                                        renameDialog.close()
                                    }
                                });
    
                                cancelRenameBtn.addEventListener('click', () => {
                                    renameDialog.close()
                                    resolve(undefined); // Resolve as undefined to indicate renaming was cancelled
                                });
                            }
                            popupDuplicateProject.closeMessageModal()
                        }
                    }
                    popupDuplicateProject.showNotificationMessage(buttonCallbacks);
                })
    
            } else {
                // No duplicate, create the project
                const project = new Project(data)
    
                console.log(project.todoList)
    
                // this.ui.append(project.ui)
                this.list.push(project)
                //this.removeDefaultProject();
                this.onProjectCreated(project)
                return project
            }
    
        }
    */

    // It has been suplanted by custome hook
        /**
     * Filtra la lista de proyectos por nombre.
     * @param {string} value El valor a buscar en el nombre del proyecto.
     * @returns {Project[]} La lista de proyectos filtrada.
     */
    filterProjects(value: string) {
        console.log('ProjectsManager: filterProjects llamado.', { value });
        const filteredProjects = this.list.filter((project) => {
            return project.name.toLowerCase().includes(value.toLowerCase())
        })
        return filteredProjects
    }

    /* //setDetailsPage function
    static setDetailsPage(project: Project) {
        const detailPage = document.getElementById("project-details")
        if (!detailPage) { return }


        //Set up counter of the search input in the todo-list
        const counterElement = document.getElementById('todolist-search-counter') as HTMLElement
        if (counterElement) {
            resetSearchState(counterElement);
        }

        
        for (const key in project) {
            const dataElement = detailPage.querySelectorAll(`[data-project-info="${key}"]`)
            if (dataElement) {
                if (key === "finishDate") {
                    const formattedDate = project.finishDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    dataElement.forEach(element => {
                        element.textContent = formattedDate
                    })
                } else if (key === "cost") {
                    const costElement = detailPage.querySelector(`[data-project-info="cost"]`)
                    if (costElement) {
                        costElement.textContent = `${project["cost"]}`
                    }
                } else {
                    dataElement.forEach(element => {
                        element.textContent = project[key]
                    })
                }
                
            }
        }
        // Update the background color of the acronym in the dashboard-card
        const acronymElement = detailPage.querySelector('[data-project-info="acronym"]') as HTMLElement
        if (acronymElement) {
            acronymElement.style.backgroundColor = project.backgroundColorAcronym;
        }

        // Set the data-projectId attribute with the unique ID of the proyect 
        const projectDatasetAttributeId = document.getElementById("edit-project-details")
        if (projectDatasetAttributeId) {
            projectDatasetAttributeId.dataset.projectId = project.id.toString()
        }

        // Set the data-projectId attribute with the unique ID of the proyect in the button of new To-Do
        const projectToDoDatasetAttributeId = document.getElementById("new-todo-issue-btn")
        if (projectToDoDatasetAttributeId) {
            projectToDoDatasetAttributeId.dataset.projectId = project.id.toString()
        }

        //****Create de list of ToDo cards for that specifict project****
        //We have to manage new project and imported projects from Json. Tose last project don´t have ui HTML elements imported.

        //Get the target element
        const projectListToDosUI = document.querySelector("#details-page-todo-list") as HTMLElement

        // Clear any existing content in the container 
        while (projectListToDosUI.firstChild) {
            projectListToDosUI.removeChild(projectListToDosUI.firstChild);
        }
        // Iterate through the todoList and append each UI element
        project.todoList.forEach(toDoIssue => {
            if (!toDoIssue.ui) {
                renderToDoIssueListInsideProject(toDoIssue)
            }

            // Append the new div to the todoListContainer
            projectListToDosUI.appendChild((toDoIssue as any).ui);
            
        })

        //SetUp the selection intput of existing projects showing the stored inside the local storage selectedProjectId
        console.log("setUpSelectionProject", project.id)
        ProjectsManager.setUpSelectionProject("projectSelectedProjectDetailPage", project.id)
        
        //Setup the todo-header column with the name of the project
        const todoHeader = document.querySelector("#todo-project-header-name") as HTMLElement

        if (todoHeader) {
            todoHeader.textContent = ""
            todoHeader.textContent = project.name
        }
        
    
    }
*/


    static setUpSelectionProject(idElementSelection?, projectIdSelected?) {
        // Get the project list
        //const projectManager = ProjectsManager.getInstance()
        const projectsManager = useProjectsManager();
        const projectsList = projectsManager.list
        const selectionProjectForProjectDetailPage = document.getElementById(idElementSelection) as HTMLSelectElement

        if (selectionProjectForProjectDetailPage) {
            selectionProjectForProjectDetailPage.innerHTML = ""

            // Add a default option to select a project
            const option = document.createElement("option");
            option.value = "";
            option.text = "Select a project"
            // option.disabled = true
            option.style.color = "var(--color-fontbase-dark)"
            selectionProjectForProjectDetailPage.appendChild(option);

            // Populate the select element with project options
            projectsList.forEach((project) => {
                const option = document.createElement("option");
                option.value = project.id;
                option.text = project.name;
                selectionProjectForProjectDetailPage.appendChild(option)

                // Select the project corresponding to the stored project ID

                selectionProjectForProjectDetailPage.value = projectIdSelected
            })
        }

        //Listen when the user change the Project inside the ToDo Board
        selectionProjectForProjectDetailPage.addEventListener("change", () => {
            const changedProjectId = selectionProjectForProjectDetailPage.value

            // Reset the number of task in the counter of todo Issues 
            const counterElementProjectDetails = document.getElementById('todolist-search-counter') as HTMLElement
            if (counterElementProjectDetails) {
                resetSearchState(counterElementProjectDetails)
            }

            //Clean the search input
            clearSearchAndResetList()

            //Save the Id of the selected project in the local storage
            localStorage.setItem("selectedProjectId", changedProjectId)
            updateAsideButtonsState()

            // Now you can use the selectedProjectId variable, it is updated using the setUpToDoBoard function
            console.log("selectedProjectId", changedProjectId)

            // Recover the project with this ID
            const selectedProject = projectsList.find(project => project.id === changedProjectId);


            const storedPageWIP = localStorage.getItem("pageWIP")

            if (storedPageWIP === "project-details" && selectedProject) {
                ProjectsManager.setDetailsPage(selectedProject)
            }
        })

    }

    /* USED INSIDE INDEX.TSX */

        /**
     * Actualiza un proyecto en la lista interna del manager.
     * Este método es para actualizar la lista local, no para escribir en Firebase.
     * La escritura en Firebase debe hacerse a través de un método async separado.
     * @param {Project} dataToUpdate Los datos del proyecto a actualizar.
     * @returns {Project[] | false} La lista de proyectos actualizada o false si no se encontró el proyecto.
     */


    updateReactProjects(dataToUpdate: Project): Project[] | false {
        console.log('ProjectsManager: updateReactProjects llamado para actualizar en lista local.', { dataToUpdate });
        const projectIndex = this._projects.findIndex(p => p.id === dataToUpdate.id)

        if (projectIndex !== -1) {
            //Preserve the original ID
            dataToUpdate.id = this.list[projectIndex].id

            //Create a new list with the updated project
            const updatedProjectsList = this.list.map((project, index) =>
                index === projectIndex ? new Project({
                    ...project, // Keep existing properties
                    ...dataToUpdate // Add new properties
                }) : project
            );
            // Se usa this._projects para la lista interna
            this._projects = updatedProjectsList; // Actualizar la lista interna
            this.updateLocalStorage(); // Actualizar localStorage
            if (this.onProjectUpdated) { this.onProjectUpdated(dataToUpdate.id!); } // Notificar callback específico
            if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); } // Notificar callback general

            //Return the entire updated list of projects
            return updatedProjectsList

            /*  
            Update the Project Data in the Array.
            this.list[projectIndex] = new Project({
                ...this.list[projectIndex], // Keep existing properties
                ...dataToUpdate // Update with new values
            })

            //ProjectsManager.setDetailsPage(this.list[projectIndex])
            return this.list
          // return true; // Indicate successful update
          */

        } else {
            console.error("Project not found in the list!")
            return false
        }
    }

    /* USED INSIDE NEWPROJECTFORM.TSX */

        /**
     * Actualiza un proyecto en la lista interna del manager y en Firebase.
     * @param {string} projectId El ID del proyecto a actualizar.
     * @param {Project} dataToUpdate Los datos del proyecto a actualizar.
     * @returns {Project | null} El proyecto actualizado o null si no se encontró.
     */

    updateProject(projectId: string, dataToUpdate: Project): Project | null {
        console.log("ProjectsManager.ts: updateProject called", { projectId, dataToUpdate })
        // Se mantiene la comprobación de isReady aquí si se quiere que este método lance un error
        // si el manager no está listo, aunque la lógica original no lo hacía.

        const projectIdString = projectId.toString().trim()
        const projectIndex = this.list.findIndex(p => p.id?.toString().trim() === projectIdString) //Convert to string and trim for the comparing the same type of data

        if (projectIndex !== -1) {
            //  Update the existing project object directly (instead of creating a new one)
            //const projectToUpdate = this.list[projectIndex];

            // Create new project instance with updated data
            const currentProject = this._projects[projectIndex]; 
            const updatedProject = new Project({
                ...currentProject,
                ...dataToUpdate,
                id: projectId,
                finishDate: dataToUpdate.finishDate instanceof Date
                    ? dataToUpdate.finishDate
                    : new Date(dataToUpdate.finishDate)
            });


            // Check if the date is valid
            if (isNaN(updatedProject.finishDate.getTime())) {
                console.error("Invalid date provided for finishDate:", dataToUpdate.finishDate);
                updatedProject.finishDate = new Date(); // Set a default valid date
            }


            // // Update properties of the existing project
            //for (const key in dataToUpdate) {
            //    if (key !== "id") { // Explicitly exclude the ID to prevent it from //being overwritten.
            //        projectToUpdate[key] = dataToUpdate[key];
            //    }
            //}

            // Update the list
            this._projects[projectIndex] = updatedProject;



            // Actualizar en Firebase
            const projectDocRef = doc(firestoreDB, 'projects', projectId);
            setDoc(projectDocRef, this.toFirestoreData(updatedProject), { merge: true }) // Usar toFirestoreData
                .then(() => console.log(`ProjectsManager: Document updated successfully in Firebase at projects/${projectId}`))
                .catch(error => console.error(`ProjectsManager: Error updating document in Firebase at projects/${projectId}:`, error));

            // Notificar a los suscriptores y actualizar localStorage
            this.updateLocalStorage(); 
            if (this.onProjectUpdated) { this.onProjectUpdated(projectId); } // Notificar callback específico
            if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); } // Notificar callback general



            // // Trigger update callback
            // if (this.onProjectUpdated) {
            //     this.onProjectUpdated(projectId)
            // }

            // // Update localStorage
            // this.updateLocalStorage()

            return updatedProject


        } else {
            console.error("Project not found in the list!")
            return null
        }
    }


    /**
     * Actualiza el caché de proyectos en localStorage.
     * Se llama cuando la lista interna de proyectos (_projects) se actualiza.
     */

    private updateLocalStorage(): void {
        try {
            console.log('LS_Update: Iniciando updateLocalStorage. this.list tiene:',
                this.list.map(p => ({ id: p.id, todoCount: p.todoList?.length ?? 'N/A' }))
            );
            // Process projects before storing
            const processedProjects = this.list.map(project => {
                const processedTodoList = project.todoList.map(todo => {
                    // *** Simplificación: Llamar directamente a toISOString() ***
                    const processedDueDate = todo.dueDate.toString();
                    const processedCreatedDate = todo.createdDate.toString();

                    return {
                        ...todo,
                        dueDate: processedDueDate,
                        createdDate: processedCreatedDate,
                        // ui: undefined, // Asegúrate de excluir propiedades no serializables
                    };
                });
                // Procesar finishDate (Aún necesita chequeo si puede ser inválido o no Date)
                let processedFinishDate: string | null = null;
                if (project.finishDate instanceof Date) {
                    // *** ¡AÚN RECOMENDADO! Chequeo isNaN para finishDate ***
                    if (!isNaN(project.finishDate.getTime())) {
                        processedFinishDate = project.finishDate.toISOString();
                    } else {
                        console.warn(`LS_Update - Proyecto ${project.id}: finishDate inválida. Guardando null.`);
                        processedFinishDate = null;
                    }
                } else if (project.finishDate !== null && project.finishDate !== undefined) {
                    // Podría ser un string si viene de localStorage
                    processedFinishDate = project.finishDate as string;
                }

                return {
                    ...project,
                    todoList: processedTodoList,
                    finishDate: processedFinishDate,
                    // ui: undefined, // Asegúrate de excluir propiedades no serializables
                };
            });


            // *** Log CLAVE antes de JSON.stringify ***
            // *** Log CLAVE antes de JSON.stringify ***
            console.log('LS_Update - FINAL: Datos listos para guardar. Estado de las todoLists:',
                processedProjects.map(p => ({ id: p.id, todoCount: p.todoList?.length ?? 'N/A' }))
            )

            localStorage.setItem(STORAGE_KEY, JSON.stringify(processedProjects));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

            console.log('LS_Update: localStorage actualizado.');

        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }



    /**
     * Helper para convertir el objeto Project a un objeto plano compatible con Firestore.
     * Maneja la conversión de objetos Date a Firestore Timestamps, especialmente para todoList.
     * @param {Project} project El objeto Project a convertir.
     * @returns {{ [key: string]: any }} El objeto plano para Firestore.
     */
    private toFirestoreData(project: Project): { [key: string]: any } {
        const data: { [key: string]: any } = { ...project };
        // Convertir objetos Date a Firestore Timestamps para los elementos de todoList
        data.todoList = data.todoList.map((todo: ToDoIssue) => ({
            ...todo,
            dueDate: todo.dueDate instanceof Date ? Timestamp.fromDate(todo.dueDate) : todo.dueDate,
            createdDate: todo.createdDate instanceof Date ? Timestamp.fromDate(todo.createdDate) : todo.createdDate,
        }));
        delete data.id; // El ID del documento de Firestore es independiente de los campos
        return data;
    }








    //FOR UPDATING THE TODO LIST INSIDE DE PROJECTS.MANAGER WHEN IT SHOULD BE UPDATED

        /**
     * Actualiza la lista de To-Do Issues dentro de un proyecto específico en el manager.
     * Este método manipula la lista interna y actualiza localStorage.
     * @param {string} projectId El ID del proyecto al que pertenece el To-Do.
     * @param {ToDoIssue} todo El To-Do Issue a añadir o actualizar.
     */
    updateProjectToDoList(projectId: string, todo: ToDoIssue) {
        console.log(`PM.updateProjectToDoList ENTERED at ${Date.now()} for todo ID ${todo.id}`)

        const projectIndex = this._projects.findIndex(p => p.id === projectId);
        // const project = this.list.find(p => p.id === projectId); 

        if (projectIndex !== -1) {
            //if (project) {
            const currentProject = this._projects[projectIndex]

            console.log(`PM.updateProjectToDoList: Checking project ${projectId}. Current todoList IDs:`, currentProject.todoList.map(t => t.id))


            const existingTodoIndex = currentProject.todoList.findIndex(t => t.id === todo.id)

            // Only add if it doesn't exist
            if (existingTodoIndex === -1) {
                try {
                    //project.todoList.push(todo);
                    // Process the todo before add
                    const todoToAdd = new ToDoIssue({
                        ...todo,
                        dueDate: todo.dueDate instanceof Date
                            ? todo.dueDate
                            : new Date(todo.dueDate),
                        createdDate: todo.createdDate instanceof Date 
                            ? todo.createdDate
                            : new Date(todo.createdDate),
                        todoProject: projectId // Asegurar que mantiene la referencia al proyecto
                    });
                    console.log('PM: todoToAdd (instancia validada):', { ...todoToAdd });
                
                    if (isNaN(todoToAdd.dueDate.getTime())) {
                        throw new Error(`Invalid dueDate for todo ${todo.id}`);
                    }

                    // Clonar la lista existente y añadir el nuevo ToDo
                    const updatedTodoList = [...currentProject.todoList, todoToAdd];
                    console.log('PM: updatedTodoList (antes de new Project):', updatedTodoList.map(t => ({ id: t.id, title: t.title }))); 

                    // *** Log CLAVE antes de llamar al constructor ***
                    const dataForNewProject = {
                        ...currentProject,
                        todoList: updatedTodoList,
                        id: projectId
                    };
                    console.log('PM: Datos que se pasarán a new Project():', JSON.stringify(dataForNewProject, null, 2)); // Stringify para ver estructura

                    // New ToDos Array in a inmutable way
                    const updatedProject = new Project({
                        ...currentProject,
                        todoList: updatedTodoList,
                        id: projectId
                    })
                    console.log('PM: updatedProject (DESPUÉS de new Project):', { ...updatedProject, todoList: updatedProject.todoList.map(t => ({ id: t.id, title: t.title })) }); // Log simplificado

                
                    // Actualizar la lista de proyectos con el nuevo proyecto
                    this._projects = [
                        ...this.list.slice(0, projectIndex),
                        updatedProject,
                        ...this._projects.slice(projectIndex + 1)
                    ]
                    console.log('PM: this._projects actualizado, proyecto afectado:', this._projects[projectIndex].todoList.map(t => ({ id: t.id, title: t.title })));

                    // *** Log CLAVE antes de guardar en localStorage ***
                    console.log('PM: Llamando a updateLocalStorage(). Estado actual de this._projects:', this._projects.map(p => ({ id: p.id, name: p.name, todoCount: p.todoList.length })));

                    // Actualizar en Firebase
                    const projectDocRef = doc(firestoreDB, 'projects', projectId);
                    setDoc(projectDocRef, this.toFirestoreData(updatedProject), { merge: true }) // Actualizar el proyecto completo en Firebase
                        .then(() => console.log(`ProjectsManager: Project ${projectId} todoList updated in Firebase.`))
                        .catch(error => console.error(`ProjectsManager: Error updating project ${projectId} todoList in Firebase:`, error));


                    // Update localStorage immediately after updating ProjectsManager
                    this.updateLocalStorage()

                    console.log('Todo added successfully:', {
                        projectId,
                        todoId: todoToAdd.id,
                        todoListLength: updatedProject.todoList.length,
                        storedTodos: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
                            .find(p => p.id === projectId)?.todoList?.length || 0
                    });

                    // Notify changes
                    // Notificar a los suscriptores
                    if (this.onProjectUpdated) { this.onProjectUpdated(projectId); } // Notificar callback específico
                    if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); } // Notificar callback general
                    // El callback onProjectUpdated se elimina, ya que onProjectsListUpdated es más general
                    // this.onProjectUpdated(projectId); 

                } catch (error) {
                    console.error('Error adding todo:', error);
                }

            } else {
                console.warn(`PM.updateProjectToDoList: Todo ID ${todo.id} ALREADY FOUND at index ${existingTodoIndex}. Skipping add/localStorage update.`);
                // Si el ToDo ya existe, se asume que no hay cambio o que ya se manejó.
                // Solo se actualiza localStorage y se notifica si es necesario.
                // Update localStorage immediately after updating ProjectsManager
                this.updateLocalStorage()
                // Notify changes
                // Notificar a los suscriptores
                if (this.onProjectUpdated) { this.onProjectUpdated(projectId); } // Notificar callback específico
                if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); } // No
                //this.onProjectUpdated(projectId);

            }
        } else {
            console.error(`Project with ID ${projectId} not found.`);
        }
    }

    // Add this method to handle todo updates

        /**
     * Actualiza un To-Do Issue específico dentro de un proyecto.
     * Este método manipula la lista interna y actualiza localStorage.
     * @param {string} projectId El ID del proyecto al que pertenece el To-Do.
     * @param {string} todoId El ID del To-Do Issue a actualizar.
     * @param {ToDoIssue} updatedTodo Los datos actualizados del To-Do Issue.
     */
    async updateToDoIssue(projectId: string, todoId: string, updates: Partial<IToDoIssue>) {
        console.log("ProjectsManager.ts: updateToDoIssue called", { projectId, todoId, updates })
        // const project = this._projects.find(p => p.id === projectId);
        const projectIndex = this._projects.findIndex(p => p.id === projectId);


        if (projectIndex === -1) {
            console.error(`Project with ID ${projectId} not found.`);
            throw new Error("Project not found");
        }

        const project = this._projects[projectIndex];
        const todoIndex = project.todoList.findIndex(t => t.id === todoId);

        if (todoIndex === -1) {
            console.error(`ToDo with ID ${todoId} not found in project ${projectId}.`);
            throw new Error("ToDo not found");
        }

        // 1. FUSIONAR el estado local PRIMERO para evitar errores en localStorage.
        const originalTodo = project.todoList[todoIndex];
        const updatedTodoForState = new ToDoIssue({ ...originalTodo, ...updates });

        const newTodoList = [...project.todoList];
        newTodoList[todoIndex] = updatedTodoForState;

        const updatedProjectInstance = new Project({ ...project, todoList: newTodoList });
        this._projects[projectIndex] = updatedProjectInstance;

        try {
            // 2. Separar las actualizaciones de campos de las de subcolecciones.
            const { tags, assignedUsers, ...otherUpdates } = updates;

            // 3. Actualizar los campos simples del documento principal si existen.
            if (Object.keys(otherUpdates).length > 0) {
                console.log(`ProjectsManager: Updating simple fields for ToDo ${todoId}:`, Object.keys(otherUpdates));
                // La función updateDocument ya se encarga de serializar las fechas.
                await updateDocument(todoId, otherUpdates, { basePath: `projects/${projectId}/todoList` });
            }

            // 4. Gestionar la subcolección de 'tags' si se ha modificado.
            if (tags) {
                console.log(`ProjectsManager: Updating 'tags' subcollection for ToDo ${todoId}`);
                const tagsPath = `projects/${projectId}/todoList/${todoId}/tags`;
                await replaceSubcollectionItems(tagsPath, tags);
            }

            // 5. Gestionar la subcolección de 'assignedUsers' si se ha modificado.
            if (assignedUsers) {
                console.log(`ProjectsManager: Updating 'assignedUsers' subcollection for ToDo ${todoId}`);
                const usersPath = `projects/${projectId}/todoList/${todoId}/assignedUsers`;
                await replaceSubcollectionItems(usersPath, assignedUsers);
            }

            // 6. Actualizar localStorage y notificar a los listeners.
            this.updateLocalStorage();
            if (this.onProjectUpdated) { this.onProjectUpdated(projectId); }
            if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); }

        } catch (error) {
            console.error('Error updating ToDo in Firebase:', error);
            // Aquí podrías implementar una lógica de rollback para el estado local si Firebase falla.
            // Por ahora, lo más importante es que el error se propague para que se muestre un toast.
            throw error;
        }


    }

    
    deleteToDoIssue(projectId: string, todoId: string): void {
        const projectIndex = this._projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            console.error(`Project with ID ${projectId} not found.`);
            return;
        }
        const project = this._projects[projectIndex];
        const newTodoList = project.todoList.filter(todo => todo.id !== todoId);
        this._projects[projectIndex] = new Project({ ...project, todoList: newTodoList });
    
        this.updateLocalStorage();
        if (this.onProjectUpdated) { this.onProjectUpdated(projectId); }
        if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); }
    }










    //  *** USED INSIDE NewProjectForm *** 
    /**
     * Método estático para poblar un formulario HTML con los detalles de un proyecto.
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     * @param {Project} project El objeto Project con los datos para poblar el formulario.
     */
    static populateProjectDetailsForm(project: Project) {
        console.log('ProjectsManager: populateProjectDetailsForm llamado.');
        const projectDetailsForm = document.getElementById("new-project-form")
        if (!projectDetailsForm) { return }


        for (const key in project) {
            const inputField = projectDetailsForm.querySelectorAll(`[data-form-value="${key}"]`)
            if (inputField.length > 0) {
                if (key === "finishDate") {
                    // Format date for input type="date"
                    const date = new Date(project.finishDate);
                    date.setHours(12, 0, 0, 0)
                    const formattedDate = date.toISOString().split('T')[0]


                    // const formattedDate = project.finishDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    console.log(`ProjectsManager: Populating finishDate for ${key}: ${formattedDate}`);

                    inputField.forEach(element => {
                        (element as HTMLInputElement).value = formattedDate
                        console.log(`${project[key]}`);

                    })
                } else {
                    inputField.forEach(element => {
                        // Handle different input types                        
                        if (element instanceof HTMLInputElement) {
                            element.value = (project as any)[key] // For text, date inputs
                        } else if (element instanceof HTMLTextAreaElement) {
                            element.value = project[key] // For textareas
                        } else if (element instanceof HTMLSelectElement) {
                            // For select elements, set the selected option
                            const options = element.options
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].value === project[key]) {
                                    options[i].selected = true
                                    break
                                }
                            }
                        }
                    })
                }
            }
        }
    }


    //*** USED INSIDE NewProjectForm *** *

        /**
     * Compara un proyecto existente con uno actualizado y devuelve las diferencias.
     * NOTA: Este método es de utilidad general y no manipula el estado del manager.
     * @param {Project | null} existingProject El proyecto original.
     * @param {Project} updatedProject El proyecto con los datos actualizados.
     * @returns {Record<string, [any, any]>} Un objeto con las propiedades que cambiaron.
     */

    static getChangedProjectDataForUpdate(existingProject: Project | null, updatedProject: Project): Record<string, [any, any]> {
        console.log('ProjectsManager: getChangedProjectDataForUpdate llamado.');
        const changedData: { [key: string]: [string, string] } = {};

        if (!existingProject) return changedData;

        for (const key in existingProject) {
            // Skip certain properties
            if (['backgroundColorAcronym', 'createdAt', 'updatedAt', 'todoList'].includes(key)) {
                continue;
            }

            // // Avoid 'backgroundColorAcronym' property from the comparation
            // if (key === "backgroundColorAcronym") {
            //     continue;
            // }
            // // Avoid 'createdAt' property from the comparation
            // if (key === "createdAt") {
            //     continue;
            // }
            // // Avoid 'createdAt' property from the comparation
            // if (key === "updatedAt") {
            //     continue;
            // }
            // // Avoid 'todoList' property from the comparation
            // if (key === "todoList") {
            //     continue;
            // }

            const currentProjectValue = existingProject[key];
            const valueToUpdate = updatedProject[key];

            // Skip if both values are undefined or null
            if (currentProjectValue === undefined && valueToUpdate === undefined) continue;
            if (currentProjectValue === null && valueToUpdate === null) continue;

            console.log(`Comparing ${key}:`, currentProjectValue, valueToUpdate); // Línea de depuración

            if (key === 'finishDate') {
                // Comparar y almacenar la diferencia (manejando las fechas adecuadamente)
                // Set both dates to noon for comparison
                const currentDate = currentProjectValue instanceof Date
                    ? currentProjectValue
                    : new Date(currentProjectValue);

                const updateDate = valueToUpdate instanceof Date
                    ? valueToUpdate
                    : new Date(valueToUpdate);

                // Set both dates to noon for comparison
                currentDate.setHours(12, 0, 0, 0);
                updateDate.setHours(12, 0, 0, 0);

                // Only add to changedData if dates are different and valid
                if (!isNaN(currentDate.getTime()) && !isNaN(updateDate.getTime()) && currentDate.getTime() !== updateDate.getTime()) {
                    changedData[key] = [currentDate.toLocaleDateString('es-ES'), updateDate.toLocaleDateString('es-ES')];
                }
                continue
            }


            //     if (currentProjectValue.getTime() !== valueToUpdate.getTime()) {
            //         changedData[key] = [currentProjectValue.toLocaleDateString(), valueToUpdate.toLocaleDateString()];
            //     }
            if (currentProjectValue !== valueToUpdate) {
                changedData[key] = [String(currentProjectValue), String(valueToUpdate)];
            }
        }

        console.log("Changed Data:", changedData);
        return changedData;
    };


// /* ********* REMOVED BECAUSE IS USED REACT FOR MANAGING UI INTERFACES ******** */

    // renderProjectList(): void {
    //     const projectListUiElements = document.getElementById('project-list');
    //     if (projectListUiElements) {

    //         // Clear the existing elements inside the #project-list div
    //         projectListUiElements.innerHTML = ""

    //         // Re-render the project list with the updated data
    //         this.list.forEach(project => {
    //             const projectUiElement = this.updateProjectUi(project);
    //             projectListUiElements.appendChild(projectUiElement);

    //             // // Remove any existing click listeners (optional but recommended)
    //             // projectUiElement.removeEventListener("click", this.handleProjectClick);

    //             // Attach the click listener 
    //             projectUiElement.addEventListener("click", () => {
    //                 changePageContent("project-details", "flex");

    //                 //Set the funcionality of search between todoIssues
    //                 setupProjectDetailsSearch()
    //                 localStorage.setItem("selectedProjectId", project.id)

    //                 ProjectsManager.setDetailsPage(project);
    //                 console.log("Details page set in a new window");

    //                 updateAsideButtonsState()
    //             });


    //         });
    //     }
    // }


    /*REMOVED THE CREATION OF DEFAULT PROJECT
    createDefaultProject() {
        if (this.defaultProjectCreated) { return }
        const defaultData = {
            name: "Example Project",
            acronym: "EP",
            description: "This is a A Big Building",
            businessUnit: "Edification" as BusinessUnit,
            status: "Active" as ProjectStatus,
            userRole: "Developer" as UserRole,
            finishDate: new Date("2022-02-03"),
            cost: 0,
            progress: 1,
            id: "default-project",
            todoList: [],
            backgroundColorAcronym: "#ccc"

        }
        
        const defaultProject = new Project(defaultData)
        defaultProject.ui.classList.add("default-project") //making the default special for easy removing 
        this.list.push(defaultProject)
        this.defaultProjectCreated = true
    }
    */

    /*REMOVED THE ERASE OF DEFAULT PROJECT
    removeDefaultProject() {
        if (this.defaultProjectCreated && this.list.length > 1) {
            // Remove the defautl project from the Ui and from the array list
            const defaultProjectUI = this.ui.querySelector(".default-project");
            if (defaultProjectUI) {
                this.ui.removeChild(defaultProjectUI);
            }
            // this.list = this.list.filter(project => project.ui !== defaultProjectUI)
            this.defaultProjectCreated = false;
        }
    }
    */

    /* USED INSIDE ProjectDetailsPage */


    /**
     * Obtiene la lista de To-Do Issues para un proyecto específico.
     * @param {string} projectId El ID del proyecto.
     * @returns {IToDoIssue[]} La lista de To-Do Issues del proyecto.
     */

    getToDoListForProject(projectId: string): IToDoIssue[] {
        console.log('ProjectsManager: getToDoListForProject llamado.', { projectId });
        const project = this.getProject(projectId)
        if (project) {
            return [...project.todoList]; 
        } else {
            return []
        }
    }


    /**
     * Calcula el costo total de todos los proyectos.
     * @returns {number} El costo total.
     */
    totalProjectsCost() {
        console.log('ProjectsManager: totalProjectsCost llamado.');
        const TotalBudget = this.list.reduce((acumulative, Project) => acumulative + Project.cost, 0)
        return TotalBudget
    }


        /**
     * Elimina un proyecto de la lista interna del manager.
     * Este método manipula la lista interna y actualiza localStorage.
     * @param {string} id El ID del proyecto a eliminar.
     */

    deleteProject(id: string): void {
        console.log('ProjectsManager: deleteProject llamado para eliminar de la lista local.', { id });
        const project = this.getProject(id)
        if (!project) { return }
        //project.ui.remove()

        //Remove the project from the local list
        this._projects = this._projects.filter(project => project.id !== id)
        this.updateLocalStorage(); // Actualizar localStorage
        if (this.onProjectDeleted) { this.onProjectDeleted(project.name); } // Notificar callback específico
        if (this.onProjectsListUpdated) { this.onProjectsListUpdated(); } // Notificar callback general
        // if (this.onProjectDeleted) {
        //     this.onProjectDeleted(project.name)
        // }

        //Clean the ID Project from the localStorage if there is project
        if (localStorage.getItem("selectedProjectId") === id) {
            localStorage.removeItem("selectedProjectId");
        }

    }

    /*
        deleteToDoIssue(projectId: string, todoId: string) {
            const project = this.getProject(projectId)
            if (!project) { return }
            const todoIssue = project.todoList.find((todo) => {
                return todo.id === todoId
            })
            if (!todoIssue) {
                console.error(`ToDoIssue with ID ${todoId} not found in project ${projectId}.`);
                return;
            }
            // Filter the todoList of the project to remove the todo
            project.todoList = project.todoList.filter((todo) => todo.id !== todoId);
    
            // Update the project in the main list
            const projectIndex = this.list.findIndex((p) => p.id === projectId);
            if (projectIndex !== -1) {
                this.list[projectIndex] = project; // Replace the old project with the updated one
            } else {
                console.error(`Project with ID ${projectId} not found in the main list.`);
                return;
            }
            this.onToDoIssueDeleted(todoIssue.id)
        }
        */

    /**
     * Exporta los proyectos seleccionados a un archivo JSON.
     * @param {string} [fileName="projects"] El nombre del archivo JSON.
     */
    exprtToJSON(fileName: string = "projects") {
        console.log("Inside exprtToJSON")
        const projects: IProject[] = this.list
        console.log("Projects:", projects)
        this.showExportJSONModal(projects, fileName)
        console.log("After showExportJSONModal")
    }

        /**
     * Importa proyectos desde un archivo JSON.
     * @returns {void}
     */
    imprtFromJSON() {
        // Create a file input element to allow the user to select a JSON file
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "application/json"
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            // Get the JSON data from the file 
            const json = reader.result
            if (!json) { return }
            const projects: IProject[] = JSON.parse(json as string)


            //Check that each project is assigned a unique ID.
            projects.forEach((project) => {
                if (!project.id) {
                    console.warn(`Project "${project.name}" is missing an ID. Generating a new one...`)
                    const messagePopUp = new MessagePopUp(
                        document.body,
                        "warning",
                        "ID missing",
                        `Project "${project.name}" is missing an ID. Generating a new one...`,
                        ["Got it"]
                    )

                    // Define ALL your button callbacks for the messagePopUp created
                    const buttonCallbacks = {
                        "Got it": () => {
                            console.log("Got it button clicked!");
                            messagePopUp.closeMessageModal();// ... logic for "Got it" button ...
                        },
                    }
                    project.id = uuidv4(); // Genera un nuevo ID si no existe
                }
            })

            // Fire the dialog where you select the projects you want to import
            this.showImportJSONModal(projects)

            /* // ESTE CODIGO HA SIDO TRANSLADADO A LA FUNCIÓN QUE MUESTRA EL LISTADO PARA SELECCIONAR
                        // for (const project of projects) {
                        //     try {
                        //         this.newProject(project)
                        //     } catch (error) {
                        //         console.log(error)
                        //     }
            */

        })

        input.addEventListener("change", () => {
            const filesList = input.files
            if (!filesList) { return }
            reader.readAsText(filesList[0])
        })
        input.click()
    }

    // Propiedades para gestionar listeners de eventos de botones en modales (lógica de UI)
    confirmBtnClickListener: EventListener | null = null
    cancelImportProjectBtnClickListener: EventListener | null = null
    cancelExportProjectBtnClickListener: EventListener | null = null


    /**
     * Helper para convertir un objeto Project a un objeto plano compatible con Firestore.
     * Maneja la conversión de objetos Date a Firestore Timestamps, especialmente para todoList.
     * @param {Project} project El objeto Project a convertir.
     * @returns {{ [key: string]: any }} El objeto plano para Firestore.
     */
    private serializeProjectForFirebase(project: Project) {
        console.log('ProjectsManager: serializeProjectForFirebase llamado.');
        const serializedProject = {
            ...project,
            // Convertir fechas a Timestamp
            finishDate: project.finishDate instanceof Date 
                ? Firestore.Timestamp.fromDate(project.finishDate)
                : project.finishDate,
            // createdAt: project.createdAt instanceof Date
            //     ? Firestore.Timestamp.fromDate(project.createdAt)
            //     : project.createdAt,
            // updatedAt: Firestore.Timestamp.fromDate(new Date()),
            // // Excluir todoList ya que se maneja como subcollección
            // todoList: undefined
            createdAt: project.createdAt instanceof Date ? Firestore.Timestamp.fromDate(project.createdAt) : project.createdAt,
            updatedAt: project.updatedAt instanceof Date ? Firestore.Timestamp.fromDate(project.updatedAt) : Firestore.Timestamp.fromDate(new Date()),
            // Asegurarse de que todoList también se serialice correctamente con Timestamps
            todoList: project.todoList.map(todo => ({
                ...todo,
                dueDate: todo.dueDate instanceof Date ? Timestamp.fromDate(todo.dueDate) : todo.dueDate,
                createdDate: todo.createdDate instanceof Date ? Timestamp.fromDate(todo.createdDate) : todo.createdDate,
            })),
        };
    
        // // Verificación adicional de datos
        // if (!serializedProject.createdAt) {
        //     serializedProject.createdAt = Firestore.Timestamp.fromDate(new Date());
        // }
    
        return serializedProject;
    }

    showImportJSONModal(projects: IProject[]) {
        // Create a modal dialog element
        const modalListOfProjectsJson = document.getElementById("modal-list-of-projects-json")
        if (modalListOfProjectsJson) {
            toggleModal("modal-list-of-projects-json")
        } else {
            throw new Error("Modal dialog element not found")

        }
        // Generate the list of projects
        const projectListJson = document.querySelector("#json-projects-list")
        if (projectListJson) {
            this.generateProjectList(projects, projectListJson)
        } else {
            throw new Error("Project list element not found")
        }

        // Change the Modal Title
        const title = document.querySelector("#modal-header-title h4")
        if (title) {
            title.textContent = "SELECT PROJECT/S TO IMPORT"
        } else {
            throw new Error("Title element not found")
        }

        // Button to select all the projects at once
        const selectAllBtn = document.querySelector("#selectAllBtn")
        if (selectAllBtn) {
            selectAllBtn.textContent = "Select all"
            selectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.selectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Select all button not found")
        }

        // Button to deselect all the projects at once
        const deselectAllBtn = document.querySelector("#deselectAllBtn")
        if (deselectAllBtn) {
            deselectAllBtn.textContent = "Deselect all"
            deselectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.deselectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Deselect all button not found")
        }

        //Prevent the use of the keydown Escape
        modalListOfProjectsJson.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                event.stopPropagation()
                event?.preventDefault()
            }
        })

        // Confirmation-Cancellation button for taking the selection
        const confirmBtn = document.querySelector("#confirm-json-list")
        if (!confirmBtn) {
            throw new Error("Confirm button not found")
        }

        const checkmarkSymbol = String.fromCharCode(0x2713)
        confirmBtn.textContent = checkmarkSymbol

        //Disable checkboxes for existing project
        projectListJson?.querySelectorAll("li > label > input[type='checkbox']").forEach(async (checkbox) => {
            const parentNode = checkbox.closest("li")
            if (parentNode) {
                const projectName: string | null = parentNode.textContent
                if (projectName) {
                    const existingProject = this.getProjectByName(projectName)
                    if (existingProject) {
                        (checkbox as HTMLInputElement).disabled = true;
                        // Add visual cues to the disabled checkbox
                        (parentNode as HTMLElement).classList.add("disabled-checkbox"); // Add a CSS class for styling
                        //Add question mark icon 
                        const questionMarkIcon = document.createElement("span");
                        questionMarkIcon.textContent = String.fromCharCode(0x003F);
                        questionMarkIcon.style.fontSize = "1.2rem";
                        questionMarkIcon.style.marginLeft = "5px";
                        parentNode.appendChild(questionMarkIcon);

                        //Create the MessagePopUp instance outside the eventlistener in order to pass the info to the instance
                        // const messagePopUp = new MessagePopUp(
                        //     document.body,
                        //     "info",
                        //     "A project with that name already exists and cannot be imported. Please delete the project with the same name before trying to import.",
                        // );
                        //Add the CSS class to the Got it button to apply the mask for animation
                        // const gotItBtn = this.ui.querySelector("#btn-popup")
                        // gotItBtn?.classList.add("message-popup-mask-over-btn")



                        // Add event listener to the question mark icon
                        questionMarkIcon.addEventListener("click", async () => {
                            const projectExistingID = existingProject.id
                            const messagePopUp = new MessagePopUp(
                                document.body,
                                "info",
                                "This Project already exists",
                                'The specified project name is already in use. To import this project and replace the existing data, select the button "Allow overwrite"',
                                ["Got it", "Allow overwrite"]
                            )

                            // Define ALL your button callbacks for the messagePopUp created
                            const buttonCallbacks = {
                                "Got it": () => {
                                    console.log("Got it button clicked!");
                                    messagePopUp.closeMessageModal();// ... logic for "Got it" button ...
                                },
                                "Allow overwrite": () => {
                                    console.log("Overwrite button clicked!");

                                    //The logic for enabling the checkbox of the project
                                    if (projectExistingID) {
                                        console.log(`the project ID is: ${projectExistingID}`);
                                        (checkbox as HTMLInputElement).disabled = false;
                                        (parentNode as HTMLElement).classList.remove("disabled-checkbox");
                                        // Add visual clues to the overwrite checkbox
                                        (parentNode as HTMLElement).classList.add("overwrite-checkbox");
                                    } else {
                                        console.log("Errror:Could not find the project ID.");

                                    }
                                    messagePopUp.closeMessageModal();
                                }

                            };

                            // *** Wait for the buttons to be rendered and event listeners attached ***
                            await messagePopUp.showNotificationMessage(buttonCallbacks,);
                        });

                        //change cursor to pointer on hover
                        questionMarkIcon.addEventListener("mouseover", () => {
                            questionMarkIcon.style.cursor = "pointer"
                        });
                        //Reset cursor on mouseout
                        questionMarkIcon.addEventListener("mouseout", () => {
                            questionMarkIcon.style.cursor = "default"
                        });
                    }
                }
            }
        })


        this.confirmBtnClickListener = async (e: Event) => {
            e.preventDefault()

            //Get the selected projects from the checkboxes
            const selectedProjects: IProject[] = []
            projectListJson?.querySelectorAll("li > label > input[type='checkbox']:checked").forEach((checkbox) => {
                const parentNode = checkbox.closest("li")
                if (parentNode) {
                    // Get the first child node, which should be the text node
                    // the fisrt child is de checkbox
                    // the second child is the proper name
                    // the third child is the question mark
                    const projectName = parentNode.childNodes[1].textContent?.trim()
                    const project = projects.find((project) => project.name === projectName)
                    if (project) {
                        selectedProjects.push(project)
                    } else {
                        console.log("Project not found:  " + projectName)
                    }
                } else {
                    console.log("Parent node not found for the checkbox")
                }
            })

            //Check whether any project is selecter before confirm
            //if none project is selected, close the modal the same way cancel button
            if (selectedProjects.length > 0) { 
                // const importToastId = toast.loading(`Importando ${selectedProjects.length} proyecto${selectedProjects.length > 1 ? 's' : ''}...`);
                console.log(selectedProjects);


                //Import the selected projects
                for (const project of selectedProjects) {
                    try {

                        // check if the project already exist locally before call to this.newProject
                        const existingProjectInList = this.list.find(p => p.name === project.name);
                        const wasOverwrite = !!existingProjectInList;

                        //// Update local state
                        //const newProjectResult = await this.newProject(project as Project); // Wait for the Promise
                        // Usar el método newProject existente que ya actualiza la lista local y localStorage
                        const newProjectResult = this.newProject(project as Project); 

                        
                        if (newProjectResult) { // Check if a project was created (not skipped)
                            // Sincronize with Firebase
                            console.log("Project imported successfully:", newProjectResult.name);

                            // Persist in Firebase the main document of the project
                            try {
                                if (wasOverwrite) {
                                    console.log(`Updating project "${newProjectResult.name}" (ID: ${newProjectResult.id}) in Firebase...`);

                                    // Serializar el proyecto antes de enviarlo a Firebase
                                    //const serializedProject = this.serializeProjectForFirebase(newProjectResult);
                                    const serializedProject = this.toFirestoreData(newProjectResult); // Usar toFirestoreData

                                    
                                    await updateDocument(newProjectResult.id!, serializedProject, { basePath: 'projects' });

                                    // toast.success(`Proyect "${newProjectResult.name}" updated  in Firebase.`, { id: `firebase-${newProjectResult.id}` });

                                    // If overwriting, delete the existing todoList in Firebase before adding the new one
                                    await deleteAllTodosInProject(newProjectResult.id!);


                                } else {
                                    console.log(`Adding new project "${newProjectResult.name}" (ID: ${newProjectResult.id}) to Firebase...`);

                                    // // Serializar el proyecto antes de enviarlo a Firebase
                                    // const serializedProject = this.serializeProjectForFirebase(newProjectResult);
                                    // Serializar el proyecto antes de enviarlo a Firebase (usar toFirestoreData)
                                    const serializedProject = this.toFirestoreData(newProjectResult); 
                                    // createDocument no necesita el ID como argumento separado si está en el objeto
                                    await createDocument('projects', serializedProject, newProjectResult.id);
                                    // toast.success(`Proyecto "${newProjectResult.name}" añadido a Firebase.`, { id: `firebase-${newProjectResult.id}` });
                                }

                                // Process ToDoList whether exists
                                if (newProjectResult.todoList && newProjectResult.todoList.length > 0) {
                                    console.log(`Firebase: Processing ${newProjectResult.todoList.length} todos for project ${newProjectResult.id}`);

                                    for (const todo of newProjectResult.todoList) {

                                        const todoPath = `projects/${newProjectResult.id}/todoList`;

                                        // Extraer tags y assignedUsers para guardarlos como subcolecciones
                                        const { tags, assignedUsers, ...todoDataForFirebase } = todo;
                                        const serializedTodo = {
                                            ...todoDataForFirebase,
                                            dueDate: todo.dueDate instanceof Date
                                                ? Firestore.Timestamp.fromDate(todo.dueDate)
                                                : todo.dueDate,
                                            createdDate: todo.createdDate instanceof Date
                                                ? Firestore.Timestamp.fromDate(todo.createdDate)
                                                : todo.createdDate
                                        };


                                        // Grant we have a ID from the ToDo (could come from JSON o generating now)
                                        if (!todoDataForFirebase.id) {
                                            console.warn('Todo missing ID, generating new one');
                                            todoDataForFirebase.id = uuidv4();
                                        }

                                        

                                        const todoDocRef = await createDocument(
                                            todoPath,
                                            serializedTodo,
                                            todoDataForFirebase.id // ID del ToDoIssue en Firebase

                                        )
                                        const todoIdFirebase = todoDocRef.id; // ID del ToDoIssue en Firebase

                                        // Process tags
                                        if (tags && tags.length > 0) {
                                            const tagsPath = `${todoPath}/${todoDataForFirebase.id}/tags`;
                                            console.log(`Firebase: Creating ${tags.length} tags at ${tagsPath}`);

                                            await Promise.all(tags.map(tag =>
                                                createDocument(
                                                    tagsPath,
                                                    {
                                                        title: tag.title,
                                                        createdAt: tag.createdAt instanceof Date
                                                            ? Firestore.Timestamp.fromDate(tag.createdAt)
                                                            : tag.createdAt
                                                    },
                                                    tag.id
                                                )
                                            ));
                                            console.log(`Firebase: Successfully created ${tags.length} tags`);
                                        }

                                        // Process assignedUsers
                                        if (assignedUsers && assignedUsers.length > 0) {
                                            const usersPath = `${todoPath}/${todoDataForFirebase.id}/assignedUsers`;
                                            console.log(`Firebase: Creating ${assignedUsers.length} users at ${usersPath}`);


                                            await Promise.all(assignedUsers.map(user =>
                                                createDocument(
                                                    usersPath,
                                                    {
                                                        name: user.name,
                                                        createdAt: user.createdAt instanceof Date
                                                            ? Firestore.Timestamp.fromDate(user.createdAt)
                                                            : user.createdAt
                                                    },
                                                    user.id
                                                )
                                            ));
                                        }
                                        console.log(`ToDoIssue "${todo.title}" (ID: ${todoIdFirebase}) and its subcollections imported to project ${newProjectResult.name}`);

                                    }

                                    // Toast solo cuando todo el proceso se completa
                                    toast.success(
                                        wasOverwrite 
                                            ? `Project "${newProjectResult.name}" updated with ${newProjectResult.todoList.length} todos`
                                            : `Project "${newProjectResult.name}" created with ${newProjectResult.todoList.length} todos`,
                                        { 
                                            id: `firebase-${newProjectResult.id}`,
                                            description: 'All todos, tags and assignments imported successfully',
                                            style: {
                                                zIndex: 2000,
                                                position: 'relative'
                                            }
                                        }
                                    );

                                } else {
                                
                                // return true; // Indicate that the project was imported successfully

                                // Toast para proyectos sin todos
                                    toast.success(
                                        wasOverwrite
                                            ? `Project "${newProjectResult.name}" updated with ${newProjectResult.todoList.length} todos`
                                            : `Project "${newProjectResult.name}" created with ${newProjectResult.todoList.length} todos`,
                                        {
                                            id: `firebase-${newProjectResult.id}`,
                                            description: 'All todos, tags and assignments imported successfully',
                                            style: {
                                                zIndex: 2000,
                                                position: 'relative'
                                            }
                                        }
                                    );
                                }

                            } catch (firebaseError) {
                                console.error(`Error saving project "${newProjectResult.name}" in Firebase:`, firebaseError);
                                toast.error(`Error saving project "${newProjectResult.name}" in Firebase:`, {
                                    id: `firebase-error-${newProjectResult.id}`,
                                    description: "Check console for details. Please, try again later.",
                                    style: {
                                        zIndex: 2000,
                                        position: 'relative'
                                    }
                                });
                            }

                        } else {
                            console.log("Project import skipped:", project.name);
                        }
                    } catch (error) {
                        console.error("Error importing project:", project.name, error);
                        toast.error(`Error importing project: "${project.name}" `, {
                            id: `import-process-error-${project.name || 'unknown'}`
                        });
                    
                    }
                }
                // toast.dismiss(importToastId);

            }
            closeModalProject("modal-list-of-projects-json", this)
            this.clearProjectCheckList("#json-projects-list")
            
        }

        const cancelImportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
        if (!cancelImportProjectBtn) {
            throw new Error("Cancel button not found")
        }

        const cancelSymbol = String.fromCharCode(0x274C)
        cancelImportProjectBtn.textContent = cancelSymbol
        this.cancelImportProjectBtnClickListener = (e: Event) => {
            e.preventDefault()
            closeModalProject("modal-list-of-projects-json", this)
            this.clearProjectCheckList("#json-project-list")
        }

        //Remove existing event listener
        confirmBtn.removeEventListener("click", this.confirmBtnClickListener);
        cancelImportProjectBtn?.removeEventListener("click", this.cancelImportProjectBtnClickListener);

        //Add new event listener
        confirmBtn.addEventListener("click", this.confirmBtnClickListener)
        cancelImportProjectBtn?.addEventListener("click", this.cancelImportProjectBtnClickListener)
    }


    showExportJSONModal(projects: IProject[], fileName: string) {

        // Show the modal dialog element
        const modalListOfProjectsJson = document.getElementById("modal-list-of-projects-json")
        if (modalListOfProjectsJson) {
            toggleModal("modal-list-of-projects-json")
            console.log("After show the modal")
        } else {
            throw new Error("Modal dialog element not found")
        }

        // Generate the list of projects
        const projectListJson = document.querySelector("#json-projects-list")
        this.generateProjectList(projects, projectListJson)
        console.log("After display the list of projects")
        // Change the Modal Title
        const title = document.querySelector("#modal-header-title h4")
        if (title) {
            title.textContent = "SELECT PROJECT/S TO EXPORT"
        } else {
            throw new Error("Title element not found")
        }
        console.log("cambio de titulo del modal");

        // Button to select all the projects at once
        const selectAllBtn = document.querySelector("#selectAllBtn")
        if (selectAllBtn) {
            selectAllBtn.textContent = "Select all"
            selectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.selectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Selected all button not found")
        }

        // Button to deselect all the projects at once
        const deselectAllBtn = document.querySelector("#deselectAllBtn")
        if (deselectAllBtn) {
            deselectAllBtn.textContent = "Deselect all"
            deselectAllBtn.addEventListener("click", (e) => {
                e.preventDefault()
                this.deselectAllCheckboxes(projectListJson)
            })
        } else {
            throw new Error("Deselected all button not found")
        }
        // Prevent the use of the keydown Escape
        modalListOfProjectsJson.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                event.stopPropagation()
                event?.preventDefault()
            }
        })
        // Confirmation-Cancellation button for taking the selection
        const confirmBtn = document.getElementById("confirm-json-list")
        if (!confirmBtn) {
            throw new Error("Confirm button not found")
        }

        const checkmarkSymbol = String.fromCharCode(0x2713)
        confirmBtn.textContent = checkmarkSymbol

        this.confirmBtnClickListener = (e: Event) => {
            e.preventDefault()

            // Get the selected projects from the checkboxes
            const selectedProjects: IProject[] = []
            projectListJson?.querySelectorAll("li > label > input[type='checkbox']:checked").forEach((checkbox) => {
                const parentNode = checkbox.closest("li")
                if (parentNode) {
                    const projectName = parentNode.textContent
                    const project = projects.find((project) => project.name === projectName)
                    if (project) {
                        selectedProjects.push(project)
                    } else {
                        console.log("Project not found: " + projectName)
                    }
                } else {
                    console.log("Parent node not found for the checkbox")
                }
            })

            // Check whether any project is selecter before confirm
            // if none project is selected, close the modal the same way cancel button                
            if (selectedProjects.length > 0) {

                // Export the selected projects

                // //function for the second argument of the STRINGIFY
                // function removeUIfromExport(key, value) {
                //     if (key === "ui") {
                //         return undefined
                //     }
                //     return value
                // }

                //const json = JSON.stringify(selectedProjects, removeUIfromExport, 2) //remove null from the second argument
                try {
                    // The 'ui' property is no longer part of Project instances, so the replacer function is not needed.
                    const json = JSON.stringify(selectedProjects, null, 2)
                    const blob = new Blob([json], { type: "application/json" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `${fileName}_${new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })}.json`
                    a.click()
                    URL.revokeObjectURL(url)  // Release the blob URL
                    toast.success("Exportación completada", {
                        description: `Se ${selectedProjects.length === 1 ? '1 Project has been exported' : selectedProjects.length + ' Projects have been exported'} to '${a.download}' successfully.`,
                    });

                } catch (error) {
                    console.error("Error exporting projects:", error)
                    let errorMessage = "An unexpected error occurred during the export.";
                    if (error instanceof Error) {
                        // You might want to log error.message to the console or a logging system,
                        // but for the user, it's better to provide a generic message.
                    }
                    toast.error("Export Error", {
                        description: `${errorMessage} Please try again later.`,
                    });
                } finally {
                    closeModalProject("modal-list-of-projects-json", this)
                    this.clearProjectCheckList("#json-projects-list")
                }
                
            } else {
                console.log("PM: showExportJSONModal - No projects selected. Closing modal.");                
                closeModalProject("modal-list-of-projects-json", this)
                this.clearProjectCheckList("#json-projects-list")
            }
            
        }

        const cancelExportProjectBtn: Element | null = document.getElementById("cancel-json-list-btn")
        if (!cancelExportProjectBtn) {
            throw new Error("Cancel button not found")
        }
        const cancelSymbol = String.fromCharCode(0x274C)
        cancelExportProjectBtn.textContent = cancelSymbol
        this.cancelExportProjectBtnClickListener = (e: Event) => {
            e.preventDefault()            
            closeModalProject("modal-list-of-projects-json", this)
            this.clearProjectCheckList("#json-projects-list")
        }
        // cancelExportProjectBtn.removeEventListener("click", cancelExportProjectBtnClickListener)

        //Remove existing event listeners
        confirmBtn.removeEventListener("click", this.confirmBtnClickListener)
        cancelExportProjectBtn?.removeEventListener("click", this.cancelExportProjectBtnClickListener)

        //Add new event listeners
        confirmBtn.addEventListener("click", this.confirmBtnClickListener)
        cancelExportProjectBtn?.addEventListener("click", this.cancelExportProjectBtnClickListener)
    }

    /**
     * Genera la lista de proyectos para mostrar en un modal (import/export).
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     * @param {IProject[]} projects La lista de proyectos a mostrar.
     * @param {Element | null} projectListJson El elemento DOM donde se renderizará la lista.
     */
    generateProjectList(projects: IProject[], projectListJson: Element | null) {
        // const projectListJson = document.querySelector("#json-projects-list")
        if (!projectListJson) {
            throw new Error("Project list element not found")
        }
        projectListJson.innerHTML = "" //This clear the list befor adding the projects
        console.log("Before display the list of projects")
        projects.forEach((project) => {
            const listItems = document.createElement("li")

            // Create the checkbox with a custom label and checkmark
            const checkboxLabel = document.createElement("label")
            checkboxLabel.classList.add("radio") //Added "radio" class for stiling
            // Append the checkbox label to the list item
            listItems.appendChild(checkboxLabel)

            const checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkboxLabel.appendChild(checkbox)

            const checkmark = document.createElement("span")
            checkmark.classList.add("checkmark")
            checkboxLabel.appendChild(checkmark)



            // const listItems = document.createElement("li")

            // const checkbox = document.createElement("input")
            // checkbox.type = "checkbox"
            // listItems.appendChild(checkbox)

            const projectNametext = document.createTextNode(project.name)
            listItems.appendChild(projectNametext)
            listItems.classList.add("checkbox-json")
            projectListJson?.appendChild(listItems)

        })
    }


    /**
     * Limpia la lista de checkboxes de proyectos en un modal.
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     */
    clearProjectCheckList(list: string) {
        const cleanCheckList = document.querySelector(list);
        if (cleanCheckList) {
            cleanCheckList.innerHTML = "";
        } else {
            console.log("Error: cleanCheckList is null")
        }
    }


    /**
     * Selecciona todos los checkboxes habilitados en una lista.
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     */
    selectAllCheckboxes(list: Element | null) {
        if (!list) {
            throw new Error("List element not found");
        }
        list.querySelectorAll("input[type='checkbox']:not(:disabled)").forEach((checkbox) => {
            (checkbox as HTMLInputElement).checked = true;
        });
    }


    /**
     * Deselecciona todos los checkboxes en una lista.
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     */
    deselectAllCheckboxes(list: Element | null) {
        if (!list) {
            throw new Error("List element not found");
        }
        list.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            (checkbox as HTMLInputElement).checked = false;
        });
    }

    /**
     * Obtiene los proyectos seleccionados de una lista de checkboxes.
     * NOTA: Este método contiene lógica de UI y DOM, idealmente debería estar fuera de esta clase.
     * @returns {IProject[]} La lista de proyectos seleccionados.
     */
    //Method for get all the selected projects in the export and import modals
    getSelectedProjects(projectListJson, projects): IProject[] {
        const selectedProjects: IProject[] = []
        projectListJson.querySelectorAll("li > label > input[type='checkbox']").forEach((checkbox) => {
            if ((checkbox as HTMLInputElement).checked) {
                // Add the project to the selectedProjects array
                const parentNode = checkbox.closest("li")
                if (!parentNode) {
                    console.error("Error: parentNode not found")
                    return
                }
                const projectName = parentNode.textContent?.trim()

                // Get the project object from the projects array using the project name
                const selectedProject = projects.find(project => project.name === projectName)

                if (selectedProject) {
                    selectedProjects.push(selectedProject)
                } else {
                    console.error(`Error: Project with name "${projectName}" not found in projects array.`)
                }
            }
        })
        return selectedProjects
    }


    /**
     * Inicializa el listener de Firestore para obtener la lista de proyectos.
     * Este método se llama en el constructor de la clase.
     */
    public init() {
        this.setupFirestoreListener();
    }


    /**
     * Limpia el listener de Firestore.
     * Debería llamarse cuando la instancia del manager ya no sea necesaria (ej. al desmontar la aplicación).
     */
        public cleanup() {
            console.log('ProjectsManager: Ejecutando cleanup.');
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
                console.log('ProjectsManager: Listener de Firestore desuscrito.');
            }
        }
}




