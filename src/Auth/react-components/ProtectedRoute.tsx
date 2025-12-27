import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserUnverifiedPage } from '../../react-components/UserUnverifiedPage';
import { LoadingIcon } from '../../react-components/icons';
import { UserDisabledPage } from '../../react-components/UserDisabledPage';

export const ProtectedRoute = () => {
    const { currentUser, userProfile, loading } = useAuth();

    console.log('ProtectedRoute Check:', {
        loading,
        currentUser: !!currentUser,
        userProfileRole: userProfile?.roleInApp,
        userProfileStatus: userProfile?.status
    });

    if (loading) {
        // Muestra un indicador de carga mientras se verifica el estado de autenticación.
        // Esto previene un parpadeo momentáneo a la página de login.
        return <LoadingIcon />;
    }

    if (!currentUser) {
        // Si no hay usuario, redirige a la página de autenticación.
        return <ReactDOM.Navigate to="/auth" replace />;
    }

    if (userProfile?.status === 'disable') {
        // Si el usuario está deshabilitado, muestra la página de "deshabilitado".
        return <UserDisabledPage />;
    }

    if (userProfile?.roleInApp === 'unverified') {
        // Si el usuario no está verificado, muestra la página de "no verificado".
        return <UserUnverifiedPage />;
    }

    // Si el usuario está autenticado y verificado, renderiza la ruta hija solicitada.
    return <ReactDOM.Outlet />;
};