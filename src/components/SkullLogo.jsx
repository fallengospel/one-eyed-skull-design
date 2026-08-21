export default function SkullLogo({ size = 40, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 5C14.5 5 8 11.2 8 20c0 4.9 2.4 8.7 6 11v4.6c0 1.5 1.2 2.7 2.7 2.7h14.6c1.5 0 2.7-1.2 2.7-2.7V31c3.6-2.3 6-6.1 6-11 0-8.8-6.5-15-16-15Z"
        fill="#f0f0ea"
      />
      <circle cx="30" cy="21.5" r="3.2" fill="#08080b" />
      <path
        d="M14.2 18l5.8 5.8M20 18l-5.8 5.8"
        stroke="#08080b"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M24 27l-2.2 3.8h4.4L24 27Z" fill="#08080b" />
      <path d="M19 42v-5M24 42v-5M29 42v-5" stroke="#08080b" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
