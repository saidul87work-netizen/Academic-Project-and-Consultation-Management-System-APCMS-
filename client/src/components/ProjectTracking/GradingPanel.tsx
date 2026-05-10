import { useState } from 'react'
import axios from 'axios'
import StarRating from './StarRating'

interface Props {
  submissionId: string
  userId: string
}

const GradingPanel = ({ submissionId, userId }: Props) => {
  const [score, setScore] = useState('')
  const [stars, setStars] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')
  const [weightedScore, setWeightedScore] = useState<number | null>(null)

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await axios.post(
        `http://localhost:5000/api/grades/${submissionId}/grade`,
        { score: Number(score), stars, feedback, userId }
      )
      setMessage('✅ Graded successfully!')
      setWeightedScore(res.data.weightedScore)
    } catch (error) {
      setMessage('❌ Error grading submission')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-700">⭐ Grade Submission</h2>

      {message && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
          {message}
          {weightedScore !== null && (
            <p className="mt-1">Weighted Score: <strong>{weightedScore}</strong></p>
          )}
        </div>
      )}

      <form onSubmit={handleGrade} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Score (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={e => setScore(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Star Rating</label>
          <StarRating value={stars} onChange={setStars} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Feedback</label>
          <textarea
            rows={4}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Write your feedback here..."
            className="w-full border rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Submit Grade
        </button>
      </form>
    </div>
  )
}

export default GradingPanel