"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
  BookOpen,
  Users,
  Star,
  GraduationCap,
  Building2,
  BookMarked,
  FileText,
  Download,
  Filter,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateInstructorReport } from "@/lib/generateInstructorReport";

interface Question {
  questionText: string;
  totalScore: number;
  count: number;
  average: number;
}

interface CategoryAverage {
  categoryName: string;
  average: number;
  questions: Question[];
}

interface ProgramAverage {
  programId: string;
  programName: string;
  totalScore: number;
  count: number;
  average: number;
  responses: number;
}

interface SectionAverage {
  sectionId: string;
  sectionName: string;
  programName: string;
  totalScore: number;
  count: number;
  average: number;
  responses: number;
}

interface CourseAverage {
  courseId: string;
  courseCode: string;
  courseName: string;
  programName: string;
  sectionName: string;
  totalScore: number;
  count: number;
  average: number;
  responses: number;
  students: number;
}

interface InstructorSummary {
  id: string;
  facultyId: number;
  fullName: string;
  totalResponses: number;
  totalStudents: number;
  overallAverage: number;
  categoryAverages: CategoryAverage[];
  programAverages: ProgramAverage[];
  sectionAverages: SectionAverage[];
  courseAverages: CourseAverage[];
}

interface Program {
  id: string;
  name: string;
}

