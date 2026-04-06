import { getInitials } from "@/utils/initials"
import { colorFromName } from "@/utils/colors"
import { cn } from "@/lib/utils"

export function Avatar({ name = "", avatarUrl = null, avatarColor = null, avatarTextColor = null, size = "md", shape = "circle", className }) {
  const { bg, text } = colorFromName(name)
  const fallbackTextColor = text || "#FFFFFF"

  const sizes = {
    sm: "w-6 h-6 text-[9px]",
    md: "w-8 h-8 text-[11px]",
    lg: "w-14 h-14 text-xl",
  }

  const shapes = {
    circle: "rounded-full",
    square: "rounded-md",
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          "object-cover flex-shrink-0",
          sizes[size],
          shapes[shape],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-shrink-0 font-medium",
        sizes[size],
        shapes[shape],
        className
      )}
      style={{ backgroundColor: avatarColor || bg, color: avatarTextColor || fallbackTextColor }}
    >
      {getInitials(name)}
    </div>
  )
}