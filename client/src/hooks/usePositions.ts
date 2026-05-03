import { useCallback, useEffect, useMemo, useState } from "react";
import type { Application, Position } from "../services/positionApi";
import { applicationApi, positionApi } from "../services/positionApi";

export type PositionFilterType = "all" | "ST" | "RA" | "TA";

interface UsePositionsOptions {
  /**
   * Temporary stand-in for auth. If not provided, hook will not auto-load applications.
   */
  studentId?: string;
  /** If true, fetch only positions with spots remaining. Default true to match UI behavior. */
  availableOnly?: boolean;
}

export function usePositions(options: UsePositionsOptions = {}) {
  const { studentId, availableOnly = true } = options;

  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const refreshPositions = useCallback(async () => {
    setLoadingPositions(true);
    setError(null);
    try {
      const res = await positionApi.getPositions({ available: availableOnly });
      setPositions(res.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load positions");
      setPositions([]);
    } finally {
      setLoadingPositions(false);
    }
  }, [availableOnly]);

  const refreshApplications = useCallback(async () => {
    if (!studentId) {
      setApplications([]);
      return;
    }

    setLoadingApplications(true);
    setError(null);
    try {
      const res = await applicationApi.getStudentApplications(studentId);
      setApplications(res.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load applications");
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, [studentId]);

  const submitApplication = useCallback(
    async (payload: Omit<Application, "id" | "status" | "appliedDate">) => {
      setSubmitting(true);
      setError(null);
      try {
        await applicationApi.submitApplication(payload as any);
        // refresh both: filled count and my apps
        await Promise.all([refreshPositions(), refreshApplications()]);
      } catch (e: any) {
        setError(e?.message ?? "Failed to submit application");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshApplications, refreshPositions]
  );

  const hasApplied = useCallback(
    (positionId: string) => applications.some((a: Application) => a.positionId === positionId),
    [applications]
  );

  const loading = useMemo(
    () => loadingPositions || loadingApplications || submitting,
    [loadingApplications, loadingPositions, submitting]
  );

  useEffect(() => {
    refreshPositions();
  }, [refreshPositions]);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  return {
    positions,
    applications,
    loading,
    loadingPositions,
    loadingApplications,
    submitting,
    error,
    refreshPositions,
    refreshApplications,
    submitApplication,
    hasApplied
  };
}
