import * as React from 'react';
//import * as Router from 'react-router-dom';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChatBubbleIcon, DragIndicatorIcon, FlagIcon } from './icons';

import { ToDoIssue } from '../classes/ToDoIssue';
//import { Project } from '../classes/Project';

interface Props {   
    toDoIssue: ToDoIssue    
    isSortable?: boolean; // <-- NUEVA PROP: Indica si la tarjeta debe ser sorteable
    isDndEnabled: boolean;
    onClickOpenToDoDetailsWindow: (todoIssue: ToDoIssue) => void
}
interface Tag {
    title: string
}

export function ToDoCard({ toDoIssue, onClickOpenToDoDetailsWindow, isSortable = false, isDndEnabled }: Props) {


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
            disabled: !isSortable || !isDndEnabled, // <-- Deshabilita el hook si no es sorteable
        data: {
            todo: toDoIssue,
            type: 'ToDoItem',
            columnId: toDoIssue.statusColumn
        } //Pasa el objeto toDoIssue completo en data.current.todo. Esto es crucial para onDragStart y el Overlay.
    });

    // --- DEBUGGING ---
    console.log(`ToDoCard [${toDoIssue.id}] Props & Sortable State:`, {
        isDndEnabledProp: isDndEnabled, // Prop recibida
        isSortableProp: isSortable,     // Prop recibida
        useSortableIsDisabled: !isSortable || !isDndEnabled, // Cálculo de disabled para useSortable
        isDraggingHook: isDragging      // Estado de isDragging del hook useSortable
    });
    
    // Estilos para dnd-kit (solo si es sorteable)
    const sortableStyle: React.CSSProperties = isSortable ?{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        // cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 10 : 'auto',
        //userSelect: 'none',// Evita selección de texto al arrastrar       

        // Asegúrar que el elemento pueda ser posicionado (ej. position: 'relative') si es necesario
    } : {}; // Objeto vacío si no es sorteable

 

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
            // Aplicamos estilos sorteables y un cursor por defecto si no se está arrastrando
            style={{
                ...sortableStyle,
                cursor: isDragging ? 'grabbing' : (isSortable ? 'pointer' : 'default'), // Ajusta según necesite
                position: 'relative', // Necesario para el pseudo-elemento
                //overflow: 'hidden'    // Necesario para el pseudo-elemento
            }}
            
            // {...attributes}
            // {...(isSortable ? listeners : {})}

            {...(isSortable ? attributes : {})} // Apply attributes only if sortable
            className={`todo-item ${isDragging ? 'todo-item--dragging' : ''}`}// Usar isDragging para estilizar
            onClick={handleClickOverToDoCard}
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
                    {/* Botón Drag Handle: aplica combined listeners condicionalmente */}
                    <button
                        {...(isSortable ? listeners : {})} // Aplicar listeners de dnd-kit directamente si es sorteable
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
                        // Añadir onPointerUp aquí también para asegurar limpieza si se suelta sobre el botón
                        // onPointerUp={handlePointerUp} No es necesario porque ahora se gestino global en window
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
                            whiteSpace: "nowrap",
                            margin: 5,
                            marginTop: 15,
                            marginBottom:10,
                            color: "var(--color-fontbase) !important",
                            textShadow:` 
                                -2px 2px 1px var(--background-300),
                                2px -2px 1px var(--background-300),
                                -2px -2px 1px var(--background-300),
                                0px 2px 1px var(--background-300),
                                0px -2px 1px var(--background-300),
                                2px 0px 1px var(--background-300),
                                -2px 0px 1px var(--background-300) `, 
                            backgroundColor: `${toDoIssue.backgroundColorColumn}`,
                            fontSize: "var(--font-base)"
                        }}
                    >
                        {`${ToDoIssue.getStatusColumnText(toDoIssue.statusColumn || "Not Assigned")}`}
                    </span>
                </div>
            </div>
            {/* Removida la indicación visual de isDragActivating para simplificar */}
            {/* {isDragActivating && (
                <motion.div
                    className="hold-progress"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.25, ease: "linear" }}
                />
            )} */}
        </div>
    )
}

// Add display name for debugging purposes
ToDoCard.displayName = 'ToDoCard'

