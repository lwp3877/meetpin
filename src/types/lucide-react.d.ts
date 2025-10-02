// Type declarations for lucide-react individual icon imports
// This allows TypeScript to recognize individual icon imports without errors

declare module 'lucide-react/dist/esm/icons/*' {
  import { LucideIcon } from 'lucide-react'
  const icon: LucideIcon
  export default icon
}
