import * as React from 'react';
import { ToDoIssue } from '../classes/ToDoIssue';
import { ITag } from '../Types';

interface Props {
    fieldName: keyof Pick<ToDoIssue, 'tags' | 'assignedUsers'>;
    value: ITag[] | string[];
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    onChange: (value: string[]) => void;
    placeholder?: string;
    arrayRef?: React.RefObject<HTMLDivElement>;
}

export function ToDoFieldArray({
    fieldName,
    value,
    isEditing,
    setIsEditing,
    onChange,
    placeholder,
    arrayRef
}: Props) {
    const [items, setItems] = React.useState<ITag[] | string[]>(value);
    const [newItem, setNewItem] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync with external value
    React.useEffect(() => {
        setItems(value);
    }, [value]);

    // Handle focus when editing starts
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);



    const isTagField = fieldName === 'tags';




    const renderItem = (item: ITag | string):string => {
        if (typeof item === 'object' && 'title' in item) {
            return item.title;
        }
        return item as string;
    };




    const handleAddItem = () => {
        if (newItem.trim() && !items.includes(newItem.trim())) {
            const updatedItems = [...items, newItem.trim()];
            setItems(updatedItems);
            onChange(updatedItems);
            setNewItem('');
        }
    };

    const handleRemoveItem = (itemToRemove: ITag | string) => {
        const updatedItems = items.filter(item => {
            if (isTagField && typeof item !== 'string') {
                return item.id !== (itemToRemove as Tag).id
            }
            return item !== itemToRemove
        })
        
        setItems(updatedItems);
        onChange(updatedItems);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        }
    };

    return (
        <div
            className="todo-field-select"
            style={{                
                transform: "translateY(-15px) translateX(0px)",
                minHeight: "fit-content", // Add this
                height: "auto" // Add this

            }}
        >
            {/* Display Mode */}
            <div
                style={{
                    display: !isEditing ? 'block' : 'none',
                    textWrap: "nowrap",
                    marginLeft: 35,
                    fontSize: "var(--font-base)",
                    height: "auto", // Changed from fit-content
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
                            //paddingLeft: 20,
                            position: "relative",
                            //marginLeft: 25,
                            listStyle: "none",
                            overflow: "visible", // Changed from hidden
                            maxHeight: "none", // Changed from 100px
                            overflowY: 'auto',
                            height: "auto", // Add this
                            flexWrap: "wrap",
                            gap: "8px", // Add this
                            paddingBottom: "16px" // Add this for spacing

                        }}>
                        {items.map((item, index) => (
                            <li
                                key={isTagField ? (item as ITag).id : index}
                                className={`todo-tags `}
                                //className={`todo-${fieldName}-tag`}
                                data-todo-info={fieldName}
                                data-id={isTagField ? (item as ITag).id : undefined}
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
                        No {fieldName === 'tags' ? 'tags' : 'users'} added
                    </span>
                )}
            </div>

            {/* Edit Mode */}
            <div
                
                style={{
                    display: isEditing ? 'flex' : 'none',
                    flexDirection: 'column',
                    rowGap: "20px",
                    padding: '8px 12px',
                    height: "auto", // Changed from fit-content
                    width: "500px",
                    minHeight: "fit-content", // Add this
                    overflow: "visible" // Add this

            }}>
                {/* Add New Item Input */}                
                <input
                    ref={inputRef}
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={ `Add ${fieldName === 'tags' ? 'a tag + <Enter> key' : 'a user + <Enter> key'}`}
                    //className="add-item-input"
                    className="tags-todo-card"
                    name="tags"
                    id="todo-tags-detail-input"
                    
                    style={{
                        fontSize: "var(--font-base)",
                        height: 20,
                        transform: "translateY(0px) translateX(-30px)",
                        minWidth: "50%",
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
                        height: "auto", // Add this
                        gap: "8px", // Add this
                        paddingBottom: "16px" // Add this
                        

                    }}>
                    {items.map((item, index) => (
                        <li
                            key={isTagField ? (item as ITag).id : index}
                            className={`todo-tags `}
                            //className={`todo-${fieldName}-tag editable`}
                            data-id={isTagField ? (item as ITag).id : undefined}
                            onClick={() => handleRemoveItem(item)}

                        >
                            {renderItem(item)}
                            {/* <button
                                onClick={() => handleRemoveItem(item)}
                                className="remove-item-btn"
                                aria-label={`Remove ${renderItem(item)}`}
                            >
                                ×
                            </button> */}
                        </li>
                        
                    ))}
                </ul>
            </div>
        </div>
    );
} 