import * as React from 'react';
import { ToDoIssue } from '../classes/ToDoIssue';
import { ITag, IAssignedUsers } from '../types';


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
}

export const ToDoFieldArray = React.forwardRef<IToDoFieldArrayRef, ToDoFieldArrayProps>(({
    fieldName,
    value,
    isEditing,
    setIsEditing,
    onSave,
    onCancel,

    placeholder,
    //arrayRef
}, ref) => {
    //console.log('ToDoFieldArray render:', { fieldName, value, isEditing })


    const [items, setItems] = React.useState<ItemType[]>(value || []);
    const [newItem, setNewItem] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);
    const originalItems = React.useRef<ItemType[]>(value || []);
    const containerRef = React.useRef<HTMLDivElement>(null);


    // Type guards
    const isTag = (item: ItemType): item is ITag => 'title' in item
    const isAssignedUser = (item: ItemType): item is IAssignedUsers => 'name' in item

    // Sync with external valueand store original state
    React.useEffect(() => {
        console.log('Value changed effect:', { value, isEditing, originalItems: originalItems.current });

        // Store original items only when editing starts
        if (!isEditing) {
            setItems(value || [])
            originalItems.current = value || [];
        }
    }, [value, isEditing])



    //Handle focus when editing starts
    React.useEffect(() => {
        console.log('Focus effect triggered:', { isEditing, inputRef: inputRef.current })
        if (isEditing && inputRef.current) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [isEditing]);



    // Add handler for external save functionality
    const handleExternalSave = React.useCallback(() => {
        console.log('Save triggered:', {
            currentItems: items,
            originalItems: originalItems.current,
            isEditing
        });
        // Notify parent with current items
        onSave(items)
        // Clear any new item being entered
        setNewItem('')
    }, [onSave, items]);


    // Add handler for external cancel
    const handleExternalCancel = React.useCallback(() => {
        console.log('Handling cancel:', { originalItems: originalItems.current })
        // Restore original items
        setItems(originalItems.current)
        // Clear any new item being entered
        setNewItem('')
        // Notify parent with original values
        onSave(originalItems.current)
    }, [onSave])


    // Connect handlers to ref
    React.useImperativeHandle(ref, () => ({
        handleSave: () => {
            console.log('Imperative save:', {
                currentItems: items,
                originalItems: originalItems.current
            });
            handleExternalSave()
            setIsEditing(false)
        },
        handleCancel: () => {
            console.log('Imperative cancel:', {
                currentItems: items,
                originalItems: originalItems.current
            });
            handleExternalCancel()
            setIsEditing(false)
        }
    }), [handleExternalSave, handleExternalCancel, setIsEditing, items])




    // React.useEffect(() => {
    //     console.log('Items state changed:', { items, isEditing });
    // }, [items, isEditing]);






    const createNewItem = (text: string): ItemType => {
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



    const handleRemoveItem = (itemToRemove: ItemType) => {
        console.log('Removing item:', itemToRemove);
        setItems(prev => prev.filter(item => item.id !== itemToRemove.id))
    }


    const handleKeyPress = (e: React.KeyboardEvent) => {
        //e.preventDefault()
        if (e.key === 'Enter') {
            e.preventDefault()
            const inputValue = (e.target as HTMLInputElement).value.trim()
            if (!inputValue) return

            // Update newItem state
            setNewItem(inputValue)
            // const trimmedValue = newItem.trim();
            // if (!trimmedValue) return;

            const itemExists = items.some(item => {
                if (isTag(item)) return item.title.toLowerCase() === inputValue.toLowerCase();
                if (isAssignedUser(item)) return item.name.toLowerCase() === inputValue.toLowerCase();
                return false;
            })

            if (!itemExists) {
                const newItemObject = createNewItem(inputValue);
                setItems(prev => [...prev, newItemObject]);
                (e.target as HTMLInputElement).value = ''

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

    // Add click outside handler
    React.useEffect(() => {
        if (!isEditing) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isEditing, setIsEditing])



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
        <div
            ref={containerRef}
            className="todo-field-select"
            style={{
                transform: "translateY(-15px) translateX(0px)",
                display: "flex",
                flexDirection: "column",
                minHeight: "fit-content",
                height: "auto",
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
                    overflowY: 'auto',
                    padding: '8px 12px',
                    minHeight: "fit-content", // Add this
                }}
            >
                {items.length > 0 ? (
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
                    height: "75px", // Changed from fit-content
                    width: "500px",
                    minHeight: "fit-content",
                    overflow: "visible",
                    alignItems: 'flex-start',
                    position: "relative"

                }}>
                {/* Add New Item Input */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    minHeight: "fit-content",
                    height: "auto",
                    position: "relative"
                }}>
                    <input
                        ref={inputRef}
                        type="text"
                        // value={newItem}
                        defaultValue=""
                        //onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={getPlaceholderText()}
                        onBlur={handleBlur}
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
                            position: "relative"
                        }}
                    />
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
                            maxHeight: "85px",
                            paddingBottom: "16px",
                            width: '100%'
                        }}>
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className={`todo-tags `}
                                //className={`todo-${fieldName}-tag editable`}
                                data-id={item.id}
                                onClick={() => handleRemoveItem(item)}
                                style={{ cursor: "pointer" }}
                            >
                                {renderItem(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
})