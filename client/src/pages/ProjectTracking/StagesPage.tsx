import { useEffect, useState } from 'react'
import axios from 'axios'
import CreateStage from '../../components/ProjectTracking/CreateStage'
import StageList from '../../components/ProjectTracking/StageList'

const StagesPage = () => {
  const [stages, setStages] = useState([])
  const projectId = "test-project-123"

  const fetchStages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/stages/project/${projectId}`
      )
      setStages(res.data.data)
    } catch (error) {
      console.error("Error fetching stages:", error)
    }
  }

  useEffect(() => {
    fetchStages()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Project Stage Management</h1>
      <CreateStage projectId={projectId} onStageCreated={fetchStages} />
      <StageList stages={stages} />
    </div>
  )
}

export default StagesPage