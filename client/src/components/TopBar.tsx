import { Bell, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import type { PageView, UserRole } from "../App";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

const PAGE_TITLES: Record<PageView, string> = {
  dashboard: "Dashboard",
  projects: "Projects & Evaluations",
  "project-details": "Project Details",
  reservations: "Room & Desk Booking",
  positions: "Position Applications",
  users: "User Management",
  "supervisor-management": "Supervisor Management",
  "supervisor-availability": "My Availability",
  calendar: "Calendar Integration",
  profile: "Profile & Settings",
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  faculty: "Faculty",
  student: "Student",
  ta: "TA / RA",
};

const ROLE_INITIALS: Record<UserRole, string> = {
  admin: "AD",
  faculty: "FA",
  student: "ST",
  ta: "TA",
};

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Administrator",
  faculty: "Dr. Smith",
  student: "Demo Student",
  ta: "Teaching Assistant",
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Evaluation Assigned",
    message: "You have been assigned to evaluate 'ML Research Project'",
    time: "2h ago",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Application Accepted",
    message: "Your ST application has been accepted by Prof. Hasan",
    time: "1d ago",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Reservation Reminder",
    message: "Lab 301 booking starts in 30 minutes",
    time: "30m ago",
    read: true,
    type: "warning",
  },
  {
    id: "4",
    title: "Supervisor Assigned",
    message: "Dr. Rahman has been assigned as your project supervisor",
    time: "3d ago",
    read: true,
    type: "info",
  },
];

const TYPE_DOT: Record<Notification["type"], string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
};

interface TopBarProps {
  currentPage: PageView;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigate: (page: PageView) => void;
}

export function TopBar({ currentPage, userRole, onRoleChange, onNavigate }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const closeAll = () => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowRoleMenu(false);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      {/* Backdrop for closing dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div className="fixed inset-0 z-10" onClick={closeAll} />
      )}

      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Page Title */}
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
              {PAGE_TITLES[currentPage] ?? "APCMS"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block leading-tight">
              Academic Project &amp; Consultation Management
            </p>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            {/* Role switcher — single dropdown */}
            <div className="relative z-20">
              <button
                onClick={() => { setShowRoleMenu(!showRoleMenu); setShowNotifications(false); setShowUserMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                {ROLE_LABELS[userRole]}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  {(["student", "faculty", "admin", "ta"] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => { onRoleChange(role); setShowRoleMenu(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                        userRole === role
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${userRole === role ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                      {ROLE_LABELS[role]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications bell */}
            <div className="relative z-20">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 ${
                          !n.read ? "bg-blue-50/60 dark:bg-blue-900/10" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_DOT[n.type]}`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <ModeToggle />

            {/* User menu */}
            <div className="relative z-20">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-semibold">{ROLE_INITIALS[userRole]}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
                    {ROLE_DISPLAY_NAMES[userRole]}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize leading-tight">
                    {userRole}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      closeAll();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      closeAll();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800" />
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
