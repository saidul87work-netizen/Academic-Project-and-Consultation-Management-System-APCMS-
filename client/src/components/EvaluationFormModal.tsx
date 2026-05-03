import { useState, useMemo } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { evaluationApi } from '../services/evaluationApi';
import type { Evaluation, Project, Criterion } from '../App';

interface EvaluationFormModalProps {
  evaluation: Evaluation;
  project: Project;
  onClose: () => void;
  onSubmit: (evaluation: Evaluation) => void;
}

export function EvaluationFormModal({ evaluation, project, onClose, onSubmit }: EvaluationFormModalProps) {
  const [criteria, setCriteria] = useState<Criterion[]>(evaluation.criteria);
  const [finalComment, setFinalComment] = useState(evaluation.finalComment);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const isReadOnly = evaluation.status === 'Submitted';

  const totalScore = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (c.score || 0), 0);
  }, [criteria]);

  const progress = useMemo(() => {
    const filledCriteria = criteria.filter((c) => c.score !== undefined && c.score > 0).length;
    return (filledCriteria / criteria.length) * 100;
  }, [criteria]);

  const updateCriterion = (index: number, field: 'score' | 'comment', value: string | number) => {
    const newCriteria = [...criteria];
    if (field === 'score') {
      const score = Number(value);
      const maxScore = newCriteria[index].maxScore;

      if (score < 0 || score > maxScore) {
        setErrors({ ...errors, [index]: `Score must be between 0 and ${maxScore}` });
        return;
      } else {
        const newErrors = { ...errors };
        delete newErrors[index];
        setErrors(newErrors);
      }

      newCriteria[index].score = score;
    } else {
      newCriteria[index].comment = value as string;
    }
    setCriteria(newCriteria);
  };

  const handleSubmit = async () => {
    const allScoresFilled = criteria.every((c) => c.score !== undefined && c.score >= 0);
    if (!allScoresFilled) {
      toast.error('Please fill in all scores before submitting');
      return;
    }

    try {
      // Update evaluation in MongoDB
      const updateData = {
        criteria: criteria,
        finalComment: finalComment,
        status: 'Submitted'
      };

      const updatedEvaluation = await evaluationApi.update(evaluation.id, updateData);

      // Call the onSubmit callback with updated data
      const localEvaluation: Evaluation = {
        ...evaluation,
        criteria: criteria,
        finalComment: finalComment,
        totalScore: updatedEvaluation.totalScore,
        status: 'Submitted',
        submittedAt: updatedEvaluation.submittedAt,
        updatedAt: updatedEvaluation.updatedAt,
      };

      onSubmit(localEvaluation);
      toast.success('Evaluation submitted successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      toast.error(error.response?.data?.error || 'Failed to submit evaluation');
    }
  };

  const getGrade = (score: number) => {
    if (score >= 85) return 'A (Excellent)';
    if (score >= 70) return 'B (Good)';
    if (score >= 55) return 'C (Satisfactory)';
    if (score >= 40) return 'D (Pass)';
    return 'F (Fail)';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900">Evaluation Form</h3>
            <p className="text-sm text-gray-600 mt-1">{project.title}</p>
          </div>
          <div className="flex items-center gap-3">
            {isReadOnly && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-lg">
                Submitted
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Bar */}
                {!isReadOnly && (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Criteria */}
                <div className="space-y-4">
                  {criteria.map((criterion, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                          {index + 1}
                        </span>
                        <h4 className="text-gray-900">{criterion.name}</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">
                            Score <span className="text-red-500">*</span>
                            <span className="text-gray-500 ml-1">(Max: {criterion.maxScore})</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max={criterion.maxScore}
                              step="0.5"
                              value={criterion.score ?? ''}
                              onChange={(e) => updateCriterion(index, 'score', e.target.value)}
                              disabled={isReadOnly}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[index] ? 'border-red-500' : 'border-gray-300'
                              } ${isReadOnly ? 'bg-white' : ''}`}
                              placeholder={`Enter score (0-${criterion.maxScore})`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                              / {criterion.maxScore}
                            </span>
                          </div>
                          {errors[index] && (
                            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors[index]}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-2">Comments (Optional)</label>
                          <textarea
                            value={criterion.comment || ''}
                            onChange={(e) => updateCriterion(index, 'comment', e.target.value)}
                            disabled={isReadOnly}
                            rows={2}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                              isReadOnly ? 'bg-white' : ''
                            }`}
                            placeholder="Add specific feedback..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Comments */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Final Comments & Recommendations
                  </label>
                  <textarea
                    value={finalComment}
                    onChange={(e) => setFinalComment(e.target.value)}
                    disabled={isReadOnly}
                    rows={5}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                      isReadOnly ? 'bg-white' : ''
                    }`}
                    placeholder="Provide overall feedback, strengths, areas for improvement..."
                  />
                </div>
              </div>

              {/* Sidebar - Score Summary */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
                  <h4 className="text-gray-900 mb-4">Score Summary</h4>

                  <div className="space-y-2 mb-4">
                    {criteria.map((criterion, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 truncate pr-2">{criterion.name.split('&')[0].trim()}</span>
                        <div className="flex items-center gap-1">
                          <span className={criterion.score !== undefined ? 'text-gray-900' : 'text-gray-400'}>
                            {criterion.score !== undefined ? criterion.score : '—'}
                          </span>
                          <span className="text-gray-500">/{criterion.maxScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Total Score</span>
                      <span className="text-2xl text-gray-900">{totalScore}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">Maximum</span>
                      <span className="text-gray-600">100</span>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all ${
                          totalScore >= 70 ? 'bg-green-500' : totalScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${totalScore}%` }}
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Indicative Grade</p>
                      <p className="text-sm text-blue-900">{getGrade(totalScore)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        {!isReadOnly && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Submit Evaluation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
