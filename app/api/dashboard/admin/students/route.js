export async function GET(req, res) {
  // Mock data for students
  const students = [
    {
      id: "58762025",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      yearGroup: "2025",
      profilePicture: "/placeholder.svg?height=40&width=40",
      major: "Computer Science",
      gpa: "3.8",
      eventsAttended: 5,
      resumeUploaded: true,
      careerRoadmap: {
        goals: ["Software Engineer at Google", "Complete AWS certification"],
        progress: 60,
      },
    },
    // ... other students
  ];

  // Return the student data as JSON
  res.status(200).json(students);
}