export default function InstructorEvaluationsPage() {
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<
    InstructorSummary[]
  >([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "responses">("name");
  const [selectedInstructor, setSelectedInstructor] =
    useState<InstructorSummary | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [generatingReport, setGeneratingReport] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] =
    useState<InstructorSummary | null>(null);
  const [surveyActive, setSurveyActive] = useState(false);

  useEffect(() => {
    fetchInstructorEvaluations();
    fetchPrograms();
    checkSurveyStatus();
  }, []);

  useEffect(() => {
    filterAndSortInstructors();
  }, [instructors, searchTerm, selectedProgram, sortBy]);

  const checkSurveyStatus = async () => {
    try {
      const response = await fetch("/api/admin/survey-status");
      if (response.ok) {
        const data = await response.json();
        setSurveyActive(data.isActive);
      }
    } catch (error) {
      console.error("Error checking survey status:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/create/department/program");
      const data = await response.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const fetchInstructorEvaluations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/instructor-evaluations");

      if (!response.ok) {
        throw new Error("Failed to fetch instructor evaluations");
      }

      const data = await response.json();
      setInstructors(data);
    } catch (error) {
      console.error("Error fetching instructor evaluations:", error);
      toast.error("Failed to load instructor evaluations");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInstructors = () => {
    let filtered = instructors.filter(
      (instructor) =>
        instructor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.facultyId.toString().includes(searchTerm)
    );

    // Apply program filter
    if (selectedProgram && selectedProgram !== "all") {
      filtered = filtered.filter((instructor) =>
        instructor.programAverages.some(
          (program) => program.programId === selectedProgram
        )
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fullName.localeCompare(b.fullName);
        case "rating":
          return b.overallAverage - a.overallAverage;
        case "responses":
          return b.totalResponses - a.totalResponses;
        default:
          return 0;
      }
    });

    setFilteredInstructors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProgram("all");
  };

  const hasActiveFilters = searchTerm !== "" || selectedProgram !== "all";

  const handleDeleteIndividual = async () => {
    if (!instructorToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch("/api/admin/instructor-evaluations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId: instructorToDelete.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete instructor evaluations");
      }

      const data = await response.json();
      toast.success(`Deleted ${data.deleted} evaluation records for ${instructorToDelete.fullName}`);
      fetchInstructorEvaluations();
      setDeleteDialogOpen(false);
      setInstructorToDelete(null);
    } catch (error) {
      console.error("Error deleting instructor evaluations:", error);
      toast.error("Failed to delete instructor evaluations");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (surveyActive) {
      toast.error("Cannot delete evaluations while survey is active");
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/admin/instructor-evaluations?deleteAll=true", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete all evaluations");
      }

      toast.success(`Successfully deleted all evaluations (${data.deleted} records)`);
      fetchInstructorEvaluations();
      setDeleteAllDialogOpen(false);
    } catch (error) {
      console.error("Error deleting all evaluations:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete all evaluations"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateReport = (instructor: InstructorSummary) => {
    try {
      setGeneratingReport(true);
      generateInstructorReport(instructor);
      toast.success(`Report generated for ${instructor.fullName}`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 border-green-300";
    if (rating >= 4.0) return "bg-blue-100 border-blue-300";
    if (rating >= 3.5) return "bg-yellow-100 border-yellow-300";
    if (rating >= 3.0) return "bg-orange-100 border-orange-300";
    return "bg-red-100 border-red-300";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Fair";
    return "Needs Improvement";
  };

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Instructor Evaluations</h1>
          <p className='text-muted-foreground mt-2'>
            Summary of all instructor evaluations and ratings
          </p>
        </div>
        <Button
          onClick={() => setDeleteAllDialogOpen(true)}
          variant='destructive'
          className='gap-2'
          disabled={instructors.length === 0 || surveyActive}
        >
          <Trash2 className='w-4 h-4' />
          Delete All
        </Button>
      </div>

      {/* Survey Status Warning */}
      {surveyActive && (
        <Card className='border-yellow-500 bg-yellow-50 dark:bg-yellow-950'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 text-yellow-800 dark:text-yellow-200'>
              <AlertTriangle className='w-5 h-5' />
              <p className='font-medium'>
                Survey is currently active. Delete All is disabled to protect ongoing data collection.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <User className='w-4 h-4' />
              Total Instructors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{instructors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Users className='w-4 h-4' />
              Total Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {instructors.reduce((sum, i) => sum + i.totalResponses, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Star className='w-4 h-4' />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {instructors.length > 0
                ? (
                    instructors.reduce((sum, i) => sum + i.overallAverage, 0) /
                    instructors.length
                  ).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <BookOpen className='w-4 h-4' />
              Total Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {
                new Set(
                  instructors.flatMap((i) =>
                    i.programAverages.map((p) => p.programId)
                  )
                ).size
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Sort</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 space-y-2'>
                <Label htmlFor='search' className='text-sm font-medium'>
                  Search Instructors
                </Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    id='search'
                    placeholder='Search by name or faculty ID...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='program-filter' className='text-sm font-medium'>
                  Filter by Program
                </Label>
                <Select
                  value={selectedProgram}
                  onValueChange={setSelectedProgram}
                >
                  <SelectTrigger id='program-filter'>
                    <SelectValue placeholder='All Programs' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='sort-by' className='text-sm font-medium'>
                  Sort By
                </Label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger id='sort-by'>
                    <SelectValue placeholder='Sort by' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='name'>Name (A-Z)</SelectItem>
                    <SelectItem value='rating'>Highest Rating</SelectItem>
                    <SelectItem value='responses'>Most Evaluations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className='flex flex-wrap gap-2 items-center pt-2'>
                <span className='text-sm text-muted-foreground flex items-center gap-1'>
                  <Filter className='w-4 h-4' />
                  Active filters:
                </span>
                {searchTerm && (
                  <div className='inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm'>
                    <span className='text-muted-foreground'>Search:</span>
                    <span className='font-medium'>{searchTerm}</span>
                    <button
                      onClick={() => setSearchTerm("")}
                      className='ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                )}
                {selectedProgram !== "all" && (
                  <div className='inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm'>
                    <span className='text-muted-foreground'>Program:</span>
                    <span className='font-medium'>
                      {programs.find((p) => p.id === selectedProgram)?.name}
                    </span>
                    <button
                      onClick={() => setSelectedProgram("all")}
                      className='ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearFilters}
                  className='h-7 px-2 text-xs'
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Instructors Overview</CardTitle>
          <CardDescription>
            {hasActiveFilters && (
              <span>
                Showing {filteredInstructors.length} of {instructors.length}{" "}
                instructors •{" "}
              </span>
            )}
            Click on an instructor to view detailed evaluation results or
            generate a report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead className='text-center'>Evaluations</TableHead>
                  <TableHead className='text-center'>Students</TableHead>
                  <TableHead className='text-center'>Overall Rating</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstructors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center py-8'>
                      <div className='space-y-2'>
                        <p className='text-muted-foreground'>
                          {hasActiveFilters
                            ? "No instructors found matching your filters"
                            : "No instructors found"}
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={clearFilters}
                            className='gap-2'
                          >
                            <X className='w-4 h-4' />
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInstructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className='font-medium'>
                        {instructor.facultyId}
                      </TableCell>
                      <TableCell>{instructor.fullName}</TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {instructor.programAverages
                            .slice(0, 2)
                            .map((program, idx) => (
                              <Badge
                                key={idx}
                                variant='secondary'
                                className='text-xs'
                              >
                                {program.programName}
                              </Badge>
                            ))}
                          {instructor.programAverages.length > 2 && (
                            <Badge variant='outline' className='text-xs'>
                              +{instructor.programAverages.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>
                        {instructor.totalResponses}
                      </TableCell>
                      <TableCell className='text-center'>
                        {instructor.totalStudents}
                      </TableCell>
                      <TableCell className='text-center'>
                        <div className='flex flex-col items-center gap-1'>
                          <span
                            className={`text-lg font-bold ${getRatingColor(
                              instructor.overallAverage
                            )}`}
                          >
                            {instructor.overallAverage.toFixed(2)}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {getRatingLabel(instructor.overallAverage)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleGenerateReport(instructor)}
                            disabled={generatingReport}
                          >
                            <FileText className='w-4 h-4 mr-2' />
                            Report
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setSelectedInstructor(instructor)}
                          >
                            <Eye className='w-4 h-4 mr-2' />
                            View
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setInstructorToDelete(instructor);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className='w-4 h-4 text-destructive' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog
        open={selectedInstructor !== null}
        onOpenChange={() => setSelectedInstructor(null)}
      >
        <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-start justify-between'>
              <div>
                <DialogTitle className='text-2xl'>
                  {selectedInstructor?.fullName}
                </DialogTitle>
                <DialogDescription>
                  Faculty ID: {selectedInstructor?.facultyId} | Overall Rating:{" "}
                  <span
                    className={`font-bold ${getRatingColor(
                      selectedInstructor?.overallAverage || 0
                    )}`}
                  >
                    {selectedInstructor?.overallAverage.toFixed(2)}
                  </span>
                </DialogDescription>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  selectedInstructor && handleGenerateReport(selectedInstructor)
                }
                disabled={generatingReport}
              >
                <Download className='w-4 h-4 mr-2' />
                Generate Report
              </Button>
            </div>
          </DialogHeader>

          {selectedInstructor && (
            <div className='space-y-6 mt-4'>
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Summary</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Total Evaluations
                    </p>
                    <p className='text-2xl font-bold'>
                      {selectedInstructor.totalResponses}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Total Students
                    </p>
                    <p className='text-2xl font-bold'>
                      {selectedInstructor.totalStudents}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Programs</p>
                    <p className='text-2xl font-bold'>
                      {selectedInstructor.programAverages.length}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Courses</p>
                    <p className='text-2xl font-bold'>
                      {selectedInstructor.courseAverages.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for different views */}
              <Tabs defaultValue='categories' className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='categories'>Categories</TabsTrigger>
                  <TabsTrigger value='programs'>Programs</TabsTrigger>
                  <TabsTrigger value='sections'>Sections</TabsTrigger>
                  <TabsTrigger value='courses'>Courses</TabsTrigger>
                </TabsList>

                {/* Categories Tab */}
                <TabsContent value='categories' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <BookMarked className='w-5 h-5' />
                        Evaluation by Category
                      </CardTitle>
                      <CardDescription>
                        Overall performance across all evaluation categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {selectedInstructor.categoryAverages.map((category) => (
                        <Collapsible
                          key={category.categoryName}
                          open={openCategories.has(category.categoryName)}
                          onOpenChange={() =>
                            toggleCategory(category.categoryName)
                          }
                        >
                          <div className='border rounded-lg p-4'>
                            <CollapsibleTrigger className='w-full'>
                              <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-4 flex-1'>
                                  <h3 className='font-semibold text-left'>
                                    {category.categoryName}
                                  </h3>
                                  <div className='flex items-center gap-2'>
                                    <Progress
                                      value={(category.average / 5) * 100}
                                      className='w-32'
                                    />
                                    <span
                                      className={`font-bold ${getRatingColor(
                                        category.average
                                      )}`}
                                    >
                                      {category.average.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                {openCategories.has(category.categoryName) ? (
                                  <ChevronUp className='w-4 h-4' />
                                ) : (
                                  <ChevronDown className='w-4 h-4' />
                                )}
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className='mt-4'>
                              <div className='space-y-3 pl-4'>
                                {category.questions.map((question, idx) => (
                                  <div
                                    key={idx}
                                    className='flex items-start justify-between gap-4 p-3 bg-muted/50 rounded'
                                  >
                                    <p className='text-sm flex-1'>
                                      {question.questionText}
                                    </p>
                                    <div className='flex items-center gap-2 min-w-fit'>
                                      <Progress
                                        value={(question.average / 5) * 100}
                                        className='w-24'
                                      />
                                      <span
                                        className={`font-semibold text-sm ${getRatingColor(
                                          question.average
                                        )}`}
                                      >
                                        {question.average.toFixed(2)}
                                      </span>
                                      <span className='text-xs text-muted-foreground'>
                                        ({question.count})
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Programs Tab */}
                <TabsContent value='programs' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <GraduationCap className='w-5 h-5' />
                        Performance by Program
                      </CardTitle>
                      <CardDescription>
                        Average ratings across different programs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {selectedInstructor.programAverages.map((program) => (
                          <div
                            key={program.programId}
                            className={`p-4 border-2 rounded-lg ${getRatingBgColor(
                              program.average
                            )}`}
                          >
                            <div className='flex items-start justify-between mb-3'>
                              <div>
                                <h3 className='font-semibold text-lg'>
                                  {program.programName}
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                  {program.responses} evaluation
                                  {program.responses !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <div className='text-right'>
                                <div
                                  className={`text-2xl font-bold ${getRatingColor(
                                    program.average
                                  )}`}
                                >
                                  {program.average.toFixed(2)}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {getRatingLabel(program.average)}
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={(program.average / 5) * 100}
                              className='h-2'
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sections Tab */}
                <TabsContent value='sections' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <Building2 className='w-5 h-5' />
                        Performance by Section
                      </CardTitle>
                      <CardDescription>
                        Average ratings across different sections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {selectedInstructor.sectionAverages.map((section) => (
                          <div
                            key={section.sectionId}
                            className={`p-4 border-2 rounded-lg ${getRatingBgColor(
                              section.average
                            )}`}
                          >
                            <div className='flex items-start justify-between mb-3'>
                              <div>
                                <h3 className='font-semibold text-lg'>
                                  {section.sectionName}
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                  {section.programName}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {section.responses} evaluation
                                  {section.responses !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <div className='text-right'>
                                <div
                                  className={`text-2xl font-bold ${getRatingColor(
                                    section.average
                                  )}`}
                                >
                                  {section.average.toFixed(2)}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {getRatingLabel(section.average)}
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={(section.average / 5) * 100}
                              className='h-2'
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value='courses' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <BookOpen className='w-5 h-5' />
                        Performance by Course
                      </CardTitle>
                      <CardDescription>
                        Detailed ratings for each course and section
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {selectedInstructor.courseAverages.map(
                          (course, idx) => (
                            <div
                              key={idx}
                              className={`p-4 border-2 rounded-lg ${getRatingBgColor(
                                course.average
                              )}`}
                            >
                              <div className='flex items-start justify-between mb-3'>
                                <div className='flex-1'>
                                  <h3 className='font-semibold text-lg'>
                                    {course.courseCode} - {course.courseName}
                                  </h3>
                                  <div className='flex gap-2 mt-1'>
                                    <Badge variant='secondary'>
                                      {course.programName}
                                    </Badge>
                                    <Badge variant='outline'>
                                      {course.sectionName}
                                    </Badge>
                                  </div>
                                  <p className='text-sm text-muted-foreground mt-2'>
                                    {course.students} student
                                    {course.students !== 1 ? "s" : ""} •{" "}
                                    {course.responses} evaluation
                                    {course.responses !== 1 ? "s" : ""}
                                  </p>
                                </div>
                                <div className='text-right ml-4'>
                                  <div
                                    className={`text-2xl font-bold ${getRatingColor(
                                      course.average
                                    )}`}
                                  >
                                    {course.average.toFixed(2)}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {getRatingLabel(course.average)}
                                  </div>
                                </div>
                              </div>
                              <Progress
                                value={(course.average / 5) * 100}
                                className='h-2'
                              />
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Individual Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instructor Evaluations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all evaluation data for{" "}
              <strong>{instructorToDelete?.fullName}</strong> (Faculty ID:{" "}
              {instructorToDelete?.facultyId})? This will permanently delete{" "}
              <strong>{instructorToDelete?.totalResponses}</strong> evaluation
              records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIndividual}
              disabled={deleting}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deleting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Dialog */}
      <AlertDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-destructive' />
              Delete All Instructor Evaluations
            </AlertDialogTitle>
            <AlertDialogDescription>
              {surveyActive ? (
                <div className='space-y-2'>
                  <p className='font-semibold text-destructive'>
                    Cannot delete evaluations while survey is active!
                  </p>
                  <p>
                    Please deactivate the survey first before deleting all
                    evaluations.
                  </p>
                </div>
              ) : (
                <>
                  <p className='font-semibold mb-2'>
                    This will permanently delete ALL evaluation data for ALL{" "}
                    {instructors.length} instructors!
                  </p>
                  <p>
                    Total records to be deleted:{" "}
                    <strong>
                      {instructors.reduce(
                        (sum, i) => sum + i.totalResponses,
                        0
                      )}
                    </strong>{" "}
                    evaluations
                  </p>
                  <p className='mt-2'>
                    This action cannot be undone. All instructor evaluation data
                    will be permanently lost.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={deleting || surveyActive}
              className='bg-destructive hover:bg-destructive/90'
            >
              {deleting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                "Delete All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}