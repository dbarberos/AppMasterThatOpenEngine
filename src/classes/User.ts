// src/classes/User.ts (o donde prefieras)
import * as  Firestore from 'firebase/firestore';
import type { IUser, IProjectAssignment, IUserPermissions, IUserProjectRole, UserRoleInAppKey, UserRoleInAppValue, UserStatusKey, UserStatusValue } from '../types.d.ts'; // Importa IUser desde tu archivo de tipos



export class User implements IUser {
    id: string;
    nickName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    phoneCountryNumber?: string;
    organization?: string;
    roleInApp?: UserRoleInAppKey | UserRoleInAppValue // Puedes usar un enum si lo prefieres
    photoURL?: string;
    address?: string;

    accountCreatedAt: Firestore.Timestamp | Date;
    lastLoginAt?: Firestore.Timestamp | Date;
    status: UserStatusKey | UserStatusValue

    projectsAssigned: IProjectAssignment[] = [] 
    // Nuevas propiedades
    descriptionUser?: string;


    constructor(data: Partial<IUser>, idString?: string) {
        for (const key in data) {

            if (key === "accountCreatedAt") {
                this[key] = this.parseAndValidateDate(data[key]);
            } else if (key === "lastLoginAt") {
                this[key] = data[key] ? this.parseAndValidateDate(data[key]) : undefined;
            } else if (key === "status") {
                this[key] = data[key] || 'pending'; // Valor por defecto si no se proporciona
            } else if (key === "projectsAssigned") {
                this.projectsAssigned = Array.isArray(data.projectsAssigned) ? data.projectsAssigned : [];
            } else {
                this[key] = data[key] ?? '';
            }

        
        }

        if (idString) {
            this.id = idString
        } 
    }




    private parseAndValidateDate(rawValue: any): Date {
            let dateValue: Date;
    
            if (rawValue instanceof Firestore.Timestamp) {
                return rawValue.toDate();        }
    
            if (rawValue instanceof Date) {
                dateValue = rawValue;
            } else if (rawValue instanceof Firestore.Timestamp) {
                dateValue = rawValue.toDate();
            } else if (typeof rawValue === 'string' || typeof rawValue === 'number') {
                // Intentar parsear, incluso strings vacíos (que darán Invalid Date)
                if (typeof rawValue === 'string' && rawValue.trim() === '') {
                    dateValue = new Date(NaN); // Forzar Invalid Date para strings vacíos
                } else {
                    dateValue = new Date(rawValue);
                }
            } else {
                // Para null, undefined u otros tipos, forzar Invalid Date
                dateValue = new Date(NaN);
            }
    
            // Validación final: si es inválida, usar fecha actual
            return isNaN(dateValue.getTime()) ? new Date() : dateValue;
        }
}