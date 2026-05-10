import { useState } from 'react'
import axios from 'axios'

interface Props {
  submissionId: string
  userId: string
}

const ResubmissionForm = ({ submissionId, userId }: Props) => {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return setMessage('❌ Please select a file!')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    try {
      setLoading(true)
      await axios.patch(
        `http://localhost:5000/api/submissions/${submissionId}/resubmit`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setMessage('✅ Resubmitted successfully!')
    } catch (error) {
      setMessage('❌ Error resubmitting')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-700">
        📤 Resubmit Your Work (Student)
      </h2>

      {message && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleResubmit} className="space-y-4">
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full"
            accept=".pdf,.doc,.docx,.zip,.png,.jpg"
          />
          <p className="text-sm text-gray-500 mt-2">
            Upload your corrected work
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Resubmit Work'}
        </button>
      </form>
    </div>
  )
}

export default ResubmissionForm