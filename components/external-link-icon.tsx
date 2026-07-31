// components/external-link-icon.tsx
import { ExternalLink } from 'lucide-react'

interface ExternalLinkIconProps {
  href: string
  label: string  // for screen readers
}

export function ExternalLinkIcon({ href, label }: ExternalLinkIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
    >
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}