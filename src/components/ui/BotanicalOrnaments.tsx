import { cx } from '../../lib/cx';

/**
 * Delicate engraving-inspired fine-line botanical ornaments.
 * All SVGs use currentColor with fine strokes (0.9–1.1px) so they harmonize
 * naturally in both sunlit botanical light mode and enchanted forest night mode.
 */

export function BotanicalDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx('flex items-center gap-3 text-sage/75 select-none', className)}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-divider to-divider" />
      <svg
        width="54"
        height="16"
        viewBox="0 0 54 16"
        fill="none"
        className="shrink-0 text-fern/70"
      >
        {/* Flowing delicate stem */}
        <path
          d="M2 8.5C11 8.5 17 7.5 27 8C37 8.5 43 7.5 52 8.5"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        {/* Left tender leaves */}
        <path
          d="M17 8C14.5 5 11.5 4.2 9.5 4.5C11.2 6.8 14 7.8 17 8Z"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
        <path
          d="M21 8.2C18.8 11 16 12 14 11.8C15.8 9.6 18.2 8.5 21 8.2Z"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
        {/* Center tiny wildflower bud */}
        <circle cx="27" cy="8" r="2.2" stroke="currentColor" strokeWidth="0.9" />
        <path
          d="M27 3.5V5.5M27 10.5V12.5M24.2 5.4L25.4 6.5M29.8 5.4L28.6 6.5"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        {/* Right tender leaves */}
        <path
          d="M37 8C39.5 5 42.5 4.2 44.5 4.5C42.8 6.8 40 7.8 37 8Z"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
        <path
          d="M33 8.2C35.2 11 38 12 40 11.8C38.2 9.6 35.8 8.5 33 8.2Z"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
      </svg>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-divider to-divider" />
    </div>
  );
}

/** Graceful arching fern frond for subtle margins, sidebar footers, and hero corners. */
export function FernSprig({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 86"
      fill="none"
      className={cx('pointer-events-none select-none', className)}
    >
      {/* Main graceful arching stem */}
      <path
        d="M8 78C26 60 56 35 110 14"
        stroke="currentColor"
        strokeWidth="0.95"
        strokeLinecap="round"
      />
      {/* Upper fern leaflets */}
      <path
        d="M24 63C20 51 22 41 26 36C29 43 29 53 24 63Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M39 51C36 40 39 31 44 26C46 33 45 42 39 51Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M55 40C53 30 57 22 62 18C63 24 61 32 55 40Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M72 30C71 22 75 16 80 13C80 18 78 25 72 30Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M88 22C88 16 92 12 96 10C96 14 93 19 88 22Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      {/* Lower fern leaflets */}
      <path
        d="M30 58C42 58 51 62 56 67C48 68 38 65 30 58Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M46 46C57 46 66 49 71 53C63 54 54 52 46 46Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M63 35C73 35 81 37 85 41C78 42 70 40 63 35Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M79 26C87 26 94 28 97 31C91 32 85 30 79 26Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      {/* Delicate wildflower accent beside stem */}
      <path
        d="M18 71C24 72 31 75 35 80"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <circle cx="37" cy="81" r="1.8" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/** Fine-line wildflower & vine sprig for subtle editorial corner framing. */
export function WildflowerSprig({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 88 88"
      fill="none"
      className={cx('pointer-events-none select-none', className)}
    >
      {/* Delicate curved corner vine */}
      <path
        d="M10 78C14 54 28 30 54 16C64 11 72 9 80 8"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {/* Five-petal wildflower blossom */}
      <g stroke="currentColor" strokeWidth="0.85">
        <circle cx="39" cy="31" r="2.2" />
        <path d="M39 28.5C37 23 41 23 39 28.5Z" />
        <path d="M41.3 30.2C46.5 28 47.5 32 41.3 30.2Z" />
        <path d="M40.5 32.8C44 37.5 40.5 39.5 40.5 32.8Z" />
        <path d="M37.5 32.8C34 37.5 37.5 39.5 37.5 32.8Z" />
        <path d="M36.7 30.2C31.5 28 30.5 32 36.7 30.2Z" />
      </g>
      {/* Small accompanying leaves */}
      <path
        d="M23 53C16 49 13 43 13 38C18 41 22 47 23 53Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M27 46C34 45 40 48 44 52C38 53 32 51 27 46Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M54 16C52 10 54 6 58 4C59 8 58 13 54 16Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M65 11C69 15 74 17 78 17C75 13 70 11 65 11Z"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      {/* Tiny trailing bud */}
      <path
        d="M16 66C21 67 25 70 28 74"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <circle cx="29.5" cy="75.5" r="1.6" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/** Tiny inline botanical leaf flourish for chapter headings or diary dates. */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cx('inline-block shrink-0', className)}
    >
      <path
        d="M3 13C4.5 8 8.5 4.5 13 3C12 7.5 8.5 11.5 3 13Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M3 13L10.5 5.5"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
    </svg>
  );
}
