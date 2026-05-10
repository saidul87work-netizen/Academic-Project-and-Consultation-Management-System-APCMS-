import { useNavigate } from 'react-router-dom'

interface Stage {
  _id: string
  name: string
  weight: number
  deadline: string
  status: string
  deliverables: string[]
  order: number
}

interface Props {
  stages: Stage[]
}

const StageList = ({ stages }: Props) => {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'active') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-blue-700">📋 Project Stages</h2>
      {stages.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No stages yet. Create one above!
        </p>
      )}
      {stages.map((stage) => (
        <div
          key={stage._id}
          className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{stage.name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stage.status)}`}>
              {stage.status}
            </span>
          </div>

          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>⚖️ Weight: <strong>{stage.weight}%</strong></span>
            <span>📅 Deadline: <strong>{new Date(stage.deadline).toLocaleDateString()}</strong></span>
            <span>🔢 Order: <strong>{stage.order}</strong></span>
          </div>

          {stage.deliverables.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">📦 Deliverables:</p>
              <div className="flex gap-2 flex-wrap">
                {stage.deliverables.map((d, i) => (
                  <span key={i} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(`/submit/${stage._id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            📤 Submit Work
          </button>
        </div>
      ))}
    </div>
  )
}

export default StageList