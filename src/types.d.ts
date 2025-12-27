import * as Firestore from 'firebase/firestore'


import { TODO_STATUSCOLUMN } from './const'
import { USER_STATUS, USER_ROL_IN_APP, USER_ROLES_IN_PROJECT, USER_PERMISSIONS } from './const'

export type StatusColumnValue = typeof TODO_STATUSCOLUMN[keyof typeof TODO_STATUSCOLUMN] 
export type StatusColumnKey = keyof typeof TODO_STATUSCOLUMN
export interface IStatusColumn {
    StatusColumnValues : typeof TODO_STATUSCOLUMN [keyof typeof TODO_STATUSCOLUMN]
}


export type UserStatusValue = typeof USER_STATUS[keyof typeof USER_STATUS]
export type UserStatusKey = keyof typeof USER_STATUS

export type UserRoleInAppValue = typeof USER_ROL_IN_APP[keyof typeof USER_ROL_IN_APP]
export type UserRoleInAppKey = keyof typeof USER_ROL_IN_APP
export type UserRoleInProjectKey = keyof typeof USER_ROLES_IN_PROJECT;

export type UserPermissionKey = keyof typeof USER_PERMISSIONS;


export interface ITag {
    id: string
    title: string
    createdAt: Date | string | number | Firestore.Timestamp
}

export interface IAssignedUsers {
    id: string
    name: string
    createdAt: Date | string | number | Firestore.Timestamp
}

interface FirebaseTimestamp {
    seconds: number;
    nanoseconds: number;
}


export interface IToDoIssue {
    title: string
    description: string
    statusColumn?: StatusColumnKey
    tags: ITag[]
    assignedUsers: IAssignedUsers[]
    dueDate: Date | string | number | Firestore.Timestamp
    todoProject: string // ID del proyecto al que pertenece
    createdDate: Date | string | number | Firestore.Timestamp
    todoUserOrigin: string // ID o nombre del usuario creador
    id?: string // ID de Firebase
    backgroundColorColumn?: string
    sortOrder: number;
}

export interface IUser {
    id: string; // UID de Firebase Auth
    nickName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    phoneCountryNumber?: string;

    organization?: string;
    roleInApp?: UserRoleInAppKey | UserRoleInAppValue; // Rol general en la aplicación
    photoURL?: string;
    address?: string;

    accountCreatedAt: FirebaseTimestamp | Date; // Firestore usa Timestamp, al leer puede ser Date
    lastLoginAt?: FirebaseTimestamp | Date;
    status: UserStatusKey | UserStatusValue; // Estado del usuario: activo, pendiente, deshabilitado
    // La subcolección 'projectsAssigned' se manejará por separado o se podría cargar bajo demanda.
    projectsAssigned?: IProjectAssignment[]; // Opcional si decides cargarla siempre con el usuario
    descriptionUser?: string
}

export interface IProjectAssignment {
    id?: string; // ID único del documento de asignación, generado por Firebase
    projectId: string;
    projectName?: string;
    roleInProject: UserRoleInProjectKey | ''; // Usamos la clave del rol, permitiendo un string vacío para el estado inicial
    permissions: UserPermissionKey[];
    assignedDate: Date;
}


// export interface IUserProjectRole {
//     name: typeof USER_ROLES_IN_PROJECT[keyof typeof USER_ROLES_IN_PROJECT];
//     createdAt: Firestore.Timestamp | Date; // Fecha en que se creó el rol
//     description?: string; // Descripción opcional del rol
// }

declare global {
    interface Array<T> {
        toSorted(compareFn?: (a: T, b: T) => number): T[]
    }
}