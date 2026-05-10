import { useState } from 'react'
import axios from 'axios'

interface Props {
  submissionId: string
}

const ResubmissionRequest = ({ submissionId }: Props) => {
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.patch(
        `http://localhost:5000/api/submissions/${submissionId}/request-resubmission`,
        { resubmissionNote: note }
      )
      setMessage('✅ Resubmission requested! Student has been notified.')
      setNote('')
    } catch (error) {
      setMessage('❌ Error requesting resubmission')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto mb-6">
      <h2 className="text-xl font-bold mb-4 text-red-600">
        🔄 Request Resubmission (Supervisor)
      </h2>

      {message && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleRequest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Reason for Resubmission
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Explain what needs to be fixed..."
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold"
        >
          Request Resubmission
        </button>
      </form>
    </div>
  )
}

export default ResubmissionRequest