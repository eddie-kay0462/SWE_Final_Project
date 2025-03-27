"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpCircle, CheckCircle, Calendar, Award, BookOpen, Briefcase, Users, FileEdit, X, ChevronRight, ChevronLeft, Info } from "lucide-react"
import Link from "next/link"

// Mock data for student's career progress
const mockStudentProgress = {
  currentStage: 3,
  milestones: [
    {
      id: 1,
      title: "Orientation",
      description: "Get acquainted with career services and resources",
      completed: true,
      achievements: [
        { title: "Attend Career Orientation Session", completed: true },
        { title: "Complete Career Services Registration", completed: true },
        { title: "Set up Initial Profile", completed: true }
      ]
    },
    {
      id: 2, 
      title: "Resume Building",
      description: "Create a professional resume and cover letter",
      completed: true,
      achievements: [
        { title: "Attend Resume Workshop", completed: true },
        { title: "Submit Resume for Review", completed: true },
        { title: "Complete LinkedIn Profile", completed: true }
      ]
    },
    {
      id: 3,
      title: "Skills Development",
      description: "Develop key professional and technical skills",
      completed: false,
      achievements: [
        { title: "Attend 3 Skills Workshops", completed: true },
        { title: "Complete Technical Assessment", completed: true },
        { title: "Earn Professional Skills Certificate", completed: false }
      ]
    },
    {
      id: 4,
      title: "Interview Preparation",
      description: "Prepare for professional interviews",
      completed: false,
      achievements: [
        { title: "Attend Interview Workshop", completed: true },
        { title: "Complete Mock Interview", completed: false },
        { title: "Finalize Elevator Pitch", completed: false }
      ]
    },
    {
      id: 5,
      title: "Internship Application",
      description: "Apply for internships and track progress",
      completed: false,
      achievements: [
        { title: "Submit 5 Internship Applications", completed: false },
        { title: "Attend Career Fair", completed: false },
        { title: "Schedule Follow-up Sessions", completed: false }
      ]
    },
    {
      id: 6,
      title: "Internship Success",
      description: "Complete internship and document experience",
      completed: false,
      achievements: [
        { title: "Secure Internship Position", completed: false },
        { title: "Complete Mid-Internship Check-in", completed: false },
        { title: "Submit Final Internship Report", completed: false }
      ]
    }
  ],
  recommendedSessions: [
    {
      id: 1,
      title: "Professional Skills Certificate Workshop",
      type: "workshop",
      date: "April 15, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Career Center, Room 202"
    },
    {
      id: 2,
      title: "Mock Interview Session",
      type: "one-on-one",
      date: "April 20, 2025",
      time: "10:00 AM - 11:00 AM",
      location: "Online (Zoom)"
    },
    {
      id: 3,
      title: "Spring Career Fair",
      type: "event",
      date: "May 5, 2025",
      time: "9:00 AM - 3:00 PM",
      location: "University Conference Center"
    }
  ]
}

