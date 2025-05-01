"use client"

import { useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

/**
 * InternshipLetter Component
 * 
 * Renders an internship letter with download functionality.
 * 
 * @param {Object} props Component props
 * @param {string} props.studentName Student's full name
 * @param {string} props.studentId Student's ID number
 * @param {string} props.yearGroup Student's year group
 * @param {string} props.major Student's major
 * @param {string} props.internshipDuration Duration of internship
 * @param {string} props.companyName Company name
 * @param {string} props.companyAddress Company address
 * @param {string} props.employerName Employer's name
 * @param {string} props.requestDate Request submission date
 */
export default function InternshipLetter({
  studentName,
  studentId,
  yearGroup,
  major,
  internshipDuration,
  companyName,
  companyAddress,
  employerName,
  requestDate
}) {
  const letterRef = useRef(null)

  const handleDownload = () => {
    const element = letterRef.current
    const opt = {
      margin: [0.75, 0.75, 0.75, 0.75],
      filename: `internship-letter-${studentId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[8.27in] mx-auto bg-white shadow-lg">
        {/* Download Button */}
        <div className="sticky top-0 z-50 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Internship Letter</h2>
          <Button onClick={handleDownload} className="bg-brand hover:bg-brand/90">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Letter Content */}
        <div 
          ref={letterRef} 
          className="p-8 font-serif text-[12pt] leading-[1.5] text-justify"
          style={{ fontFamily: 'Times New Roman' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/ashesi-logo.png" 
              alt="Ashesi University Logo" 
              className="h-16 mx-auto mb-4"
            />
            <div className="text-brand font-semibold">
              ASHESI UNIVERSITY
            </div>
            <div className="text-sm">
              1 University Avenue, Berekuso
              <br />
              PMB CT 3, Cantonments, Accra, Ghana
              <br />
              T: +233 302 610 330
            </div>
          </div>

          {/* Date */}
          <div className="mb-8">
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>

          {/* Company Address */}
          <div className="mb-8 whitespace-pre-line">
            {companyName}
            <br />
            {companyAddress}
          </div>

          {/* Salutation */}
          <div className="mb-4">
            Dear {employerName},
          </div>

          {/* Body */}
          <div className="space-y-4 mb-8">
            <p>
              I am writing to confirm that {studentName} (ID: {studentId}) is a {yearGroup} {major} student at Ashesi University.
            </p>
            <p>
              As part of our degree requirements, our students are required to complete an internship program. We would be grateful if you would consider {studentName} for an internship position at your organization for a duration of {internshipDuration}.
            </p>
            <p>
              Ashesi students are known for their strong academic performance, leadership qualities, and professional conduct. We believe that {studentName} would be a valuable addition to your team.
            </p>
            <p>
              Please do not hesitate to contact us if you need any additional information.
            </p>
          </div>

          {/* Signature */}
          <div className="mb-8">
            Sincerely,
            <br /><br /><br />
            Dr. Angela Owusu-Ansah
            <br />
            Provost
            <br />
            Ashesi University
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 mt-16 pt-4 border-t">
            <p>Request submitted on: {new Date(requestDate).toLocaleDateString()}</p>
            <p>Document ID: {studentId}-{new Date().getTime()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
