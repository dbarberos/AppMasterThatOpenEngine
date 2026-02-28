// src/react-components/NewUserModal.tsx (Conceptual)
import * as React from 'react';

import * as Firestore from 'firebase/firestore';

import {  updateDocument } from '../services/Firebase'

import { IUser, IProjectAssignment, UserStatusKey, UserRoleInAppKey,UserStatusValue, UserRoleInProjectKey} from '../types'; 
import {  USER_ROLES_IN_PROJECT , USER_STATUS, USER_ROL_IN_APP   } from '../const'
import { User } from '../classes/User'; 
import { UsersManager } from '../classes/UsersManager'

//import { ProjectsManager } from '../classes/ProjectsManager';
//import { usePrepareUserForm } from '../hooks';
//import { UsersManager } from '../classes/UsersManager';
//import { usePrepareUserForm } from '../hooks';
import {parseDate} from '../utils/DateUtils'


// Hook useUsersCache no existe en el contexto, lo comentamos por ahora.
// import { useUsersCache } from '../hooks';

import { useAuth, UserProfile } from '../Auth/react-components/AuthContext' 
import { firestoreDB as db } from '../services/Firebase/index'; 
import { toast } from 'sonner'
import { ChangePasswordForm } from '../Auth/react-components/ChangePasswordForm';
import { DiffContentMessage, MessagePopUp, MessagePopUpProps } from '../react-components';
import { usePrepareUserForm, useUsersCache } from '../hooks';

interface NewUserFormProps { 
    currentUserData: UserProfile; // Datos del perfil del usuario actual
    usersManager: UsersManager; // Instancia de UsersManager
    authCurrentUserRole: UserRoleInAppKey | undefined; // Rol del usuario autenticado
    onClose: () => void;
    onProfileUpdate: (updatedData: Partial<UserProfile>) => void; // Callback tras actualización exitosa
    onTriggerChangePassword: () => void;
    
    //projectsManager: ProjectsManager;   // No necesario para "Mi Perfil"    
    //onAssignProjects: (user: User) => void;  // Esto iría en otra sección, no en "Mi Perfil" básico
}

interface Country {
    name: string;
    callingCode: string;
}

