// src/react-components/NewUserModal.tsx (Conceptual)
import * as React from 'react';
import * as Router from 'react-router-dom';
import * as Firestore from 'firebase/firestore';
//import { db } from '../services/firebase'; // Asegúrate que db esté exportado desde firebase.ts
import { createDocument, updateDocument, deleteDocument } from '../services/firebase'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { MessagePopUp, MessagePopUpProps } from '../react-components';
import { IUser, IProjectAssignment,  UserStatusKey, UserRoleInAppKey ,IUserPermissions, IUserProjectRole } from '../types'; 
import { User } from '../classes/User'; 
import { ProjectsManager } from '../classes/ProjectsManager';
import { usePrepareUserForm } from '../hooks';
import { UsersManager } from '../classes/UsersManager';
//import { usePrepareUserForm } from '../hooks';


// Hook useUsersCache no existe en el contexto, lo comentamos por ahora.
// import { useUsersCache } from '../hooks';

interface NewUserFormProps {    
    onClose: () => void;
    usersManager: UsersManager;
    updateUser?: IUser | null; //El objeto User si se está editando (opcional).
    onAssignProjects: (user: User) => void; // Función para abrir el modal de asignación
    onCreateUser?: (createdUser: User) => void; // Callback opcional para manejar el usuario creado
    onUpdateUser?: (updatedUser: User) => void; // Callback opcional para manejar el usuario editado
}

interface Country {
    name: string;
    callingCode: string;
}



