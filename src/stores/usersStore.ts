import create from 'zustand';
import { IUser } from '../types';

interface UserFormState {
  isUserFormOpen: boolean;
  userToEdit: IUser | null;
  openUserForm: (user?: IUser | null) => void;
  closeUserForm: () => void;
}

export const useUserFormStore = create<UserFormState>((set) => ({
  isUserFormOpen: false,
  userToEdit: null,
  openUserForm: (user = null) => set({ isUserFormOpen: true, userToEdit: user }),
  closeUserForm: () => set({ isUserFormOpen: false, userToEdit: null }),
}));