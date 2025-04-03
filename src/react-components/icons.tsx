import * as React from 'react';

interface IconProps {
    size: number;
    color: string;
    className?: string; // Make className optional
}

export const ClockIcon = ({ size = 24, color = '#dfd9d9' }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <circle r="15" cx="16" cy="16" fill="none" stroke="currentColor" strokeWidth="2" />
        <polyline points="16,7 16,16 23,16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg >
)

export const ReportIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
            <path
                d="M13.89 8.7L12 10.59 10.11 8.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 8.7 13.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l1.89 1.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l1.89-1.89c.39-.39.39-1.02 0-1.41-.39-.38-1.03-.38-1.41 0zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg >
)

export const MessageIcon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <polygon points="1,6 31,6 31,26 1,26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            stroke-linejoin="round" />
        <polyline points="1,6 16,18 31,6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" />
    </svg >
)

export const CheckCircle2Icon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
            <circle r="15" cx="16" cy="16" fill="none" stroke="hsl(93,90%,40%)" strokeWidth="2" />
            <polyline points="9,18 13,22 23,12" fill="none" stroke="hsl(93,90%,40%)" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" />
    </svg >
)

export const ArrowUpIcon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
            <circle r="15" cx="16" cy="16" fill="none" stroke="currentColor" strokeWidth="2" />
            <polyline points="11,15 16,10 21,15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" />
            <line x1="16" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2" stroke-linecap="round" />
    </svg >
)

export const Warning2Icon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
            <polygon points="16,1 31,31 1,31" fill="none" stroke="hsl(33,90%,55%)" strokeWidth="2" strokeLinecap="round"
                stroke-linejoin="round" />
            <line x1="16" y1="12" x2="16" y2="20" stroke="hsl(33,90%,55%)" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="25" x2="16" y2="25" stroke="hsl(33,90%,55%)" strokeWidth="3" strokeLinecap="round" />
    </svg >
)

export const Report2Icon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
            <path
                d="M15.32 3H8.68c-.26 0-.52.11-.7.29L3.29 7.98c-.18.18-.29.44-.29.7v6.63c0 .27.11.52.29.71l4.68 4.68c.19.19.45.3.71.3h6.63c.27 0 .52-.11.71-.29l4.68-4.68c.19-.19.29-.44.29-.71V8.68c0-.27-.11-.52-.29-.71l-4.68-4.68c-.18-.18-.44-.29-.7-.29zM12 17.3c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3zm0-4.3c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1z" />
    </svg >
)

export const WarningIcon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3zM12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" />
    </svg >
)

export const CheckCircleIcon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29 5.7 12.7c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.17l6.88-6.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-7.59 7.59c-.38.39-1.02.39-1.41 0z" />
    </svg >
)

export const NotificationsActiveIcon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.68-1.5-1.51-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-1.3 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16zm-6.01 6c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zM6.77 4.73c.42-.38.43-1.03.03-1.43-.38-.38-1-.39-1.39-.02C3.7 4.84 2.52 6.96 2.14 9.34c-.09.61.38 1.16 1 1.16.48 0 .9-.35.98-.83.3-1.94 1.26-3.67 2.65-4.94zM18.6 3.28c-.4-.37-1.02-.36-1.4.02-.4.4-.38 1.04.03 1.42 1.38 1.27 2.35 3 2.65 4.94.07.48.49.83.98.83.61 0 1.09-.55.99-1.16-.38-2.37-1.55-4.48-3.25-6.05z" />
    </svg >
)

export const UpdateIcon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z" />
    </svg >
)

export const RadioButtonUncheckedIcon = ({ size = 24, color = "#dfd9d9", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    </svg >
)

export const RenameIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M15,16l-4,4h8c1.1,0,2-0.9,2-2v0c0-1.1-0.9-2-2-2H15z" />
        <path
            d="M12.06,7.19l-8.77,8.77C3.11,16.14,3,16.4,3,16.66V19c0,0.55,0.45,1,1,1h2.34c0.27,0,0.52-0.11,0.71-0.29l8.77-8.77 L12.06,7.19z" />
        <path
            d="M18.71,8.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.39-0.39-1.02-0.39-1.41,0l-1.83,1.83l3.75,3.75L18.71,8.04z" />
    </svg >
)

export const EditIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg >
)

export const EditNoteIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M14,11c0,0.55-0.45,1-1,1H4c-0.55,0-1-0.45-1-1s0.45-1,1-1h9C13.55,10,14,10.45,14,11z M3,7c0,0.55,0.45,1,1,1h9 c0.55,0,1-0.45,1-1s-0.45-1-1-1H4C3.45,6,3,6.45,3,7z M10,15c0-0.55-0.45-1-1-1H4c-0.55,0-1,0.45-1,1s0.45,1,1,1h5 C9.55,16,10,15.55,10,15z M18.01,12.87l0.71-0.71c0.39-0.39,1.02-0.39,1.41,0l0.71,0.71c0.39,0.39,0.39,1.02,0,1.41l-0.71,0.71 L18.01,12.87z M17.3,13.58l-5.16,5.16C12.05,18.83,12,18.95,12,19.09v1.41c0,0.28,0.22,0.5,0.5,0.5h1.41c0.13,0,0.26-0.05,0.35-0.15 l5.16-5.16L17.3,13.58z" />
    </svg >
)