export function NewUserForm({
    onClose,
    usersManager,
    updateUser, // Si se pasa este prop, estamos en modo edición
    onAssignProjects,
    onCreateUser,
    onUpdateUser,
}: NewUserFormProps) {

    const navigateTo = Router.useNavigate()
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)

    const [formData, setFormData] = React.useState<Partial<IUser> | null>(null)
    const [password, setPassword] = React.useState(''); // Estado separado para la contraseña
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const isEditMode = !!updateUser;



    const [assignProjects, setAssignProjects] = React.useState<IProjectAssignment[]>([])


    const [newUsertName, setNewUserName] = React.useState<string | null>(null);
    const [userNameToConfirm, setUserNameToConfirm] = React.useState<string | null>(null);
    const [userDetailsToRename, setUserDetailsToRename] = React.useState<IUser | null>(null);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [currentUserName, setCurrentUserName] = React.useState('');

    // Add useUsersCache hook
    // For loading the Users from cache at the beggining as Projects
    //const { updateCache } = useUsersCache();
    


  // Estados para manejar los países y la selección
    const [countries, setCountries] = React.useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);
    const [showCountryList, setShowCountryList] = React.useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = React.useState('');



    usePrepareUserForm({ userToBeUpdated: updateUser, usersManager });
    

    const onCloseNewUserForm = () => {
        const userForm = document.getElementById("new-user-modal") as HTMLFormElement
        if (userForm) {
            userForm.reset()
        }
        onClose() // Close the form after the accept button is clicked
    }


    //CREO QUE NO SERÁ NECESARIO LA OPCIÓN DE RENOMBRAR PORQUE EL EMAIL ES ÚNICO Y NO SE PUEDE CAMBIAR Y VENDRÁ DESDE LA AUTENTIFICACIÓN Y SI UN USUARIO SE DA DE ALTA CON DOS CORREOS UNO PUEDE SER POR HABER ESTADO EN DIFERENTES EMPRESAS.






    async function handleUpdateDataUserInDB(userDetailsToUpdate: User, simplifiedChanges: Record<string, any>) {

        if (!userDetailsToUpdate.id) {
            throw new Error('Invalid user ID');
            return
        }
        try {
            const processedChanges = { ...simplifiedChanges };

            // Convert the date string to a Date object
            if (processedChanges.accountCreatedAt) {
                const parsedDate = parseDate(processedChanges.accountCreatedAt);
                console.log('Processing date:', {
                    original: processedChanges.accountCreatedAt,
                    parsed: parsedDate.toISOString()
                });
                processedChanges.accountCreatedAt = parsedDate;
            } else if (processedChanges.lastLoginAt) {
                const parsedDate = parseDate(processedChanges.lastLoginAt);
                console.log('Processing date:', {
                    original: processedChanges.lastLoginAt,
                    parsed: parsedDate.toISOString()
                });
                processedChanges.lastLoginAt = parsedDate;
            }


            //update in Firebase
            const updatedData = await updateDocument<Partial<User>>(
                userDetailsToUpdate.id,
                processedChanges
            )
            
            console.log("data transfered to DB")
            console.log("projectDetailsToUpdate.id", userDetailsToUpdate.id)
            console.log("projectDetailsToUpdate", userDetailsToUpdate)
            //console.log("Projects in manager:", projectsManager.list.map(p => p.id))
            

//SE DEBE CREAR LA ESTRUCTURA EN USERSMANAGER PARA QUE FUNCIONE

            //Update projectsManager and obtain the project
            const updateResult = usersManager.updateUser(
                userDetailsToUpdate.id,
                new User({ ...userDetailsToUpdate, ...processedChanges })
            );

            if (updateResult) {
            
                updateCache(usersManager.list); // Update localStorage cache
                onUpdatedUser && onUpdatedUser(updateResult!) //Prop_Notify parent component
                usersManager.onUserUpdated?.(userDetailsToUpdate.id);
            

                console.log('Project updated successfully:', {
                    id: userDetailsToUpdate.id,
                    changes: simplifiedChanges
                })

            } else {
                console.error("Project update failed in ProjectsManager")
                throw new Error('Failed to update project in ProjectManager');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            throw error
        }
    }
    



    async function handleCreateUserInDB(userDetails: IUser) {

        const newUser = new User(userDetails)
        console.log(newUser)
        try {

            const newUserDoc = await createDocument("/Users", newUser)
            newUser.id = newUserDoc.id
            console.log("data transfered to DB", newUser)

            usersManager.newUser(newUser, newUser.id)


            onCreatedUser && onCreatedUser({ ...newUser, id: newUserDoc.id })

            console.log("project added to the list", projectsManager.list)
        } catch (error) {
            console.error("Error creating project in DB:", error);

            setMessagePopUpContent({
                type: "error",
                title: "Error Creating User",
                message: "There was a problem saving the user. Please try again later.",
                actions: ["OK"],
                onActionClick: {
                    "OK": () => setShowMessagePopUp(false),
                },
                onClose: () => setShowMessagePopUp(false),
            });
            setShowMessagePopUp(true);
        }
    
    }
    








    async function handleNewProjectFormSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null);

        if (!isEditMode && password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        const userForm = document.getElementById("new-user-modal")

        if (!(userForm && userForm instanceof HTMLFormElement)) { return }

        const formDataUser = new FormData(userForm)
        //const checkProjectID = updateProject.id


        if (userForm.checkValidity()) {
            // Form is valid, proceed with data processing
            // *** Get the finishDate from the form data ***
            let finishProjectDate: Date | null = null // Allow null initially
            const finishProjectDateString = formDataUser.get("finishDate") as string

            // Try to create a Date object, handling potential errors
            if (finishProjectDateString) {
                finishProjectDate = new Date(finishProjectDateString)
                finishProjectDate.setHours(12, 0, 0, 0) // Set time to noon to avoid timezone issues
                // Check if the Date object is valid
                if (isNaN(finishProjectDate.getTime())) {
                    // Handle invalid date input (e.g., show an error message)
                    console.error("Invalid date input:", finishProjectDateString);
                    finishProjectDate = null; // Reset to null if invalid
                }
            }
            // Set to current date if no valid date was provided
            if (!finishProjectDate) {
                finishProjectDate = new Date("2026-12-31") // Create a new Date object for today
                finishProjectDate.setHours(12, 0, 0, 0) // Set time to noon to avoid timezone issues
            }

            const userDetails: IUser = {
                nickName: formDataUser.get("nickName") as string,
                firstName: formDataUser.get("firstName") as string,
                lastName: formDataUser.get("lastName") as string,
                email: formDataUser.get("email") as string,
                phoneNumber: formDataUser.get("phoneNumber") as string,
                phoneCountryNumber: formDataUser.get("countryCode") as string,
                organization: formDataUser.get("organization") as string,
                roleInApp: formDataUser.get("roleInApp") as UserRoleInAppKey,
                photoURL: "",
                address: formDataUser.get("address") as string,

                
                accountCreatedAt: new Date(),
                lastLoginAt: new Date(),
                status: formDataUser.get("status") as UserStatusKey
                //projectsAssigned: [],
                

            }
            if (updateUser === null) {
                //When the form is for a NEW PROJECT
                //createNewProject(projectDetails)
                const projectNames = projectsManager.list.map(project => project.name);
                const existingProject = projectNames.find(existingName => existingName.toLowerCase() === userDetails.name.toLowerCase())

                if (existingProject) {
                    console.log(`A project with the name [ ${projectDetails.name} ] already exists`)
                    console.log("Setting messagePopUpContent state...");    // Log before setting state
                    //Create a Confirmation Modal to prompt the user about the duplication and offer options
                    setMessagePopUpContent({
                        type: "warning",
                        title: `A project with the name "${projectDetails.name}" already exist`,
                        message: (
                            <React.Fragment>
                                <b>
                                    <u>Overwrite:</u>
                                </b>{" "}
                                Replace the existing project with the new data.
                                <br />
                                <b>
                                    <u>Skip:</u>
                                </b>{" "}
                                Do not create a new project.
                                <br />
                                <b>
                                    <u>Rename:</u>
                                </b>{" "}
                                Enter a new name for the new project.

                            </React.Fragment>),
                        actions: ["Overwrite", "Skip", "Rename"],
                        onActionClick: {
                            "Overwrite": async () => {
                                console.log("Overwrite button clicked!");

                                //Logic inside newProject already delete if is found a project with the same name
                                //so, we overwrite the project using create newProject
                                const originalDataProject = projectsManager.getProjectByName(projectDetails.name)
                                console.log("originalDataProject", originalDataProject);

                                if (!originalDataProject) return
                                const newProject = new Project({
                                    ...projectDetails,
                                    id: originalDataProject.id,
                                })
                                console.log(newProject);

                                await deleteDocument("/projects", originalDataProject.name)
                                await createDocument("/projects", newProject)


                                // await updateDocument<Project>("/projects", originalDataProject.id, newProject)
                                console.log("data transfered to DB created")

                                onUpdatedProject && onUpdatedProject(newProject)
                                //Because newProject manage the overwrite as well
                                projectsManager.newProject(newProject)

                                setShowMessagePopUp(false)
                                onCloseNewProjectForm()

                            },
                            "Skip": () => {
                                console.log("Skip button clicked!")
                                setShowMessagePopUp(false)
                            },
                            "Rename": () => {
                                console.log("Rename button clicked!");
                                setProjectDetailsToRename(projectDetails)

                                setCurrentProjectName(projectDetails.name);
                                setIsRenaming(true)


                                setShowMessagePopUp(false)


                            },

                        },
                        onClose: () => setShowMessagePopUp(false)
                    })
                    setShowMessagePopUp(true)
                    console.log("showMessagePopUp state:", showMessagePopUp);  // Log state *after* setting it.  Will still be false!
                    console.log("messagePopUpContent state:", messagePopUpContent); // Log content after setting it.
                    e.preventDefault()
                    return

                } else {
                    // No duplicate, create the project
                    try {
                        handleCreateProjectInDB(projectDetails)
                    } catch (error) {
                        console.error("Error creating project in DB:", error)
                        throw error
                    }

                    onCloseNewProjectForm(); // Close the form for new projects only after creation
                }


            } else {
                //When the form is for UPDATE AN EXISTING PROJECT

                //HAY QUE COMPROBAR SI LOS DATOS QUE SE CAPTAN DEL FORMULARIO HAY QUE COGER LOS DATOS QUE NO ESTAN EN IProyect.
                const projectDetailsToUpdate = new Project({
                    ...projectDetails,
                    id: updateProject.id,
                    progress: updateProject.progress,
                    // backgroundColorAcronym: Project.calculateBackgroundColorAcronym(updateProject.businessUnit),
                    todoList: updateProject.todoList,
                })


                const changesInProject = ProjectsManager.getChangedProjectDataForUpdate(updateProject, projectDetailsToUpdate)
                const simplifiedChanges: Record<string, any> = {}
                for (const key in changesInProject) {
                    if (changesInProject.hasOwnProperty(key)) { //Variant of the for...in loop that avoids iterating over inherited properties.
                        simplifiedChanges[key] = changesInProject[key][1]; // Onlytakes the second value
                    }
                }
                console.log("simplifiedChanges for DB", simplifiedChanges)

                if (Object.keys(simplifiedChanges).length > 0) {
                    const messageContent = <DiffContentProjectsMessage changes={changesInProject} />
                    // Calculate the number of rows in the messageContent table
                    const messageRowsCount = Object.keys(simplifiedChanges).length
                    // Calculate the desired message height
                    const messageHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`; // 3.5rem per row + 5rem for the title

                    setMessagePopUpContent({
                        type: "info",
                        title: "Confirm Project Update",
                        message: messageContent,
                        messageHeight: messageHeight,
                        actions: ["Confirm update", "Cancel update"],
                        onActionClick: {
                            "Confirm update": async () => {
                                try {
                                    await handleUpdateDataProjectInDB(projectDetailsToUpdate, simplifiedChanges)
                                    navigateTo("/")

                                    setShowMessagePopUp(false)

                                } catch (error) {
                                    console.error("Error updating project in callback throw App till index.ts", error)
                                    throw error
                                }
                            },
                            "Cancel update": () => {
                                console.log("User  cancelled the update.")
                                setShowMessagePopUp(false)
                            }
                        },
                        onClose: () => setShowMessagePopUp(false)
                    })
                    setShowMessagePopUp(true)
                    e.preventDefault()
                    return

                } else {
                    setMessagePopUpContent({
                        type: "info",
                        title: "No Changes Detected",
                        message: "No changes were detected in the project details.",
                        actions: ["Got it"],
                        onActionClick: {
                            "Got it": () => {
                                console.log("No changes to update in the project.");
                                setShowMessagePopUp(false)
                                }
                            },
                            onClose: () => setShowMessagePopUp(false)
                        })
                        setShowMessagePopUp(true)
                        e.preventDefault()
                        return
                    }
    
    
    
    
                    // try {
                    //     await handleUpdateDataProjectInDB(projectDetailsToUpdate, simplifiedChanges)
                    //     navigateTo("/")
    
    
                    // } catch (error) {
                    //     console.error("Error updating project in callback throw App till index.ts", error);
                    //     throw error
                    // }
                }
                onCloseNewProjectForm()
            } else {
                // Form is invalid, let the browser handle the error display
                projectForm.reportValidity();
            }
    }
    



    // React.useEffect(() => {
    //         if (projectDetailsToRename && projectNameToConfirm) {
    //             handleRenameConfirmation(projectNameToConfirm, projectDetailsToRename)
    //                 .then(() => {
    //                     setProjectDetailsToRename(null)
    //                     setProjectNameToConfirm(null) // Reset after use
    //                     onCloseNewProjectForm() // Close the form
    //                 });
    //         }
    //     }, [projectDetailsToRename, projectNameToConfirm, handleRenameConfirmation, onCloseNewProjectForm]);
    

    
    
      // Cargar los países al montar el componente
  React.useEffect(() => {
    const fetchCountries = async () => {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flags');
            const data = await response.json();
            
            const formattedCountries = data.map((country: any) => {
                // Algunos países tienen múltiples códigos, tomamos el primero
                const callingCode = country.idd.root + (country.idd.suffixes?.[0] || '');
                return {
                    name: country.name.common,
                    callingCode: callingCode.replace(/\s+/g, ''),
                    flag: country.flags.svg || country.flags.png
                };
            }).filter((country: Country) => country.callingCode);
            
            // Ordenar alfabéticamente
            formattedCountries.sort((a: Country, b: Country) => 
                a.name.localeCompare(b.name)  
            );
            
            setCountries(formattedCountries);
        } catch (error) {
            console.error('Error fetching countries:', error);
            // Manejar error apropiadamente
        }
    };

    fetchCountries();
  }, []);

  // Filtrar países basado en el término de búsqueda
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
    country.callingCode.includes(countrySearchTerm)
  );

  // Manejar selección de país
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryList(false);
    setCountrySearchTerm('');
  };
    

    return (
        <div className="dialog-container">
            <div className="custom-backdrop">        
                <dialog id="new-user-modal" style={{ overflow: "visible" }} open>
                    <form onSubmit={(e) => { handleNewProjectFormSubmit(e) }}
                        id="new-user-form"
                        action=""
                        name="new-user-form"
                        method="post"
                        className="user-form"
                        encType="multipart/form-data"
                    >
                        <h2
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div id="modal-user-title">User's Data</div>
                        </h2>

                        <div className="user-input-list">
                            <fieldset className="data-mandatory">
                                <legend>Please complete all required fields:</legend>
                                <div className="form-field-container">
                                    <label>
                                        <span className="material-icons-round">account_circle</span>Nick Name
                                    </label>
                                    <input
                                        data-form-value="nickName"
                                        name="nickName"
                                        type="text"
                                        size={30}
                                        placeholder="Please enter the name you want we use in the app."
                                        required={false}
                                        minLength={3}
                                        title="Please enter at least 3 characters"
                                        autoComplete="off"
                                    />
                                    <details>
                                        <summary>Tip</summary>
                                        <p>Use a short and characteristic name </p>
                                    </details>
                                </div>
                                <div className="form-field-container">
                                    <label>
                                        <span className="material-icons-round">badge</span>First Name
                                    </label>
                                    <input
                                        data-form-value="firstName"
                                        name='firstName'                                        
                                        type="text"
                                        size={20}
                                        placeholder="Your Identity. Because your name Matters."
                                        required={false}
                                        maxLength={20}
                                        title= "Please enter your real name"
                                        autoComplete=""
                                    />
                                </div>
                                <div className="form-field-container">
                                    <label>
                                        <span className="material-icons-round">badge</span>Last Name
                                    </label>
                                    <input
                                        data-form-value="lastName"
                                        name='lastName'
                                        type="text"
                                        size={30}
                                        placeholder="Finish your Identity with your last name."
                                        required={false}
                                        maxLength={30}
                                        title= "Please enter your real name"
                                        autoComplete=""
                                    />
                                </div>
                                <div className="form-field-container">
                                    <label>
                                        <span className="material-icons-round">alternate_email</span>Work Email
                                    </label>
                                    <input
                                        type="email"
                                        id='email'
                                        name='email'
                                        size={30}
                                        placeholder="Your Email is Your Key. Stay Connected."
                                        autoComplete="email"
                                        required={false}
                                    />
                                </div>
                                <div className="form-field-container">
                                    <label>
                                        <span className="material-icons-round">phone</span>Work Phone
                                    </label>
                                    <input
                                        type="tel"
                                        id='phoneNumber'
                                        name='phoneNumber'
                                        placeholder="123-456-7890"
                                        required={false}
                                        inputMode="numeric"
                                        pattern="[0-9]+"
                                    />
                                </div>
                                <div className="form-field-container">
                                    <label>
                                        <span className="material-icons-round">language</span>Country Phone Code
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={selectedCountry ? `${selectedCountry.name} (+${selectedCountry.callingCode})` : ''}
                                            onClick={() => setShowCountryList(true)}
                                            readOnly
                                            placeholder="Select country"
                                            required
                                            style={{ cursor: 'pointer' }}
                                        />
                                
                                        {showCountryList && (
                                            <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            maxHeight: '300px',
                                            overflowY: 'auto',
                                            backgroundColor: 'white',
                                            border: '1px solid #ccc',
                                            zIndex: 1000,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                            }}>
                                            {/* Campo de búsqueda */}
                                            <input
                                                type="text"
                                                placeholder="Search country..."
                                                value={countrySearchTerm}
                                                onChange={(e) => setCountrySearchTerm(e.target.value)}
                                                style={{
                                                width: '100%',
                                                padding: '8px',
                                                boxSizing: 'border-box',
                                                border: 'none',
                                                borderBottom: '1px solid #eee'
                                                }}
                                                autoFocus
                                            />
                                            
                                            {/* Lista de países */}
                                            {filteredCountries.map(country => (
                                                <div 
                                                key={country.name}
                                                onClick={() => handleCountrySelect(country)}
                                                style={{
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderBottom: '1px solid #eee',
                                                    '&:hover': {
                                                    backgroundColor: '#f0f0f0'
                                                    }
                                                }}
                                                >
                                                {/* <img 
                                                    src={country.flag} 
                                                    alt={`${country.name} flag`} 
                                                    style={{ 
                                                    width: '30px', 
                                                    height: '20px', 
                                                    marginRight: '10px',
                                                    objectFit: 'cover'
                                                    }} 
                                                /> */}
                                                <span style={{ flex: 1 }}>{country.name}</span>
                                                <span style={{ color: '#666' }}>+{country.callingCode}</span>
                                                </div>
                                            ))}
                                            </div>
                                        )}
                                    </div>
                                        
                                    {/* Campo oculto para almacenar el valor en el formulario */}
                                    <input 
                                        type="hidden" 
                                        name="countryCode" 
                                        value={selectedCountry ? selectedCountry.callingCode : ''} 
                                    />
                                </div>



                                <div className="form-field-container">
                                    <label>
                                        <span className="material-icons-round">business</span>Organization
                                    </label>
                                    <input
                                        type="email"
                                        size={30}
                                        placeholder="Your Email is Your Key. Saty Connected."
                                    />
                                </div>
                                <div className="form-field-user-container">
                                    <label>
                                        <span className="material-icons-round">engineering</span>Rol
                                    </label>
                                    <input type="text" list="rol" />
                                    <datalist id="rol">
                                        <option value="Architect">Architect</option>
                                        <option value="Engineer">Engineer</option>
                                        <option value="Developer">Developer</option>
                                        <option value="Information Manager">Information Manager</option>
                                        <option value="Document Controller">Document Controller</option>
                                        <option value="Site Manager">Site Manager</option>
                                        <option value="MEP Engineer">MEP Engineer</option>
                                        <option value="Structural Engineer">Structural Engineer</option>
                                    </datalist>
                                </div>
                                <div className="form-field-user-container">
                                    <label>
                                        <span className="material-icons-round">not_listed_location</span>
                                        Status
                                    </label>
                                    <select name="status" data-form-value="status" defaultValue="Pending">
                                        <option value="Pending">Pending</option>
                                        <option value="Active">Active</option>
                                        <option value="Disabled">Disabled</option>
                                    </select>
                                </div>
                            </fieldset>
                            <fieldset style={{ border: "none" }} className="data-optional">
                                <legend>Optional Data:</legend>
                                <div style={{ display: "flex", flexDirection: "column", rowGap: 20 }}>
                                    <div className="form-field-container">
                                        <label>
                                            <span className="material-icons-round">contact_mail</span>
                                            <address />
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            size={30}
                                            placeholder="Please provide your mailing/business address"
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            columnGap: 25
                                        }}
                                    >
                                        <div className="fake-upload-button">
                                            <label htmlFor="">Upload a user icon file</label>
                                            <input type="file" accept=".jpg, .png, .jpeg" />
                                        </div>
                                        <div className="users-photo" style={{ border: "none" }}>
                                            <img
                                            src="./assets/photo-users/Architect.jpg"
                                            alt="app photo user"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-field-container">
                                        <label>
                                            <span className="material-icons-round">diversity_3</span>Project
                                            Team
                                        </label>
                                        <div id="form-project-teams-included">
                                            <p>Reserved space for icons of Project Teams</p>
                                        </div>
                                        <select name="projectTeam" data-form-value="projectTeam" defaultValue="">
                                            <option value="" disabled hidden>
                                            Select a project
                                            </option>
                                            <option value="ProjectA">ProjectA</option>
                                            <option value="ProjectB">ProjectB</option>
                                            <option value="ProjectC">ProjectC</option>
                                            <option value="ProjectD">ProjectD</option>
                                            <option value="new">...Create a new project from here</option>
                                        </select>
                                    </div>
                                    <div className="form-field-container" style={{}}>
                                        <label>
                                            <span className="material-icons-round">article</span>Notes
                                        </label>
                                        <textarea
                                            style={{ marginBottom: 30 }}
                                            name=""
                                            id=""
                                            cols={45}
                                            rows={7}
                                            placeholder="Any "
                                            defaultValue={""}
                                        />
                                    </div>
                                </div>
                            </fieldset>
                            <div
                                        id="buttonEndRight"
                                        className="data-optional"
                                        style={{ alignSelf: "end", height: 'fit-content' }}
                                    >
                                        <button className="buttonC">Cancel</button>
                                        <button className="buttonB">Accept</button>
                                </div>
                            
                        </div>
                    </form>
                </dialog>
            </div>
            {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
        </div >
    )
};

NewUserForm.displayName = 'NewUserForm';
