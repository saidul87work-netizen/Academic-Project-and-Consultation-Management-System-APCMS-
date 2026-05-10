import { useState } from 'react'
import axios from 'axios'

interface Props {
  projectId: string
  onStageCreated: () => void
}

const CreateStage = ({ projectId, onStageCreated }: Props) => {
  const [form, setForm] = useState({
    name: '',
    weight: '',
    deadline: '',
    deliverables: '',
    order: ''
  })
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/stages', {
        ...form,
        project: projectId,
        deliverables: form.deliverables.split(',')
      })
      setMessage('✅ Stage created successfully!')
      setForm({ name: '', weight: '', deadline: '', deliverables: '', order: '' })
      onStageCreated()
    } catch (error) {
      setMessage('❌ Error creating stage')
    }
  }

return (
    <div className="bg-white rounded-xl shadow p-8 mb-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-blue-700">➕ Create New Stage</h2>
      
      {message && (
        <p className="mb-6 text-green-600 font-semibold text-lg">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-gray-700">Stage Name</label>
          <input
            type="text"
            placeholder="e.g. Proposal, Midterm, Final"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border-2 rounded-lg p-3 text-base focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-gray-700">Weight (%)</label>
          <input
            type="number"
            placeholder="e.g. 20"
            value={form.weight}
            onChange={e => setForm({ ...form, weight: e.target.value })}
            className="w-full border-2 rounded-lg p-3 text-base focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-gray-700">Deadline</label>
          <input
            type="date"
            value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            className="w-full border-2 rounded-lg p-3 text-base focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-gray-700">
            Deliverables
            <span className="text-gray-400 text-sm ml-2">(comma separated)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Report, Presentation, Code"
            value={form.deliverables}
            onChange={e => setForm({ ...form, deliverables: e.target.value })}
            className="w-full border-2 rounded-lg p-3 text-base focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-gray-700">Order</label>
          <input
            type="number"
            placeholder="e.g. 1"
            value={form.order}
            onChange={e => setForm({ ...form, order: e.target.value })}
            className="w-full border-2 rounded-lg p-3 text-base focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors duration-200"
        >
          Create Stage
        </button>

      </form>
    </div>
  )
}

export default CreateStage