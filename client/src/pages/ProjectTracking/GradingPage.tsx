import GradingPanel from '../../components/ProjectTracking/GradingPanel'

const GradingPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">⭐ Grade Submission</h1>
      <GradingPanel 
        submissionId="test-submission-123" 
        userId="supervisor-123" 
      />
    </div>
  )
}

export default GradingPage