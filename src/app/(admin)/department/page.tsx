"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddModal } from "@/components/ui/add-modal"
import { ProgramAdd } from "@/components/department/program"
import { SectionAdd } from "@/components/department/section"
import { CourseAdd } from "@/components/department/course"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus } from "lucide-react"
import { Section } from "@/generated/prisma/browser"

interface Program {
  id: string
  name: string
}

interface Course {
  id: string
  name: string
  programId: string
  sectionId: string
}

export default function DepartmentDashboard() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programRes, courseRes, sectionRes] = await Promise.all([
          fetch("/api/create/department/program"),
          fetch("/api/create/department/course"),
          fetch("/api/create/department/section"),
        ])
        const programData = await programRes.json()
        const courseData = await courseRes.json()
        const sectionData = await sectionRes.json()
        setPrograms(programData)
        setCourses(courseData)
        setSections(sectionData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Department Overview</h1>
            <p className="text-muted-foreground mt-2">Manage your academic programs, sections, and courses</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create New Item</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                <AddModal triggerText="Program" title="Add Program">
                  <ProgramAdd />
                </AddModal>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                <AddModal triggerText="Section" title="Add Section">
                  <SectionAdd />
                </AddModal>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                <AddModal triggerText="Course" title="Add Course">
                  <CourseAdd />
                </AddModal>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Programs Card */}
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Programs</CardTitle>
                  <CardDescription>Active academic programs</CardDescription>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-foreground">{loading ? "-" : programs.length}</p>
                <p className="text-sm text-muted-foreground">Total programs in department</p>
              </div>
            </CardContent>
          </Card>

          {/* Courses Card */}
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Courses</CardTitle>
                  <CardDescription>Course offerings</CardDescription>
                </div>
                <div className="bg-chart-1/10 p-3 rounded-lg">
                  <BookOpen className="w-5 h-5 text-chart-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-foreground">{loading ? "-" : courses.length}</p>
                <p className="text-sm text-muted-foreground">Total courses available</p>
              </div>
            </CardContent>
          </Card>

          {/* Sections Card */}
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Sections</CardTitle>
                  <CardDescription>Course sections</CardDescription>
                </div>
                <div className="bg-chart-2/10 p-3 rounded-lg">
                  <BookOpen className="w-5 h-5 text-chart-2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-foreground">{loading ? "-" : sections.length}</p>
                <p className="text-sm text-muted-foreground">Total active sections</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Active Programs</span>
                  <span className="font-semibold">{programs.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Total Courses</span>
                  <span className="font-semibold">{courses.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AddModal triggerText="+ Add Program" title="Add Program">
                  <ProgramAdd />
                </AddModal>
                <AddModal triggerText="+ Add Course" title="Add Course">
                  <CourseAdd />
                </AddModal>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
