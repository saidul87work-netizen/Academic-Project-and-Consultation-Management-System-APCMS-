import { useState } from 'react'
import axios from 'axios'

interface Props {
  stageId: string
  projectId: string
  userId: string
}

const FileUpload = ({ stageId, projectId, userId }: Props) => {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [isLate, setIsLate] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return setMessage('❌ Please select a file!')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('stageId', stageId)
    formData.append('projectId', projectId)
    formData.append('userId', userId)

    try {
      setLoading(true)
      const res = await axios.post(
        'http://localhost:5000/api/submissions/submit',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setMessage(res.data.message)
      setIsLate(res.data.isLate)
    } catch (error) {
      setMessage('❌ Error submitting work')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-700">📤 Upload Your Work</h2>

      {isLate && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ⚠️ <strong>Late Submission!</strong> This submission has been flagged as late.
        </div>
      )}

      {message && !isLate && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
          <input
            type="file"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full"
            accept=".pdf,.doc,.docx,.zip,.png,.jpg"
          />
          <p className="text-sm text-gray-500 mt-2">
            Allowed: PDF, DOC, DOCX, ZIP, PNG, JPG (Max 10MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Submit Work'}
        </button>
      </form>
    </div>
  )
}

export default FileUpload