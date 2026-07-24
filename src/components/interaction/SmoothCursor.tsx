import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';

type SpringConfig = {
  damping: number;
  stiffness: number;
  mass: number;
  restDelta: number;
};

type SmoothCursorProps = {
  enabled: boolean;
  cursor?: ReactNode;
  springConfig?: SpringConfig;
};

type SpringAxis = {
  value: number;
  velocity: number;
};

type CursorState = {
  x: SpringAxis;
  y: SpringAxis;
  rotation: SpringAxis;
  scale: SpringAxis;
  targetX: number;
  targetY: number;
  targetRotation: number;
  targetScale: number;
  previousAngle: number;
  hasPosition: boolean;
  visible: boolean;
  textMode: boolean;
  interactiveMode: boolean;
  isSelectingText: boolean;
  selectionPointerId: number | null;
  selectionStartX: number;
  selectionStartY: number;
  lastPointerX: number;
  lastPointerY: number;
  lastPointerAt: number;
  lastDirectionX: number;
  shakeEnergy: number;
  locatePulseUntil: number;
};

const defaultSpringConfig: SpringConfig = {
  damping: 45,
  stiffness: 400,
  mass: 1,
  restDelta: 0.001
};

const textSelectionActivationDistance = 3;

function isTrackablePointer(pointerType: string) {
  return pointerType !== 'touch';
}

function springTo(axis: SpringAxis, target: number, config: SpringConfig, delta: number) {
  const safeDelta = Math.min(Math.max(delta, 1 / 120), 1 / 30);
  const force = (target - axis.value) * config.stiffness;
  const damping = axis.velocity * config.damping;
  const acceleration = (force - damping) / config.mass;

  axis.velocity += acceleration * safeDelta;
  axis.value += axis.velocity * safeDelta;

  if (Math.abs(target - axis.value) < config.restDelta && Math.abs(axis.velocity) < config.restDelta) {
    axis.value = target;
    axis.velocity = 0;
  }

  return Math.abs(target - axis.value) > config.restDelta || Math.abs(axis.velocity) > config.restDelta;
}

function setAxis(axis: SpringAxis, value: number) {
  axis.value = value;
  axis.velocity = 0;
}

function normalizeAngleDiff(diff: number) {
  if (diff > 180) return diff - 360;
  if (diff < -180) return diff + 360;

  return diff;
}

function isEditableTextTarget(x: number, y: number) {
  const target = document.elementFromPoint(x, y);

  return target instanceof Element && Boolean(target.closest('input, textarea, [contenteditable="true"], [role="textbox"]'));
}

function isInteractiveTarget(x: number, y: number) {
  const target = document.elementFromPoint(x, y);
  if (!(target instanceof Element)) return false;

  return Boolean(target.closest('a, button, select, summary, [role="button"], [role="link"], [aria-haspopup]'));
}

function isCursorTextBlockedTarget(x: number, y: number) {
  const target = document.elementFromPoint(x, y);
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      '[data-cursor-text="off"], [data-nav-chrome], a, button, select, summary, [role="button"], [role="link"], [role="menu"], [role="menuitem"], [aria-haspopup]'
    )
  );
}

function isPointInsideSelection(x: number, y: number) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) return false;

  for (let index = 0; index < selection.rangeCount; index += 1) {
    const range = selection.getRangeAt(index);
    const rects = Array.from(range.getClientRects());

    for (const rect of rects) {
      if (rect.width <= 0 || rect.height <= 0) continue;
      if (rect.height > 96) continue;

      const hitSlop = 2;
      if (
        x >= rect.left - hitSlop &&
        x <= rect.right + hitSlop &&
        y >= rect.top - hitSlop &&
        y <= rect.bottom + hitSlop
      ) {
        return true;
      }
    }
  }

  return false;
}

function isPointOverRenderedText(root: Element, x: number, y: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (node.textContent?.trim()) {
      const range = document.createRange();
      range.selectNodeContents(node);

      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width <= 0 || rect.height <= 0) continue;

        const hitSlop = 2;
        if (
          x >= rect.left - hitSlop &&
          x <= rect.right + hitSlop &&
          y >= rect.top - hitSlop &&
          y <= rect.bottom + hitSlop
        ) {
          return true;
        }
      }
    }

    node = walker.nextNode();
  }

  return false;
}

