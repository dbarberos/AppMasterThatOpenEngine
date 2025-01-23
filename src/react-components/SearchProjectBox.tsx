import * as React from 'react';

interface Props {
    onChange: (value: string) => void;
  }


export function SearchProjectBox(props: Props) {

    return (
        <div style={{ display: "flex", alignItems: "center", columnGap : 10, width: "40%" }}>
        <input
            type="search"
                placeholder="Search projects by name... "
                style={{ width: "clamp(200px, 900px, 1500px)" }}
            onChange= {(e) => props.onChange(e.target.value)}
        />
        </div>
    )
}