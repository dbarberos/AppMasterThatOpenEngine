import * as React from 'react';


interface CounterProps {
    filteredItemsNum: number
    totalItemsNum: number
}


export const CounterBox = ({
    filteredItemsNum,
    totalItemsNum
}: CounterProps) => {
    
    const getMessage = React.useCallback(() => {

        if (filteredItemsNum === 0 && totalItemsNum === 0) {
            return 'There are no Tasks'
        } else if  (filteredItemsNum === 0 && totalItemsNum > 0) {
            return `0 task of ${totalItemsNum} ${totalItemsNum === 1 ? 'Task' : 'Tasks'} in total`;
        } else {
            return `${filteredItemsNum} ${filteredItemsNum === 1 ? 'Task' : 'Tasks'} of ${totalItemsNum}`;
        }
    }, [totalItemsNum, filteredItemsNum]);

    // const [message, setMessage] = React.useState(getMessage());

    // React.useEffect(() => {
    //     setMessage(getMessage());
    // }, [getMessage]);





    return (
        <div 
            className="todo-counter"
            id="todolist-search-counter"
            style={{
                fontSize: 'var(--font-base)',
                color: 'var(--color-fontbase)',
                marginRight: '10px'
            }}
        >
            {getMessage()}
        </div>
        
    )

}