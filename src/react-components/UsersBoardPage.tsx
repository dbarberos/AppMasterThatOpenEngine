import * as React from 'react';


export function UsersBoardPage() {
    return (
        <section className="page" id="users-page" data-page="" style={{ display: "" }}>
        <header className="header-users" style={{ height: 120 }}>
            <div>
                <h2 style={{ display: "flex", alignItems: "center", columnGap: 20 }}>
                Users Board
                <span className="material-icons-round" style={{ padding: 10 }}>
                    people_alt
                </span>
                <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                    <p style={{ fontSize: "var(--font-lg)", fontWeight: "normal" }}>
                    Project:{" "}
                    </p>
                    <select
                    id="projectSelectedUsersPage"
                    style={{
                        padding: 10,
                        borderRadius: 5,
                        fontSize: "var(--font-lg)",
                        lineHeight: 1,
                        letterSpacing: "normal",
                        textTransform: "none",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                        wordWrap: "normal"
                    }}
                    ></select>
                </div>
                </h2>
                <ul
                id="users-sliding-nav1"
                style={{
                    display: "flex",
                    columnGap: 25,
                    transform: "translateY(15px)",
                    zIndex: 100,
                    alignItems: "center"
                }}
                >
                <li className="users-slide1" />
                <li className="users-slide2" />
                <li>
                    <a href="#/users" className="tab-buttons">
                    <span className="material-icons-round">people_alt</span>
                    Users
                    </a>
                </li>
                <li>
                    <a href="#/teams" className="tab-buttons" style={{ width: 175 }}>
                    <span className="material-icons-round">diversity_3</span>
                    Projects Teams
                    </a>
                </li>
                </ul>
                {/* <div style="display: flex; column-gap: 25px; transform: translateY(35px); z-index:100;" >
                            <button class="tab-button">
                                <span class="material-icons-round">people_alt</span>
                                Users
                            </button>
                            <button class="tab-button" style="width: 200px;">
                                <span class="material-icons-round">diversity_3</span>
                                Projects Teams
                            </button>
                        </div> */}
            </div>
            <div>
                <div
                style={{
                    display: "flex",
                    flexDirection: "row-reverse",
                    columnGap: 20,
                    alignItems: "center"
                }}
                >
                <div
                    style={{
                    display: "flex",
                    flexDirection: "row",
                    alignContent: "space-between"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                    <input
                        type="search"
                        id="search-user"
                        placeholder="Search by name, email or phone number"
                        style={{ width: 350 }}
                    />
                    <span className="material-icons-round">search</span>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "end", columnGap: 10 }}>
                    <button
                    className="btn-secondary"
                    style={{ borderRadius: 10, width: "auto", border: 0 }}
                    >
                    <span className="material-icons-round">filter_alt</span>
                    </button>
                </div>
                </div>
            </div>
            </header>
            <div className="users-page-content" id="users-index" style={{ display: "" }}>
            <div className="header-user-page-content">
                <div style={{ display: "flex", flexDirection: "row", columnGap: 10 }}>
                <button
                    style={{ borderRadius: 10, width: "auto" }}
                    className="btn-secondary"
                >
                    <span className="material-icons-round">swap_vert</span>
                    <p>Sort By</p>
                    <span className="material-icons-round">expand_more</span>
                </button>
                <button style={{ borderRadius: 10 }}>
                    <span className="material-icons-round">add</span>
                    <p>Add New User</p>
                </button>
                </div>
            </div>
            <div
                className="user-container-header"
                style={{ border: "none", backgroundColor: "transparent" }}
            >
                <div>
                <div
                    style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "left",
                    columnGap: 10
                    }}
                >
                    {/* <label for=""></label> */}
                    <input
                    name="bulk-checkbox"
                    type="checkbox"
                    defaultValue="all-selected"
                    className="checkbox"
                    style={{ width: 17, height: 17 }}
                    />
                    <div>
                    <button
                        style={{ borderRadius: 10, width: "auto" }}
                        className="btn-secondary"
                    >
                        Bulk Actions
                        <label>
                        <span className="material-icons-round">expand_more</span>
                        {/* <select name="" id="" style="appearance: none;">
                                            <option value="Asign proyect">Asign proyect</option>
                                            <option value="Remove all projects">Remove all projects</option>
                                            <option value="Remove all roles">Remove all roles</option>
                                            <option value="Email Validation Accounts">Email Validation Accounts</option>
                                            <option value="Disable account">Disable account</option>
                                            <option value="Delete users">Delete users</option>
                                        </select> */}
                        </label>
                    </button>
                    </div>
                </div>
                </div>
                <h5 />
                <h5>EMAIL</h5>
                <h5>PHONE</h5>
                <h5>ORGANIZATION / ROL</h5>
                <h5>STATUS</h5>
                <h5 className="users-edit">ACTIONS</h5>
            </div>
            <div className="users-list">
                <div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/OFFICE1.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Chris</div>
                    </div>
                    <p>christina@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>BDP</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Project Manager
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p
                            style={{
                            fontSize: "var(--font-xl)",
                            backgroundColor: "#ca8134",
                            padding: 10,
                            borderRadius: "var(--br-circle)",
                            aspectRatio: 1,
                            color: "var(--background)"
                            }}
                        >
                            HC
                        </p>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/constructor.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>D Harrison</div>
                    </div>
                    <p>david@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>Dragados</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        BIM Manager
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>David Harrison </p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p
                            style={{
                            fontSize: "var(--font-xl)",
                            backgroundColor: "#ca8134",
                            padding: 10,
                            borderRadius: "var(--br-circle)",
                            aspectRatio: 1,
                            color: "var(--background)"
                            }}
                        >
                            HC
                        </p>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/EDIF1.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Anne</div>
                    </div>
                    <p>anne@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>FCC</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Site Manager
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Anne Richard</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p
                            style={{
                            fontSize: "var(--font-xl)",
                            backgroundColor: "#ca8134",
                            padding: 10,
                            borderRadius: "var(--br-circle)",
                            aspectRatio: 1,
                            color: "var(--background)"
                            }}
                        >
                            HC
                        </p>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/OFFICE6.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Mrs Samia</div>
                    </div>
                    <p>samia@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>Acciona</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Document Controller
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Samia Kartoon</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/OBRAS2.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Mr Clerk</div>
                    </div>
                    <p>andy@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>Ferrovial</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        MEP Engineer
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Andy Clerk</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/Architect.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Sir Halligan</div>
                    </div>
                    <p>brian@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>Sacyr</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Architect
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Brian Halligan</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/OFFICE4.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Bart</div>
                    </div>
                    <p>barto@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>OHLA</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Building Surveyor
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Bartolome Simpson</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/INGENIERA2.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Cami</div>
                    </div>
                    <p>cwelt@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>ARUP</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Structural Engineer
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Camila Welters</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/OBRA5.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Oliver</div>
                    </div>
                    <p>oliver@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>AECOM</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        BIM Coordinator
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Activer</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Oliver Schevich</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-container">
                    <div className="users-checkbox">
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name">
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/COMPANY2.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>JW</div>
                    </div>
                    <p>myhairisred@site.com</p>
                    <div>
                    <p>666 666 66 66</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Spain +34
                    </p>
                    </div>
                    <div>
                    <p>dBASE</p>
                    <p
                        style={{
                        fontSize: "var(--font-base)",
                        color: "var(--color-grey)"
                        }}
                    >
                        Full Stack Soft. developer
                    </p>
                    </div>
                    <div className="users-status">
                    <p>Active</p>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                <option value="Asign proyect">Asign proyect</option>
                                                <option value="Remove all projects">Remove all projects</option>
                                                <option value="Remove all project roles">Remove all roles</option>
                                                <option value="Email Validation Accounts">Email Validation Accounts</option>
                                                <option value="Disable account">Disable account</option>
                                                <option value="Delete users">Delete users</option>
                                            </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="user-details1">
                    <div className="user-data">
                        <p>FULL NAME:</p>
                        <p>Jessica Williams</p>
                    </div>
                    <div className="user-data">
                        <p>ADDRESS:</p>
                        <p>Trump tower. New York </p>
                    </div>
                    <div className="user-data">
                        <p>ACCOUNT CREATED ON:</p>
                        <p>30/05/2024 </p>
                    </div>
                    <div className="user-data">
                        <p>CREATED BY:</p>
                        <p>Christina Bersh </p>
                    </div>
                    <div className="user-data">
                        <p>LAST LOGIN:</p>
                        <p>30/05/2024 </p>
                    </div>
                    </div>
                    <div className="user-details2">
                    <div className="user-data" style={{ justifyContent: "flex-start" }}>
                        <div>
                        <p>PROYECTS TEAMS:</p>
                        </div>
                        <div>
                        <p />
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
            <div
            className="users-page-content"
            id="teams-page"
            style={{ display: "none" }}
            >
            <div className="header-user-page-content">
                <div style={{ display: "flex", flexDirection: "row", columnGap: 10 }}>
                <button
                    style={{ borderRadius: 10, width: "auto" }}
                    className="btn-secondary"
                >
                    <span className="material-icons-round">swap_vert</span>
                    <p>Sort By</p>
                    <span className="material-icons-round">expand_more</span>
                </button>
                <button style={{ borderRadius: 10 }}>
                    <span className="material-icons-round">add</span>
                    <p>Add New User To Team</p>
                </button>
                </div>
            </div>
            <div
                className="user-container-header"
                style={{ border: "none", backgroundColor: "transparent" }}
            >
                <div>
                <div
                    style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "left",
                    columnGap: 10
                    }}
                >
                    {/* <label for=""></label> */}
                    <input
                    name="bulk-checkbox"
                    type="checkbox"
                    defaultValue="all-selected"
                    className="checkbox"
                    style={{ width: 17, height: 17 }}
                    />
                    <div>
                    <button
                        style={{ borderRadius: 10, width: "auto" }}
                        className="btn-secondary"
                    >
                        Bulk Actions
                        <label>
                        <span className="material-icons-round">expand_more</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                        <option value="Remove from the Team">Remove from</option>
                                                        <option value="Email Validation Team Project">Email Validation Team</option>
                                                        <option value="Disable for de team">Disable team</option>
                                                        <option value="Delete users">Delete users</option>
                                                        
                                                    </select> */}
                        </label>
                    </button>
                    </div>
                </div>
                </div>
                <h5 />
                <h5>DATA</h5>
                <h5 />
                <h5>PERMISSIONS</h5>
                <h5 />
                <h5 className="users-edit">ACTIONS</h5>
            </div>
            <div className="users-list">
                <div>
                <div className="user-team-container">
                    <div className="users-checkbox" style={{ marginTop: "-75px" }}>
                    {/* <label for=""></label> */}
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name" style={{ marginTop: "-75px" }}>
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/OFFICE1.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Chris</div>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                            <option value="Remove from the Team">Remove from</option>
                                                            <option value="Email Validation Team Project">Email Validation Team</option>
                                                            <option value="Disable for de team">Disable team</option>
                                                            <option value="Delete users">Delete users</option>
                                                        </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="team-data">
                    <div className="user-data">
                        <p>EMAIL:</p>
                        <p>christina@site.com </p>
                    </div>
                    <div className="user-data">
                        <p>PHONE:</p>
                        <p>666 666 66 66</p>
                    </div>
                    <div className="user-data">
                        <p>ORGANIZATION:</p>
                        <p>BDP</p>
                    </div>
                    <div className="user-data">
                        <p>ROLE:</p>
                        <p>Project Manager </p>
                    </div>
                    </div>
                    <div className="team-permissions">
                    <div
                        className="user-data"
                        style={{ justifyContent: "flex-start" }}
                    ></div>
                    <div
                        className="user-data"
                        style={{ justifyContent: "flex-start", alignItems: "center" }}
                    >
                        <div style={{ width: 75 }}>
                        <p>TO-DO LIST:</p>
                        </div>
                        <div style={{ display: "flex", columnGap: "var(--gap-base)" }}>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            add
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            visibility
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            drive_file_rename_outline
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            delete_outline
                        </span>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-team-container">
                    <div className="users-checkbox" style={{ marginTop: "-75px" }}>
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name" style={{ marginTop: "-75px" }}>
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/constructor.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>D Harrison</div>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                            <option value="Remove from the Team">Remove from</option>
                                                            <option value="Email Validation Team Project">Email Validation Team</option>
                                                            <option value="Disable for de team">Disable team</option>
                                                            <option value="Delete users">Delete users</option>
                                                        </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="team-data">
                    <div className="user-data">
                        <p>EMAIL:</p>
                        <p>david@site.com </p>
                    </div>
                    <div className="user-data">
                        <p>PHONE:</p>
                        <p>666 666 66 66</p>
                    </div>
                    <div className="user-data">
                        <p>ORGANIZATION:</p>
                        <p>Dragados</p>
                    </div>
                    <div className="user-data">
                        <p>ROLE:</p>
                        <p>BIM ManagerProject Manager </p>
                    </div>
                    </div>
                    <div className="team-permissions">
                    <div
                        className="user-data"
                        style={{ justifyContent: "flex-start" }}
                    ></div>
                    <div
                        className="user-data"
                        style={{ justifyContent: "flex-start", alignItems: "center" }}
                    >
                        <div style={{ width: 75 }}>
                        <p>TO-DO LIST:</p>
                        </div>
                        <div style={{ display: "flex", columnGap: "var(--gap-base)" }}>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            add
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            visibility
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            drive_file_rename_outline
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            delete_outline
                        </span>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="user-team-container">
                    <div className="users-checkbox" style={{ marginTop: "-75px" }}>
                    <input
                        name="bulk-checkbox"
                        type="checkbox"
                        className="checkbox"
                        defaultValue="all-selected"
                    />
                    </div>
                    <div className="users-name" style={{ marginTop: "-75px" }}>
                    <div className="users-photo">
                        <img
                        src="./assets/photo-users/SELECTED/EDIF1.jpg"
                        alt="PROJECT MANAGER"
                        />
                    </div>
                    <div>Anne</div>
                    </div>
                    <div className="users-edit">
                    <button className="btn-secondary">
                        <label>
                        <span className="material-icons-round">more_horiz</span>
                        {/* <select name="" id="" style="appearance: none;">
                                                            <option value="Remove from the Team">Remove from</option>
                                                            <option value="Email Validation Team Project">Email Validation Team</option>
                                                            <option value="Disable for de team">Disable team</option>
                                                            <option value="Delete users">Delete users</option>
                                                        </select> */}
                        </label>
                    </button>
                    </div>
                    <div className="team-data">
                    <div className="user-data">
                        <p>EMAIL:</p>
                        <p>christina@site.com </p>
                    </div>
                    <div className="user-data">
                        <p>PHONE:</p>
                        <p>666 666 66 66</p>
                    </div>
                    <div className="user-data">
                        <p>ORGANIZATION:</p>
                        <p>FCC</p>
                    </div>
                    <div className="user-data">
                        <p>ROLE:</p>
                        <p>Site Manager </p>
                    </div>
                    </div>
                    <div className="team-permissions">
                    <div
                        className="user-data"
                        style={{ justifyContent: "flex-start" }}
                    ></div>
                    <div
                        className="user-data"
                        style={{ justifyContent: "flex-start", alignItems: "center" }}
                    >
                        <div style={{ width: 75 }}>
                        <p>TO-DO LIST:</p>
                        </div>
                        <div style={{ display: "flex", columnGap: "var(--gap-base)" }}>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            add
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            visibility
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            drive_file_rename_outline
                        </span>
                        <span
                            style={{ fontSize: "2em" }}
                            className="material-icons-round"
                        >
                            delete_outline
                        </span>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </section>
    )
}

// Add display name for debugging purposes
UsersBoardPage.displayName = 'UsersBoardPage'


