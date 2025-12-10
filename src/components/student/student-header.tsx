"use client"

import { ChevronDown } from "lucide-react"

export function StudentHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Student Management</h1>
        <p className="text-muted-foreground">View and manage all enrolled students</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
        <span>Filter</span>
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  )
}
