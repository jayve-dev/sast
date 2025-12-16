import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InstructorReportData {
  id: string;
  facultyId: number;
  fullName: string;
  totalResponses: number;
  totalStudents: number;
  overallAverage: number;
  categoryAverages: Array<{
    categoryName: string;
    average: number;
    questions: Array<{
      questionText: string;
      average: number;
      count: number;
    }>;
  }>;
  programAverages: Array<{
    programId: string;
    programName: string;
    average: number;
    responses: number;
  }>;
  sectionAverages: Array<{
    sectionId: string;
    sectionName: string;
    programName: string;
    average: number;
    responses: number;
  }>;
  courseAverages: Array<{
    courseId: string;
    courseCode: string;
    courseName: string;
    programName: string;
    sectionName: string;
    average: number;
    responses: number;
    students: number;
  }>;
}

export function generateInstructorReport(data: InstructorReportData) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > 280) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to get rating label
  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Fair";
    return "Needs Improvement";
  };

  // Header
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Instructor Evaluation Report", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, {
    align: "center",
  });

  yPosition = 50;

  // Instructor Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Instructor Information", 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.fullName}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Faculty ID: ${data.facultyId}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total Student Responses: ${data.totalStudents}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Total Evaluations: ${data.totalResponses}`, 20, yPosition);
  yPosition += 15;

  // Overall Performance
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Performance", 20, yPosition);
  yPosition += 10;

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, yPosition, 170, 20, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Overall Average Rating: ${data.overallAverage.toFixed(2)} / 5.00`,
    30,
    yPosition + 8
  );
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Performance Level: ${getRatingLabel(data.overallAverage)}`,
    30,
    yPosition + 15
  );
  yPosition += 30;

  // Performance by Program
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Performance by Program", 20, yPosition);
  yPosition += 10;

  const programTableData = data.programAverages.map((program) => [
    program.programName,
    program.responses.toString(),
    program.average.toFixed(2),
    getRatingLabel(program.average),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Program", "Evaluations", "Average", "Performance"]],
    body: programTableData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 20, right: 20 },
    didDrawPage: (data) => {
      yPosition = data.cursor?.y || yPosition;
    },
  });

  yPosition += 15;

  // Performance by Section
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Performance by Section", 20, yPosition);
  yPosition += 10;

  const sectionTableData = data.sectionAverages.map((section) => [
    section.sectionName,
    section.programName,
    section.responses.toString(),
    section.average.toFixed(2),
    getRatingLabel(section.average),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Section", "Program", "Evaluations", "Average", "Performance"]],
    body: sectionTableData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 20, right: 20 },
    didDrawPage: (data) => {
      yPosition = data.cursor?.y || yPosition;
    },
  });

  yPosition += 15;

  // Performance by Course
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Performance by Course", 20, yPosition);
  yPosition += 10;

  const courseTableData = data.courseAverages.map((course) => [
    course.courseCode,
    course.courseName,
    course.programName,
    course.sectionName,
    course.students.toString(),
    course.responses.toString(),
    course.average.toFixed(2),
    getRatingLabel(course.average),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [
      [
        "Code",
        "Course",
        "Program",
        "Section",
        "Students",
        "Evals",
        "Avg",
        "Performance",
      ],
    ],
    body: courseTableData,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9 },
    didDrawPage: (data) => {
      yPosition = data.cursor?.y || yPosition;
    },
  });

  yPosition += 15;

  // Detailed Category Breakdown
//   checkPageBreak(30);
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Category Breakdown", 20, yPosition);
  yPosition += 10;

  data.categoryAverages.forEach((category) => {
    checkPageBreak(50);

    // Category Header
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(20, yPosition, 170, 12, 2, 2, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(category.categoryName, 25, yPosition + 8);
    doc.text(`Average: ${category.average.toFixed(2)}`, 160, yPosition + 8, {
      align: "right",
    });
    yPosition += 17;

    // Questions Table
    const questionTableData = category.questions.map((question, index) => [
      (index + 1).toString(),
      question.questionText,
      question.count.toString(),
      question.average.toFixed(2),
      getRatingLabel(question.average),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Question", "Responses", "Average", "Performance"]],
      body: questionTableData,
      theme: "striped",
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 90 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 35 },
      },
      didDrawPage: (data) => {
        yPosition = data.cursor?.y || yPosition;
      },
    });

    yPosition += 10;
  });

  // Summary and Recommendations (Last Page)
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Summary & Recommendations", 20, yPosition);
  yPosition += 15;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Strengths
  doc.setFont("helvetica", "bold");
  doc.text("Strengths:", 20, yPosition);
  yPosition += 7;
  doc.setFont("helvetica", "normal");

  const topCategories = [...data.categoryAverages]
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);

  topCategories.forEach((category, index) => {
    doc.text(
      `${index + 1}. ${category.categoryName} (${category.average.toFixed(
        2
      )}/5.00)`,
      25,
      yPosition
    );
    yPosition += 6;
  });

  yPosition += 10;

  // Areas for Improvement
  doc.setFont("helvetica", "bold");
  doc.text("Areas for Improvement:", 20, yPosition);
  yPosition += 7;
  doc.setFont("helvetica", "normal");

  const bottomCategories = [...data.categoryAverages]
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  bottomCategories.forEach((category, index) => {
    doc.text(
      `${index + 1}. ${category.categoryName} (${category.average.toFixed(
        2
      )}/5.00)`,
      25,
      yPosition
    );
    yPosition += 6;
  });

  yPosition += 15;

  // Overall Assessment
  doc.setFont("helvetica", "bold");
  doc.text("Overall Assessment:", 20, yPosition);
  yPosition += 7;
  doc.setFont("helvetica", "normal");

  const assessment = `${data.fullName} has received a total of ${
    data.totalResponses
  } evaluations from ${data.totalStudents} students across ${
    data.programAverages.length
  } program(s), ${data.sectionAverages.length} section(s), and ${
    data.courseAverages.length
  } course(s). The overall performance rating of ${data.overallAverage.toFixed(
    2
  )}/5.00 indicates ${getRatingLabel(
    data.overallAverage
  ).toLowerCase()} teaching effectiveness.`;

  const splitAssessment = doc.splitTextToSize(assessment, 170);
  doc.text(splitAssessment, 20, yPosition);

  // Save the PDF
  const fileName = `Instructor_Report_${data.fullName.replace(
    /\s+/g,
    "_"
  )}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
