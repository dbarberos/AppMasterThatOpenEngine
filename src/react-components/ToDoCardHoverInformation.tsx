import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { QuillEditor } from './QuillEditor';
import { ToDoIssue } from '../classes/ToDoIssue';

interface Props {
    todo: ToDoIssue;
    isVisible: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    isDragging?: boolean;
}


export function ToDoCardHoverInformation({ todo, isVisible, containerRef, isDragging = false }: Props) {
    const [position, setPosition] = React.useState({
        top: 0,
        left: 0,
        placement: 'bottom' as 'top' | 'bottom' 
    });
    // NEW STATE: Track if the position has been calculated at least once, for avoid pre-render initial flicker
    // This is useful to avoid flickering when the component is first rendered
    const [isPositionCalculated, setIsPositionCalculated] = React.useState(false);


    // Add ResizeObserver ref for accurate height measurements
    const bannerRef = React.useRef<HTMLDivElement>(null);
    const [bannerHeight, setBannerHeight] = React.useState(0);

    
    // Setup ResizeObserver for accurate height measurements
    React.useEffect(() => {
        if (!bannerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            const height = entries[0]?.contentRect.height ?? 0;
            setBannerHeight(height);
        });

        resizeObserver.observe(bannerRef.current);
        return () => resizeObserver.disconnect();
    }, []);




    React.useEffect(() => {
        // Check if containerRef exists and has current
        if (!containerRef?.current || !isVisible || isDragging) {
            setIsPositionCalculated(false)
            return;
        }

        const updatePosition = () => {
            try {
                const cardRect = containerRef.current?.getBoundingClientRect();
                if (!cardRect) return;
    
                const windowHeight = window.innerHeight;
                const spaceBelow = windowHeight - cardRect.bottom;
                const spaceAbove = cardRect.top;
                const safetyMargin = 300; // Safety margin
                const visualGap = 16; // Desired visual gap between card and banner
                const actualHeight = bannerHeight || calculateBannerHeight(todo);
                
                // Determine if there's enough space below considering safety margin
                const shouldShowBelow = (spaceBelow >= actualHeight + safetyMargin) || 
                                    (spaceBelow >= spaceAbove && spaceBelow >= safetyMargin);
                                    
    
                setPosition({
                    top: shouldShowBelow 
                        ? cardRect.bottom + window.scrollY + visualGap // Position banner's TOP visualGap px BELOW card's bottom
                        : cardRect.top + window.scrollY - visualGap, // Position banner's BOTTOM visualGap px ABOVE card's top
                    left: cardRect.left + window.scrollX,
                    placement: shouldShowBelow ? 'bottom' : 'top'                    
                });
                setIsPositionCalculated(true);
            } catch (error) {
                console.error('Error calculating banner position:', error);
            }
        }

        // Use RAF for smooth updates
        let rafId: number;
        const smoothUpdate = () => {  
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updatePosition);
        };

        smoothUpdate(); // Calculate position immediately when visible/not dragging
        window.addEventListener('scroll', smoothUpdate);
        window.addEventListener('resize', smoothUpdate);

        return () => {
            window.removeEventListener('scroll', smoothUpdate);
            window.removeEventListener('resize', smoothUpdate);
            cancelAnimationFrame(rafId);
            setIsPositionCalculated(false)
        };
    }, [isVisible, containerRef, isDragging, todo, bannerHeight]);
        



// Función auxiliar para estimar altura del banner
const calculateBannerHeight = (todo: ToDoIssue): number => {
    let height = 0;
    
    // Base padding 
    height += 20; // Padding top/bottom

    // User origin height - kept reasonable
    if (todo.todoUserOrigin) height += 30;

    // Assigned users height - kept original calculation
    if (todo.assignedUsers?.length) {
        height += 30 + Math.ceil(todo.assignedUsers.length / 3) * 25;
    }

    // Description height
    if (todo.description) {
        const lines = todo.description.split('\n').length;
        height += 30 + lines * 20;
    }

    // Altura para el texto de ayuda
    height += 40;

    return height;
};



    if (!isVisible || !containerRef?.current || isDragging) return null;




    return ReactDOM.createPortal(
        
            
        <div
            className={`todo-hover-banner ${position.placement}`}
            aria-label={`Additional details for ${todo.title}`}
            data-visible={isVisible}
            style={{
                position: 'fixed',
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 1500,

                transform: position.placement === 'top' 
                    ? 'translateY(-100%)' // Move banner up by its full height to align its bottom with top
                    : 'translateY(0)', // No additional translation needed if top is correct
                
                opacity: isPositionCalculated ? 1 : 0, 
                transition: 'opacity 0.2s ease, transform 0.2s ease',


                background: 'var(--color-tododetails-bg)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)', // For Safari support

                height: 'auto', // Let the height adapt to content
                maxHeight: 'none',      // Eliminar cualquier restricción de altura máxima
                minHeight: 'auto',      // Cambiado de '150px' a 'auto'
                border: `3px solid ${todo.backgroundColorColumn}`,
                display: 'flex',        // Añadido para mejor control del layout
                flexDirection: 'column',
                overflow: 'visible',     // Asegurar que no hay scroll
                pointerEvents: 'none', // Prevent interaction with the banner itself
            }}
        >
            {todo.todoUserOrigin && (
                <div className="banner-section">
                    <span className="banner-label">Created by:</span>
                    <span className="banner-value">{todo.todoUserOrigin}</span>
                </div>
            )}
            
            {Array.isArray(todo.assignedUsers) && todo.assignedUsers.length > 0 && (
                <div className="banner-section">
                    <span className="banner-label">Assigned to:</span>
                    <div className="banner-users">
                    {todo.assignedUsers.map((user, index) => (
                        <React.Fragment key={user.id}>
                            <span className="user-tag">
                                {user.name}
                            </span>
                            {index < todo.assignedUsers.length - 1 && (
                                <span className="user-separator">, </span>
                            )}
                        </React.Fragment>
            ))}
                    </div>
                </div>
            )}
            
            {todo.description && (
                <div className="banner-section">
                    <span className="banner-label">Description:</span>
                    <div
                        className="banner-description"
                        style={{
                            maxHeight: 'none',    // Asegurar que el editor no tenga límite
                            overflow: 'visible'
                        }}
                    >
                        <QuillEditor
                            initialValue={todo.description}
                            readOnly={true}
                            onContentChange={() => { }}                            
                        />
                    </div>
                </div>
            )}

            <div className="banner-section" style={{
                // borderTop: '1px solid var(--color-border)',
                // marginBottom: '2px',
                padding: '4px',
                fontSize: 'var(--font-base)',
                color: 'var(--color-fontbase-dark)',
                opacity: 0.8,
                textAlign: 'center'
            }}>
                Click on the card to edit content
            </div>


        </div>, document.body
    );
}


// Add display name for debugging purposes
ToDoCardHoverInformation.displayName = 'ToDoCardHoverInformation'


//https://www.joshwcomeau.com/snippets/react-components/in-portal/
//InPortal_React Portals_ToDoCardHoverInformation aparecera junto al ToDoCard en pantalla y por encima de todo lo demás. Las restricciones de los elementos padres me estan volviendo loco, por eso uso un Portal.
//Un Portal te permite renderizar un componente hijo en un nodo DOM diferente, fuera de la jerarquía del componente padre. Normalmente, se renderiza directamente en document.body