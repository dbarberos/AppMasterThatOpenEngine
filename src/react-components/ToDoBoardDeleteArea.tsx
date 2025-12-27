import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';

import { TrashIcon } from './icons';


interface Props {
    isVisible: boolean;
    style?: React.CSSProperties;
}

export function ToDoBoardDeleteArea({ isVisible, style }: Props) {

    const { setNodeRef, isOver } = useDroppable({
        id: 'delete-zone',
        data: {
            type: 'deleteZone',
            isEmpty: true
        }
    });

    return (
            
        <motion.div
            ref={setNodeRef}

            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.95 
            }}
            exit={{ opacity: 0, scale: 0.95 }}

            className={`delete-zone ${isOver ? 'can-drop' : ''}`}
            style={{
                opacity: isOver ? 0.5 : 1,
                backgroundColor: isOver
                ? 'rgba(var(--primary-200-rgb), 0.5)' // 0.5 es la opacidad
                : 'rgba(var(--primary-400-rgb), 0.1)',
                //backgroundColor: isOver ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                border: `2px dashed ${isOver ? 'var(--color-error)' : 'rgba(0, 0, 0, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                cursor: 'default',
                minWidth: '160px',
                ...style // Permitir override de estilos
            }}
        >
            <TrashIcon
            size={30}
            className={`todo-icon-plain ${isOver ? 'text-error' : ''}`}
            color={isOver ? 'var(--color-error)' : 'var(--color-fontbase)'}
            />
            <span 
                className={`delete-zone-text ${isOver ? 'text-error' : ''}`}
                style={{ 
                    fontSize: '0.9rem',
                    userSelect: 'none'
                }}
            >
                Drop here to delete
            </span>
            {isOver && (
                <motion.div 
                    className="delete-confirmation-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
                
            

        </motion.div >
            
        
    )
}
