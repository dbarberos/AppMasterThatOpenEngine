import * as React from 'react';
import { ReportIcon } from './icons'; // Usamos un icono de advertencia/error

export function UserDisabledPage() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '20px'
        }}>
            <div style={{
                padding: '40px 50px',
                textAlign: 'center',
                maxWidth: '650px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--gap-m)'
            }}>
                <ReportIcon size={60} color="var(--color-error)" />
                <h2 style={{ fontSize: 'var(--font-3xl)', color: 'var(--color-error)' }}>
                    Account Disabled
                </h2>
                <p style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-fontbase-dark)', lineHeight: '1.6' }}>
                    Your account has been disabled by an administrator.
                    If you believe this is an error, please contact support for assistance.
                </p>
            </div>
        </div>
    );
}

// Add display name for debugging purposes
UserDisabledPage.displayName = 'UserDisabledPage';

