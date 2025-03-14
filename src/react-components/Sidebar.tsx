import * as React from 'react';
import * as Router from 'react-router-dom';


export const toggleSidebar = {
    collapse: () => {
        const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
        if (sidebarCheckbox) {
            sidebarCheckbox.checked = true;
        }
    },
    expand: () => {
        const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
        if (sidebarCheckbox) {
            sidebarCheckbox.checked = false;
        }
    },
    getState: (): boolean => {
        const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
        return sidebarCheckbox?.checked || false;
    },
    setState: (state: boolean) => {
        const sidebarCheckbox = document.getElementById('sidebar-checkbox-switch') as HTMLInputElement;
        if (sidebarCheckbox) {
            sidebarCheckbox.checked = state;
        }
    }
};


export function Sidebar() {
    return (
        <aside id="sidebar">
            <div className="sidebar-organization">
                <img
                    id="company-logo"
                    src="./assets/company-logo.svg"
                    alt="Construction company"
                    title="company-logo"
                />
                <ul id="navigation-bar">
                    <Router.Link to="/"><li id="asideBtnProjects" className="nav-button">
                        <span className="material-icons-round">location_city</span>Projects
                        Catalog
                    </li></Router.Link>                    
                    <li id="asideBtnProjectDetails" className="nav-button">
                        <span className="material-icons-round">home_work</span>Project Details
                    </li>
                    <li id="asideBtnToDoBoards" className="nav-button">
                        <span className="material-icons-round">view_kanban</span>
                        To-Do Boards
                    </li>
                    <li id="asideBtnUsers" className="nav-button">
                        <span className="material-icons-round">people_alt</span>Index Users
                    </li>
                </ul>
                <div>
                    <div>
                        <input type="checkbox" id="sidebar-checkbox-switch" />
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