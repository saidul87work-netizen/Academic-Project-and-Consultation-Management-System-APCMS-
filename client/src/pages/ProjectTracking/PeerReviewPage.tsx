import PeerReviewForm from '../../components/ProjectTracking/PeerReviewForm'

const PeerReviewPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👥 Peer Review</h1>
      <PeerReviewForm 
        submissionId="test-submission-123" 
        userId="student-123" 
      />
    </div>
  )
}

export default PeerReviewPage