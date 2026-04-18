// useProjectSearch.ts
// Provides debounced search + multi-field filtering for the project list.
// Usage:
//   const { filtered, query, setQuery, filters, setFilter } = useProjectSearch(projects);

import { useState, useMemo, useEffect, useRef } from "react";
import type { Project } from "../App";

export interface ProjectFilters {
  status: string;      // "" = all
  department: string;  // "" = all
  supervisor: string;  // "" = all
}

const DEFAULT_FILTERS: ProjectFilters = {
  status: "",
  department: "",
  supervisor: "",
};

export function useProjectSearch(projects: Project[]) {
  const [query, setQueryRaw] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFiltersRaw] = useState<ProjectFilters>(DEFAULT_FILTERS);

  // Debounce the text query by 350ms so we don't filter on every keystroke
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setQuery = (value: string) => {
    setQueryRaw(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQuery(value), 350);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Update a single filter key without touching the others
  const setFilter = (key: keyof ProjectFilters, value: string) => {
    setFiltersRaw((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setQueryRaw("");
    setDebouncedQuery("");
    setFiltersRaw(DEFAULT_FILTERS);
  };

  // Derive the filtered list only when inputs change
  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();

    return projects.filter((project) => {
      // Text search across multiple fields
      if (q) {
        const searchable = [
          project.title,
          project.studentName,
          project.studentId,
          project.department,
          project.supervisor,
          project.description,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Dropdown filters (exact match)
      if (filters.status && project.status !== filters.status) return false;
      if (filters.department && project.department !== filters.department) return false;
      if (filters.supervisor && project.supervisor !== filters.supervisor) return false;

      return true;
    });
  }, [projects, debouncedQuery, filters]);

  // Derive unique values for filter dropdowns
  const uniqueStatuses = useMemo(
    () => [...new Set(projects.map((p) => p.status).filter(Boolean))].sort(),
    [projects]
  );
  const uniqueDepartments = useMemo(
    () => [...new Set(projects.map((p) => p.department).filter(Boolean))].sort(),
    [projects]
  );
  const uniqueSupervisors = useMemo(
    () => [...new Set(projects.map((p) => p.supervisor).filter(Boolean))].sort(),
    [projects]
  );

  const isFiltered = debouncedQuery !== "" || Object.values(filters).some((v) => v !== "");

  return {
    filtered,
    query,
    setQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    options: { uniqueStatuses, uniqueDepartments, uniqueSupervisors },
  };
}
