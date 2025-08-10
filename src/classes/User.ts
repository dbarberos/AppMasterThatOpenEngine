// src/classes/User.ts (o donde prefieras)
import * as  Firestore from 'firebase/firestore';
import type { IUser, IProjectAssignment, UserRoleInAppKey, UserRoleInAppValue, UserStatusKey, UserStatusValue } from '../types'; // Importa IUser desde tu archivo de tipos

interface FirebaseTimestamp {
    seconds: number;
    nanoseconds: number;
}

export class User implements IUser {
    id: string;
    nickName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    phoneCountryNumber?: string;
    organization?: string;
    roleInApp?: UserRoleInAppKey | UserRoleInAppValue;
    photoURL?: string;
    address?: string;
    
    accountCreatedAt: Date;
    lastLoginAt?: Firestore.Timestamp | Date;
    status: UserStatusKey | UserStatusValue

    projectsAssigned: IProjectAssignment[];
    // Nuevas propiedades
    descriptionUser?: string;


    constructor(data: Partial<IUser>, idString?: string) {
        // Prioriza idString, luego data.id, y finalmente un string vacío.
        // Es crucial que un usuario siempre tenga un ID.
        this.id = idString || data.id || '';
        if (!this.id) {
            console.warn("User created without an ID.");
        }

        // Asignación explícita para mayor seguridad y claridad
        this.nickName = data.nickName || '';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.email = data.email || '';
        this.status = data.status || 'pending';

        // Campos opcionales que pueden ser undefined
        this.descriptionUser = data.descriptionUser;
        this.phoneNumber = data.phoneNumber;
        this.phoneCountryNumber = data.phoneCountryNumber;
        this.organization = data.organization;
        this.roleInApp = data.roleInApp;
        this.photoURL = data.photoURL;
        this.address = data.address;

        // Campos de fecha con parseo robusto
        this.accountCreatedAt = this.parseAndValidateDate(data.accountCreatedAt);
        this.lastLoginAt = data.lastLoginAt ? this.parseAndValidateDate(data.lastLoginAt) : undefined;

        // Asegura que `projectsAssigned` sea siempre un array para evitar errores.
        this.projectsAssigned = Array.isArray(data.projectsAssigned) ? data.projectsAssigned : [];
    }

    private parseAndValidateDate(rawValue: any): Date {
        if (!rawValue) {
            // Devuelve una fecha por defecto si el valor es null, undefined, o un string vacío.
            return new Date();
        }

        if (rawValue instanceof Firestore.Timestamp) {
            return rawValue.toDate();
        }

        if (rawValue instanceof Date) {
            // Si ya es una fecha, comprueba si es válida.
            return isNaN(rawValue.getTime()) ? new Date() : rawValue;
        }

        // Maneja objetos planos de la deserialización de JSON (ej: de localStorage)
        if (typeof rawValue === 'object' && rawValue.seconds !== undefined && rawValue.nanoseconds !== undefined) {
            return new Firestore.Timestamp(rawValue.seconds, rawValue.nanoseconds).toDate();
        }

        // Maneja strings o números
        if (typeof rawValue === 'string' || typeof rawValue === 'number') {
            const dateValue = new Date(rawValue);
            // Devuelve una fecha por defecto si el parseo falla.
            return isNaN(dateValue.getTime()) ? new Date() : dateValue;
        }

        // Fallback para cualquier otro tipo.
        return new Date();
    }
    
    // // Método para convertir a objeto plano si es necesario para guardar en DB o cache
    // // Especialmente útil para serializar fechas a string ISO
    // toPlainObject(): Omit<IUser, 'accountCreatedAt' | 'lastLoginAt'> & { accountCreatedAt: string; lastLoginAt: string; id: string; } {
    //     return {
    //         id: this.id,
    //         nickName: this.nickName,
    //         firstName: this.firstName,
    //         lastName: this.lastName,
    //         email: this.email,
    //         phoneNumber: this.phoneNumber,
    //         phoneCountryNumber: this.phoneCountryNumber,
    //         organization: this.organization,
    //         roleInApp: this.roleInApp,
    //         photoURL: this.photoURL,
    //         address: this.address,
    //         descriptionUser: this.descriptionUser,
    //         accountCreatedAt: this.accountCreatedAt.toString(),
    //         lastLoginAt: this.lastLoginAt?.toString(),
    //         status: this.status,
    //         projectsAssigned: this.projectsAssigned,
    //     };
    // }


}