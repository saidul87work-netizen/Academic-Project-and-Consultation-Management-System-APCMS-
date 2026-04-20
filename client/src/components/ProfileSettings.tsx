import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Lock,
  Bell,
  Palette,
  Shield,
  Save,
  Camera,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { ModeToggle } from "./mode-toggle";
import type { UserRole } from "../App";

interface ProfileSettingsProps {
  userRole: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "System Administrator",
  faculty: "Faculty Member",
  student: "Student",
  ta: "Teaching / Research Assistant",
};

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  faculty: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  student: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  ta: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  studentId: string;
  bio: string;
}

interface NotifPrefs {
  evaluationAssigned: boolean;
  applicationStatus: boolean;
  reservationReminder: boolean;
  supervisorUpdates: boolean;
  systemAnnouncements: boolean;
}

export function ProfileSettings({ userRole }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<ProfileForm>({
    firstName: userRole === "faculty" ? "Dr. Ahmed" : userRole === "admin" ? "Admin" : "Rafsan",
    lastName: userRole === "faculty" ? "Rahman" : userRole === "admin" ? "User" : "Rahman",
    email: userRole === "admin" ? "admin@campus.edu" : userRole === "faculty" ? "ahmed.rahman@campus.edu" : "rafsan@student.campus.edu",
    phone: "+880 1700-000000",
    department: "Computer Science & Engineering",
    studentId: userRole === "student" ? "CSE-2021-001" : userRole === "ta" ? "TA-2024-003" : "",
    bio: userRole === "faculty"
      ? "Researcher in Machine Learning and NLP. 12 years of teaching experience."
      : userRole === "student"
      ? "Final year CSE student working on deep learning thesis."
      : "",
  });

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    evaluationAssigned: true,
    applicationStatus: true,
    reservationReminder: true,
    supervisorUpdates: true,
    systemAnnouncements: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [saved, setSaved] = useState(false);

  const handleProfileSave = () => {
    setSaved(true);
    toast.success("Profile updated successfully!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = () => {
    if (!passwords.current) { toast.error("Enter your current password"); return; }
    if (passwords.newPass.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error("Passwords do not match"); return; }
    setPasswords({ current: "", newPass: "", confirm: "" });
    toast.success("Password changed successfully!");
  };

  const toggleNotif = (key: keyof NotifPrefs) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const NotifRow = ({
    label,
    description,
    field,
  }: {
    label: string;
    description: string;
    field: keyof NotifPrefs;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => toggleNotif(field)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
          notifPrefs[field] ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
        role="switch"
        aria-checked={notifPrefs[field]}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${
            notifPrefs[field] ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-bold">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </span>
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Change photo"
              >
                <Camera className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {profile.firstName} {profile.lastName}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE_COLORS[userRole]}`}
                >
                  {ROLE_LABELS[userRole]}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{profile.department}</p>
            </div>
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
                <CheckCircle className="w-4 h-4" />
                Saved
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                First Name
              </Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Department
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {(userRole === "student" || userRole === "ta") && (
            <div className="space-y-1.5">
              <Label htmlFor="studentId" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {userRole === "ta" ? "TA / Employee ID" : "Student ID"}
              </Label>
              <Input
                id="studentId"
                value={profile.studentId}
                onChange={(e) => setProfile((p) => ({ ...p, studentId: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Write a short bio..."
              className="text-sm resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleProfileSave} className="text-xs">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPass" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Current Password
            </Label>
            <Input
              id="currentPass"
              type="password"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              className="h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPass" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                New Password
              </Label>
              <Input
                id="newPass"
                type="password"
                placeholder="Min. 8 characters"
                value={passwords.newPass}
                onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPass" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPass"
                type="password"
                placeholder="Repeat new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button size="sm" variant="outline" onClick={handlePasswordChange} className="text-xs">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotifRow
            label="Evaluation Assigned"
            description="Get notified when you are assigned to evaluate a project"
            field="evaluationAssigned"
          />
          <NotifRow
            label="Application Status"
            description="Updates on your ST / RA / TA application reviews"
            field="applicationStatus"
          />
          <NotifRow
            label="Reservation Reminders"
            description="Reminders 30 minutes before your bookings start"
            field="reservationReminder"
          />
          <NotifRow
            label="Supervisor Updates"
            description="Notify when a supervisor is assigned or changed"
            field="supervisorUpdates"
          />
          <NotifRow
            label="System Announcements"
            description="Campus-wide and APCMS system notifications"
            field="systemAnnouncements"
          />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Switch between light and dark mode
              </p>
            </div>
            <ModeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
