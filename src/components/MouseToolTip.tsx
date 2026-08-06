import React, { CSSProperties, useEffect, useRef } from 'react'
import { Label } from 'semantic-ui-react'

interface MouseToolTipProps {
  text?: string | null;
}

type TooltipStyle = CSSProperties & {
  '--tooltip-arrow-left': string;
};

const edgeMargin = 16;

export function MouseToolTip({ text }: MouseToolTipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const schedulePositionRef = useRef<(() => void) | null>(null);
  const displayText = text || null;

  useEffect(() => {
    const trackPointer = (event: MouseEvent) => {
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      schedulePositionRef.current?.();
    };

    document.addEventListener('mousemove', trackPointer, { passive: true });
    return () => document.removeEventListener('mousemove', trackPointer);
  }, []);

  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!displayText || !tooltip) {
      return;
    }

    let animationFrame: number | null = null;
    let visibilityTimer: ReturnType<typeof setTimeout> | null = null;
    let canShow = false;

    const updatePosition = () => {
      animationFrame = null;

      const label = labelRef.current;
      const pointer = lastPointerRef.current;
      if (!label || !pointer) return;

      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      if (!tooltipWidth || !tooltipHeight) return;

      const viewportWidth = window.innerWidth;
      let left = pointer.x - (tooltipWidth / 2);
      let top = pointer.y - tooltipHeight - 10;
      let arrowLeft = 50;

      if (left < edgeMargin) {
        arrowLeft = ((pointer.x - edgeMargin) / tooltipWidth) * 100;
        left = edgeMargin;
      } else if (left + tooltipWidth > viewportWidth - edgeMargin) {
        arrowLeft = ((pointer.x - (viewportWidth - tooltipWidth - edgeMargin)) / tooltipWidth) * 100;
        left = viewportWidth - tooltipWidth - edgeMargin;
      }

      arrowLeft = Math.max(10, Math.min(90, arrowLeft));

      const isBelowPointer = top < edgeMargin;
      if (isBelowPointer) {
        top = pointer.y + 15;
      }

      const pointingDirection = isBelowPointer ? 'above' : 'below';
      if (!label.classList.contains(pointingDirection)) {
        label.className = label.className.replace(
          /pointing (?:above|below)/,
          `pointing ${pointingDirection}`,
        );
      }
      tooltip.style.setProperty('--tooltip-arrow-left', `${arrowLeft}%`);
      tooltip.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      if (canShow) tooltip.style.opacity = '1';
    };

    const schedulePosition = () => {
      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(updatePosition);
      }
    };

    tooltip.style.opacity = '0';
    schedulePositionRef.current = schedulePosition;
    visibilityTimer = setTimeout(() => {
      canShow = true;
      schedulePosition();
    }, 30);

    if (lastPointerRef.current) {
      schedulePosition();
    }

    return () => {
      if (schedulePositionRef.current === schedulePosition) {
        schedulePositionRef.current = null;
      }
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      if (visibilityTimer !== null) clearTimeout(visibilityTimer);
      tooltip.style.opacity = '0';
    };
  }, [displayText]);

  const tooltipStyle: TooltipStyle = {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: 0,
    transform: 'translate3d(0, 0, 0)',
    willChange: displayText ? 'transform' : undefined,
    '--tooltip-arrow-left': '50%',
  };

  return (
    <>
      <div
        ref={tooltipRef}
        id='MouseToolTipAnchor'
        className='Relative NoMouse NoDrag'
        style={tooltipStyle}
      >
        {displayText && (
          <Label
            pointing='below'
            style={{ position: 'relative' }}
            ref={labelRef}
          >
            <div dangerouslySetInnerHTML={{ __html: displayText }} />
          </Label>
        )}
      </div>
      <style jsx global>{`
        #MouseToolTipAnchor .ui.pointing.label::before {
          left: var(--tooltip-arrow-left, 50%) !important;
        }
      `}</style>
    </>
  );
}
