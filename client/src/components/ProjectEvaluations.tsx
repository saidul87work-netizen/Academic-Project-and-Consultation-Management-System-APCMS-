import { useState } from 'react';
import { CheckCircle, Clock, FileEdit, Eye, Download, Printer } from 'lucide-react';
import type { Project, UserRole, Evaluation } from '../App';
import { EvaluationFormModal } from './EvaluationFormModal';
import { ScoreAggregator } from './ScoreAggregator';

interface ProjectEvaluationTabProps {
  project: Project;
  userRole: UserRole;
  currentUserId: string;
  evaluations: Evaluation[];
  onSubmitEvaluation: (evaluation: Evaluation) => void;
}

export function ProjectEvaluationTab({ project, userRole, currentUserId, evaluations, onSubmitEvaluation }: ProjectEvaluationTabProps) {
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const projectEvaluations = evaluations.filter((e) => e.projectId === project.id);
  const submittedEvaluations = projectEvaluations.filter((e) => e.status === 'Submitted');

  const handleEvaluate = (evaluationId: string) => {
    setSelectedEvaluationId(evaluationId);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setSelectedEvaluationId(null);
  };

  const handleSubmit = (updatedEvaluation: Evaluation) => {
    onSubmitEvaluation(updatedEvaluation);
    handleCloseModal();
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here');
  };

  const selectedEvaluation = evaluations.find((e) => e.id === selectedEvaluationId);

  return (
    <div className="space-y-6">
      {/* Score Summary Section */}
      {submittedEvaluations.length > 0 && (
        <ScoreAggregator evaluations={submittedEvaluations} userRole={userRole} />
      )}

      {/* Faculty List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">Assigned Faculty</h3>
          {userRole !== 'student' && submittedEvaluations.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handlePrintSummary}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {projectEvaluations.map((evaluation) => {
            const isCurrentUser = userRole === 'faculty' && evaluation.assessorId === currentUserId;
            const canEvaluate = isCurrentUser;
            const isSubmitted = evaluation.status === 'Submitted';

            return (
              <div
                key={evaluation.id}
                className={`bg-white border-2 rounded-lg p-5 transition-all ${
                  isSubmitted
                    ? 'border-green-200 bg-green-50'
                    : isCurrentUser
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isSubmitted ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      {isSubmitted ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900">{evaluation.assessorName}</p>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          {evaluation.assessorRole}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                            isSubmitted
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {evaluation.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isSubmitted && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Score</p>
                        <p className="text-xl text-gray-900">{evaluation.totalScore}/100</p>
                      </div>
                    )}

                    {canEvaluate && (
                      <button
                        onClick={() => handleEvaluate(evaluation.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isSubmitted
                            ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isSubmitted ? (
                          <>
                            <Eye className="w-4 h-4" />
                            View Evaluation
                          </>
                        ) : (
                          <>
                            <FileEdit className="w-4 h-4" />
                            Evaluate Now
                          </>
                        )}
                      </button>
                    )}

                    {!canEvaluate && userRole === 'admin' && (
                      <button
                        onClick={() => handleEvaluate(evaluation.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    )}
                  </div>
                </div>

                {/* Show submitted date if available */}
                {isSubmitted && evaluation.submittedAt && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Submitted on {new Date(evaluation.submittedAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {projectEvaluations.length === 0 && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              {userRole === 'faculty'
                ? <>No faculty members assigned to evaluate this project yet. Click <span className="text-blue-600 font-medium">"Assign Myself to Evaluate"</span> above to get started.</>
                : 'No faculty members assigned to this project yet'}
            </p>
          </div>
        )}
      </div>

      {/* Evaluation Comments Section (for submitted evaluations) */}
      {submittedEvaluations.length > 0 && (userRole === 'admin' || userRole === 'student') && (
        <div>
          <h3 className="text-gray-900 mb-4">Faculty Feedback</h3>
          <div className="space-y-4">
            {submittedEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-900">{evaluation.assessorName}</p>
                    <p className="text-sm text-gray-600">{evaluation.assessorRole}</p>
                  </div>
                  <span className="text-gray-900">{evaluation.totalScore}/100</span>
                </div>
                {evaluation.finalComment && (
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{evaluation.finalComment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluation Form Modal */}
      {showFormModal && selectedEvaluation && (
        <EvaluationFormModal
          evaluation={selectedEvaluation}
          project={project}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
