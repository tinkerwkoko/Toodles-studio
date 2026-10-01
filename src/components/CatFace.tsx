import type { MoodLevel } from '../types';

export interface CatFaceProps {
  mood?: MoodLevel | 'doe' | 'curious' | 'sleepy';
  size?: number;
  className?: string;
  /** Hides the decorative label from screen readers when the mood is spoken. */
  decorative?: boolean;
  animated?: boolean;
}

const FUR = 'var(--color-cat-body, #FFFCFA)';
const LINE = 'var(--color-cat-outline, #B592A4)';
const FACE = 'var(--color-ink, #4A3540)';
const NOSE = 'var(--color-peach-300, #F4C3A8)';
const BLUSH = 'var(--color-peach-300, #F4C3A8)';
const ACCENT = 'var(--color-lilac-300, #D9BFCC)';

/** Cat expressions used by the mood tracker and page headings. */
export function CatFace({
  mood = 'doe',
  size = 40,
  className,
  decorative = true,
  animated = false,
}: CatFaceProps) {
  const blink = animated ? 'animate-blink' : undefined;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : `${mood} cat face`}
    >
      <path d="M16 22 12 8l14 6z" fill={FUR} stroke={LINE} strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M48 22l4-14-14 6z" fill={FUR} stroke={LINE} strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M16 19 14 11l8 4z" fill={BLUSH} />
      <path d="M48 19 50 11l-8 4z" fill={BLUSH} />

      <circle cx="32" cy="36" r="22" fill={FUR} stroke={LINE} strokeWidth={2.6} />

      {/* forehead stripes */}
      <path
        d="M26 22q2 3 0 6M32 20q2 4 0 7M38 22q-2 3 0 6"
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {mood === 'sleepy' && (
        <g className={animated ? 'animate-snooze' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {/* soft curved sleeping eyes */}
          <path
            d="M19 33q5 6 10 0"
            fill="none"
            stroke={FACE}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <path
            d="M35 33q5 6 10 0"
            fill="none"
            stroke={FACE}
            strokeWidth={2.4}
            strokeLinecap="round"
          />

          {/* peaceful sleeping mouth */}
          <path
            d="M32 41q0 2-3 1.5M32 41q0 2 3 1.5"
            fill="none"
            stroke={FACE}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* relaxed whiskers */}
          <path
            d="M12 37H5M12 41l-6 1M52 37h7M52 41l6 1"
            stroke={LINE}
            strokeWidth={1.8}
            strokeLinecap="round"
          />

          {/* floating sleepy z's */}
          <text
            x="48"
            y="23"
            fontSize="9"
            fontFamily="Chewy, cursive"
            fill={ACCENT}
            opacity="0.9"
          >
            z
          </text>
          <text
            x="54"
            y="16"
            fontSize="7"
            fontFamily="Chewy, cursive"
            fill={ACCENT}
            opacity="0.85"
          >
            z
          </text>
        </g>
      )}

      {(mood === 'doe' || mood === 'curious') && (
        <g className={blink} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {/* doe eyes with specular catchlights */}
          <ellipse cx="23.5" cy="33.5" rx="4.2" ry="4.8" fill={FACE} />
          <ellipse cx="40.5" cy="33.5" rx="4.2" ry="4.8" fill={FACE} />
          <circle cx="25" cy="31.8" r="1.5" fill={FUR} />
          <circle cx="42" cy="31.8" r="1.5" fill={FUR} />
          <circle cx="22.5" cy="34.8" r="0.7" fill={FUR} opacity="0.8" />
          <circle cx="39.5" cy="34.8" r="0.7" fill={FUR} opacity="0.8" />

          {/* cute mouth */}
          <path
            d="M32 41q0 3-4 2M32 41q0 3 4 2"
            fill="none"
            stroke={FACE}
            strokeWidth={2.2}
            strokeLinecap="round"
          />

          {/* whiskers */}
          <path
            d="M12 36H5M12 40l-6 2M52 36h7M52 40l6 2"
            stroke={LINE}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </g>
      )}

      {mood === 'happy' && (
        <>
          <path d="M19 34q5-6 10 0" fill="none" stroke={FACE} strokeWidth={2.8} strokeLinecap="round" />
          <path d="M35 34q5-6 10 0" fill="none" stroke={FACE} strokeWidth={2.8} strokeLinecap="round" />
          <path d="M32 41q-6 6-10 1" fill="none" stroke={FACE} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M32 41q6 6 10 1" fill="none" stroke={FACE} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}

      {mood === 'good' && (
        <>
          <circle cx="24" cy="34" r="2.4" fill={FACE} />
          <circle cx="40" cy="34" r="2.4" fill={FACE} />
          <path d="M31 41q-5 5-8 1" fill="none" stroke={FACE} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M33 41q5 5 8 1" fill="none" stroke={FACE} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}

      {mood === 'okay' && (
        <>
          <path d="M20 34h8" stroke={FACE} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M36 34h8" stroke={FACE} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M28 43h8" stroke={FACE} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}

      {mood === 'low' && (
        <>
          <path d="M20 36q4-3 8 1" fill="none" stroke={FACE} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M36 37q4-4 8-1" fill="none" stroke={FACE} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M28 46q4-4 8 0" fill="none" stroke={FACE} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}

      {mood === 'difficult' && (
        <>
          <path d="M20 31l8 5M28 31l-8 5" stroke={FACE} strokeWidth={2.2} strokeLinecap="round" />
          <path d="M36 31l8 5M44 31l-8 5" stroke={FACE} strokeWidth={2.2} strokeLinecap="round" />
          <path
            d="M27 45q3-4 6 0 3 4 6 0"
            fill="none"
            stroke={FACE}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </>
      )}

      <path d="M29 38h6l-3 3z" fill={NOSE} />
      <ellipse cx="17" cy="41" rx="4" ry="2.6" fill={BLUSH} opacity="0.85" />
      <ellipse cx="47" cy="41" rx="4" ry="2.6" fill={BLUSH} opacity="0.85" />
    </svg>
  );
}
