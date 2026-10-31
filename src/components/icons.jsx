function Icon({ children, size = 20, className = '', ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {children}
    </svg>
  )
}

export function IconEye(props) {
  return <Icon {...props}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></Icon>
}

export function IconPen(props) {
  return <Icon {...props}><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" /><path d="M13.5 7.5l3 3" /></Icon>
}

export function IconTrash(props) {
  return <Icon {...props}><path d="M4 7h16" /><path d="M9 7V5h6v2" /><path d="M6.5 7l1 13h9l1-13" /><path d="M10 11v6M14 11v6" /></Icon>
}

export function IconX(props) {
  return <Icon {...props}><path d="M5.5 5.5c4.5 4.3 9 8.9 13 13" /><path d="M18.5 5.5c-4.4 4.4-8.8 8.8-13 13" /></Icon>
}

export function IconSearch(props) {
  return <Icon {...props}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></Icon>
}

export function IconUpload(props) {
  return <Icon {...props}><path d="M12 16V5" /><path d="M7.5 9.5L12 5l4.5 4.5" /><path d="M4 16v3h16v-3" /></Icon>
}

export function IconPlus(props) {
  return <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>
}

export function IconMinus(props) {
  return <Icon {...props}><path d="M5 12h14" /></Icon>
}

export function IconReset(props) {
  return <Icon {...props}><path d="M4 10a8 8 0 1 1 2 6" /><path d="M4 5v5h5" /></Icon>
}

export function IconGitHub(props) {
  return (
    <Icon {...props}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </Icon>
  )
}

export function IconMail(props) {
  return (
    <Icon {...props}>
      <rect x="2" y="4.5" width="20" height="15" rx="2" />
      <path d="m2.5 6.5 8.4 5.6a2 2 0 0 0 2.2 0l8.4-5.6" />
    </Icon>
  )
}

export function IconChevronLeft(props) {
  return <Icon {...props}><path d="M15 18l-6-6 6-6" /></Icon>
}

export function IconChevronRight(props) {
  return <Icon {...props}><path d="M9 18l6-6-6-6" /></Icon>
}

export function IconArrowRight(props) {
  return <Icon {...props}><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></Icon>
}

export function IconHeart(props) {
  return <Icon {...props}><path d="M12 20s-7-4.6-9.2-9C1.3 8 2.6 4.7 5.9 4.3 8 4 9.4 5.1 12 8c2.6-2.9 4-4 6.1-3.7 3.3.4 4.6 3.7 3.1 6.7C19 15.4 12 20 12 20Z" /></Icon>
}
