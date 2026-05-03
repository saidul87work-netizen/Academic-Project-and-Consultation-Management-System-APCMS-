import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Search, User, GraduationCap, BookOpen, Calendar, ChevronDown } from 'lucide-react';
import { projectApi } from '../services/projectService';
import { userApi, type UserSearchResult } from '../services/userService';
import { toast } from 'sonner';
import type { UserRole, Project } from '../App';

interface AddProjectModalProps {
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  studentName: string;
  userRole: UserRole;
  project?: Project;
}

export function AddProjectModal({ onClose, onSuccess, studentName, userRole, project }: AddProjectModalProps) {
  const isEditing = !!project;

  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    department: project?.department || 'Computer Science',
    studentName: project?.studentName || '',
    studentId: project?.studentId || '',
    supervisorName: project?.supervisor || '',
    supervisorId: '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    stage: project?.stage || 'Proposal'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState(project?.studentName || '');
  const [studentResults, setStudentResults] = useState<UserSearchResult[]>([]);
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState(project?.supervisor || '');
  const [supervisorResults, setSupervisorResults] = useState<UserSearchResult[]>([]);
  const [showSupervisorResults, setShowSupervisorResults] = useState(false);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [isSearchingSupervisor, setIsSearchingSupervisor] = useState(false);

  const studentRef = useRef<HTMLDivElement>(null);
  const supervisorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentRef.current && !studentRef.current.contains(event.target as Node)) {
        setShowStudentResults(false);
      }
      if (supervisorRef.current && !supervisorRef.current.contains(event.target as Node)) {
        setShowSupervisorResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (studentSearch.length > 1 && showStudentResults) {
      setIsSearchingStudent(true);
      const timer = setTimeout(async () => {
        try {
          const results = await userApi.searchUsers(studentSearch, 'student');
          setStudentResults(results);
        } catch { console.error('Failed to search students'); }
        finally { setIsSearchingStudent(false); }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setStudentResults([]);
    }
  }, [studentSearch, showStudentResults]);

  useEffect(() => {
    if (supervisorSearch.length > 1 && showSupervisorResults) {
      setIsSearchingSupervisor(true);
      const timer = setTimeout(async () => {
        try {
          const results = await userApi.searchUsers(supervisorSearch, 'faculty');
          setSupervisorResults(results);
        } catch { console.error('Failed to search supervisors'); }
        finally { setIsSearchingSupervisor(false); }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSupervisorResults([]);
    }
  }, [supervisorSearch, showSupervisorResults]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }
    setIsLoading(true);
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        studentName: studentSearch,
        studentId: formData.studentId,
        supervisorName: supervisorSearch,
        startDate: formData.startDate,
        expectedEndDate: formData.endDate,
        creatorName: studentName,
        userRole: userRole
      };
      if (isEditing) {
        await projectApi.updateProject(project!.id, projectData);
        toast.success('Project updated successfully!');
      } else {
        await projectApi.createProject(projectData);
        toast.success('Project created successfully!');
      }
      await onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-400/60 focus:bg-white/8 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 text-sm";
  const labelClass = "block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '92vh' }}>
        
        {/* Glow accents */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', filter: 'blur(20px)' }} />

        {/* Header */}
        <div className="relative flex items-center justify-between px-8 pt-8 pb-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEditing ? 'Edit Project' : 'New Project'}
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                {isEditing ? 'Update project details below' : 'Fill in the details to create a project'}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 130px)' }}>
          <div className="px-8 py-6 space-y-5">

            {/* Project Title */}
            <div>
              <label className={labelClass}>Project Title <span className="text-red-400 normal-case tracking-normal">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder="e.g. AI-Powered Learning Management System"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description <span className="text-red-400 normal-case tracking-normal">*</span></label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={inputClass + ' resize-none'}
                placeholder="Describe the project objectives, scope and expected outcomes..."
                required
              />
            </div>

            {/* Student & Supervisor row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Student Search */}
              <div ref={studentRef} className="relative">
                <label className={labelClass}>
                  <User className="inline w-3 h-3 mr-1 mb-0.5" />
                  Student <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => { setStudentSearch(e.target.value); setShowStudentResults(true); }}
                    onFocus={() => setShowStudentResults(true)}
                    className={inputClass + ' pl-10'}
                    placeholder="Search students..."
                    required
                    autoComplete="off"
                  />
                </div>
                {showStudentResults && studentSearch.length > 1 && (
                  <div className="absolute left-0 right-0 mt-1.5 rounded-xl overflow-hidden shadow-2xl z-[10001]"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.10)' }}>
                    {isSearchingStudent ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-white/40">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                      </div>
                    ) : studentResults.length > 0 ? (
                      <div className="max-h-44 overflow-y-auto">
                        {studentResults.map((u) => (
                          <button key={u.id} type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setStudentSearch(u.name);
                              setFormData({ ...formData, studentId: u.id, studentName: u.name });
                              setShowStudentResults(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{u.name}</p>
                              <p className="text-xs text-white/40">{u.universityId || u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-white/30 text-center">No students found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Supervisor Search */}
              <div ref={supervisorRef} className="relative">
                <label className={labelClass}>
                  <GraduationCap className="inline w-3 h-3 mr-1 mb-0.5" />
                  Supervisor <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    value={supervisorSearch}
                    onChange={(e) => { setSupervisorSearch(e.target.value); setShowSupervisorResults(true); }}
                    onFocus={() => setShowSupervisorResults(true)}
                    className={inputClass + ' pl-10'}
                    placeholder="Search faculty..."
                    required
                    autoComplete="off"
                  />
                </div>
                {showSupervisorResults && supervisorSearch.length > 1 && (
                  <div className="absolute left-0 right-0 mt-1.5 rounded-xl overflow-hidden shadow-2xl z-[10001]"
                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.10)' }}>
                    {isSearchingSupervisor ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-white/40">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
                      </div>
                    ) : supervisorResults.length > 0 ? (
                      <div className="max-h-44 overflow-y-auto">
                        {supervisorResults.map((u) => (
                          <button key={u.id} type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSupervisorSearch(u.name);
                              setFormData({ ...formData, supervisorId: u.id, supervisorName: u.name });
                              setShowSupervisorResults(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{u.name}</p>
                              <p className="text-xs text-white/40">{u.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-white/30 text-center">No faculty found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Department & Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Department <span className="text-red-400 normal-case tracking-normal">*</span></label>
                <div className="relative">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className={inputClass + ' appearance-none cursor-pointer'}
                    required>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Project Stage <span className="text-red-400 normal-case tracking-normal">*</span></label>
                <div className="relative">
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className={inputClass + ' appearance-none cursor-pointer'}
                    required>
                    <option value="Proposal">Proposal</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <Calendar className="inline w-3 h-3 mr-1 mb-0.5" />
                  Start Date <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={inputClass + ' [color-scheme:dark]'}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Calendar className="inline w-3 h-3 mr-1 mb-0.5" />
                  Expected End Date <span className="text-red-400 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={inputClass + ' [color-scheme:dark]'}
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-8 py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/8 border border-white/10 hover:border-white/20 transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: isLoading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? (isLoading ? 'Updating...' : 'Update Project') : (isLoading ? 'Creating...' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