export const FlagIcon = ({ size = 24, color = "#a5a4a4", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M14.4 6l-.24-1.2c-.09-.46-.5-.8-.98-.8H6c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1s1-.45 1-1v-6h5.6l.24 1.2c.09.47.5.8.98.8H19c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-4.6z" />
    </svg >
)

export const ChatBubbleIcon = ({ size = 24, color = "#a5a4a4", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M12,4c4.97,0,8.9,4.56,7.82,9.72c-0.68,3.23-3.4,5.74-6.67,6.2c-1.59,0.22-3.14-0.01-4.58-0.7 c-0.27-0.13-0.56-0.19-0.86-0.19c-0.19,0-0.38,0.03-0.56,0.08l-2.31,0.68c-0.38,0.11-0.74-0.24-0.63-0.63l0.7-2.39 c0.13-0.45,0.07-0.92-0.14-1.35C4.26,14.34,4,13.18,4,12C4,7.59,7.59,4,12,4 M12,2C6.48,2,2,6.48,2,12c0,1.54,0.36,2.98,0.97,4.29 l-1.46,4.96C1.29,22,2,22.71,2.76,22.48l4.96-1.46c1.66,0.79,3.56,1.15,5.58,0.89c4.56-0.59,8.21-4.35,8.66-8.92 C22.53,7.03,17.85,2,12,2L12,2z" />
    </svg >
)

export const DragIndicatorIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg >
)

export const ArrowLeftIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M12.29 8.71L9.7 11.3c-.39.39-.39 1.02 0 1.41l2.59 2.59c.63.63 1.71.18 1.71-.71V9.41c0-.89-1.08-1.33-1.71-.7z" />
    </svg >
)

export const ArrowRightIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M11.71 15.29l2.59-2.59c.39-.39.39-1.02 0-1.41L11.71 8.7c-.63-.62-1.71-.18-1.71.71v5.17c0 .9 1.08 1.34 1.71.71z" />
    </svg >
)

export const KanbanIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path
            d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M8,17L8,17c-0.55,0-1-0.45-1-1V8 c0-0.55,0.45-1,1-1h0c0.55,0,1,0.45,1,1v8C9,16.55,8.55,17,8,17z M12,12L12,12c-0.55,0-1-0.45-1-1V8c0-0.55,0.45-1,1-1h0 c0.55,0,1,0.45,1,1v3C13,11.55,12.55,12,12,12z M16,15L16,15c-0.55,0-1-0.45-1-1V8c0-0.55,0.45-1,1-1h0c0.55,0,1,0.45,1,1v6 C17,14.55,16.55,15,16,15z" />
    </svg >
)

export const TrashIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg focusable="false" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
    </svg >
)

export const SaveIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M17.59 3.59c-.38-.38-.89-.59-1.42-.59H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7.83c0-.53-.21-1.04-.59-1.41l-2.82-2.83zM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm1-10H7c-1.1 0-2-.9-2-2s.9-2 2-2h6c1.1 0 2 .9 2 2s-.9 2-2 2z" />
    </svg >
)

export const ArrowUpwardIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M13 19V7.83l4.88 4.88c.39.39 1.03.39 1.42 0 .39-.39.39-1.02 0-1.41l-6.59-6.59c-.39-.39-1.02-.39-1.41 0l-6.6 6.58c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L11 7.83V19c0 .55.45 1 1 1s1-.45 1-1z" />
    </svg >
)

export const ArrowDownwardIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
            d="M11 5v11.17l-4.88-4.88c-.39-.39-1.03-.39-1.42 0-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L13 16.17V5c0-.55-.45-1-1-1s-1 .45-1 1z" />
    </svg >
)

export const AddIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 -960 960 960" fill={color} className={className} >
        <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z" />
    </svg >
)

export const SearchIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 -960 960 960" fill={color} className={className} >
        <path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
    </svg >
)

export const LoadingIcon = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', margin: 'auto'}}>
            <svg
                style={{ boxShadow: "none", backgroundColor: "inherit", border: "none" }}

                fill="var(--color-fontbase)"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                width="100px" // Puedes ajustar el tamaño aquí
                height="100px" // Puedes ajustar el tamaño aquí
            >
                <g>
                    <circle cx="12" cy="2.5" r="1.5" opacity=".14" />
                    <circle cx="16.75" cy="3.77" r="1.5" opacity=".29" />
                    <circle cx="20.23" cy="7.25" r="1.5" opacity=".43" />
                    <circle cx="21.50" cy="12.00" r="1.5" opacity=".57" />
                    <circle cx="20.23" cy="16.75" r="1.5" opacity=".71" />
                    <circle cx="16.75" cy="20.23" r="1.5" opacity=".86" />
                    <circle cx="12" cy="21.5" r="1.5" />
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        calcMode="discrete"
                        dur="0.75s"
                        values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"
                        repeatCount="indefinite"
                    />
                </g>
            </svg>
            <div style={{ marginTop: '10px', fontSize: '16px', color: '#333' }}>Loading...</div>
        </div>
    );
};