export function NewUserForm({
    currentUserData,
    usersManager,
    authCurrentUserRole,
    onClose,
    onProfileUpdate, //Siempre se abre en modo edición. Se crea con el Auth.
    onTriggerChangePassword
}: NewUserFormProps) {

    console.log('--- DEBUG NewUserForm ---');
    console.log('Rol recibido (authCurrentUserRole):', authCurrentUserRole);
    console.log('¿Es superadmin?:', authCurrentUserRole === 'superadmin');
    console.log('-------------------------');

        
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)

    const { currentUser, loading: authLoading, userProfile } = useAuth(); // userProfile vendrá de currentUserData

    // Estados para los campos del formulario editables por el usuario
    const [nickName, setNickName] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [descriptionUser, setDescriptionUser] = React.useState('');
    const [organization, setOrganization] = React.useState('');
    const [phoneCountryNumber, setPhoneCountryNumber] = React.useState('');
    const [roleInApp, setRoleInApp] = React.useState<UserRoleInAppKey | ''>('');
    const [status, setStatus] = React.useState<UserStatusKey | ''>('pending'); // Por defecto 'pending' para nuevos usuarios
        
    // photoURL se manejaría con un input type="file" y lógica de subida a Firebase Storage (más complejo)
    


    // const [formData, setFormData] = React.useState<Partial<IUser> | null>(null)
    // const [password, setPassword] = React.useState(''); // Estado separado para la contraseña
    // const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);


    //const [assignProjects, setAssignProjects] = React.useState<IProjectAssignment[]>([])


    // Add useUsersCache hook
    // For loading the Users from cache at the beggining as Projects
    //const { updateCache } = useUsersCache();
    


    // Estados para manejar los países y la selección
    const [countries, setCountries] = React.useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);
    const [showCountryList, setShowCountryList] = React.useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = React.useState('');

    // // Estados para la asignación de proyectos NO SE ASIGNAN DIRECTAMENTE AQUÍ SE HACE EN OTRA PARTE DE LA APP
    // const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
    // const [selectedProjectRole, setSelectedProjectRole] = React.useState<UserRoleInAppKey | ''>('');

    // Estado para mostrar las asignaciones de proyectos existentes
    const [projectAssignments, setProjectAssignments] = React.useState<IProjectAssignment[]>([]);

    //Para cambiar el password
    // Eliminado porque es mejor que lo muestre el componente padre se pasa por porp la order de mostrar el formulario de cambio de contraseña
    //const [showChangePasswordForm, setShowChangePasswordForm] = React.useState(false);

    usePrepareUserForm({ userToBeUpdated: currentUser, usersManager })



    // Inicializar el formulario con los datos del currentUserData
    React.useEffect(() => {
        if (currentUserData) {
            setNickName(currentUserData.nickName || '');
            setFirstName(currentUserData.firstName || '');
            setLastName(currentUserData.lastName || '');
            setPhoneNumber(currentUserData.phoneNumber || '');
            setSelectedCountry(countries.find(c => c.callingCode === currentUserData.phoneCountryNumber) || null);
            setAddress(currentUserData.address || '');
            setDescriptionUser(currentUserData.descriptionUser || '');
            setProjectAssignments(currentUserData.projectsAssigned || []);
            setRoleInApp(currentUserData.roleInApp || '');
            setOrganization(currentUserData.organization || '');
            setPhoneCountryNumber(currentUserData.phoneCountryNumber || '');
            setStatus(currentUserData.status); // Por defecto 'pending' si no se especifica
            ;

        }
    }, [currentUserData, countries, authCurrentUserRole]);





    const onCloseNewUserForm = () => {
        const userForm = document.getElementById("new-user-form") as HTMLFormElement
        if (userForm) {
            userForm.reset()
        }
        onClose() // Close the form after the accept button is clicked
    }


    //CREO QUE NO SERÁ NECESARIO LA OPCIÓN DE RENOMBRAR PORQUE EL EMAIL ES ÚNICO Y NO SE PUEDE CAMBIAR Y VENDRÁ DESDE LA AUTENTIFICACIÓN Y SI UN USUARIO SE DA DE ALTA CON DOS CORREOS UNO PUEDE SER POR HABER ESTADO EN DIFERENTES EMPRESAS.


    /**
     * Maneja la actualización del perfil de usuario en Firebase a través de UsersManager.
     * @param {string} userId El ID del usuario a actualizar.
     * @param {Partial<UserProfile>} newUpdatedProfileData Los datos parciales del perfil a actualizar.
     * @returns {Promise<UserProfile>} El perfil de usuario actualizado.
     * @throws {Error} Si el UsersManager no está listo o si falla la actualización.
     */
    async function handleUpdateProfileUserInDB(userId, newUpdatedProfileData: Partial<UserProfile>) {

        console.log("NewUserForm: handleUpdateProfileUserInDB called", { userId, newUpdatedProfileData });
        
        // 1. Verificar si UsersManager está listo
        if (!usersManager.isReady) {
            const errorMessage = "UsersManager no está listo. Los datos iniciales no se han cargado todavía.";
            console.error(`NewUserForm: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        if (!userId) {
            throw new Error('Invalid user ID');            
        }
        try {
            const processedChanges = { ...newUpdatedProfileData };

            // // Convert the date string to a Date object
            // if (processedChanges.accountCreatedAt) {
            //     const parsedDate = parseDate(processedChanges.accountCreatedAt);
            //     console.log('Processing date:', {
            //         original: processedChanges.accountCreatedAt,
            //         parsed: parsedDate.toISOString()
            //     });
            //     processedChanges.accountCreatedAt = parsedDate;

            // } else if (processedChanges.lastLoginAt) {
            //     const parsedDate = parseDate(processedChanges.lastLoginAt);
            //     console.log('Processing date:', {
            //         original: processedChanges.lastLoginAt,
            //         parsed: parsedDate.toISOString()
            //     });
            //     processedChanges.lastLoginAt = parsedDate;

            // }


            //update in Firebase
            const updatedData = await updateDocument<Partial<User>>(
                userId,
                processedChanges,
                { basePath: 'users' }
            )
            
            console.log("data transfered to DB")
            console.log("userId", userId)
            console.log("newProfileData", processedChanges)
            //console.log("Projects in manager:", projectsManager.list.map(p => p.id))
            

            //SE DEBE CREAR LA ESTRUCTURA EN USERSMANAGER PARA QUE FUNCIONE



            

            //Update usersManager and obtain the user
            const updateResult = usersManager.updateUser(
                userId,
                new User({
                    ...currentUserData,
                    ...processedChanges,
                    // El constructor de User espera `email: string | undefined`, pero currentUserData.email es `string | null`.
                    // El operador `??` convierte `null` a `undefined`, resolviendo el conflicto de tipos.
                    email: currentUserData.email ?? undefined,
                    // Lo mismo ocurre con photoURL, que puede ser `null` desde Firebase.
                    photoURL: currentUserData.photoURL ?? undefined,


                })
            );

            if (updateResult) {            

                console.log('Project updated successfully:', {
                    id: userId,
                    changes: processedChanges 
                })

                // Notificar al componente padre con el perfil actualizado
                //onProfileUpdate && onProfileUpdate({ ...currentUserData, ...newUpdatedProfileData } as UserProfile);

                return { ...currentUserData, ...processedChanges } as UserProfile

            } else {
                console.error("User update failed in UsersManager")
                throw new Error('Failed to update user in UsersManager');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            setMessagePopUpContent({
                type: "error",
                title: "Error Updating User",
                message: "There was a problem updating the user. Please try again later.",
                actions: ["OK"],
                onActionClick: {
                    "OK": () => setShowMessagePopUp(false),
                },
                onClose: () => setShowMessagePopUp(false),
            });
            setShowMessagePopUp(true);
            throw error
        } finally {
            setIsLoading(false);
        }
    }
    

    async function handleProfileUpdateSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if (!currentUser || !currentUserData) {
            setError("Debes estar autenticado para actualizar tu perfil.");
            toast.error("Debes estar autenticado para actualizar tu perfil.");
            setIsLoading(false);
            return;
        }

        if (!firstName || !lastName || !nickName) {
            setError("Nombre, apellidos y nickname son requeridos.");
            toast.error("Nombre, apellidos y nickname son requeridos.");
            setIsLoading(false);
            return;
        }

        const currentProfileForDiff: Partial<UserProfile> = {
            nickName: currentUserData.nickName,
            firstName: currentUserData.firstName,
            lastName: currentUserData.lastName,
            phoneNumber: currentUserData.phoneNumber,
            phoneCountryNumber: currentUserData.phoneCountryNumber,
            address: currentUserData.address,
            descriptionUser: currentUserData.descriptionUser,
            organization: currentUserData.organization,
            roleInApp: currentUserData.roleInApp,
            status: currentUserData.status,

        };
        console.log('[NewUserForm] currentProfileForDiff (original data):', currentProfileForDiff);
        
        // Solo los admins pueden cambiar estos campos, así que los incluimos en el diff si el rol es admin
        //if (authCurrentUserRole === 'admin') {
        // Aquí deberías obtener los valores de los campos de rol y status del formulario si son editables por el admin
        // Por ahora, asumimos que no se cambian en este flujo simplificado o que se manejan de otra forma.
        // currentProfileForDiff.roleInApp = currentUserData.roleInApp;
        // currentProfileForDiff.status = currentUserData.status;
        //}
        

        // PROCESO: Usar el spread operator para fusionar.
        // 1. Copiamos todos los datos originales del usuario. Y así podemos emprear el mismo componente en diferentes contextos para editar distintos campos.
        // 2. Sobrescribimos solo los campos que vienen del estado del formulario.
        // Propiedades como 'projectsAssigned', 'id', 'uid', etc., se mantendrán intactas. Ya que el usuer puede tener mas información que la que puede modificarse en este formulario.
        const mergedProfileData = { ...currentUserData };



        const newProfileData: Partial<UserProfile> = {
            nickName,
            firstName,
            lastName,
            phoneNumber,
            phoneCountryNumber: selectedCountry?.callingCode || currentUserData.phoneCountryNumber,            
            address,
            descriptionUser,
            organization,
            roleInApp: authCurrentUserRole === 'superadmin' ? roleInApp : (currentUserData.roleInApp || 'viewer'),
            status: authCurrentUserRole === 'superadmin' ? status : (currentUserData.status || 'pending'),
            photoURL: currentUserData.photoURL !== undefined ? currentUserData.photoURL : null,

            // Campos que solo un admin podría cambiar (si se implementa su edición en el form)
            // roleInApp: (authCurrentUserRole === 'admin' ? formData.get("roleInApp") : currentUserData.roleInApp) as UserRoleInAppKey,
            // status: (authCurrentUserRole === 'admin' ? formData.get("status") : currentUserData.status) as UserStatusKey,
        };
        console.log('[NewUserForm] newProfileData (datos del formulario):', newProfileData);

        // Calcular diferencias para la confirmación
        const changes: Record<string, [any, any]> = {};
        for (const key in newProfileData) {
            // if (newProfileData.hasOwnProperty(key) && currentProfileForDiff.hasOwnProperty(key)) {
                // if (newProfileData[key] !== currentProfileForDiff[key]) {
                //     changes[key] = [currentProfileForDiff[key] || "N/A", newProfileData[key] || "N/A"];
            if (newProfileData.hasOwnProperty(key) && mergedProfileData.hasOwnProperty(key)) {
                if (newProfileData[key] !== mergedProfileData[key]) {
                    changes[key] = [mergedProfileData[key] || "N/A", newProfileData[key] || "N/A"];
                }
            }
        }
        console.log('[NewUserForm] Objeto de cambios calculado:', changes);

        if (Object.keys(changes).length === 0) {
            toast.info("No se detectaron cambios en el perfil.");
            setIsLoading(false);
            onClose(); // Opcional: cerrar si no hay cambios
            return;
        }

        // Mostrar MessagePopUp para confirmación
        const messageContent = <DiffContentMessage changes={changes} entityType='user' />
        console.log('[NewUserForm] Props para DiffContentMessage:', { changes, entityType: 'user' })

        const messageRowsCount = Object.keys(changes).length;
        const messageHeight = `calc(${messageRowsCount} * 3.5rem + 5rem)`;

        setMessagePopUpContent({
            type: "info",
            title: "Confirmar Actualización de Perfil",
            message: messageContent,
            messageHeight: messageHeight,
            actions: ["Confirm", "Cancel"],
            onActionClick: {
                "Confirm": async () => {
                    setShowMessagePopUp(false);
                    setIsLoading(true); // Re-establecer isLoading
                    try {
                        // FIX: Get the user ID from either 'uid' (from Auth context) or 'id' (from User class)
                        const userIdToUpdate = currentUserData.uid || currentUserData.id;
                        if (!userIdToUpdate) {
                            throw new Error("User ID is missing, cannot update profile.");
                        }

                        if (newProfileData.photoURL === undefined) {
                            newProfileData.photoURL = null;
                        }

                        // Usamos el objeto fusionado para la actualización
                        const finalDataToUpdate = { ...currentUserData, ...newProfileData };
                        const updatedUser = await handleUpdateProfileUserInDB(userIdToUpdate, finalDataToUpdate);

                        // const updatedUser = await handleUpdateProfileUserInDB(userIdToUpdate, newProfileData);
                        //const updatedUser = await handleUpdateProfileUserInDB(currentUserData.uid, newProfileData);
                        
                        toast.success("Profile Updated correctly.");
                        //onSuccess(updatedUser); // Llama al callback con el usuario actualizado

                        if (onProfileUpdate) {
                            onProfileUpdate(updatedUser);
                        }
                        // Cerrar el modal después de guardar exitosamente
                        onClose()


                    } catch (err) {
                        console.error("Error updating profile:", err);
                        const errorMessage = (err instanceof Error) ? err.message : "No se pudo actualizar el perfil.";
                        setError(errorMessage);
                        toast.error(errorMessage);
                    } finally {
                        setIsLoading(false);
                    }
                },
                "Cancel": () => {
                    setShowMessagePopUp(false);
                    setIsLoading(false);
                }
            },
            onClose: () => {
                setShowMessagePopUp(false);
                setIsLoading(false);
            }
        });
        setShowMessagePopUp(true);
        // No establecer setIsLoading(false) aquí, se maneja en el MessagePopUp
    }




    ///ELIMINAR HE CAMBIADO LA LÓGICA
    async function handleNewUserFormSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if (!currentUser || !currentUserData) {
            setError("Debes estar autenticado para actualizar tu perfil.");
            setIsLoading(false);
            return;
        }

        if (!firstName || !lastName || !nickName) {
            setError("Nombre, apellidos y nickname son requeridos.");
            setIsLoading(false);
            return;
        }

        // if (!isEditMode && password !== confirmPassword) {
        //     setError("Passwords do not match.");
        //     setIsLoading(false);
        //     return;
        // }


        const userForm = document.getElementById("new-user-form")

        if (!(userForm && userForm instanceof HTMLFormElement)) { return }

        const formDataUser = new FormData(userForm)
        //const checkProjectID = updateProject.id


        // Determine the status based on user role and form state
        let userStatus: UserStatusKey;
        if (authCurrentUserRole === 'superadmin') {
            // Admin user, get status from the form select
            const statusFromForm = formDataUser.get("status") as UserStatusKey | null;
            if (!statusFromForm) {
                // This case should ideally not happen if the select is required and valid
                console.warn("Admin user submitted form without selecting a status. Defaulting to 'pending'.");
                userStatus = 'pending'; // Fallback
            } else {
                userStatus = statusFromForm;
            }
        } else {
            // Non-admin user, status is not editable via the form
            userStatus = currentUserData?.status
                ? currentUserData.status as UserStatusKey // Keep the existing status for updates
                : 'pending'; // For new users (non-admin), default to 'pending'
        }



    }


    
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
    


        const handleFakeUploadClick = () => {
            setMessagePopUpContent({
                type: "info",
                title: "Image Upload Feature",
                message: (
                    <>
                        <p>This feature to upload user profile images is currently disabled.</p>
                        <p>
                            Firebase Storage, which is used for hosting images, requires a paid subscription
                            for servers located in Europe. As this application is primarily for
                            experimentation and development of coding skills, this functionality
                            will be enabled in a more advanced version. Sorry and Thanks
                        </p>
                    </>
                ),
                actions: ["Got it"],
                onActionClick: { "Got it": () => setShowMessagePopUp(false) },
                onClose: () => setShowMessagePopUp(false),
            });
            setShowMessagePopUp(true);
        };



        if (authLoading) {
            return <p>Cargando perfil...</p>; // O un spinner
        } // currentUserData ya se verifica arriba en el submit, aquí es para el render inicial
        if (!currentUser || !currentUserData) {
            return <p>No se pudo cargar la información del perfil. Por favor, inicia sesión de nuevo.</p>;
        } // Si currentUserData no está listo, el useEffect lo llenará.




        return (
            <div className="dialog-container">
                <div className="custom-backdrop">
                    <dialog
                        id="new-user-modal"
                        style={{
                            overflow: "visible",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }} open>
                        <form onSubmit={handleProfileUpdateSubmit}
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
                                    alignItems: "center",
                                    padding : "0 20px",
                                }}
                            >
                                <div id="modal-user-title">User's Data</div>


                                <div
                                    id="buttonEndRight"
                                    className="data-optional"
                                    style={{ alignSelf: "end", height: 'fit-content' }}
                                >
                                    <button
                                        id="cancel-user-btn" type="button" className="buttonC" onClick={onCloseNewUserForm}
                                    >
                                        Cancel
                                    </button>
                                    <button id="accept-profile-changes-btn" type="submit" className="buttonB" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : 'Save changes'}
                                    </button>
                                </div>


                            </h2>

                            <div className="user-input-list">                                
                                <fieldset className="data-mandatory">
                                    <legend>Update the user here. Click save when you´re done. </legend>
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
                                            required
                                            minLength={3}
                                            title="Please enter at least 3 characters"
                                            autoComplete="off"
                                            value={nickName}
                                            onChange={(e) => setNickName(e.target.value)}
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
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            type="text"
                                            size={20}
                                            placeholder="Your Identity. Because your name Matters."
                                            required
                                            maxLength={20}
                                            title="Please enter your real name"
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
                                            value={lastName}
                                            type="text"
                                            size={30}
                                            placeholder="Finish your Identity with your last name."
                                            required
                                            maxLength={30}
                                            title="Please enter your real name"
                                            autoComplete=""
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="form-field-container">
                                        <label>
                                            <span className="material-icons-round">phone</span>Work Phone
                                        </label>
                                        <input
                                            data-form-value="phoneNumber"
                                            type="tel"
                                            id='phoneNumber'
                                            name='phoneNumber' // Editable
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="123-456-7890"
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
                                                data-form-value="phoneCountryNumberlastName"
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
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Escape') {
                                                                setShowCountryList(false);
                                                                setCountrySearchTerm('');
                                                            }
                                                        }}

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
                                            data-form-value="organization"
                                            placeholder="Your Organization (Optional"
                                            type="text"
                                            size={30}
                                            value={organization} 
                                            onChange={(e) => setOrganization(e.target.value)}
                                        />
                                    </div>


                                    <div className="form-field-container">
                                        <label>
                                            <span className="material-icons-round">alternate_email</span>Work Email
                                        </label>
                                        <p
                                            data-form-value="email"
                                            //type="email"
                                            id='email'
                                           // name='email' // El email no se edita aquí, se muestra
                                           // value={currentUserData.email || ''}
                                            //readOnly
                                            //size={30}
                                            //placeholder="Your Email is Your Key. Stay Connected."
                                            // autoComplete="email"
                                            aria-label="Email"
                                        >
                                            {currentUserData.email || 'N/A'}
                                        </p>
                                    </div>


                                    {/* El botón ahora llama a la prop del padre */}
                                    <button
                                        type="button" // Importante para que no envíe el formulario
                                        onClick={onTriggerChangePassword}
                                        style={{
                                            marginTop: '1rem',
                                            width: 'fit-content',
                                        }}
                                        className="buttonA"
                                    >
                                        Change password
                                    </button>




                                </fieldset>
                                <fieldset style={{ border: "none" }} className="data-optional">
                                    <legend></legend>
                                    <div style={{ display: "flex", flexDirection: "column", rowGap: 20 }}>
                                        <div className="form-field-container">
                                            <label>
                                                <span className="material-icons-round">contact_mail</span>
                                                <address />
                                                Address
                                            </label>
                                            <input
                                                data-form-value="address"
                                                type="text"
                                                size={30}
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
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
                                            {/* Add onClick handler to the fake upload button container */}

                                            <div className="fake-upload-button" onClick={handleFakeUploadClick} style={{ cursor: 'pointer' }}>
                                                <label htmlFor="profilePhotoUpload">Upload a user icon file</label>
                                                <input
                                                    type="file"
                                                    accept=".jpg, .png, .jpeg" />
                                            </div>
                                            <div className="users-photo" style={{ border: "none" }}>
                                                <img
                                                    src={currentUserData.photoURL || "/assets/photo-users/default-avatar.jpg"}
                                                    alt="User profile"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = "/assets/photo-users/default-avatar.jpg";
                                                    }}
                                                />
                                                {/* TODO: Implementar subida de imagen y actualización de photoURL */}
                                            </div>
                                        </div>
                                        <div className="form-field-container">
                                            <label>
                                                <span className="material-icons-round">diversity_3</span>Projects
                                                Team
                                            </label>
                                            {currentUserData.projectsAssigned && currentUserData.projectsAssigned.length > 0 ? (
                                                <div id="form-project-teams-included" style={{ marginTop: "10px" }}>
                                                    <ul style={{
                                                        listStyleType: 'none', paddingLeft: 0, maxHeight: '250px', overflowY: 'auto',
                                                        fontSize: 'var(--font-base)'
                                                    }}>
                                                        {projectAssignments.map((assignment, index) => (
                                                            <li key={index} style={{ marginBottom: '5px', padding: '8px', border: '1px solid var(--color-fontbase-light)', borderRadius: '4px', backgroundColor: 'var(--color-background-light)' }}>
                                                                <span>
                                                                    <strong>{assignment.projectName}</strong> - {USER_ROLES_IN_PROJECT[assignment.roleInProject as UserRoleInProjectKey] || 'Rol not defined'}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: 'var(--font-base', color: 'var(--color-fontbase-dark)' }}>
                                                    No projects assigned. Manage assignments inside 'Project Teams' section.
                                                </p>
                                            )}
                                        </div>
                                        <div className="form-field-container" style={{}}>
                                            <label>
                                                <span className="material-icons-round">article</span>Notes
                                            </label>
                                            <textarea
                                                name="descriptionUser"
                                                data-form-value="descriptionUser"
                                                value={descriptionUser}
                                                onChange={(e) => setDescriptionUser(e.target.value)}
                                                style={{ marginBottom: 30 }}
                                                id="descriptionUser"
                                                cols={45}
                                                rows={7}
                                                placeholder="Any"
                                            />
                                        </div>

                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",     // Dos columnas iguales
                                            rowGap: "10px",                     // Espacio entre filas
                                            justifyContent: "space-between",    // Opcional, dependiendo de lo que necesites
                                            alignItems: "center"
                                        }}>
                                            <div className="form-field-user-container">
                                                <label>
                                                    <span className="material-icons-round">engineering</span>Rol
                                                </label>
                                                {authCurrentUserRole === 'superadmin' ? (
                                                    <select
                                                        name="roleInApp"
                                                        data-form-value="roleInApp"
                                                        required
                                                        value={roleInApp || ''}
                                                        onChange={(e) => setRoleInApp(e.target.value as UserRoleInAppKey)}
                                                        disabled={isLoading}
                                                    // El valor por defecto será establecido por usePrepareUserForm
                                                    // o puedes establecerlo aquí si no es modo edición:
                                                    // defaultValue={isEditMode ? updateUser?.roleInApp : ""}
                                                    >
                                                        <option value="" disabled>Select a role</option>
                                                        {Object.entries(USER_ROL_IN_APP   ).map(([key, label]) => (
                                                            <option key={key} value={key}>{label}</option>
                                                        ))}
                                                    </select>
                                                ) : (

                                                    <p className="form-field-static-value" aria-label="Rol en la aplicación">
                                                        {USER_ROLES_IN_PROJECT[currentUserData.roleInApp as UserRoleInAppKey] || currentUserData.roleInApp || 'N/A'}
                                                    </p>
                                                )}
                                            </div>
                                            

                                            <div className="form-field-user-container">
                                                <label>
                                                    <span className="material-icons-round">not_listed_location</span>
                                                    Status
                                                </label>
                                                {authCurrentUserRole === 'superadmin' ? (
                                                    // Admin can edit status
                                                    <select
                                                        name="status" // Name for FormData
                                                        value={status || ''}
                                                        data-form-value="status" // For usePrepareUserForm
                                                        required // Status is likely required
                                                        onChange={(e) => setStatus(e.target.value as UserStatusKey)}
                                                        disabled={isLoading}
                                                    >
                                                        <option value="" disabled style={{ color: 'var(--color-fontbase-dark)' }}>
                                                            Select status
                                                        </option>
                                                        {Object.entries(USER_STATUS).map(([key, value]) => (
                                                            <option key={key} value={key as UserStatusKey}>
                                                                {value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    // Non-admin user, just display status
                                                    <span className={`user-status-badge status-${currentUserData?.status ? currentUserData.status.toLowerCase() : 'pending'}`}>
                                                        {currentUserData?.status
                                                            ? USER_STATUS[currentUserData.status as UserStatusKey] || currentUserData.status
                                                            : USER_STATUS['pending']}
                                                    </span>
                                                )}

                                            </div>
                                        </div>

                                        
                                        {/* Campos informativos de fecha */}
                                        <div
                                            style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",     // Dos columnas iguales
                                            rowGap: "10px",                     // Espacio entre filas
                                            justifyContent: "space-between",    // Opcional, dependiendo de lo que necesites
                                            alignItems: "center"
                                        }}>
                                            <div className="form-field-user-container">
                                                <label>
                                                    <span className="material-icons-round">event</span>Fecha de Creación
                                                </label>
                                                <p className="form-field-static-value" aria-label="Fecha de creación de la cuenta">
                                                    {currentUserData.accountCreatedAt 
                                                        ? new Date(currentUserData.accountCreatedAt instanceof Date ? currentUserData.accountCreatedAt : currentUserData.accountCreatedAt.toDate()).toLocaleString() 
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="form-field-user-container">
                                                <label>
                                                    <span className="material-icons-round">login</span>Último Acceso
                                                </label>
                                                <p className="form-field-static-value" aria-label="Fecha del último acceso">
                                                    {currentUserData.lastLoginAt 
                                                        ? new Date(currentUserData.lastLoginAt instanceof Date ? currentUserData.lastLoginAt : currentUserData.lastLoginAt.toDate()).toLocaleString() 
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
                            {success && <p style={{ color: 'green', marginTop: '1rem', textAlign: 'center' }}>{success}</p>}
                        </form>
                    </dialog>
                </div>
                {showMessagePopUp && messagePopUpContent && (<MessagePopUp {...messagePopUpContent} />)}
            </div >
        )
    };


NewUserForm.displayName = 'NewUserForm';
