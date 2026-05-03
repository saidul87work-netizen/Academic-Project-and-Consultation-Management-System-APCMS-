export type EvaluationStatus = "Submitted" | "Pending";

export interface CriterionScore {
  name: string;
  maxScore: number;
  score?: number;
  comment?: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  assessorName: string;
  assessorRole: string;
  totalScore: number;
  status: EvaluationStatus;
  criteria: CriterionScore[];
  finalComment?: string;
  submittedAt?: string;
}

export interface CriteriaSummary {
  name: string;
  average: number;
  maxScore: number;
}

export interface EvaluationSummary {
  averageTotal: number;
  submittedCount: number;
  totalCount: number;
  criteriaSummary: CriteriaSummary[];
}

export function calculateSummary(evaluations: Evaluation[]): EvaluationSummary {
  const totalCount = evaluations.length;
  const submitted = evaluations.filter(e => e.status === "Submitted");
  const submittedCount = submitted.length;

  const averageTotal = submittedCount
    ? submitted.reduce((sum, e) => sum + e.totalScore, 0) / submittedCount
    : 0;

  const criteriaSummary: CriteriaSummary[] = (submitted[0]?.criteria || []).map((criterion, index) => {
    const scores = submitted
      .map(e => e.criteria[index]?.score)
      .filter((score): score is number => typeof score === "number");

    const average = scores.length
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    return {
      name: criterion.name,
      average,
      maxScore: criterion.maxScore
    };
  });

  return {
    averageTotal,
    submittedCount,
    totalCount,
    criteriaSummary
  };
}
