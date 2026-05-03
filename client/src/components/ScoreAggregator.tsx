import { TrendingUp, Award, BarChart3 } from 'lucide-react';
import type { Evaluation, UserRole } from '../App';

interface ScoreAggregatorProps {
  evaluations: Evaluation[];
  userRole: UserRole;
}

export function ScoreAggregator({ evaluations, userRole }: ScoreAggregatorProps) {
  // Calculate average total score
  const averageTotalScore = evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length;

  // Calculate average for each criterion
  const criteriaAverages = evaluations[0]?.criteria.map((criterion, index) => {
    const sum = evaluations.reduce((total, evaluation) => {
      return total + (evaluation.criteria[index]?.score || 0);
    }, 0);
    return {
      name: criterion.name,
      average: sum / evaluations.length,
      maxScore: criterion.maxScore,
    };
  }) || [];

  const getGrade = (score: number) => {
    if (score >= 85) return { grade: 'A', label: 'Excellent', color: 'text-green-600' };
    if (score >= 70) return { grade: 'B', label: 'Good', color: 'text-blue-600' };
    if (score >= 55) return { grade: 'C', label: 'Satisfactory', color: 'text-amber-600' };
    if (score >= 40) return { grade: 'D', label: 'Pass', color: 'text-orange-600' };
    return { grade: 'F', label: 'Fail', color: 'text-red-600' };
  };

  const finalGrade = getGrade(averageTotalScore);

  return (
    <div className="space-y-6">
      {/* Final Average Score Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5" />
          <h3>Final Average Score</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl">{averageTotalScore.toFixed(1)}</span>
              <span className="text-2xl opacity-80">/100</span>
            </div>
            <p className="text-sm opacity-90 mt-2">
              Based on {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
              <p className="text-sm opacity-90">Grade</p>
              <p className="text-3xl mt-1">{finalGrade.grade}</p>
              <p className="text-sm opacity-90">{finalGrade.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Assessor Scores */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-gray-900">Individual Assessor Scores</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-700">Assessor</th>
                <th className="px-4 py-3 text-left text-sm text-gray-700">Role</th>
                <th className="px-4 py-3 text-right text-sm text-gray-700">Total Score</th>
                <th className="px-4 py-3 text-center text-sm text-gray-700">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {evaluations.map((evaluation) => {
                const grade = getGrade(evaluation.totalScore);
                return (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{evaluation.assessorName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {evaluation.assessorRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {evaluation.totalScore}/100
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`${grade.color}`}>{grade.grade}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-gray-900">Criteria Breakdown</h3>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            {criteriaAverages.map((criterion, index) => {
              const percentage = (criterion.average / criterion.maxScore) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">{criterion.name}</span>
                    <span className="text-sm text-gray-900">
                      {criterion.average.toFixed(1)}/{criterion.maxScore}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
