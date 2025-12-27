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
    )
}

export const MainProjectCatalog = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M15 11V5.83c0-.53-.21-1.04-.59-1.41L12.7 2.71c-.39-.39-1.02-.39-1.41 0l-1.7 1.7C9.21 4.79 9 5.3 9 5.83V7H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2h-4zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z" />
    
    </svg >
)


export const MainProjectDetails = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M14.16,10.4l-5-3.57c-0.7-0.5-1.63-0.5-2.32,0l-5,3.57C1.31,10.78,1,11.38,1,12.03V20c0,0.55,0.45,1,1,1h4v-6h4v6h4 c0.55,0,1-0.45,1-1v-7.97C15,11.38,14.69,10.78,14.16,10.4z" /><path d="M21.03,3h-9.06C10.88,3,10,3.88,10,4.97l0.09,0.09c0.08,0.05,0.16,0.09,0.24,0.14l5,3.57c0.76,0.54,1.3,1.34,1.54,2.23H19 v2h-2v2h2v2h-2v3v1h4.03c1.09,0,1.97-0.88,1.97-1.97V4.97C23,3.88,22.12,3,21.03,3z M19,9h-2V7h2V9z" />
    </svg >
)



export const MainToDoBoard = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M0 0h24v24H0V0z" fill="none" /><path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M8,17L8,17c-0.55,0-1-0.45-1-1V8 c0-0.55,0.45-1,1-1h0c0.55,0,1,0.45,1,1v8C9,16.55,8.55,17,8,17z M12,12L12,12c-0.55,0-1-0.45-1-1V8c0-0.55,0.45-1,1-1h0 c0.55,0,1,0.45,1,1v3C13,11.55,12.55,12,12,12z M16,15L16,15c-0.55,0-1-0.45-1-1V8c0-0.55,0.45-1,1-1h0c0.55,0,1,0.45,1,1v6 C17,14.55,16.55,15,16,15z" />
    </svg >
)



export const MainUsersIndex = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M16.67,13.13C18.04,14.06,19,15.32,19,17v3h3c0.55,0,1-0.45,1-1v-2C23,14.82,19.43,13.53,16.67,13.13z" fillRule="evenodd" />
        <circle cx="9" cy="8" r="4" fillRule="evenodd" />
        <path d="M15,12c2.21,0,4-1.79,4-4c0-2.21-1.79-4-4-4c-0.47,0-0.91,0.1-1.33,0.24C14.5,5.27,15,6.58,15,8s-0.5,2.73-1.33,3.76C14.09,11.9,14.53,12,15,12z" fillRule="evenodd" />
        <path d="M9,13c-2.67,0-8,1.34-8,4v2c0,0.55,0.45,1,1,1h14c0.55,0,1-0.45,1-1v-2C17,14.34,11.67,13,9,13z" fillRule="evenodd" />
    </svg >
)


export const AssignProjectIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => (
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
    </svg>
)


export const CloseIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
    </svg>
)

export const MoreOptionsHorzIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
)


export const GithubIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    <svg width={size} height={size} viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill={color}/>
    </svg>
)


export const GoogleIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    <svg width={size} height={size} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" className={className}><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>
)

export const ChevronDownIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M12 5.83l2.46 2.46c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L12.7 3.7c-.39-.39-1.02-.39-1.41 0L8.12 6.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 5.83zm0 12.34l-2.46-2.46c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l3.17 3.18c.39.39 1.02.39 1.41 0l3.17-3.17c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L12 18.17z"/>
    </svg>
)

export const UserIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z"/>
    </svg>
)

export const ProfileIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <g><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"/></g>
    </svg>
)


export const LoginIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <g><path d="M10.3,7.7L10.3,7.7c-0.39,0.39-0.39,1.01,0,1.4l1.9,1.9H3c-0.55,0-1,0.45-1,1v0c0,0.55,0.45,1,1,1h9.2l-1.9,1.9 c-0.39,0.39-0.39,1.01,0,1.4l0,0c0.39,0.39,1.01,0.39,1.4,0l3.59-3.59c0.39-0.39,0.39-1.02,0-1.41L11.7,7.7 C11.31,7.31,10.69,7.31,10.3,7.7z M20,19h-7c-0.55,0-1,0.45-1,1v0c0,0.55,0.45,1,1,1h7c1.1,0,2-0.9,2-2V5c0-1.1-0.9-2-2-2h-7 c-0.55,0-1,0.45-1,1v0c0,0.55,0.45,1,1,1h7V19z"/></g>
    </svg>
)


