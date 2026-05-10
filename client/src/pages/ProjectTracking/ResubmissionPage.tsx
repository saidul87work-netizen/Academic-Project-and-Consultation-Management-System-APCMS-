import ResubmissionRequest from '../../components/ProjectTracking/ResubmissionRequest'
import ResubmissionForm from '../../components/ProjectTracking/ResubmissionForm'

const ResubmissionPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔄 Resubmission</h1>
      <ResubmissionRequest submissionId="test-submission-123" />
      <ResubmissionForm 
        submissionId="test-submission-123" 
        userId="student-123" 
      />
    </div>
  )
}

export default ResubmissionPage