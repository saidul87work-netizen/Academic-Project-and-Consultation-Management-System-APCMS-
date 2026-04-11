import { LayoutDashboard, FolderKanban, Calendar, Users, FileText, Settings, Briefcase } from 'lucide-react';
import type { PageView, UserRole } from '../App';

interface SidebarProps {
  currentPage: PageView;
  userRole: UserRole;
  onNavigate: (page: PageView) => void;
}

interface NavItem {
  id: PageView;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export function Sidebar({ currentPage, userRole, onNavigate }: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'projects',
      label: 'Project Evaluations',
      icon: <FolderKanban className="w-5 h-5" />,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'reservations',
      label: 'Room & Desk Booking',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'positions',
      label: 'Positions & Applications',
      icon: <Briefcase className="w-5 h-5" />,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 border-r border-purple-700 flex flex-col shadow-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-purple-600/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-purple-100 font-bold text-lg drop-shadow-lg">APCMS</h2>
            <p className="text-xs text-purple-200">Efficiency You Can Trust.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs text-purple-300 uppercase tracking-wider font-semibold">Main Menu</p>
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                currentPage === item.id || (currentPage === 'project-details' && item.id === 'projects')
                  ? 'bg-purple-600/30 text-purple-100 border-l-4 border-purple-400 shadow-lg'
                  : 'text-purple-200 hover:bg-purple-700/20 hover:text-white hover:shadow-md'
              }`}
              style={{
                filter: currentPage === item.id || (currentPage === 'project-details' && item.id === 'projects')
                  ? 'brightness(1.2)'
                  : 'brightness(0.9)'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Menu */}
        <div className="mt-8 space-y-1">
          <p className="px-3 py-2 text-xs text-purple-300 uppercase tracking-wider font-semibold">System</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-purple-200 hover:bg-purple-700/20 hover:text-white transition-all duration-200 hover:shadow-md">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-purple-600/30">
        <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-lg p-3 border border-purple-500/30 backdrop-blur-sm">
          <p className="text-xs text-purple-200 mb-1 font-medium">Need Help?</p>
          <p className="text-xs text-purple-300">Contact support@campus.edu</p>
        </div>
      </div>
    </aside>
  );
}
