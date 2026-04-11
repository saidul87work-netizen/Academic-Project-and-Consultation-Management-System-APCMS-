import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { projectApi, type CreateProjectData } from '../services/projectService';
import { toast } from 'sonner';
import type { UserRole } from '../App';

interface AddProjectModalProps {
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  studentName: string;
  userRole: UserRole;
}

export function AddProjectModal({ onClose, onSuccess, studentName, userRole }: AddProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    studentId: '',
    description: '',
    department: 'Computer Science',
    supervisor: '',
    startDate: '',
    endDate: '',
  });
  const [assignSelfAsSupervisor, setAssignSelfAsSupervisor] = useState(userRole === 'faculty'); // Auto-assign for faculty
  const [isLoading, setIsLoading] = useState(false);

  // Test API connection when modal opens
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 TESTING API CONNECTION from modal...');
        await projectApi.testConnection();
        console.log('✅ API connection test passed');
      } catch (error) {
        console.error('❌ API connection test failed:', error);
        toast.error('Cannot connect to server. Please check if backend is running.');
      }
    };
    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Minimal validation - only title and description required
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('ADD PROJECT MODAL - FORM SUBMIT STARTED');
      console.log('ADD PROJECT MODAL - CURRENT TOKEN:', localStorage.getItem('token'));

      if (userRole === 'faculty') {
        // Use new faculty project creation API
        const projectData = {
          title: formData.title,
          description: formData.description,
          assignSelfAsSupervisor: assignSelfAsSupervisor
        };

        console.log('🚀 ADD PROJECT MODAL - FACULTY CREATING PROJECT:', projectData);
        await projectApi.createProjectAsFaculty(projectData);
        toast.success(assignSelfAsSupervisor
          ? 'Project created and assigned as supervisor!'
          : 'Project created successfully!');
      } else {
        // Use legacy project creation for students/admins
        const projectData = {
          studentId: formData.studentId || null,
          title: formData.title,
          description: formData.description,
          department: formData.department,
          supervisorName: formData.supervisor,
          startDate: formData.startDate,
          expectedEndDate: formData.endDate,
          creatorName: studentName,
          userRole: userRole
        };

        console.log('🚀 ADD PROJECT MODAL - SENDING PROJECT DATA:', projectData);
        await projectApi.createProject(projectData);
        toast.success('Project submitted successfully!');
      }

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ FRONTEND ERROR creating project:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);

      // Show detailed error information
      if (error.response?.data) {
        console.error('❌ Server responded with:', error.response.data);
        const errorMessage = error.response.data.message ||
                            error.response.data.error ||
                            'Unknown server error';
        toast.error(`Server Error: ${errorMessage}`);
      } else if (error.request) {
        console.error('❌ No response from server:', error.request);
        toast.error('No response from server. Check if backend is running.');
      } else {
        console.error('❌ Request setup error:', error.message);
        toast.error(`Request Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-gray-900">Add New Project</h3>
            <p className="text-sm text-gray-600 mt-1">
              {userRole === 'student'
                ? 'Submit your academic project for evaluation'
                : userRole === 'faculty'
                ? 'Create a project template or demo project'
                : 'Create a project for testing or demonstration'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Creator Name (Read-only) */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                {userRole === 'student' ? 'Student Name' : userRole === 'faculty' ? 'Faculty Name' : 'Admin Name'}
              </label>
              <input
                type="text"
                value={studentName}
                disabled
                placeholder="Loading..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* ID Field - Optional for faculty/admin */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                {userRole === 'student' ? 'Student ID' : 'Project ID/Reference'}
                {userRole === 'student' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={userRole === 'student' ? 'e.g., CS2021-1234' : 'e.g., DEMO-001 or leave blank'}
                required={userRole === 'student'}
              />
            </div>

            {/* Project Title */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your project title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Project Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe your project objectives, methodology, and expected outcomes..."
                required
              />
            </div>

            {/* Faculty Supervisor Assignment */}
            {userRole === 'faculty' && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="assignSupervisor"
                  checked={assignSelfAsSupervisor}
                  disabled={true} // Auto-assigned for faculty
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 opacity-60 cursor-not-allowed"
                />
                <label htmlFor="assignSupervisor" className="text-sm text-blue-800 font-medium">
                  ✓ Automatically assigned as supervisor (Faculty role)
                </label>
              </div>
            )}

            {/* Department */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Psychology">Psychology</option>
                <option value="Business Administration">Business Administration</option>
              </select>
            </div>

            {/* Supervisor */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Supervisor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write Your Supervisor name"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Expected End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                minWidth: '120px',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isLoading ? '#9ca3af' : (
                  userRole === 'student' ? '#dc2626' :
                  userRole === 'faculty' ? '#2563eb' :
                  '#16a34a'
                ),
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                minWidth: '160px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  const colors = {
                    student: '#b91c1c',
                    faculty: '#1d4ed8',
                    admin: '#15803d'
                  };
                  e.currentTarget.style.backgroundColor = colors[userRole as keyof typeof colors] || '#b91c1c';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  const colors = {
                    student: '#dc2626',
                    faculty: '#2563eb',
                    admin: '#16a34a'
                  };
                  e.currentTarget.style.backgroundColor = colors[userRole as keyof typeof colors] || '#dc2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
