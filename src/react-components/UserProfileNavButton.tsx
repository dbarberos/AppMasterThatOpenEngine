import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile as AuthUserProfile } from '../Auth/react-components/AuthContext'; // Asumiendo que UserProfile está aquí
import {
    UserIcon,
    ChevronDownIcon,
    ProfileIcon,
    LoginIcon,
    LogoutIcon,
    LoadingIcon,
} from './icons'; // Asegúrate que estos iconos existan o créalos

interface UserProfileNavButtonProps {
    currentUser: FirebaseUser | null;
    userProfile: AuthUserProfile | null;
    authLoading: boolean;
    onNavigate: (
        action: 'profile' | 'auth' | 'change-password' | 'signout'
    ) => void;
}

export const UserProfileNavButton: React.FC<UserProfileNavButtonProps> = ({
    currentUser,
    userProfile,
    authLoading,
    onNavigate,
}) => {

    const [isPortalOpen, setIsPortalOpen] = React.useState(false);
    const [portalPosition, setPortalPosition] = React.useState<{
        top: number;
        left: number;
    } | null>(null);
    const buttonRef = React.useRef<HTMLLIElement>(null);
    const portalRef = React.useRef<HTMLDivElement>(null);

    const getInitials = (firstName?: string, lastName?: string): string => {
        if (firstName && lastName)
            return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        if (firstName) return firstName.substring(0, 2).toUpperCase();
        if (userProfile?.nickname)
            return userProfile.nickname.substring(0, 2).toUpperCase();
        if (currentUser?.email)
            return currentUser.email.substring(0, 2).toUpperCase();
        return '??';
    };

    const togglePortal = () => {
        if (!buttonRef.current) return;

        if (isPortalOpen) {
            setIsPortalOpen(false);
        } else {
            const rect = buttonRef.current.getBoundingClientRect();
            setPortalPosition({
                top: rect.top, // Alineado con la parte superior del botón
                left: rect.right + 10, // 10px a la derecha del botón
            });
            setIsPortalOpen(true);
        }
    };


    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isPortalOpen &&
                portalRef.current &&
                !portalRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsPortalOpen(false);
            }
        };

        if (isPortalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPortalOpen]);




    if (authLoading) {
        return (
            <li className="nav-button nav-button-loading">
                <LoadingIcon />
                <span>Loading...</span>
            </li>
        );
    }



    if (!currentUser || !userProfile) {
        return (
            <li
                className="nav-button"
                onClick={() => onNavigate('auth')}
                title="Sign Up / Sign In"
                style={{ cursor: 'pointer' }}
            >
                <LoginIcon
                    size={30}
                    className="todo-icon-edit"
                    color="var(--color-fontbase)"
                />
                <span>Sign Up / Sign In</span>
            </li>
        );
    }

    const initials = getInitials(userProfile.firstName, userProfile.lastName);


    return (
        <>
            <li
                ref={buttonRef}
                className="nav-button user-profile-nav-button"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    position: 'relative', // Para el posicionamiento del portal si fuera necesario dentro
                }}
                onClick={togglePortal} // O solo el chevron: onClick en el span del chevron
                title={userProfile.nickname || currentUser.email || 'User Profile'}
            >
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <div
                        className="avatar"
                        style={{
                            width: '37px',
                            height: '37px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent-light)', // Un color de fondo para las iniciales
                            color: 'var(--color-accent-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px', // Espacio entre avatar y texto
                            fontSize: '0.9em',
                            fontWeight: 'bold',
                            flexShrink: 0,
                        }}
                    >
                        {userProfile.photoURL ? (
                            <img
                                src={userProfile.photoURL}
                                alt="User"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="user-nav-info" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', marginRight: '5px' }}>
                        <span
                            style={{
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '0.9em',
                            }}
                        >
                            {userProfile.nickname || 'User'}
                        </span>
                        <span
                            style={{
                                fontSize: '0.75em',
                                color: 'var(--color-fontbase-dark)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {currentUser.email}
                        </span>
                    </div>
                </div>
                <span onClick={(e) => { e.stopPropagation(); togglePortal(); }} style={{ paddingLeft: '5px', display: 'flex', alignItems: 'center' }}>
                    <ChevronDownIcon
                        size={20}
                        color="var(--color-fontbase)"
                        className="todo-icon-edit"
                    />
                </span>
            </li>

            {isPortalOpen &&
                portalPosition &&
                ReactDOM.createPortal(
                    <div
                        ref={portalRef}
                        className="profile-dropdown-portal"
                        style={{
                            position: 'fixed',
                            top: `${portalPosition.top}px`,
                            left: `${portalPosition.left}px`,
                            backgroundColor: 'var(--background-elevation-2)', // Usa variables CSS
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            boxShadow:
                                '0 4px 15px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                            zIndex: 1100, // Asegúrate que esté por encima del sidebar
                            width: '230px',
                            overflow: 'hidden',
                            animation: 'fadeInDropdown 0.2s ease-out',
                        }}
                    >
                        <button
                            onClick={() => { onNavigate('profile'); setIsPortalOpen(false); }}
                            className="portal-dropdown-item"
                        >
                            <ProfileIcon size={18} color="var(--color-fontbase)" />
                            Profile
                        </button>
                        <button
                            onClick={() => { onNavigate('change-password'); setIsPortalOpen(false); }}
                            className="portal-dropdown-item"
                        >
                            <span className="material-icons-round" style={{ fontSize: '18px', marginRight: '8px' }}>key</span>
                            Change Password
                        </button>
                        <button
                            onClick={() => { onNavigate('auth'); setIsPortalOpen(false); }}
                            className="portal-dropdown-item"
                        >
                            <LoginIcon size={18} color="var(--color-fontbase)" />
                            Change Account
                        </button>
                        <div
                            style={{
                                borderTop: '1px solid var(--color-border-light)',
                                margin: '4px 0',
                            }}
                        />
                        <button
                            onClick={() => { onNavigate('signout'); setIsPortalOpen(false); }}
                            className="portal-dropdown-item portal-dropdown-item-danger"
                        >
                            <LogoutIcon size={18} color="var(--color-error)" />
                            Sign Out
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
};


    

}
