import * as React from 'react';
import { getAuth, createUserWithEmailAndPassword, updatePassword, updateProfile  } from 'firebase/auth';
import { toast } from 'sonner';
import { firestoreDB } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as Router from 'react-router-dom';
import { User } from '../../classes/User';
import { UserRoleInAppKey } from '../../types';

interface FinishUserSignUpFormProps {
    initialEmail: string;
    onSignUpSuccess: () => void;
    onClose: () => void;
}

export const FinishUserSignUpForm: React.FC<FinishUserSignUpFormProps> = ({ initialEmail, onSignUpSuccess, onClose }) => {
    const [password, setPassword] = React.useState('');
    const [nickName, setNickName] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const navigate = Router.useNavigate();
    const auth = getAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            //const userCredential = await createUserWithEmailAndPassword(auth, initialEmail, password);
            //const user = userCredential.user;
            const user = auth.currentUser;


            if (!user) {
                throw new Error("Authentication session expired. Please try the link again.");
            }

            const userData = {
                uid: user.uid,
                email: initialEmail,
                nickName: nickName,
                firstName: '',
                lastName: '',
                phoneNumber: '',
                phoneCountryNumber: '',
                address: '',
                organization: '',
                roleInApp: 'user' as UserRoleInAppKey,
                status: 'active',
                photoURL: '',
                projectsAssigned: [],
                accountCreatedAt: new Date(),
                lastLoginAt: new Date(),
            };

            //Update the display name (nickname) and pasword
            await updateProfile(user, { displayName: nickName });
            await updatePassword(user, password);

            const newUser = new User(userData);

            // Save additional user information to Firestore
            await setDoc(doc(firestoreDB, "users", user.uid), newUser.toObject());

            toast.success("Your account has been created successfully!");
            onSignUpSuccess();
            onClose();
            navigate('/');

        } catch (error: any) {
            console.error("Error creating user:", error);
            toast.error(`Failed to create user: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2>Complete Your Registration</h2>
            <input
                type="text"
                placeholder="Nickname"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
        </form>
    );
};

FinishUserSignUpForm.displayName = 'FinishUserSignUpForm';
