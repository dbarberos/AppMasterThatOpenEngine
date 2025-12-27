import * as React from 'react';
import { ToDoIssue } from '../classes/ToDoIssue';
import { ITag, IAssignedUsers } from '../Types';


export interface IToDoFieldArrayRef {
    handleSave: () => void;
    handleCancel: () => void;
}

//type ArrayFieldType = 'tags' | 'assignedUsers';
type ItemType = ITag | IAssignedUsers;

interface ToDoFieldArrayProps {
    fieldName: keyof Pick<ToDoIssue, 'tags' | 'assignedUsers'>;
    value: ItemType[];
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onSave: (value: ItemType[]) => void;
    onCancel: () => void;

    placeholder?: string;
    //arrayRef?: React.RefObject<HTMLDivElement>;
    onInvalid?: () => void;
    setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    isValid: boolean;
}

export const ToDoFieldArray = React.forwardRef<
    {
        handleSave: () => void;
        //handleCancel: () => void;
        setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
    },
    ToDoFieldArrayProps
>(({
    fieldName,
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel,
    placeholder,
    onInvalid,
    setIsValid,
    isValid,
    //arrayRef
}, ref) => {
    //console.log('ToDoFieldArray render:', { fieldName, value, isEditing })


    // const [items, setItems] = React.useState<ItemType[]>(() => {
    //     return Array.isArray(value) ? [...value] : [];
    // });
    // El estado 'items' se inicializa con la prop, pero se sincronizará con el useEffect.
    const [items, setItems] = React.useState<ItemType[]>(Array.isArray(value) ? [...value] : []);
    const [newItem, setNewItem] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const originalItems = React.useRef<ItemType[]>(value || []);
    const containerRef = React.useRef<HTMLDivElement>(null);


    // Type guards
    const isTag = (item: ItemType): item is ITag => 'title' in item
    const isAssignedUser = (item: ItemType): item is IAssignedUsers => 'name' in item

    // // Sync with external value and store original state
    // React.useEffect(() => {
    //     console.log('🔄 ToDoFieldArray - Value Sync:', {
    //         fieldName,
    //         value,
    //         isEditing,
    //         originalItems: originalItems.current,
    //         valueType: typeof value,
    //         valueIsArray: Array.isArray(value),
    //     });

    //     // Store original items only when editing starts
    //     if (!isEditing && Array.isArray(value)) {
    //         setItems([...value])
    //         originalItems.current = [...value];
    //         setIsValid(false)
    //     }
    // }, [value, isEditing])

    // REFACTORIZACIÓN CLAVE: Sincronizar siempre el estado interno con la prop 'value'.
    // Cuando el padre actualice el ToDo, esta prop cambiará y forzará el re-renderizado del hijo con los datos correctos.
    React.useEffect(() => {
        console.log(`[ToDoFieldArray: ${fieldName}] 🔄 Sincronizando estado interno con la prop 'value'.`, { newValue: value });
        setItems(Array.isArray(value) ? [...value] : []);
    }, [value, fieldName]);




    //Handle focus when editing starts
    React.useEffect(() => {
        console.log('ToDoFieldArray: Focus effect triggered:', { isEditing, inputRef: inputRef.current })
        if (isEditing && inputRef.current) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [isEditing]);



    // Add handler for external save functionality
    //const handleSave = async () => {
    const handleSave = React.useCallback(async() => {        
        console.log('💾 ToDoFieldArray - Pre-Save:', {
            fieldName,
            currentItems: items,
            newItem,
            originalItems: value,
            isSaving
        });
        if (isSaving) return;

        try {
            setIsSaving(true);


            // Validate changes
            const hasChanges = !areArraysEqual(items, value);


            if (!hasChanges) {
                console.warn("ToDoFieldArray: No changes detected");
                setIsValid(false);
                return;
            }

            // if (items.length === 0 ) {
            //     console.warn("ToDoFieldArray: Cannot save empty array");
            //     setIsValid(false);
            //     return;
            // }

            console.log("ToDoFieldArray: handleSave - calling onSave", {
                finalItems: items,
                originalItems: value
            });


            // Create new array with current items
            const currentItemsArray = [...items]

            // Add pending item if exists
            const finalItems = newItem.trim()
                ? [...currentItemsArray, createNewItem(newItem.trim())]
                : currentItemsArray;


            console.log('💾 ToDoFieldArray - Save Attempt:', {
                fieldName,
                finalItems,
                finalItemsType: typeof finalItems,
                isArray: Array.isArray(finalItems)
            })
            
            
            
            
            // Validate changes


            // const areArraysEqual =
            //     Array.isArray(value) &&
            //     Array.isArray(finalItems) && 
                
            //     finalItems.length === value.length &&
            //     finalItems.every((item, index) => {
            //         const valueItem = value[index];
            //         if (isTag(item) && isTag(valueItem)) {
            //             return item.title === valueItem.title;
            //         }
            //         if (isAssignedUser(item) && isAssignedUser(valueItem)) {
            //             return item.name === valueItem.name;
            //         }
            //         return false;
            //     });

            // if (areArraysEqual) {
            //     console.warn("ToDoFieldArray: handleSave - Arrays are identical");
            //     setIsValid(false);
            //     return;
            // }

            // if (finalItems.length === 0) {
            //     console.warn("ToDoFieldArray: handleSave - Cannot save empty array");
            //     setIsValid(false);
            //     return;
            // }

            console.log("ToDoFieldArray: handleSave - calling onSave", { finalItems });
            await onSave(finalItems);

            originalItems.current = finalItems;
            setItems(finalItems);
            setNewItem('');
            setIsEditing(false);
            setIsValid(false);

        } catch (error) {
            console.error('❌ ToDoFieldArray - Save Error:', {
                fieldName,
                error,
                items,
                originalItems: originalItems.current
            });
            console.error('Error saving array field:', error);
            setItems(originalItems.current);
            setIsValid(false);
            onInvalid?.();
        } finally {
            setIsSaving(false);
        }


    //}

    }, [onSave, items, newItem, value]);



    // Cancel handler
    const handleCancel = React.useCallback(() => {
        console.log('ToDoFieldArray: handleCancel:', { originalItems: originalItems.current });
        // Restore original items
        setItems(originalItems.current);
        // Clear any new item being entered
        setNewItem('');
        setIsValid(false);
        setIsEditing(false);
        // Notify parent with original values
        onSave(originalItems.current)
        //onCancel?.();
    }, [onSave, onCancel])

    // Expose handlers through ref
    React.useImperativeHandle(ref, () => ({
        handleSave,
        handleCancel,
        setIsValid
    }), [handleSave, handleCancel, setIsValid, setIsEditing]);


    // // Add handler for external cancel
    // const handleExternalCancel = React.useCallback(() => {
    //     console.log('Handling cancel:', { originalItems: originalItems.current })
    //     // Restore original items
    //     setItems(originalItems.current)
    //     // Clear any new item being entered
    //     setNewItem('')
    //     // Notify parent with original values
    //     onSave(originalItems.current)
    // }, [onSave])


    // // Connect handlers to ref
    // React.useImperativeHandle(ref, () => ({
    //     handleSave: () => {
    //         console.log('Imperative save:', {
    //             currentItems: items,
    //             originalItems: originalItems.current
    //         });
    //         handleExternalSave()
    //         setIsEditing(false)
    //     },
    //     handleCancel: () => {
    //         console.log('Imperative cancel:', {
    //             currentItems: items,
    //             originalItems: originalItems.current
    //         });
    //         handleExternalCancel()
    //         setIsEditing(false)
    //     }
    // }), [handleExternalSave, handleExternalCancel, setIsEditing, items])




    // React.useEffect(() => {
    //     console.log('Items state changed:', { items, isEditing });
    // }, [items, isEditing]);



    // Helper for comparing arrays
    const areArraysEqual = (array1: ItemType[], array2: ItemType[]): boolean => {
        if (array1.length !== array2.length) return false;

        return array1.every((item1) => {
            return array2.some((item2) => {
                if (isTag(item1) && isTag(item2)) {
                    return item1.id === item2.id && item1.title === item2.title;
                }
                if (isAssignedUser(item1) && isAssignedUser(item2)) {
                    return item1.id === item2.id && item1.name === item2.name;
                }
                return false;
            });
        });
    };


    const createNewItem = (text: string): ItemType => {
        console.log('🆕 ToDoFieldArray - Creating Item:', {
            fieldName,
            text,
            timestamp: Date.now()
        });

        const baseItem = {
            id: `temp-${Date.now()}-${text}`,
            createdAt: new Date()
        };

        if (fieldName === 'tags') {
            return { ...baseItem, title: text } as ITag;
        }
        if (fieldName === 'assignedUsers') {
            return { ...baseItem, name: text } as IAssignedUsers;
        }
        throw new Error(`Unsupported field type: ${fieldName}`);
    };


    // Item handlers
    const handleRemoveItem = (itemToRemove: ItemType) => {
        console.log('Removing item:', itemToRemove);
        setItems(prev => {
            const newItems = prev.filter(item => item.id !== itemToRemove.id)

            // Validar si el nuevo array es diferente del original
            const hasChanges = !areArraysEqual(newItems, value);
            setIsValid(hasChanges);

            return newItems
            
        })
    }



    const handleKeyPress = (e: React.KeyboardEvent) => {
        //e.preventDefault()
        if (e.key === 'Enter') {
            e.preventDefault()
            const inputValue = (e.target as HTMLInputElement).value.trim()
            console.log('⌨️ ToDoFieldArray - KeyPress:', {
                inputValue,
                currentItems: items,
                fieldName
            });
            if (!inputValue) return

            // Update newItem state
            setNewItem(inputValue)

            const itemExists = items.some(item => {
                if (isTag(item)) return item.title.toLowerCase() === inputValue.toLowerCase();
                if (isAssignedUser(item)) return item.name.toLowerCase() === inputValue.toLowerCase();
                return false;
            })

            if (!itemExists) {
                const newItemObject = createNewItem(inputValue);
                setItems(prev => [...prev, newItemObject]);
                
                (e.target as HTMLInputElement).value = ''
                setIsValid(true)  // añadido por validacion
                setNewItem('');
            }

            // handleAddItem()
            
        }
    }

    const handleBlur = (e: React.FocusEvent) => {
        console.log('Blur event:', {
            currentTarget: e.currentTarget,
            relatedTarget: e.relatedTarget
        })

        // Prevent blur if clicking within the component
        const currentTarget = e.currentTarget
        const relatedTarget = e.relatedTarget as Node

        if (containerRef.current && containerRef.current.contains(relatedTarget)) {
            return
        }
        //Reset to original items on blur
        //setItems(originalItems.current)
        setNewItem('')
    }

    // const containerRef = React.useRef<HTMLDivElement>(null);

    // // Add click outside handler
    // React.useEffect(() => {
    //     if (!isEditing) return;

    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
    //             setIsEditing(false);
    //         }
    //     }

    //     document.addEventListener('mousedown', handleClickOutside)
    //     return () => document.removeEventListener('mousedown', handleClickOutside)
    // }, [isEditing, setIsEditing])



    ///*** HELPERS FUNTIONS ***

    const renderItem = (item: ItemType): string => {
        if (isTag(item)) return item.title
        if (isAssignedUser(item)) return item.name
        return ''
    }

    const getPlaceholderText = () => {
        if (fieldName === 'tags') return 'Add a tag + <Enter> key'
        if (fieldName === 'assignedUsers') return 'Add a user + <Enter> key'
        return 'Add item + <Enter> key'
    }

    const getEmptyMessage = () => {
        if (fieldName === 'tags') return 'No tags added'
        if (fieldName === 'assignedUsers') return 'No users added'
        return 'No items added'
    }


    return (
        <>
            {/* Add overlay when editing */}
            {isEditing && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0, 
                        background: 'var(--color-tododetails-bg)',
                        backdropFilter: 'blur(1px)',
                        zIndex: 997, 
                        cursor: 'not-allowed',
                        animation: 'slideInBackdrop 0.3s ease-out',
                        // pointerEvents: 'none',
                    }}
                />
            )}

            <div
                ref={containerRef}
                className="todo-field-select"
                style={{
                    transform: "translateY(-15px) translateX(0px)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "fit-content",
                    height: "auto",
                    position: 'relative',
                    zIndex: isEditing ? 998 : 'auto'
                }}
            >
                {/* Display Mode */}
                <div
                    style={{
                        display: !isEditing ? 'flex' : 'none',
                        flexWrap: "wrap",
                        textWrap: "wrap",
                        marginLeft: 35,
                        fontSize: "var(--font-base)",
                        height: "auto", // Changed from fit-content
                        maxHeight: "200px",
                        overflowY: Array.isArray(items) && items.length > 0 ? 'auto' : 'hidden', 
                        padding: '8px 12px',
                        minHeight: "fit-content", // Add this
                    }}
                >
                    {Array.isArray(items) &&items.length > 0 ? (
                        <ul
                            data-todo-info={fieldName}
                            aria-labelledby={fieldName}
                            className="todo-tags-list todo-form-field-container"
                            id={`todo-${fieldName}-list-details-page`}
                            style={{
                                position: "relative",
                                listStyle: "none",
                                overflow: "visible", // Changed from hidden
                                maxHeight: "105px", // Changed from 100px
                                overflowY: 'auto',
                                height: "auto",
                                flexWrap: "wrap",
                                gap: "8px",
                                paddingBottom: "16px"
                            }}>
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className={`todo-tags `}
                                    data-todo-info={fieldName}
                                    data-id={item.id}
                                >
                                    {renderItem(item)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <span
                            className="todo-empty-message"
                            style={{
                                fontSize: "var(--font-lg)",
                                position: "relative",
                                marginLeft: 25,
                                transform: "translateY(10px) translateX(0px)",
                                //overflowY: "hidden",
                            }}>
                            {getEmptyMessage()}
                        </span>
                    )}
                </div>

                {/* Edit Mode */}
                <div

                    style={{
                        display: isEditing ? 'flex' : 'none',
                        flexDirection: 'column',
                        gap: "20px",
                        padding: '8px 12px',
                        height: "fit-content",
                        //maxHeight: "250px",
                        //height: "75px", // Changed from fit-content
                        width: "500px",
                        minHeight: "fit-content",
                        overflow: "visible",
                        alignItems: 'flex-start',
                        position: "absolute", // Cambiado de 'relative' a 'absolute' para sacar de contexto
                        zIndex: 999,

                        top: "100%", // Posiciona justo debajo del campo
                        left: "0",
                        backgroundColor: 'var(--color-bg)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        borderRadius: 'var(--br-sm)',
                        border: '1px solid var(--color-border)',


                    }}>
                    {/* Add New Item Input */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        minHeight: "fit-content",
                        height: "auto",
                        //position: "relative"
                    }}>
                        <input
                            ref={inputRef}
                            type="text"
                            // value={newItem}
                            defaultValue=""
                            //onChange={(e) => setNewItem(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={getPlaceholderText()}
                            //onBlur={handleBlur}
                            //className="add-item-input"
                            className="tags-todo-card"
                            name={fieldName}
                            id="todo-tags-detail-input"

                            style={{
                                fontSize: "var(--font-base)",
                                height: 20,
                                transform: "translateY(0px) translateX(-30px)",
                                minWidth: "75%",
                                width: "fit-content",
                                position: "relative",
                                zIndex: 998,
                                backgroundColor: 'var(--color-bg)',

                            }}
                        />
                        {Array.isArray(items) && (
                            <ul
                                className={"todo-array-list-details-page"}
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    textWrap: "nowrap",
                                    listStyle: "none",
                                    overflow: "visible", // Changed from hidden
                                    overflowY: 'auto',
                                    height: "auto",
                                    maxHeight: "300px",
                                    paddingBottom: "16px",
                                    width: '100%',
                                    position: "relative",
                                    zIndex: 999,
                                    backgroundColor: 'var(--color-bg)',
                                    borderRadius: 'var(--br-sm)',

                                }}>
                                {items.map((item) => (
                                    <li
                                        key={item.id}
                                        className={`todo-tags `}
                                        //className={`todo-${fieldName}-tag editable`}
                                        data-id={item.id}
                                        onClick={() => handleRemoveItem(item)}
                                        style={{
                                            cursor: "pointer",
                                            position: "relative",
                                            zIndex: 998
                                        }}
                                    >
                                        {renderItem(item)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
})

// Add display name for debugging purposes
ToDoFieldArray.displayName = 'ToDoFieldArray';