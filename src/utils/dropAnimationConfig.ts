import * as React from 'react';
import { CSS } from '@dnd-kit/utilities';

import { DropAnimation } from '@dnd-kit/core';

export const dropAnimationConfig: DropAnimation = {
    keyframes({ transform }) {
        return [
            { transform: CSS.Transform.toString(transform.initial) },
            {
                transform: CSS.Transform.toString({
                    ...transform.final,
                    scaleX: 0.98,
                    scaleY: 0.98,
                })
            },
            { transform: CSS.Transform.toString(transform.final) }
        ];
    },
    sideEffects({ active, dragOverlay }) {
        active.node.style.opacity = '0.5';

        return () => {
            active.node.style.opacity = '';
            if (dragOverlay) {
                dragOverlay.style.transition = 'transform 200ms ease';
            }
        };
    },
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    duration: 250,
};
