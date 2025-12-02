"use client"

import * as React from "react"
import { Disclosure } from "@headlessui/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AccordionProps {
  children: React.ReactNode
  className?: string
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>
}

export interface AccordionItemProps {
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ children, className }: AccordionItemProps) {
  return <div className={cn("border rounded-md", className)}>{children}</div>
}

export interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  return (
    <Disclosure.Button
      className={cn(
        "flex w-full items-center justify-between px-3 py-2 text-sm font-medium",
        "hover:bg-muted",
        className
      )}
    >
      <span className="line-clamp-1">{children}</span>
      <ChevronDown className="h-4 w-4 ui-open:rotate-180 transition-transform" />
    </Disclosure.Button>
  )
}

export interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  return (
    <Disclosure.Panel className={cn("px-3 pb-3 text-sm", className)}>
      {children}
    </Disclosure.Panel>
  )
}

export function AccordionItemRoot({ children }: { children: React.ReactNode }) {
  return (
    <Disclosure as="div" className="overflow-hidden rounded-md">
      {children}
    </Disclosure>
  )
}

