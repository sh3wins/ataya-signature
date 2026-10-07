/** ATAYA SIGNATURE wordmark with a tiny drip hanging off the final A. */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`group/wm inline-flex flex-col items-start leading-none ${className}`}>
      <span className="relative inline-flex items-start font-display tracking-[0.18em]">
        ATAYA
        <svg
          aria-hidden
          viewBox="0 0 10 24"
          className="absolute right-[0.13em] top-[88%] h-[0.7em] w-[0.3em] origin-top transition-transform duration-700 ease-[var(--ease-scoop)] group-hover/wm:scale-y-[1.6]"
        >
          <path d="M5 0 C5 6 2 10 2 14 C2 17 3.5 19 5 19 C6.5 19 8 17 8 14 C8 10 5 6 5 0 Z" fill="currentColor" />
        </svg>
      </span>
      <span className="mt-[0.4em] font-sans text-[0.4em] font-semibold uppercase tracking-[0.12em]">Signature</span>
    </span>
  );
}