function isSelectableTextTarget(x: number, y: number) {
  const target = document.elementFromPoint(x, y);
  if (!(target instanceof Element)) return false;

  if (isEditableTextTarget(x, y)) return true;

  if (target.closest('a, button, select, summary, [role="button"], [role="link"], [aria-haspopup]')) {
    return false;
  }

  const textHost = target.closest(
    'p, h1, h2, h3, h4, h5, h6, li, dt, dd, blockquote, pre, code, span, strong, em, small'
  );
  const selectable =
    getComputedStyle(target).userSelect !== 'none' && (!textHost || getComputedStyle(textHost).userSelect !== 'none');

  return Boolean(selectable && textHost && isPointOverRenderedText(textHost, x, y));
}

function shouldUseTextCursor(
  x: number,
  y: number,
  isSelectingText: boolean,
  isSelectionPending = false
) {
  // Once a real selection drag has started, keep the caret latched until pointerup.
  // This must win over element hit-testing so crossing links or buttons cannot
  // flicker the cursor back to the arrow mid-selection.
  if (isSelectingText) return true;
  if (isEditableTextTarget(x, y)) return true;
  if (isCursorTextBlockedTarget(x, y)) return false;
  // Native selectionchange can fire several times before a slow drag crosses the activation threshold.
  if (isSelectionPending) return false;

  return isPointInsideSelection(x, y);
}

function DefaultCursorSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="54"
      viewBox="0 0 50 54"
      fill="none"
      className="smooth-cursor__icon"
    >
      <g filter="url(#smooth-cursor-shadow)">
        <path
          d="M42.682 41.15 27.51 6.8c-.783-1.774-3.302-1.774-4.117 0L7.598 41.15c-.84 1.826.929 3.74 2.815 3.046l13.963-5.146a2.25 2.25 0 0 1 1.566 0l13.87 5.146c1.873.695 3.676-1.22 2.87-3.046Z"
          fill="#020202"
        />
        <path
          d="M43.715 40.693 28.543 6.343c-1.187-2.689-4.966-2.648-6.176-.015L6.572 40.678c-1.259 2.738 1.4 5.62 4.231 4.577l13.963-5.146a1.13 1.13 0 0 1 .783-.001l13.87 5.146c2.807 1.041 5.506-1.82 4.296-4.561Z"
          stroke="white"
          strokeWidth="1.72"
        />
      </g>
      <defs>
        <filter
          id="smooth-cursor-shadow"
          x=".602"
          y=".952"
          width="49.058"
          height="52.428"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.4" />
          <feGaussianBlur stdDeviation="1.6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export default function SmoothCursor({
  enabled,
  cursor = <DefaultCursorSvg />,
  springConfig = defaultSpringConfig
}: SmoothCursorProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const modeFrameRef = useRef(0);
  const lastFrameAtRef = useRef(0);
  const scaleTimeoutRef = useRef<number | null>(null);
  const stateRef = useRef<CursorState>({
    x: { value: 0, velocity: 0 },
    y: { value: 0, velocity: 0 },
    rotation: { value: 0, velocity: 0 },
    scale: { value: 1, velocity: 0 },
    targetX: 0,
    targetY: 0,
    targetRotation: 0,
    targetScale: 1,
    previousAngle: 0,
    hasPosition: false,
    visible: false,
    textMode: false,
    interactiveMode: false,
    isSelectingText: false,
    selectionPointerId: null,
    selectionStartX: 0,
    selectionStartY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerAt: 0,
    lastDirectionX: 0,
    shakeEnergy: 0,
    locatePulseUntil: 0
  });

  useLayoutEffect(() => {
    const element = cursorRef.current;

    if (!enabled || !element) {
      document.documentElement.classList.remove('has-smooth-cursor');
      return undefined;
    }

    const state = stateRef.current;

    const writeCursor = () => {
      element.style.opacity = state.visible ? '1' : '0';
      element.classList.toggle('is-text', state.textMode);
      element.classList.toggle('is-interactive', state.interactiveMode && !state.textMode);
      element.style.setProperty('--smooth-cursor-rotate', `${state.rotation.value.toFixed(3)}deg`);
      element.style.setProperty('--smooth-cursor-scale', state.scale.value.toFixed(3));
      element.style.transform = [
        `translate3d(${state.x.value}px, ${state.y.value}px, 0)`,
        'translate(-50%, -50%)'
      ].join(' ');
    };

    const stopScalePulse = () => {
      if (performance.now() < state.locatePulseUntil) return;
      state.targetScale = 1;
      startFrame();
    };

    const triggerLocatePulse = (currentTime: number) => {
      const nextScale = Math.min(1.86, 1.24 + state.shakeEnergy * 0.13);

      state.locatePulseUntil = currentTime + 460;
      state.targetScale = nextScale;

      if (scaleTimeoutRef.current !== null) window.clearTimeout(scaleTimeoutRef.current);
      scaleTimeoutRef.current = window.setTimeout(stopScalePulse, 460);
    };

    const updateTextMode = () => {
      if (!state.hasPosition) return;

      const isSelectionPending = state.selectionPointerId !== null && !state.isSelectingText;
      const nextTextMode = shouldUseTextCursor(
        state.targetX,
        state.targetY,
        state.isSelectingText,
        isSelectionPending
      );
      const nextInteractiveMode = !nextTextMode && isInteractiveTarget(state.targetX, state.targetY);
      if (state.textMode === nextTextMode && state.interactiveMode === nextInteractiveMode) return;

      state.textMode = nextTextMode;
      state.interactiveMode = nextInteractiveMode;
      writeCursor();
    };

    const scheduleTextModeUpdate = () => {
      if (modeFrameRef.current) return;

      modeFrameRef.current = window.requestAnimationFrame(() => {
        modeFrameRef.current = 0;
        updateTextMode();
      });
    };

    const animate = (time: number) => {
      const previousFrameAt = lastFrameAtRef.current || time;
      const delta = (time - previousFrameAt) / 1000;
      lastFrameAtRef.current = time;

      const isMovingX = springTo(state.x, state.targetX, springConfig, delta);
      const isMovingY = springTo(state.y, state.targetY, springConfig, delta);
      const isRotating = springTo(state.rotation, state.targetRotation, { ...springConfig, damping: 60 }, delta);
      const isScaling = springTo(state.scale, state.targetScale, { ...springConfig, damping: 35 }, delta);

      writeCursor();

      if (isMovingX || isMovingY || isRotating || isScaling) {
        frameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      frameRef.current = 0;
      lastFrameAtRef.current = 0;
    };

    function startFrame() {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(animate);
    }

    const hideCursor = () => {
      state.visible = false;
      writeCursor();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isTrackablePointer(event.pointerType)) return;

      const currentTime = performance.now();
      const currentX = event.clientX;
      const currentY = event.clientY;

      if (
        !state.isSelectingText &&
        state.selectionPointerId === event.pointerId &&
        (event.buttons & 1) === 1 &&
        Math.hypot(currentX - state.selectionStartX, currentY - state.selectionStartY) >=
          textSelectionActivationDistance
      ) {
        state.isSelectingText = true;
      }

      const isSelectionPending = state.selectionPointerId !== null && !state.isSelectingText;

      if (!state.hasPosition) {
        setAxis(state.x, currentX);
        setAxis(state.y, currentY);
        state.targetX = currentX;
        state.targetY = currentY;
        state.lastPointerX = currentX;
        state.lastPointerY = currentY;
        state.lastPointerAt = currentTime;
        state.hasPosition = true;
        state.visible = true;
        state.textMode = shouldUseTextCursor(
          currentX,
          currentY,
          state.isSelectingText,
          isSelectionPending
        );
        state.interactiveMode = !state.textMode && isInteractiveTarget(currentX, currentY);
        writeCursor();
        return;
      }

      const deltaTime = Math.max(currentTime - state.lastPointerAt, 1);
      const deltaX = currentX - state.lastPointerX;
      const velocityX = (currentX - state.lastPointerX) / deltaTime;
      const velocityY = (currentY - state.lastPointerY) / deltaTime;
      const speed = Math.hypot(velocityX, velocityY);
      const directionX = Math.sign(deltaX);
      const directionChanged = directionX !== 0 && state.lastDirectionX !== 0 && directionX !== state.lastDirectionX;

      state.targetX = currentX;
      state.targetY = currentY;
      state.lastPointerX = currentX;
      state.lastPointerY = currentY;
      state.lastPointerAt = currentTime;
      state.visible = true;
      state.textMode = shouldUseTextCursor(
        currentX,
        currentY,
        state.isSelectingText,
        isSelectionPending
      );
      state.interactiveMode = !state.textMode && isInteractiveTarget(currentX, currentY);

      if (state.textMode) {
        setAxis(state.x, currentX);
        setAxis(state.y, currentY);
        writeCursor();
      }

      state.shakeEnergy = Math.max(0, state.shakeEnergy - deltaTime / 180);
      if (Math.abs(deltaX) > 8) state.lastDirectionX = directionX;

      if (directionChanged && Math.abs(velocityX) > 0.95 && Math.abs(deltaX) > 18 && deltaTime < 170) {
        state.shakeEnergy = Math.min(5, state.shakeEnergy + 1.4 + speed * 0.25);

        if (state.shakeEnergy > 2.35) {
          triggerLocatePulse(currentTime);
        }
      }

      if (speed > 0.1) {
        const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI) + 90;
        const angleDiff = normalizeAngleDiff(angle - state.previousAngle);

        state.targetRotation += angleDiff;
        state.previousAngle = angle;

        if (currentTime >= state.locatePulseUntil) {
          state.targetScale = state.interactiveMode ? 0.9 : 0.96;

          if (scaleTimeoutRef.current !== null) window.clearTimeout(scaleTimeoutRef.current);
          scaleTimeoutRef.current = window.setTimeout(stopScalePulse, 150);
        }
      }

      startFrame();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!isTrackablePointer(event.pointerType)) return;
      if (event.button !== 0) return;

      const canStartTextSelection = isSelectableTextTarget(event.clientX, event.clientY);

      state.isSelectingText = false;
      state.selectionPointerId = canStartTextSelection ? event.pointerId : null;
      state.selectionStartX = event.clientX;
      state.selectionStartY = event.clientY;
      state.textMode = shouldUseTextCursor(event.clientX, event.clientY, false, canStartTextSelection);
      state.interactiveMode = !state.textMode && isInteractiveTarget(event.clientX, event.clientY);

      if (state.textMode) {
        state.targetX = event.clientX;
        state.targetY = event.clientY;
        setAxis(state.x, event.clientX);
        setAxis(state.y, event.clientY);
      }

      writeCursor();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (state.selectionPointerId !== null && event.pointerId !== state.selectionPointerId) return;

      state.isSelectingText = false;
      state.selectionPointerId = null;
      state.selectionStartX = 0;
      state.selectionStartY = 0;
      updateTextMode();
    };

    const handleBlur = () => {
      state.isSelectingText = false;
      state.selectionPointerId = null;
      state.selectionStartX = 0;
      state.selectionStartY = 0;
      hideCursor();
    };

    document.documentElement.classList.add('has-smooth-cursor');
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    document.addEventListener('selectionchange', scheduleTextModeUpdate);
    window.addEventListener('scroll', scheduleTextModeUpdate, { capture: true, passive: true });
    window.addEventListener('resize', scheduleTextModeUpdate, { passive: true });
    window.addEventListener('pointerleave', hideCursor);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.documentElement.classList.remove('has-smooth-cursor');
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('selectionchange', scheduleTextModeUpdate);
      window.removeEventListener('scroll', scheduleTextModeUpdate, true);
      window.removeEventListener('resize', scheduleTextModeUpdate);
      window.removeEventListener('pointerleave', hideCursor);
      window.removeEventListener('blur', handleBlur);

      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (modeFrameRef.current) window.cancelAnimationFrame(modeFrameRef.current);
      if (scaleTimeoutRef.current !== null) window.clearTimeout(scaleTimeoutRef.current);

      frameRef.current = 0;
      modeFrameRef.current = 0;
      scaleTimeoutRef.current = null;
      state.visible = false;
      state.isSelectingText = false;
      state.selectionPointerId = null;
      state.selectionStartX = 0;
      state.selectionStartY = 0;
      state.textMode = false;
      state.interactiveMode = false;
    };
  }, [enabled, springConfig]);

  if (!enabled) return null;

  return (
    <div className="smooth-cursor" ref={cursorRef} aria-hidden="true">
      <span className="smooth-cursor__arrow">{cursor}</span>
      <span className="smooth-cursor__text-caret" />
    </div>
  );
}
