"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  triggerClassName?: string
  triggerLabel?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  triggerClassName,
  triggerLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [triggerWidth, setTriggerWidth] = React.useState<number | null>(null)

  const selectedOption = options.find((o) => o.value === value)
  const displayLabel = selectedOption
    ? selectedOption.label
    : triggerLabel ?? placeholder

  const filtered =
    search.trim() === ""
      ? options
      : options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase().trim())
        )

  const handleSelect = React.useCallback(
    (val: string | undefined) => {
      onValueChange?.(val)
      setOpen(false)
      setSearch("")
    },
    [onValueChange]
  )

  // When opening, capture trigger width for dropdown
  React.useEffect(() => {
    if (open && containerRef.current) {
      setTriggerWidth(containerRef.current.offsetWidth)
    } else if (!open) {
      setTriggerWidth(null)
    }
  }, [open])

  // Close on click outside
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open])

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full justify-between font-normal",
          !value && "text-muted-foreground",
          triggerClassName
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-1 rounded-md border bg-popover p-2 shadow-md"
          style={{ width: triggerWidth ?? containerRef.current?.offsetWidth ?? "auto", minWidth: 160 }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <div className="max-h-80 overflow-y-auto text-sm mt-2">
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Check className={cn("h-4 w-4 shrink-0", value == null ? "opacity-100" : "opacity-0")} />
              <span>{placeholder}</span>
            </button>
            {filtered.length === 0 ? (
              <div className="px-2 py-1.5 text-muted-foreground">{emptyText}</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