export const LogoutIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><g><path d="M5,5h6c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h6c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H5V5z"/><path d="M20.65,11.65l-2.79-2.79C17.54,8.54,17,8.76,17,9.21V11h-7c-0.55,0-1,0.45-1,1v0c0,0.55,0.45,1,1,1h7v1.79 c0,0.45,0.54,0.67,0.85,0.35l2.79-2.79C20.84,12.16,20.84,11.84,20.65,11.65z"/></g></g>
    </svg>
)


export const PasswordIcon = ({ size = 24, color = "var(--color-fontbase)", className = "" }: IconProps): JSX.Element => ( 
    < svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} >
        <g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><g><path d="M3,17h18c0.55,0,1,0.45,1,1v0c0,0.55-0.45,1-1,1H3c-0.55,0-1-0.45-1-1v0C2,17.45,2.45,17,3,17z M2.5,12.57 c0.36,0.21,0.82,0.08,1.03-0.28L4,11.47l0.48,0.83c0.21,0.36,0.67,0.48,1.03,0.28l0,0c0.36-0.21,0.48-0.66,0.28-1.02L5.3,10.72 h0.95C6.66,10.72,7,10.38,7,9.97v0c0-0.41-0.34-0.75-0.75-0.75H5.3L5.77,8.4C5.98,8.04,5.86,7.58,5.5,7.37l0,0 C5.14,7.17,4.68,7.29,4.47,7.65L4,8.47L3.53,7.65C3.32,7.29,2.86,7.17,2.5,7.37l0,0C2.14,7.58,2.02,8.04,2.23,8.4L2.7,9.22H1.75 C1.34,9.22,1,9.56,1,9.97v0c0,0.41,0.34,0.75,0.75,0.75H2.7l-0.48,0.83C2.02,11.91,2.14,12.37,2.5,12.57L2.5,12.57z M10.5,12.57 L10.5,12.57c0.36,0.21,0.82,0.08,1.03-0.28L12,11.47l0.48,0.83c0.21,0.36,0.67,0.48,1.03,0.28l0,0c0.36-0.21,0.48-0.66,0.28-1.02 l-0.48-0.83h0.95c0.41,0,0.75-0.34,0.75-0.75v0c0-0.41-0.34-0.75-0.75-0.75H13.3l0.47-0.82c0.21-0.36,0.08-0.82-0.27-1.03l0,0 c-0.36-0.21-0.82-0.08-1.02,0.27L12,8.47l-0.47-0.82c-0.21-0.36-0.67-0.48-1.02-0.27l0,0c-0.36,0.21-0.48,0.67-0.27,1.03 l0.47,0.82H9.75C9.34,9.22,9,9.56,9,9.97v0c0,0.41,0.34,0.75,0.75,0.75h0.95l-0.48,0.83C10.02,11.91,10.14,12.37,10.5,12.57z M23,9.97c0-0.41-0.34-0.75-0.75-0.75H21.3l0.47-0.82c0.21-0.36,0.08-0.82-0.27-1.03l0,0c-0.36-0.21-0.82-0.08-1.02,0.27L20,8.47 l-0.47-0.82c-0.21-0.36-0.67-0.48-1.02-0.27l0,0c-0.36,0.21-0.48,0.67-0.27,1.03l0.47,0.82h-0.95C17.34,9.22,17,9.56,17,9.97v0 c0,0.41,0.34,0.75,0.75,0.75h0.95l-0.48,0.83c-0.21,0.36-0.08,0.82,0.28,1.02l0,0c0.36,0.21,0.82,0.08,1.03-0.28L20,11.47 l0.48,0.83c0.21,0.36,0.67,0.48,1.03,0.28l0,0c0.36-0.21,0.48-0.66,0.28-1.02l-0.48-0.83h0.95C22.66,10.72,23,10.38,23,9.97 L23,9.97z"/></g></g>
    </svg>
)
    
