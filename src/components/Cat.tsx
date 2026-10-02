export type CatPose = 'sleepy' | 'wave' | 'happy' | 'curious';

export interface CatProps {
  pose?: CatPose;
  size?: number;
  className?: string;
  /** Set false for a still illustration (used inside dense lists). */
  animated?: boolean;
  title?: string;
}

const FUR = 'var(--cat-body, #FFFBF7)';
const LINE = 'var(--cat-outline, #B592A4)';
const WHISKER = 'var(--cat-whisker, var(--cat-outline, #B592A4))';
const BLUSH = 'var(--cat-blush, #F4C3A8)';
const NOSE = 'var(--cat-nose, #F4C3A8)';
const FACE = 'var(--cat-face, #4A3540)';
const STRIPES = 'var(--cat-stripes, #D9BFCC)';

/**
 * Toodles: an original round, sleepy cat drawn in plain SVG.
 * Designed to look soothing, distinct, and visible in both light & dark mode.
 */
export function Cat({
  pose = 'sleepy',
  size = 140,
  className,
  animated = true,
  title = 'Toodles, a round sleepy cat',
}: CatProps) {
  const blink = animated ? 'animate-blink' : undefined;
  const float = animated && pose !== 'sleepy' ? 'animate-float' : undefined;

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 160 152"
      width={size}
      height={(size * 152) / 160}
      className={className}
    >
      <g className={float}>
        {/* tail */}
        <path
          d="M124 116c18 2 24 16 13 24-9 7-24 2-26-9"
          fill="none"
          stroke={WHISKER}
          strokeWidth={9}
          strokeLinecap="round"
        />
        {/* body */}
        <ellipse cx="80" cy="114" rx="39" ry="27" fill={FUR} stroke={LINE} strokeWidth={4} />
        {/* front paws */}
        <ellipse cx="60" cy="136" rx="13" ry="8" fill={FUR} stroke={LINE} strokeWidth={4} />
        <ellipse cx="100" cy="136" rx="13" ry="8" fill={FUR} stroke={LINE} strokeWidth={4} />
        {/* chest tuft */}
        <path
          d="M80 96c-6 6-6 12 0 16 6-4 6-10 0-16z"
          fill={FUR}
          stroke={LINE}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* ears */}
        <path
          d="M46 44 38 14l30 12z"
          fill={FUR}
          stroke={LINE}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path
          d="M114 44l8-30-30 12z"
          fill={FUR}
          stroke={LINE}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path d="M49 34 45 22l12 5z" fill={BLUSH} />
        <path d="M111 34l4-12-12 5z" fill={BLUSH} />

        {/* head */}
        <ellipse cx="80" cy="68" rx="45" ry="39" fill={FUR} stroke={LINE} strokeWidth={4} />

        {/* forehead stripes */}
        <path
          d="M62 34q6 9 0 16M80 28q6 10 0 18M98 34q-6 9 0 16"
          fill="none"
          stroke={STRIPES}
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* eyes */}
        <g className={blink} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {pose === 'sleepy' && (
            <>
              <path
                d="M54 68q10 10 20 0"
                fill="none"
                stroke={FACE}
                strokeWidth={4}
                strokeLinecap="round"
              />
              <path
                d="M86 68q10 10 20 0"
                fill="none"
                stroke={FACE}
                strokeWidth={4}
                strokeLinecap="round"
              />
            </>
          )}

          {(pose === 'wave' || pose === 'happy') && (
            <>
              <path
                d="M54 70q10-11 20 0"
                fill="none"
                stroke={FACE}
                strokeWidth={4.4}
                strokeLinecap="round"
              />
              <path
                d="M86 70q10-11 20 0"
                fill="none"
                stroke={FACE}
                strokeWidth={4.4}
                strokeLinecap="round"
              />
            </>
          )}

          {pose === 'curious' && (
            <>
              <ellipse cx="64" cy="68" rx="8.5" ry="9.5" fill={FACE} />
              <ellipse cx="96" cy="68" rx="8.5" ry="9.5" fill={FACE} />
              <circle cx="67" cy="64" r="3" fill={FUR} />
              <circle cx="99" cy="64" r="3" fill={FUR} />
            </>
          )}
        </g>

        {/* nose + mouth */}
        <path d="M74 78h12l-6 6z" fill={NOSE} />
        <path
          d={pose === 'curious' ? 'M80 84q0 7-9 5M80 84q0 7 9 5' : 'M80 84q0 6-8 4M80 84q0 6 8 4'}
          fill="none"
          stroke={FACE}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* whiskers */}
        <path
          d="M28 62h-14M28 72l-14 4M132 62h14M132 72l14 4"
          stroke={WHISKER}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* blush */}
        <ellipse cx="46" cy="82" rx="8" ry="5" fill={BLUSH} opacity="0.9" />
        <ellipse cx="114" cy="82" rx="8" ry="5" fill={BLUSH} opacity="0.9" />
      </g>

      {/* pose extras */}
      {pose === 'sleepy' && (
        <g className={animated ? 'animate-snooze' : undefined} fill={STRIPES} opacity="0.9">
          <text x="126" y="46" fontSize="20" fontFamily="Chewy, cursive">
            z
          </text>
          <text x="140" y="30" fontSize="14" fontFamily="Chewy, cursive">
            z
          </text>
        </g>
      )}

      {pose === 'wave' && (
        <g className="animate-pop" style={{ transformBox: 'fill-box', transformOrigin: 'bottom center' }}>
          <ellipse cx="116" cy="98" rx="10" ry="16" fill={FUR} stroke={LINE} strokeWidth={4} />
          <path d="M124 90q4-8 10-6" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