export default function CareerRoadmapPage() {
  const [loading, setLoading] = useState(true)
  const [selectedMilestone, setSelectedMilestone] = useState(mockStudentProgress.currentStage)
  const [showMilestoneDetails, setShowMilestoneDetails] = useState(false)
  const [showTips, setShowTips] = useState(false)

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleMilestoneClick = (id) => {
    setSelectedMilestone(id)
    setShowMilestoneDetails(true)
  }

  const getStatusColor = (milestone) => {
    if (milestone.completed) return "text-green-500"
    if (milestone.id === mockStudentProgress.currentStage) return "text-[#A91827]"
    return "text-gray-400"
  }

  const getStatusIcon = (milestone) => {
    if (milestone.completed) return <CheckCircle className="h-6 w-6 text-green-500" />
    if (milestone.id === mockStudentProgress.currentStage) return <ArrowUpCircle className="h-6 w-6 text-[#A91827]" />
    return <circle className="h-6 w-6 text-gray-300" />
  }

  const getMilestoneIcon = (id) => {
    switch (id) {
      case 1: return <Users className="h-6 w-6" />
      case 2: return <FileEdit className="h-6 w-6" />
      case 3: return <BookOpen className="h-6 w-6" />
      case 4: return <Users className="h-6 w-6" />
      case 5: return <Briefcase className="h-6 w-6" />
      case 6: return <Award className="h-6 w-6" />
      default: return <CheckCircle className="h-6 w-6" />
    }
  }

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case "workshop": return <Users className="h-5 w-5 text-blue-500" />
      case "one-on-one": return <Users className="h-5 w-5 text-purple-500" />
      case "event": return <Calendar className="h-5 w-5 text-orange-500" />
      default: return <Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className={`space-y-6 transition-all duration-500 ease-in-out ${loading ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Career Development Roadmap</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your progress and upcoming career milestones
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Info className="h-4 w-4 text-[#A91827]" />
            <span>{showTips ? "Hide" : "Show"} Tips</span>
          </button>
          <Link 
            href="/dashboard/student/profile" 
            className="px-4 py-2 bg-[#A91827] text-white rounded-lg text-sm flex items-center gap-2 hover:bg-[#A91827]/90"
          >
            <Award className="h-4 w-4" />
            <span>View Achievements</span>
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      {showTips && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center flex-shrink-0">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300">Career Development Tips</h3>
                <ul className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Complete all achievements in your current milestone before moving to the next one.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Attend recommended sessions to help complete your achievements faster.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Schedule one-on-one sessions with career advisors for personalized guidance.</span>
                  </li>
                </ul>
              </div>
            </div>
            <button 
              onClick={() => setShowTips(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Roadmap */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <h2 className="text-lg font-medium mb-6">Your Career Journey</h2>
            
            {/* Interactive Roadmap Visualization */}
            <div className="relative mb-8 px-4">
              {/* Connecting Line */}
              <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              
              {/* Milestone Steps */}
              <div className="space-y-10">
                {mockStudentProgress.milestones.map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className={`relative flex items-start gap-4 cursor-pointer transition-all duration-300 ${
                      selectedMilestone === milestone.id ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => handleMilestoneClick(milestone.id)}
                  >
                    {/* Status Circle */}
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${
                      milestone.completed ? 'bg-green-100 dark:bg-green-900/30' : 
                      milestone.id === mockStudentProgress.currentStage ? 'bg-[#A91827]/10 dark:bg-[#A91827]/30' : 
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {getStatusIcon(milestone)}
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 ${
                      milestone.completed ? 'border-green-500' : 
                      milestone.id === mockStudentProgress.currentStage ? 'border-[#A91827]' : 
                      'border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            milestone.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                            milestone.id === mockStudentProgress.currentStage ? 'bg-[#A91827]/10 dark:bg-[#A91827]/30 text-[#A91827]' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            {getMilestoneIcon(milestone.id)}
                          </div>
                          <h3 className="font-medium">{milestone.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            milestone.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                            milestone.id === mockStudentProgress.currentStage ? 'bg-[#A91827]/10 dark:bg-[#A91827]/30 text-[#A91827]' : 
                            'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}>
                            {milestone.completed ? 'Completed' : 
                             milestone.id === mockStudentProgress.currentStage ? 'Current' : 
                             'Upcoming'}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Overall Career Progress</h3>
                <span className="text-sm font-medium text-[#A91827]">
                  {Math.round((mockStudentProgress.currentStage - 1 + 
                    mockStudentProgress.milestones[mockStudentProgress.currentStage - 1].achievements.filter(a => a.completed).length / 
                    mockStudentProgress.milestones[mockStudentProgress.currentStage - 1].achievements.length) / 
                    mockStudentProgress.milestones.length * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#A91827] to-[#FF6B6B] rounded-full"
                  style={{ 
                    width: `${Math.round((mockStudentProgress.currentStage - 1 + 
                      mockStudentProgress.milestones[mockStudentProgress.currentStage - 1].achievements.filter(a => a.completed).length / 
                      mockStudentProgress.milestones[mockStudentProgress.currentStage - 1].achievements.length) / 
                      mockStudentProgress.milestones.length * 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Milestone View or Recommended Sessions */}
        <div className="lg:col-span-1">
          {showMilestoneDetails ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <button 
                    className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    onClick={() => setShowMilestoneDetails(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-lg font-medium">Milestone Details</h2>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  mockStudentProgress.milestones[selectedMilestone - 1].completed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  selectedMilestone === mockStudentProgress.currentStage ? 'bg-[#A91827]/10 dark:bg-[#A91827]/30 text-[#A91827]' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {mockStudentProgress.milestones[selectedMilestone - 1].completed ? 'Completed' :
                   selectedMilestone === mockStudentProgress.currentStage ? 'In Progress' :
                   'Not Started'}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  mockStudentProgress.milestones[selectedMilestone - 1].completed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  selectedMilestone === mockStudentProgress.currentStage ? 'bg-[#A91827]/10 dark:bg-[#A91827]/30 text-[#A91827]' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {getMilestoneIcon(selectedMilestone)}
                </div>
                <div>
                  <h3 className="font-medium">{mockStudentProgress.milestones[selectedMilestone - 1].title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mockStudentProgress.milestones[selectedMilestone - 1].description}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <h3 className="font-medium mb-3">Required Achievements</h3>
                <div className="space-y-3">
                  {mockStudentProgress.milestones[selectedMilestone - 1].achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 ${
                        achievement.completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {achievement.completed ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <circle className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${achievement.completed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                          {achievement.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMilestone === mockStudentProgress.currentStage && (
                <div className="mt-6">
                  <button className="w-full px-4 py-3 bg-[#A91827] hover:bg-[#A91827]/90 text-white rounded-lg text-sm font-medium">
                    Schedule Related Session
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-medium mb-4">Recommended Next Steps</h2>
              <div className="space-y-4">
                {mockStudentProgress.recommendedSessions.map((session) => (
                  <div key={session.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 shadow-sm">
                        {getSessionTypeIcon(session.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{session.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            session.type === 'workshop' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                            session.type === 'one-on-one' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                            'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          }`}>
                            {session.type === 'workshop' ? 'Workshop' :
                             session.type === 'one-on-one' ? '1-on-1 Session' :
                             'Event'}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date} • {session.time}</span>
                          </div>
                          <p>{session.location}</p>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button className="px-3 py-1.5 bg-[#A91827] text-white rounded text-xs font-medium">
                            RSVP Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/dashboard/student/attendance-history" className="text-sm text-[#A91827] hover:text-[#A91827]/80 font-medium flex items-center justify-center gap-1">
                  View all upcoming sessions
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 