import * as React from 'react';
import * as Router from 'react-router-dom';

import { MainProjectCatalog, MainProjectDetails, MainToDoBoard, MainUsersIndex } from './icons';
import { useStickyState } from '../hooks'
import {ProjectsManager } from '../classes/ProjectsManager'


interface SidebarProps { // Añadir props
    projectsManager: ProjectsManager;
}

export function Sidebar({ projectsManager }: SidebarProps) {
    console.log('Sidebar: Component rendering / re-rendering TOP');
    // Usamos useStickyState para gestionar el estado principal y su persistencia
    const [selectedProjectId, setSelectedProjectId] = useStickyState<string | null>(null, 'selectedProjectId');

    const location = Router.useLocation(); // Hook para obtener la ubicación actual

    const navigate = Router.useNavigate();


    // Función para manejar el clic en el botón "Projects Catalog"
    const handleCatalogClick = () => {
        console.log('Sidebar: Clearing selectedProjectId using useStickyState setter');
        //localStorage.removeItem('selectedProjectId');
        setSelectedProjectId(null); // Actualiza el estado inmediatamente

        // Eliminación directa para casos donde el estado no cambia
        window.localStorage.removeItem('selectedProjectId');

        // Añadir navegación para forzar actualización
        navigate('/', { replace: true }); 
    };




    React.useEffect(() => {

        const currentPath = location.pathname;
        console.log('Sidebar: location effect running.', {
            pathname: currentPath,
            currentSelectedProjectId: selectedProjectId
        });

        let extractedProjectId: string | null = null;
        const parts = currentPath.split('/'); // e.g., ["", "project", "ID"] or ["", "project", "todoBoard", "ID"]


        if (currentPath === '/') {
            
            if (selectedProjectId !== null) {
                console.log('Sidebar: Navigated to home. Clearing selectedProjectId.');
                setSelectedProjectId(null);
            }
            return  // Early exit for home page
        }


        // Palabras clave que indican segmentos de ruta que NO son IDs de proyecto por sí mismos
        // cuando aparecen como el último segmento de una ruta que no termina en un ID.
        // Ejemplos: /project, /project/todoBoard, /usersBoard
        // Asegúrate de incluir aquí cualquier segmento que pueda ser el último en una URL
        // donde quieras que el selectedProjectId se mantenga "sticky" en lugar de intentar
        // extraer un ID.
        const pathKeywords = ["project", "todoBoard", "usersBoard", "settings"]; // Añade más según sea necesario

        let potentialProjectId = parts[parts.length - 1];

        // Si el último segmento está vacío (ej: URL termina en '/'), o es una palabra clave conocida.
        if (!potentialProjectId || pathKeywords.includes(potentialProjectId)) {
            // Estamos en una ruta como /project/ o /project/todoBoard (sin ID al final), o /users.
            // En estos casos, selectedProjectId mantiene su valor "sticky".
            // Si selectedProjectId era null, seguirá siendo null.
            // Si selectedProjectId tenía un valor, lo conservará.
            // Esto permite que si navegas de /project/ID_VALIDO a /project/todoBoard (sin ID en la URL),
            // el botón "Project Details" siga activo con ID_VALIDO.
            // Si luego navegas a /project/todoBoard/NUEVO_ID_VALIDO, la siguiente condición (else) lo capturará.
            console.log('Sidebar: Last segment is empty or a keyword. selectedProjectId remains sticky:', selectedProjectId);
        } else {
            // El último segmento no está vacío y no es una palabra clave conocida.
            // VERIFICAR SI EL ID EXTRAÍDO DE LA URL EXISTE EN ProjectsManager
        if (projectsManager.getProject(potentialProjectId)) {
            extractedProjectId = potentialProjectId;
        } else {
            // El ID extraído de la URL no corresponde a un proyecto conocido.
            // No actualizaremos selectedProjectId con este ID inválido, manteniendo el valor "sticky" anterior.
            console.warn(`Sidebar: Project ID "${potentialProjectId}" from URL not found in ProjectsManager. Keeping sticky ID: ${selectedProjectId}`);
            // extractedProjectId permanece null, por lo que selectedProjectId no se cambiará a este ID inválido.
        }
        }




        // If a project ID was extracted from the URL
        if (extractedProjectId) {
            if (extractedProjectId !== selectedProjectId) {
                console.log('Sidebar: Syncing selectedProjectId with extracted URL Project ID:', extractedProjectId);
                setSelectedProjectId(extractedProjectId);
            }
        } else {
            // Si no se extrajo un ID válido de la URL (o la URL era '/', o era una página no específica de proyecto)
            // selectedProjectId mantiene su valor "sticky".
            // Si currentPath es '/', selectedProjectId ya se habrá puesto a null antes.
            if (currentPath !== '/') {
                console.log('Sidebar: No valid project ID extracted from URL or on non-project page. selectedProjectId remains sticky:', selectedProjectId);
            }
        }


    }, [location.pathname, selectedProjectId, setSelectedProjectId]);


    // This is the crucial part for rendering the button.
    // It uses `selectedProjectId` which is the state managed by `useStickyState` in THIS component.
    const isProjectSelected = !!selectedProjectId; // Booleano para saber si hay un proyecto seleccionado
    console.log('Sidebar RENDER: selectedProjectId for button logic:', selectedProjectId, 'isProjectSelected:', isProjectSelected);


    //Si no hay ID, usa '0' como placeholder. Si hay ID, úsalo.
    const toDoBoardPath = selectedProjectId ? `/project/todoBoard/${selectedProjectId}` : '/project/todoBoard/0';
    


    return (
        <aside id="sidebar">
            <div className="sidebar-organization">
                <img
                    id="company-logo"
                    src="/assets/company-logo.svg"
                    alt="Construction company"
                    title="company-logo"
                />
                <ul id="navigation-bar">
                    <Router.Link
                        to="/"
                        onClick={handleCatalogClick}
                    >
                        <li id="asideBtnProjects" className="nav-button" title="Projects Catalog" >
                            <MainProjectCatalog size={37}
                                className="todo-icon-edit"
                                color="var(--color-fontbase)"

                            />
                            Projects
                            Catalog
                        </li>
                    </Router.Link >

                    {/* Button Project Details */}

                            {/* <Router.Link to={`/project/${selectedProjectId}`}>
                                <li
                                    id="asideBtnProjectDetails"
                                    className="nav-button"
                                    title="Project Details"
                                >
                                    <MainProjectDetails size={37}
                                        className="todo-icon-edit"
                                        color="var(--color-fontbase)"
                                    />
                                    Project Details
                                </li>
                            </Router.Link> */}


                    {isProjectSelected
                        ? (
                            <Router.Link to={`/project/${selectedProjectId}`}>
                                <li
                                    id="asideBtnProjectDetails"
                                    className="nav-button"
                                    title="Project Details"
                                >
                                    <MainProjectDetails size={37}
                                        className="todo-icon-edit"
                                        color="var(--color-fontbase)"
                                    />
                                    Project Details
                                </li>
                            </Router.Link>
                        ) : (
                            <li
                                id="asideBtnProjectDetailsDisabled"
                                className="nav-button disabled" // La clase 'disabled' maneja el estilo visual
                                title="Select a project first"
                            >
                                <MainProjectDetails size={37}
                                    className="todo-icon-edit"
                                    color="var(--color-fontbase)" // El color se mantiene, pero la opacidad lo atenúa
                                />
                                Project Details
                            </li>
                        )
                    } 



                    {/* Button To-Do Boards  */}
                    <Router.Link to={toDoBoardPath}>
                        <li
                            id="asideBtnToDoBoards"
                            className="nav-button"
                            title="To-Do Boards"
                        >
                            <MainToDoBoard size={37}
                                className="todo-icon-edit"
                                color="var(--color-fontbase)"
                            />
                            To-Do Boards
                        </li>
                    </Router.Link>


                    {/* Botón Users Index */}
                    <Router.Link to='/usersBoard'>
                        <li
                            id="asideBtnUsers"
                            className="nav-button"
                            title="Index Users"
                        >
                            <MainUsersIndex size={37}
                                className="todo-icon-edit"
                                color="var(--color-fontbase)"
                            />
                            Index Users
                        </li>
                    </Router.Link>
                </ul>
                <div>
                    <div>
                        <input
                            type="checkbox"
                            id="sidebar-checkbox-switch"
                            defaultChecked={false}
                        />
                        <label htmlFor="sidebar-checkbox-switch" className="open-sidebar-btn">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="100%"
                                viewBox="0 0 24 24"
                                width="100%"
                                fill="var(--color-fontbase)"
                                transform="rotate(90)"
                                style={{ background: "transparent" }}
                            >
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M12 5.83l2.46 2.46c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L12.7 3.7c-.39-.39-1.02-.39-1.41 0L8.12 6.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 5.83zm0 12.34l-2.46-2.46c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l3.17 3.18c.39.39 1.02.39 1.41 0l3.17-3.17c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 18.17z" />
                            </svg>
                        </label>
                        <div className="show-sidebar">
                            <label htmlFor="sidebar-checkbox-switch" className="close-sidebar-btn">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="100%"
                                    viewBox="0 0 24 24"
                                    width="100%"
                                    fill="var(--color-fontbase)"
                                    transform="rotate(90)"
                                    style={{ background: "transparent" }}
                                >
                                    <path d="M24 0v24H0V0h24z" fill="none" opacity=".87" />
                                    <path d="M8.12 19.3c.39.39 1.02.39 1.41 0L12 16.83l2.47 2.47c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-3.17-3.17c-.39-.39-1.02-.39-1.41 0l-3.17 3.17c-.4.38-.4 1.02-.01 1.41zm7.76-14.6c-.39-.39-1.02-.39-1.41 0L12 7.17 9.53 4.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.03 0 1.42l3.17 3.17c.39.39 1.02.39 1.41 0l3.17-3.17c.4-.39.4-1.03.01-1.42z" />
                                </svg>
                            </label>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignContent: "space-between"
                        }}
                    />
                    <button id="theme-switch">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            enableBackground="new 0 0 24 24"
                            height="24px"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="#808b9f"
                        >
                            <rect fill="none" height={24} width={24} />
                            <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41 l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
                        </svg>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            enableBackground="new 0 0 24 24"
                            height="24px"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="#5f6368"
                        >
                            <rect fill="none" height={24} width={24} />
                            <path d="M11.01,3.05C6.51,3.54,3,7.36,3,12c0,4.97,4.03,9,9,9c4.63,0,8.45-3.5,8.95-8c0.09-0.79-0.78-1.42-1.54-0.95 c-0.84,0.54-1.84,0.85-2.91,0.85c-2.98,0-5.4-2.42-5.4-5.4c0-1.06,0.31-2.06,0.84-2.89C12.39,3.94,11.9,2.98,11.01,3.05z" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    )
}

// Add display name for debugging purposes
Sidebar.displayName = 'Sidebar'