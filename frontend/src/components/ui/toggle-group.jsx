import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const toggleGroupVariants = cva(
    "flex items-center justify-center gap-1",
    {
        variants: {
            variant: {
                default: "bg-transparent",
                outline: "border border-input bg-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const ToggleGroup = React.forwardRef(({ className, variant, size, children, ...props }, ref) => (
    <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn(toggleGroupVariants({ variant, className }))}
        {...props}
    >
        {children}
    </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef(({ className, children, variant, size, ...props }, ref) => (
    <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
            toggleVariants({
                variant,
                size,
            }),
            className
        )}
        {...props}
    >
        {children}
    </ToggleGroupPrimitive.Item>
))

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
