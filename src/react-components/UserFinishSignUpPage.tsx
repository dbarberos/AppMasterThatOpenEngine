import * as React from 'react';
import * as Router from 'react-router-dom';
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { NewUserForm } from '.';
import { toast } from 'sonner';
import { LoadingIcon } from './icons';
import { FinishUserSignUpForm } from '../Auth/react-components/FinishUserSignUpForm'

interface UserFinishSignUpPageProps {
    onSignUpSuccess: () => void;
}

export const UserFinishSignUpPage: React.FC<UserFinishSignUpPageProps> = ({ onSignUpSuccess }) => {
    const [email, setEmail] = React.useState<string | null>(null);
    const [isVerifying, setIsVerifying] = React.useState(true); // Loading state for verification
    const [showNewUserForm, setShowNewUserForm] = React.useState(false);
    const navigate = Router.useNavigate();
    const auth = getAuth();

    React.useEffect(() => {
        const checkEmailLink = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let storedEmail = window.localStorage.getItem('emailForSignIn');

                // If the email was not found, ask the user to provide it.
                if (!storedEmail) {
                    storedEmail = window.prompt('Please provide your email for confirmation');
                }

                if (!storedEmail) {
                    toast.error("Email not provided. Cannot complete sign-up.");
                    setIsVerifying(false);
                    navigate('/auth');
                    return;
                }

                setEmail(storedEmail); // Set the email state

                try {
                    // Complete the sign-in flow: this authenticates the user
                    // and gives us access to the user object.
                    const result = await signInWithEmailLink(auth, storedEmail, window.location.href);
                    const user = result.user;

                    // You can access the new user information via result.user

                    // Clear email from local storage.
                    window.localStorage.removeItem('emailForSignIn');

                    toast.success("Email verification successful! Please complete your profile.");
                    setShowNewUserForm(true); // Show the NewUserForm after verification
                    setIsVerifying(false);

                } catch (error: any) {
                    toast.error(`Error verifying email: ${error.message}`);
                    setIsVerifying(false);
                    navigate('/auth');
                }
            } else {
                toast.error("Invalid email link. Please try again.");
                setIsVerifying(false);
                navigate('/auth');
            }
        };

        checkEmailLink();
    }, [navigate, auth]);

    if (isVerifying) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <LoadingIcon />
                <p>Verifying email link...</p>
            </div>
        );
    }

    return (
        <>
            {showNewUserForm && email && (
                <div style={{ maxWidth: '600px', margin: '30% auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h1>Complete Your Profile</h1>
                    <p>Please complete the following details to finish creating your account.</p>
                    {/* <NewUserForm */}
                    <FinishUserSignUpForm

                        initialEmail={email}
                        //     onClose={() => {
                        //         setShowNewUserForm(false);
                        //         navigate('/');
                        //     }}
                        //     onProfileUpdate={() => {
                        //         setShowNewUserForm(false);
                        //         navigate('/');
                        //         onSignUpSuccess(); // Trigger success callback
                        //     }}
                        onSignUpSuccess={onSignUpSuccess}
                        onClose={() => navigate('/')}
                    />
                </div>
            )}
        </>
    );
};

UserFinishSignUpPage.displayName = 'UserFinishSignUpPage';

