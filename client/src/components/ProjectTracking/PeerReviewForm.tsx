import { useState } from 'react'
import axios from 'axios'
import StarRating from './StarRating'

interface Props {
  submissionId: string
  userId: string
}

const PeerReviewForm = ({ submissionId, userId }: Props) => {
  const [comments, setComments] = useState('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        `http://localhost:5000/api/peer-reviews/${submissionId}/review`,
        { comments, rating, userId }
      )
      setMessage('✅ Peer review submitted! Work sent to supervisor.')
      setComments('')
      setRating(0)
    } catch (error) {
      setMessage('❌ Error submitting peer review')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-700">👥 Peer Review</h2>

      {message && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comments</label>
          <textarea
            rows={4}
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Write your review comments here..."
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Submit Peer Review
        </button>
      </form>
    </div>
  )
}

export default PeerReviewForm