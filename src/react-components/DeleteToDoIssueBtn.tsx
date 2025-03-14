import * as React from 'react'
import * as Router from 'react-router-dom';

import { TrashIcon } from './icons';
import { MessagePopUp, type MessagePopUpProps } from '../react-components'

import { deleteDocument, deleteProjectWithSubcollections } from '../services/Firebase';

import { ToDoIssue } from '../classes/todoIssue'







export const DeleteToDoIssueBtn(deletedToDoIssue) {

    const navigateTo = Router.useNavigate()
    const [showMessagePopUp, setShowMessagePopUp] = React.useState(false)
    const [messagePopUpContent, setMessagePopUpContent] = React.useState<MessagePopUpProps | null>(null)

    return (
        <div>DeleteToDoIssueBtn</div>
    )
}


todoManager.onToDoIssuedeleted