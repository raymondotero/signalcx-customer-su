import { CSSProperties } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

interface ToasterPrimaryProps extends ToasterProps {
  className?: string
}

const Toaster = ({ ...props }: ToasterPrimaryProps) => {
  return (
    <Sonner
      theme="light"
      style={
        {
          "--normal-bg": "hsl(var(--card))",
          "--normal-border": "hsl(var(--border))",
          "--normal-text": "hsl(var(--card-foreground))",
          "--success-bg": "hsl(var(--muted))",
          "--success-border": "hsl(var(--border))",
          "--success-text": "hsl(var(--card-foreground))",
          "--info-bg": "hsl(var(--muted))",
          "--info-border": "hsl(var(--border))",
          "--info-text": "hsl(var(--card-foreground))",
          "--warning-bg": "hsl(var(--muted))",
          "--warning-border": "hsl(var(--border))",
          "--warning-text": "hsl(var(--card-foreground))",
          "--error-bg": "hsl(var(--destructive))",
          "--error-border": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
        } as CSSProperties
      }
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }