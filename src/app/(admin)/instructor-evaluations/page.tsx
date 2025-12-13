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
} from "lucide-react";
import { toast } from "sonner";

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

interface Course {
  code: string;
  name: string;
  program: string;
  section: string;
}

interface InstructorSummary {
  id: string;
  facultyId: number;
  fullName: string;
  courses: Course[];
  totalResponses: number;
  totalStudents: number;
  overallAverage: number;
  categoryAverages: CategoryAverage[];
}

export default function InstructorEvaluationsPage() {
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<
    InstructorSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "responses">("name");
  const [selectedInstructor, setSelectedInstructor] =
    useState<InstructorSummary | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchInstructorEvaluations();
  }, []);

  useEffect(() => {
    filterAndSortInstructors();
  }, [instructors, searchTerm, sortBy]);

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

    // Sort
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
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
      <div>
        <h1 className='text-3xl font-bold'>Instructor Evaluations</h1>
        <p className='text-muted-foreground mt-2'>
          Summary of all instructor evaluations and ratings
        </p>
      </div>

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
              Courses Evaluated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {
                new Set(
                  instructors.flatMap((i) => i.courses.map((c) => c.code))
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
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Search by name or faculty ID...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(value: any) => setSortBy(value)}
            >
              <SelectTrigger className='w-full md:w-48'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name'>Name (A-Z)</SelectItem>
                <SelectItem value='rating'>Highest Rating</SelectItem>
                <SelectItem value='responses'>Most Evaluations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Instructors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Instructors Overview</CardTitle>
          <CardDescription>
            Click on an instructor to view detailed evaluation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Courses</TableHead>
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
                      No instructors found
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
                          {instructor.courses.slice(0, 2).map((course, idx) => (
                            <Badge
                              key={idx}
                              variant='secondary'
                              className='text-xs'
                            >
                              {course.code}
                            </Badge>
                          ))}
                          {instructor.courses.length > 2 && (
                            <Badge variant='outline' className='text-xs'>
                              +{instructor.courses.length - 2}
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
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedInstructor(instructor)}
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          View Details
                        </Button>
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
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
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
          </DialogHeader>

          {selectedInstructor && (
            <div className='space-y-6 mt-4'>
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Summary</CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-2 md:grid-cols-3 gap-4'>
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
                    <p className='text-sm text-muted-foreground'>
                      Courses Taught
                    </p>
                    <p className='text-2xl font-bold'>
                      {selectedInstructor.courses.length}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Courses */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Courses Taught</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {selectedInstructor.courses.map((course, idx) => (
                      <div
                        key={idx}
                        className='flex items-center justify-between p-3 border rounded-lg'
                      >
                        <div>
                          <p className='font-medium'>
                            {course.code} - {course.name}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {course.program} - {course.section}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Ratings */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Evaluation by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {selectedInstructor.categoryAverages.map((category) => (
                    <Collapsible
                      key={category.categoryName}
                      open={openCategories.has(category.categoryName)}
                      onOpenChange={() => toggleCategory(category.categoryName)}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
