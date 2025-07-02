import * as React from 'react';
import { User } from '../classes/User';
import { MoreOptionsHorzIcon  } from './icons'; // Assuming you have these icons
import { UserCardActionsMenu} from '../react-components'

interface UserCardRowProps {
    user: User;
    isExpanded: boolean;
    onExpandToggle: (userId: string) => void;
    onAssignProjects: (user: User) => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    authRole?: 'admin' | 'superadmin' | string;
    authUserId?: string;
}

export const UserCardRow: React.FC<UserCardRowProps> = ({
    user,
    isExpanded,
    onExpandToggle,
    onAssignProjects,
    onEditUser,
    onDeleteUser,
    authRole,
    authUserId,
}) => {


    //const [isDetailsVisible, setIsDetailsVisible] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Crear una ref para el botón que abre el menú.
    // Se pasará al menú para que pueda calcular su posición.
    const menuButtonRef = React.useRef<HTMLButtonElement>(null);

    //    Debe cumplir la condición general (canExpandDetails) Y tener el rol adecuado.
    const canUserExpand = (authRole === 'admin' || authRole === 'superadmin')

    // Manejar la expansión por click
    const handleRowClick = () => {
        if (canUserExpand) {
            onExpandToggle(user.id!);
        }
    };

    // // Function to toggle details visibility
    // const toggleDetails = () => {
    //     setIsDetailsVisible(!isDetailsVisible);
    // };

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };
    

    return (
        <div className="user-card-wrapper">
            <div
                className="user-container"
                onClick={handleRowClick}
                style={{
                    cursor: canUserExpand ? 'pointer' : 'default',
                    
                }}
            >
                <div className="users-checkbox" onClick={(e) => e.stopPropagation()}>
                    <label className="radio">
                        <input
                            name="bulk-checkbox"
                            type="checkbox"
                            defaultValue="all-selected"
                        //value={user.id}
                        />
                        <span className="checkmark"></span>
                    </label>
                </div>
                <div className="users-name">
                    <div className="users-photo">
                        <img
                            src={user.photoURL || "/assets/photo-users/default-avatar.jpg"}
                            //Usa photoURL o un default
                            alt={user.nickName || "User"}
                            onError={(e) => {
                                // Previene bucles de error si el avatar por defecto también falla
                                e.currentTarget.onerror = null; 
                                e.currentTarget.src = "/assets/photo-users/default-avatar.jpg";
                            }}
                        />
                    </div>
                    <div>
                        {user.nickName || 'N/A'}
                        {/* {user.fullName && <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-grey)' }}>({user.fullName})</p>} */}
                    </div>
                </div>

                <div>{user.email || 'N/A'}</div>
                
                <div>
                    {user.phoneNumber || 'N/A'}
                    {user.phoneCountryNumber && <p style={{ fontSize: 'var(--font-base)', color: 'var(--color-fontbase-dark)' }}> {user.phoneCountryNumber} </p>}
                </div>

                <div>
                    {user.organization || 'N/A'}
                    {user.roleInApp && <p style={{ fontSize: 'var(--font-base)', color: 'var(--color-fontbase-dark)' }}>{user.roleInApp}</p>}
                </div>

                <div style={{textAlign: 'center' }}>
                    {user.projectsAssigned?.length || 0}
                </div>


                <div style={{ textAlign: 'center' }}>                
                    <p className={`user-status-badge status-${user.status?.toLowerCase()}`}>{user.status || 'N/A'}</p>
                </div>

                
                <div style={{ position: 'relative' }} className="users-edit" onClick={(e) => e.stopPropagation()}>
                    <button
                        ref={menuButtonRef}
                        onClick={toggleMenu}
                        title="Action"
                        className="btn-secondary">
                        <label>
                            <MoreOptionsHorzIcon size={20} color="var(--color-fontbase)" className='todo-icon-plain'/>
                        </label>
                    </button>

                    <UserCardActionsMenu
                        isOpen={isMenuOpen}
                        menuButtonRef={menuButtonRef}
                        onClose={closeMenu}
                        onAssignProjects={() => {
                            closeMenu();
                            onAssignProjects(user)
                        }}
                        onEditUser={() => {
                            closeMenu();
                            onEditUser(user)
                        }}
                        onDeleteUser={() => {
                            closeMenu()
                            onDeleteUser(user.id!)
                        }}
                        authRole={authRole}
                        authUserId={authUserId}
                        targetUserId={user.id}
                    />
                </div>
            </div>


            {/*  Details container. Class change dinamically for the CSS animation  */}
            <div className={`user-details-wrapper ${isExpanded ? "expanded" : ""}`}>
                {/* 4. Internal content only display if the container is expanded. optimized performance. */}
                {isExpanded  && (
                    <>
                        <div className="user-details1">
                            <div className="user-data">
                                <p>FIRST NAME:</p>
                                <p>{user.firstName || 'N/A'}</p>
                            </div>
                            <div className="user-data">
                                <p>LAS NAME:</p>
                                <p>{user.lastName || 'N/A'}</p>
                            </div>
                            <div className="user-data">
                                <p>ADDRESS:</p>
                                <p>{user.address || 'N/A'}</p>
                            </div>
                            <div className="user-data">
                                <p>ACCOUNT CREATED ON:</p>
                                <p>{user.accountCreatedAt ? new Date(user.accountCreatedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            {/* <div className="user-data">
                                <p>CREATED BY:</p>
                                <p>{user.createdBy || 'N/A'}</p>
                            </div> */}
                            <div className="user-data">
                                <p>LAST LOGIN:</p>
                                <p>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                        <div className="user-details2">
                            <div className="user-data" style={{ justifyContent: "flex-start" }}>
                                <div>
                                    <p>PROJECTS TEAMS:</p>
                                </div>
                                <div>
                                    {user.projectsAssigned && user.projectsAssigned.length > 0 ? (
                                        user.projectsAssigned.map(pa => (
                                            <p key={pa.projectId}
                                                style={{
                                                    fontSize: "var(--font-xl)",
                                                    // backgroundColor: "#ca8134", // Consider dynamic color based on project
                                                    padding: 10,
                                                    borderRadius: "var(--br-circle)",
                                                    aspectRatio: 1,
                                                    color: "var(--background)",
                                                    marginRight: 5,
                                                    display: 'inline-block',
                                                    // You might want to fetch project acronyms or use a placeholder
                                                    backgroundColor: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color for demo
                                                }}
                                                title={`Role: ${pa.roleInProject}`}
                                            >
                                                {/* Placeholder for project acronym - you'd need to fetch this */}
                                                {pa.projectId.substring(0, 2).toUpperCase()}
                                            </p>
                                        ))
                                    ) : (
                                        <p>No projects assigned</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

UserCardRow.displayName = 'UserCardRow';