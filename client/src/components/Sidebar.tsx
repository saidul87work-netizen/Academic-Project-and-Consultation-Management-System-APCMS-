import { LayoutDashboard, FolderKanban, Calendar, Users, FileText, Settings, Briefcase, UserCheck, Clock } from 'lucide-react';
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
    {
      id: 'supervisor-management',
      label: 'Project Management',
      icon: <UserCheck className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      id: 'supervisor-availability',
      label: 'My Availability',
      icon: <Clock className="w-5 h-5" />,
      roles: ['faculty'],
    },
    {
      id: 'stage-management',
      label: 'Stage Management',
      icon: <FolderKanban className="w-5 h-5" />,
      roles: ['admin', 'faculty', 'student'],
    },
    {
      id: 'submit-work',
      label: 'Submit Work',
      icon: <FileText className="w-5 h-5" />,
      roles: ['student'],
    },
    {
      id: 'grading',
      label: 'Grading Panel',
      icon: <UserCheck className="w-5 h-5" />,
      roles: ['admin', 'faculty'],
    },
    {
      id: 'peer-review',
      label: 'Peer Review',
      icon: <Users className="w-5 h-5" />,
      roles: ['student'],
    },
    {
      id: 'resubmission',
      label: 'Resubmission',
      icon: <Briefcase className="w-5 h-5" />,
      roles: ['admin', 'faculty', 'student'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside style={{
      width: '256px',
      background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1220 60%, #0a0f1e 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(34,197,94,0.4)',
          }}>
            <FileText style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>APCMS</h2>
            <p style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>Efficiency You Can Trust.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <p style={{ padding: '8px 12px', fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>Main Menu</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {filteredNavItems.map((item) => {
            const isActive = currentPage === item.id ||
              ((currentPage === 'project-details' || currentPage === 'evaluation-summary') && item.id === 'projects') ||
              (currentPage === 'supervisor-management' && item.id === 'supervisor-management') ||
              (currentPage === 'supervisor-availability' && item.id === 'supervisor-availability');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : '#64748b',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(34,197,94,0.15), rgba(34,197,94,0.04))'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                  boxShadow: isActive ? 'inset 0 0 20px rgba(34,197,94,0.05)' : 'none',
                  paddingLeft: '12px',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.color = '#cbd5e1';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#64748b';
                  }
                }}
              >
                <span style={{ color: isActive ? '#22c55e' : 'inherit', display: 'flex' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(244,63,94,0.06))',
          borderRadius: '10px', padding: '12px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>Need Help?</p>
          <p style={{ fontSize: '0.7rem', color: '#475569' }}>support@campus.edu</p>
        </div>
      </div>
    </aside>
  );
}
