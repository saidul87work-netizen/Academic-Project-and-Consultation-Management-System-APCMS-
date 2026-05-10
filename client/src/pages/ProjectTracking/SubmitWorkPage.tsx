import FileUpload from '../../components/ProjectTracking/FileUpload'

const SubmitWorkPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📤 Submit Your Work</h1>
      <FileUpload 
        stageId="test-stage-123" 
        projectId="test-project-123" 
        userId="test-user-123" 
      />
    </div>
  )
}

export default SubmitWorkPage