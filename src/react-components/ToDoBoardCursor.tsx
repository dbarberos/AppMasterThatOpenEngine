import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ToDoIssue } from '../classes/ToDoIssue';

interface Props {
    todo: ToDoIssue | null;
    isVisible: boolean;
    type: 'hover' | 'follow';
}

export function ToDoBoardCursor({ todo, isVisible, type }: Props) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [content, setContent] = useState('');

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({
                x: e.clientX + (type === 'hover' ? 15 : 5),
                y: e.clientY + (type === 'hover' ? 15 : 5)
            });
        };

        if (isVisible) {
            document.addEventListener('mousemove', handleMouseMove);

            // Establecer contenido según el tipo
            if (type === 'hover') {
                setContent('Single click for editing, hold for organize');
            } else if (type === 'follow' && todo) {
                setContent(`Due: ${todo.dueDate.toLocaleDateString()}`);
            }
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isVisible, type, todo]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`custom-cursor ${type}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: position.x,
                        y: position.y
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                >
                    <div className="cursor-content">
                        {content}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}