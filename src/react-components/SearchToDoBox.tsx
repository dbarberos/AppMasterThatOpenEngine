import * as React from 'react';

interface Props {
    onChange: (value: string) => void;
  }


export function SearchToDoBox(props: Props) {

    return (        
            <div style={{ display: "flex", alignItems: "center", }}>
                <input
                    id="todo-search-in-Project-Details"
                    type="search"
                    placeholder="Search inside TO-DO... "
                    style={{  }}
                    onChange={(e) => props.onChange(e.target.value)}
                />
            </div>
        
    )
}