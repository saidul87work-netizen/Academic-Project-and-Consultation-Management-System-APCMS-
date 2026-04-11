import { ArrowLeft, Download, Printer, User, Award, TrendingUp, MessageSquare } from 'lucide-react';
import type { Project, UserRole, Evaluation } from '../App';

interface EvaluationSummaryPageProps {
  project: Project;
  userRole: UserRole;
  evaluations: Evaluation[];
  onBack: () => void;
}

export function EvaluationSummaryPage({ project, userRole, evaluations, onBack }: EvaluationSummaryPageProps) {
  const projectEvaluations = evaluations.filter((e) => e.projectId === project.id);
  const submittedEvaluations = projectEvaluations.filter((e) => e.status === 'Submitted');

  // Calculate average scores
  const averageTotalScore =
    submittedEvaluations.length > 0
      ? submittedEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / submittedEvaluations.length
      : 0;

  // Calculate average for each criterion
  const criteriaAverages = submittedEvaluations[0]?.criteria.map((criterion, index) => {
    const scores = submittedEvaluations.map((evaluation) => evaluation.criteria[index]?.score || 0);
    const sum = scores.reduce((total, score) => total + score, 0);
    return {
      name: criterion.name,
      average: sum / submittedEvaluations.length,
      maxScore: criterion.maxScore,
      scores: submittedEvaluations.map((evaluation, evalIndex) => ({
        assessorName: evaluation.assessorName,
        score: evaluation.criteria[index]?.score || 0,
      })),
    };
  }) || [];

  const getGrade = (score: number) => {
    if (score >= 85) return { grade: 'A', label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-300' };
    if (score >= 70) return { grade: 'B', label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 55) return { grade: 'C', label: 'Satisfactory', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (score >= 40) return { grade: 'D', label: 'Pass', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    return { grade: 'F', label: 'Fail', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const finalGrade = getGrade(averageTotalScore);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here using a library like jsPDF or react-pdf');
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-gray-900 mb-2">Project Evaluation Summary</h1>
              <p className="text-gray-600">Comprehensive assessment report for academic project</p>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 ${finalGrade.color}`}>
              <div className="text-center">
                <div className="text-3xl mb-1">{finalGrade.grade}</div>
                <div className="text-xs">{finalGrade.label}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900">Project Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-lg p-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Project Title</p>
              <p className="text-gray-900">{project.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Student Name</p>
              <p className="text-gray-900">{project.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Student ID</p>
              <p className="text-gray-900">{project.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Department</p>
              <p className="text-gray-900">{project.department}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-1">Project Description</p>
              <p className="text-gray-700">{project.description}</p>
            </div>
          </div>
        </div>

        {/* Final Score Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900">Final Score</h2>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 mb-2">Average Score Across All Assessors</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl text-blue-900">{averageTotalScore.toFixed(2)}</span>
                  <span className="text-2xl text-gray-600">/100</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on {submittedEvaluations.length} submitted evaluation{submittedEvaluations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-center">
                <div className={`px-8 py-4 rounded-xl border-2 ${finalGrade.color}`}>
                  <div className="text-5xl mb-2">{finalGrade.grade}</div>
                  <div className="text-sm">{finalGrade.label}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessors Table */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900">Assessor Scores</h2>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Assessor Name</th>
                  <th className="px-6 py-4 text-left text-gray-700">Role</th>
                  <th className="px-6 py-4 text-right text-gray-700">Total Score</th>
                  <th className="px-6 py-4 text-center text-gray-700">Grade</th>
                  <th className="px-6 py-4 text-center text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submittedEvaluations.map((evaluation) => {
                  const grade = getGrade(evaluation.totalScore);
                  return (
                    <tr key={evaluation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{evaluation.assessorName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {evaluation.assessorRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {evaluation.totalScore}/100
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${grade.color}`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Submitted
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Criteria Breakdown */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-4">Detailed Criteria Breakdown</h2>
          <div className="space-y-6">
            {criteriaAverages.map((criterion, index) => {
              const percentage = (criterion.average / criterion.maxScore) * 100;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900">{criterion.name}</h3>
                    <div className="text-right">
                      <span className="text-2xl text-gray-900">{criterion.average.toFixed(2)}</span>
                      <span className="text-gray-600">/{criterion.maxScore}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentage >= 70
                            ? 'bg-green-500'
                            : percentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Individual Assessor Scores for this criterion */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {criterion.scores.map((scoreData, scoreIndex) => (
                      <div key={scoreIndex} className="bg-white rounded p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{scoreData.assessorName}</p>
                        <p className="text-gray-900">
                          {scoreData.score}/{criterion.maxScore}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900">Assessor Comments</h2>
          </div>
          <div className="space-y-4">
            {submittedEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-900">{evaluation.assessorName}</p>
                    <p className="text-sm text-gray-600">{evaluation.assessorRole}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    Score: {evaluation.totalScore}/100
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {evaluation.finalComment || 'No additional comments provided.'}
                  </p>
                </div>

                {/* Individual Criterion Comments */}
                {evaluation.criteria.some((c) => c.comment) && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">Specific Feedback:</p>
                    {evaluation.criteria.map((criterion, idx) =>
                      criterion.comment ? (
                        <div key={idx} className="ml-4">
                          <p className="text-sm text-gray-700">
                            <span className="text-gray-900">• {criterion.name}:</span> {criterion.comment}
                          </p>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-1">Campus Reservation & Academic Project Management System</p>
        </div>
      </div>
    </div>
  );
}