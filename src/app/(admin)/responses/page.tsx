"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Search,
  Eye,
  Calendar,
  User,
  BookOpen,
  Award,
  Filter,
  Loader2,
  Download,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Assessment = {
  studentId: string;
  studentName: string;
  studentIdNumber: number;
  teacherId: string;
  teacherName: string;
  programName: string;
  sectionName: string;
  courseName: string;
  courseCode: string;
  assignmentId: string;
  submittedAt: Date;
  responseCount: number;
  hasSuggestion: boolean;
  suggestionContent?: string;
  suggestionDate?: Date;
  responses: Array<{
    questionId: string;
    question: string;
    category: string;
    answer: string;
    value: number;
  }>;
};

type FilterOptions = {
  programs: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; programId: string }>;
  courses: Array<{ id: string; name: string; code: string; programId: string }>;
  teachers: Array<{ id: string; fullName: string }>;
};

export default function ResponsesPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>(
    []
  );
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    programs: [],
    sections: [],
    courses: [],
    teachers: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    assessments,
    searchTerm,
    selectedProgram,
    selectedSection,
    selectedCourse,
    selectedTeacher,
  ]);

  const fetchResponses = async () => {
    try {
      const response = await fetch("/api/admin/responses");

      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }

      const data = await response.json();
      setAssessments(data.assessments);
      setFilteredAssessments(data.assessments);
      setFilterOptions(data.filters);
    } catch (error) {
      console.error("Error fetching responses:", error);
      toast.error("Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assessments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.studentIdNumber.toString().includes(searchTerm)
      );
    }

    // Program filter
    if (selectedProgram) {
      filtered = filtered.filter((a) => a.programName === selectedProgram);
    }

    // Section filter
    if (selectedSection) {
      filtered = filtered.filter((a) => a.sectionName === selectedSection);
    }

    // Course filter
    if (selectedCourse) {
      filtered = filtered.filter((a) => a.courseCode === selectedCourse);
    }

    // Teacher filter
    if (selectedTeacher) {
      filtered = filtered.filter((a) => a.teacherName === selectedTeacher);
    }

    setFilteredAssessments(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProgram("");
    setSelectedSection("");
    setSelectedCourse("");
    setSelectedTeacher("");
  };

  const exportToCSV = () => {
    const headers = [
      "Student ID",
      "Student Name",
      "Teacher",
      "Program",
      "Section",
      "Course",
      "Submitted At",
      "Response Count",
      "Has Suggestion",
      "Suggestion",
    ];

    const rows = filteredAssessments.map((a) => [
      a.studentIdNumber,
      a.studentName,
      a.teacherName,
      a.programName,
      a.sectionName,
      `${a.courseCode} - ${a.courseName}`,
      format(new Date(a.submittedAt), "MMM dd, yyyy HH:mm"),
      a.responseCount,
      a.hasSuggestion ? "Yes" : "No",
      a.suggestionContent ? `"${a.suggestionContent.replace(/"/g, '""')}"` : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-responses-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAverageScore = (responses: Assessment["responses"]) => {
    if (responses.length === 0) return 0;
    const total = responses.reduce((sum, r) => sum + r.value, 0);
    return (total / responses.length).toFixed(2);
  };

  const groupResponsesByCategory = (responses: Assessment["responses"]) => {
    return responses.reduce((acc: any, response) => {
      if (!acc[response.category]) {
        acc[response.category] = [];
      }
      acc[response.category].push(response);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading responses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>
              Student Responses
            </h1>
            <p className='text-muted-foreground mt-1'>
              View all student assessment submissions and suggestions
            </p>
          </div>
          <Button onClick={exportToCSV} className='gap-2'>
            <Download className='w-4 h-4' />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{assessments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Unique Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {new Set(assessments.map((a) => a.studentId)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Teachers Evaluated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {new Set(assessments.map((a) => a.teacherId)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Courses Assessed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {new Set(assessments.map((a) => a.courseCode)).size}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <MessageSquare className='w-4 h-4' />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {assessments.filter((a) => a.hasSuggestion).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Filter className='w-5 h-5' />
                <CardTitle>Filters</CardTitle>
              </div>
              {(searchTerm ||
                selectedProgram ||
                selectedSection ||
                selectedCourse ||
                selectedTeacher) && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 w-full'
                />
              </div>

              <Select
                value={selectedProgram}
                onValueChange={setSelectedProgram}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Program' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Programs</SelectItem>
                  {filterOptions.programs.map((program) => (
                    <SelectItem key={program.id} value={program.name}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Section' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Sections</SelectItem>
                  {filterOptions.sections
                    .filter(
                      (section) =>
                        !selectedProgram ||
                        section.programId ===
                          filterOptions.programs.find(
                            (p) => p.name === selectedProgram
                          )?.id
                    )
                    .map((section) => (
                      <SelectItem key={section.id} value={section.name}>
                        {section.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Course' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Courses</SelectItem>
                  {filterOptions.courses.map((course) => (
                    <SelectItem key={course.id} value={course.code}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Teacher' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Teachers</SelectItem>
                  {filterOptions.teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.fullName}>
                      {teacher.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              Assessment Submissions ({filteredAssessments.length})
            </CardTitle>
            <CardDescription>
              Showing {filteredAssessments.length} of {assessments.length} total
              submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAssessments.length === 0 ? (
              <div className='text-center py-12'>
                <FileText className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground'>No submissions found</p>
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Program/Section</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead className='text-center'>Suggestion</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              {assessment.studentName}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              ID: {assessment.studentIdNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{assessment.teacherName}</TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='font-medium'>
                              {assessment.courseCode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <Badge variant='outline'>
                              {assessment.programName}
                            </Badge>
                            <div className='text-sm text-muted-foreground'>
                              {assessment.sectionName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Calendar className='w-4 h-4' />
                            {format(
                              new Date(assessment.submittedAt),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{assessment.responseCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {getAverageScore(assessment.responses)}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          {assessment.hasSuggestion ? (
                            <Badge variant='default' className='gap-1'>
                              <MessageSquare className='w-3 h-3' />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant='outline'>No</Badge>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  setSelectedAssessment(assessment)
                                }
                              >
                                <Eye className='w-4 h-4 mr-2' />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                              <DialogHeader>
                                <DialogTitle>Assessment Details</DialogTitle>
                                <DialogDescription>
                                  Detailed view of student responses and
                                  suggestions
                                </DialogDescription>
                              </DialogHeader>

                              {selectedAssessment && (
                                <div className='space-y-6'>
                                  {/* Header Info */}
                                  <div className='grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg'>
                                    <div className='flex items-center gap-2'>
                                      <User className='w-4 h-4 text-muted-foreground' />
                                      <div>
                                        <div className='text-sm text-muted-foreground'>
                                          Student
                                        </div>
                                        <div className='font-medium'>
                                          {selectedAssessment.studentName}
                                        </div>
                                      </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                      <Award className='w-4 h-4 text-muted-foreground' />
                                      <div>
                                        <div className='text-sm text-muted-foreground'>
                                          Teacher
                                        </div>
                                        <div className='font-medium'>
                                          {selectedAssessment.teacherName}
                                        </div>
                                      </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                      <BookOpen className='w-4 h-4 text-muted-foreground' />
                                      <div>
                                        <div className='text-sm text-muted-foreground'>
                                          Course
                                        </div>
                                        <div className='font-medium'>
                                          {selectedAssessment.courseCode} -{" "}
                                          {selectedAssessment.courseName}
                                        </div>
                                      </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                      <Calendar className='w-4 h-4 text-muted-foreground' />
                                      <div>
                                        <div className='text-sm text-muted-foreground'>
                                          Submitted
                                        </div>
                                        <div className='font-medium'>
                                          {format(
                                            new Date(
                                              selectedAssessment.submittedAt
                                            ),
                                            "MMM dd, yyyy HH:mm"
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Suggestion Section */}
                                  {selectedAssessment.hasSuggestion &&
                                    selectedAssessment.suggestionContent && (
                                      <>
                                        <Card className='border-primary/50 bg-primary/5'>
                                          <CardHeader>
                                            <CardTitle className='text-base flex items-center gap-2'>
                                              <MessageSquare className='w-4 h-4' />
                                              Student Suggestion
                                            </CardTitle>
                                            {selectedAssessment.suggestionDate && (
                                              <CardDescription>
                                                Submitted on{" "}
                                                {format(
                                                  new Date(
                                                    selectedAssessment.suggestionDate
                                                  ),
                                                  "MMM dd, yyyy 'at' HH:mm"
                                                )}
                                              </CardDescription>
                                            )}
                                          </CardHeader>
                                          <CardContent>
                                            <p className='text-sm whitespace-pre-wrap'>
                                              {
                                                selectedAssessment.suggestionContent
                                              }
                                            </p>
                                          </CardContent>
                                        </Card>
                                        <Separator />
                                      </>
                                    )}

                                  {/* Responses by Category */}
                                  <div className='space-y-4'>
                                    <h3 className='font-semibold text-lg'>
                                      Evaluation Responses
                                    </h3>
                                    {Object.entries(
                                      groupResponsesByCategory(
                                        selectedAssessment.responses
                                      )
                                    ).map(
                                      ([category, responses]: [
                                        string,
                                        any
                                      ]) => (
                                        <Card key={category}>
                                          <CardHeader>
                                            <CardTitle className='text-base'>
                                              {category}
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className='space-y-3'>
                                            {responses.map(
                                              (response: any, idx: number) => (
                                                <div
                                                  key={idx}
                                                  className='pb-3 border-b last:border-0 last:pb-0'
                                                >
                                                  <p className='text-sm font-medium mb-2'>
                                                    {response.question}
                                                  </p>
                                                  <div className='flex items-center justify-between'>
                                                    <span className='text-sm text-muted-foreground'>
                                                      {response.answer}
                                                    </span>
                                                    <Badge variant='secondary'>
                                                      {response.value}
                                                    </Badge>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </CardContent>
                                        </Card>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
