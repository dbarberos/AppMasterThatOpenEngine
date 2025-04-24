import * as React from 'react';
//import * as Router from 'react-router-dom';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChatBubbleIcon, DragIndicatorIcon, FlagIcon } from './icons';

import { ToDoIssue } from '../classes/ToDoIssue';
//import { Project } from '../classes/Project';

interface Props {   
    toDoIssue: ToDoIssue
    onClickOpenToDoDetailsWindow: (todoIssue: ToDoIssue) => void
    isSortable?: boolean; // <-- NUEVA PROP: Indica si la tarjeta debe ser sorteable
}
interface Tag {
    title: string
}

export function ToDoCard({ toDoIssue, onClickOpenToDoDetailsWindow, isSortable = false }: Props) {


    // --- Lógica de dnd-kit (condicional) ---
    const {
        attributes,
        listeners, // Estos son los listeners para el drag handle
        setNodeRef,
        transform,
        transition,
        isDragging // Útil para estilizar mientras se arrastra
    } = useSortable({
        id: toDoIssue.id,
        disabled: !isSortable // <-- Deshabilita el hook si no es sorteable
    });
    
    // Estilos para dnd-kit (solo si es sorteable)
    const sortableStyle: React.CSSProperties = isSortable ?{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 10 : 'auto',
        userSelect: 'none',// Evita selección de texto al arrastrar
        // Asegúrar que el elemento pueda ser posicionado (ej. position: 'relative') si es necesario
    } : {}; // Objeto vacío si no es sorteable
    
    
    // Props para el drag handle (solo si es sorteable)
    const dragHandleProps = isSortable ? listeners : undefined;
    

    // Console.log wrapped in useEffect
    React.useEffect(() => {
        console.log('ToDoCard rendering with:', toDoIssue);
    }, [toDoIssue]);
    

    const handleClickOverToDoCard = React.useCallback((event: React.MouseEvent) => {
        event.preventDefault(); // Evita el comportamiento por defecto del click
        // Evita abrir detalles si se está interactuando con el drag handle
        const target = event.target as HTMLElement;
        if (target.closest('.handler-move')) {
            return;
        }
        onClickOpenToDoDetailsWindow(toDoIssue);
    }, [toDoIssue, onClickOpenToDoDetailsWindow]);



    // Convert Firebase timestamp to Date object
    const formatDueDate = (date: Date | string |number|undefined) => {
        if (!date) return 'No date set';

        try {
            const dateObj = date instanceof Date
                ? date: typeof date ==='number'
                ? new Date(date)
                : new Date(date);

            if (isNaN(dateObj.getTime())) {
                console.error('Invalid date:', date);
                return 'Invalid date';
            }

            return dateObj.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).replace(/\//g, "-");

        } catch (error) {
            console.error('Error formatting date:', date, error);
            return 'Error formatting date'            
        }
    }

    // Get the formatted date string
    const formattedDate = React.useMemo(() =>{
        return formatDueDate(toDoIssue.dueDate);
        }, [toDoIssue.dueDate]);

    const todoTagsList = toDoIssue.tags?.map((tag, index) => (
        <span key={index} className="todo-tags">
            {typeof tag === 'object' && tag !== null &&'title' in tag
                ? (tag as Tag).title
                : String(tag)}
        </span>)) || []; // Default to empty array if undefined


    return (
        // El div exterior es el nodo sorteable
        <div
            ref={isSortable ? setNodeRef : undefined} // <-- Aplica ref condicionalmente
            style={sortableStyle} // <-- Aplica estilos sorteables
            
            className="todo-item"
            onClick={handleClickOverToDoCard}
            {...(isSortable ? attributes : {})} // <-- Aplica atributos sorteables
        >
            <div
                className="todo-color-column"
                style={{ backgroundColor: toDoIssue.backgroundColorColumn }}
            />
            <div
                className="todo-card"
                style={{
                display: "flex",
                flexDirection: "column",
                borderLeftColor: toDoIssue.backgroundColorColumn
                }}
            >
                <div className="todo-taks">
                    <div className="todo-tags-list">
                        {todoTagsList} {/* Array of JSX elements */}
                    </div>
                    {/* Botón Drag Handle: aplica listeners condicionalmente */}
                    <button
                        {...dragHandleProps} // <-- Aplica listeners sorteables
                        className="todo-task-move handler-move"
                        style={{
                            cursor: isSortable ? (isDragging ? 'grabbing' : 'grab') : 'auto', // Cursor solo si es sorteable
                            touchAction: isSortable ? 'none' : 'auto' // Mejora experiencia táctil
                        }}
                        // Evita que el click en el handle propague al onClick de la card
                        onClick={(e) => e.stopPropagation()}
                        aria-label={isSortable ? "Drag ToDo Item" : undefined} // Accesibilidad
                        disabled={!isSortable} // Deshabilita si no es sorteable
                        title={isSortable ? "Drag to reorder" : ""}
                    >
                        <DragIndicatorIcon size={24} className="todo-icon" color="var(--color-fontbase)" />                        
                    </button>
                </div>
                <div className="todo-title">
                <h5
                    style={{
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    marginLeft: 15
                    }}
                >
                    {toDoIssue.title}
                </h5>
                </div>
                <div className="todo-stats">
                    <span
                        style={{ textWrap: "nowrap", marginLeft: 10 }}
                        className="todo-task-move"
                    >
                        <FlagIcon size={24} className="todo-icon" color="var(--color-fontbase)" />
                        {formattedDate}
                    </span>
                    <span
                        style={{ textWrap: "nowrap", marginLeft: 5 }}
                        className="todo-task-move"
                    >
                        <ChatBubbleIcon size={24} className="todo-icon" color="var(--color-fontbase)" />
                        {`${toDoIssue.assignedUsers.length || 0 }`} assigned
                    </span>
                    <span
                        className="todo-task-move todo-tags"
                        style={{
                            textWrap: "nowrap",
                            marginLeft: 5,
                            color: "var(--color-fontbase) !important",
                            backgroundColor: `${toDoIssue.backgroundColorColumn}`,
                            fontSize: "var(--font-base)"
                        }}
                    >
                        {`${ToDoIssue.getStatusColumnText(toDoIssue.statusColumn || "Not Assigned")}`}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Add display name for debugging purposes
ToDoCard.displayName = 'ToDoCard'
