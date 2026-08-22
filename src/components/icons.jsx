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
