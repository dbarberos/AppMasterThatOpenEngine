import React from 'react'

interface MessageContentProps {
    changes: Record<string, [any, any]>;
}

export const DiffContentProjectsMessage: React.FC<MessageContentProps> = ({ changes }) => {
    return (
        <React.Fragment>
            The following project details will be updated:<br /><br />
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: '1px solid #ccc' }}>Property</th>
                        <th style={{ borderBottom: '1px solid #ccc' }}>Changes</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(changes).map(([key, [oldValue, newValue]]) => (
                        <tr key={key}>
                            <td style={{ borderBottom: '1px solid #ccc' }}><b>{key}</b></td>
                            <td style={{ borderBottom: '1px solid #ccc' }}>
                                From: <i>{oldValue}</i><br />
                                To: <i style={{ color: 'var(--popup-warning)' }}>{newValue}</i>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </React.Fragment>
    );
};