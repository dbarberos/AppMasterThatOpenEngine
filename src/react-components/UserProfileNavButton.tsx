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
    PasswordIcon,
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
        if (userProfile?.nickName)
            return userProfile.nickName.substring(0, 2).toUpperCase();
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
                    position: 'relative', 
                    height: 'fit-content',
                    padding: '20px 0 20px 10px',
                    columnGap: '5px',
                }}
                onClick={togglePortal} // O solo el chevron: onClick en el span del chevron
                title={userProfile.nickName || currentUser.email || 'User Profile'}
            >
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <div
                        className="avatar"
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
                    <div className="user-avatar-nav-info" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', marginRight: '5px' }}>
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: 'var(--font-xl)',
                            }}
                        >
                            {userProfile.nickName || 'User'}
                        </span>
                        <span
                            style={{
                                fontSize: 'var(--font-base)',
                                color: 'var(--color-fontbase-dark)',
                            }}
                        >
                            {currentUser.email}
                        </span>
                    </div>
                </div>
                <span onClick={(e) => { e.stopPropagation(); togglePortal(); }} style={{ paddingLeft: '5px', display: 'flex', alignItems: 'center' }}>
                    <ChevronDownIcon
                        size={30}
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
                            top: `${(portalPosition.top)-80}px`,
                            left: `${(portalPosition.left)+20}px`,
                            // backgroundColor: 'var(--background-elevation-2)', // Usa variables CSS
                            // border: '1px solid var(--color-border)',
                            // borderRadius: '8px',
                            // boxShadow:
                            //     '0 4px 15px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
                            // zIndex: 1100, // Asegúrate que esté por encima del sidebar
                            // width: '230px',
                            // overflow: 'hidden',
                            // animation: 'fadeInDropdown 0.2s ease-out',
                        }}
                    >
                        <button
                            onClick={() => { onNavigate('profile'); setIsPortalOpen(false); }}
                            className="portal-dropdown-item  buttonD"
                        >
                            <ProfileIcon size={32} color="var(--color-fontbase)" className="todo-icon-plain"/>
                            Profile
                        </button>
                        <button
                            onClick={() => { onNavigate('change-password'); setIsPortalOpen(false); }}
                            className="buttonD"
                        >
                            <PasswordIcon size={32} color="var(--color-fontbase)" className="todo-icon-plain"/>
                            Change Password
                        </button>
                        
                        <button
                            onClick={() => { onNavigate('auth'); setIsPortalOpen(false); }}
                            className="buttonD"
                        >
                            <LoginIcon size={32} color="var(--color-fontbase)" className="todo-icon-plain" />
                            Change Account
                        </button>
                        

                        <button
                            onClick={() => { onNavigate('signout'); setIsPortalOpen(false); }}
                            className=" buttonC"
                            // className="portal-dropdown-item portal-dropdown-item-danger"
                        >
                            <LogoutIcon size={32} color="var(--color-error2)" className="todo-icon-plain"/>
                            Sign Out
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
};

// Add display name for debugging purposes
UserProfileNavButton.displayName = 'UserProfileNavButton';

