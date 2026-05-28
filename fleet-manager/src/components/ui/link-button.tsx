import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

type ButtonVariants = VariantProps<typeof buttonVariants>

interface LinkButtonProps extends ButtonVariants {
  href: string
  className?: string
  children: React.ReactNode
}

export function LinkButton({ href, variant, size, className, children }: LinkButtonProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  )
}
