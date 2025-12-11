"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Award,
  MessageSquare,
  Loader2,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DashboardStats {
  teachers: number;
  students: number;
  courses: number;
  programs: number;
  responses: number;
  questions: number;
  sections: number;
  assignments: number;
  recentResponses: number;
  averageResponsesPerAssignment: number;
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    questionCount: number;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-muted-foreground'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-4'>
          <p className='text-muted-foreground'>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            Teacher Evaluation Dashboard
          </h1>
          <p className='text-muted-foreground'>
            Welcome to the evaluation management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
          {/* Teachers Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Active Teachers
              </CardTitle>
              <Award className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.teachers}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Teachers with assignments
              </p>
            </CardContent>
          </Card>

          {/* Students Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Total Students
              </CardTitle>
              <Users className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.students}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Enrolled students
              </p>
            </CardContent>
          </Card>

          {/* Courses Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Active Courses
              </CardTitle>
              <BookOpen className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.courses}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Courses available
              </p>
            </CardContent>
          </Card>

          {/* Programs Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Programs
              </CardTitle>
              <BarChart3 className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.programs}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Degree programs
              </p>
            </CardContent>
          </Card>

          {/* Assignments Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Assignments
              </CardTitle>
              <ClipboardList className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.assignments}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Active assignments
              </p>
            </CardContent>
          </Card>

          {/* Responses Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Evaluations
              </CardTitle>
              <FileText className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.responses.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Submitted responses
              </p>
            </CardContent>
          </Card>

          {/* Questions Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Questions
              </CardTitle>
              <MessageSquare className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.questions}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Evaluation questions
              </p>
            </CardContent>
          </Card>

          {/* Sections Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Sections
              </CardTitle>
              <Users className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.sections}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Active sections
              </p>
            </CardContent>
          </Card>

          {/* Recent Responses Card */}
          <Card className='border border-border hover:shadow-lg transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <CardTitle className='text-sm font-medium text-foreground'>
                Recent Activity
              </CardTitle>
              <TrendingUp className='h-5 w-5 text-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-foreground'>
                {stats.recentResponses}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Categories Card */}
        <Card className='border border-border'>
          <CardHeader>
            <CardTitle className='text-foreground'>
              Evaluation Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {stats.categories.length > 0 ? (
                stats.categories.map((category) => (
                  <div
                    key={category.id}
                    className='p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary/70 transition-colors'
                  >
                    <p className='font-medium text-foreground text-sm'>
                      {category.name}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {category.questionCount}{" "}
                      {category.questionCount === 1 ? "question" : "questions"}
                    </p>
                    {category.description && (
                      <p className='text-xs text-muted-foreground mt-2 line-clamp-2'>
                        {category.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className='col-span-4 text-center py-8 text-muted-foreground'>
                  No categories found. Create categories to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
