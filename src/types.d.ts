import * as Firestore from 'firebase/firestore'


import { TODO_STATUSCOLUMN } from './const'


export type StatusColumnValue = typeof TODO_STATUSCOLUMN[keyof typeof TODO_STATUSCOLUMN] 

export type StatusColumnKey = keyof typeof TODO_STATUSCOLUMN

export interface IStatusColumn {
    StatusColumnValues : typeof TODO_STATUSCOLUMN [keyof typeof TODO_STATUSCOLUMN]
}

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


export interface IToDoIssue {
    title: string
    description: string
    statusColumn?: StatusColumnKey
    tags: ITag[]
    assignedUsers: IAssignedUsers[]
    dueDate: Date | string | number | Firestore.Timestamp
    todoProject: string
    createdDate: Date | string | number | Firestore.Timestamp
    todoUserOrigin: string
    id?: string
    backgroundColorColumn?: string
}