import {
  createElement,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import gsap from 'gsap';
import './TextType.css';

type VariableSpeed = {
  min: number;
  max: number;
};

type TextTypeProps<T extends ElementType = 'div'> = {
  text: string | string[];
  as?: T;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: ReactNode;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: VariableSpeed;
  variableSpeedEnabled?: boolean;
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export default function TextType<T extends ElementType = 'div'>({
  text,
  as,
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  variableSpeedEnabled = false,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  disabled = false,
  ...props
}: TextTypeProps<T>) {
  const Component = as ?? 'div';
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const completedRef = useRef(false);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const effectiveVariableSpeed = variableSpeedEnabled ? (variableSpeed ?? { min: 35, max: 88 }) : variableSpeed;
  const staticText = textArray[0] ?? '';

  const getRandomSpeed = useCallback(() => {
    if (!effectiveVariableSpeed) return typingSpeed;
    const { min, max } = effectiveVariableSpeed;
    return Math.random() * (max - min) + min;
  }, [effectiveVariableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return 'inherit';
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (disabled) {
      setDisplayedText(staticText);
      setCurrentCharIndex(staticText.length);
      setIsDeleting(false);
      return;
    }

    setDisplayedText('');
    setCurrentCharIndex(0);
    setIsDeleting(false);
    setCurrentTextIndex(0);
    completedRef.current = false;
  }, [disabled, staticText]);

  useEffect(() => {
    if (disabled || !startOnVisible || !containerRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [disabled, startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return undefined;

    gsap.set(cursorRef.current, { opacity: 1 });
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });

    return () => {
      tween.kill();
    };
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (disabled || !isVisible || loop) return undefined;

    const currentText = staticText;
    const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;
    const state = { index: 0 };

    const delayedCall = gsap.delayedCall(initialDelay / 1000, () => {
      gsap.to(state, {
        index: processedText.length,
        duration: Math.max(0.32, (processedText.length * typingSpeed) / 1000),
        ease: 'none',
        onUpdate: () => {
          const nextIndex = Math.min(processedText.length, Math.floor(state.index));
          setDisplayedText(processedText.slice(0, nextIndex));
          setCurrentCharIndex(nextIndex);
        },
        onComplete: () => {
          setDisplayedText(processedText);
          setCurrentCharIndex(processedText.length);
          if (!completedRef.current) {
            completedRef.current = true;
            onSentenceComplete?.(currentText, 0);
          }
        }
      });
    });

    return () => {
      delayedCall.kill();
      gsap.killTweensOf(state);
    };
  }, [
    disabled,
    initialDelay,
    isVisible,
    loop,
    onSentenceComplete,
    reverseMode,
    staticText,
    typingSpeed
  ]);

  useEffect(() => {
    if (disabled || !isVisible || !loop) return undefined;

    let timeout: number | undefined;
    const currentText = textArray[currentTextIndex] ?? '';
    const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === '') {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) return;
          onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
          setCurrentTextIndex((previous) => (previous + 1) % textArray.length);
          setCurrentCharIndex(0);
        } else {
          timeout = window.setTimeout(() => {
            setDisplayedText((previous) => previous.slice(0, -1));
          }, deletingSpeed);
        }
        return;
      }

      if (currentCharIndex < processedText.length) {
        timeout = window.setTimeout(
          () => {
            setDisplayedText((previous) => previous + processedText[currentCharIndex]);
            setCurrentCharIndex((previous) => previous + 1);
          },
          effectiveVariableSpeed ? getRandomSpeed() : typingSpeed
        );
        return;
      }

      if (!completedRef.current) {
        completedRef.current = true;
        onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
      }

      if (!loop && currentTextIndex === textArray.length - 1) return;

      timeout = window.setTimeout(() => {
        completedRef.current = false;
        setIsDeleting(true);
      }, pauseDuration);
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
      timeout = window.setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [
    currentCharIndex,
    deletingSpeed,
    disabled,
    displayedText,
    effectiveVariableSpeed,
    getRandomSpeed,
    initialDelay,
    isDeleting,
    isVisible,
    loop,
    onSentenceComplete,
    pauseDuration,
    reverseMode,
    textArray,
    currentTextIndex,
    typingSpeed
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping && (currentCharIndex < (textArray[currentTextIndex]?.length ?? 0) || isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`.trim(),
      ...props
    },
    <span className="text-type__content" style={{ color: getCurrentTextColor() }}>
      {disabled ? staticText : displayedText}
    </span>,
    showCursor && (
      <span
        aria-hidden="true"
        className={`text-type__cursor ${cursorClassName} ${shouldHideCursor ? 'text-type__cursor--hidden' : ''}`.trim()}
        ref={cursorRef}
      >
        {cursorCharacter}
      </span>
    )
  );
}
