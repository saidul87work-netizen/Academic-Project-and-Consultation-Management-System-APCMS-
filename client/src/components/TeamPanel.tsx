import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, UserMinus, Shield, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  studentId: { _id: string; name: string; email: string };
  role: 'leader' | 'member';
  joinedAt: string;
  status: 'active' | 'removed';
}

interface Team {
  _id: string;
  teamName: string;
  members: TeamMember[];
}

export function TeamPanel({ projectId, currentUserId }: { projectId: string; currentUserId: string }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

  const fetchTeam = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teams/project/${projectId}`, {
        headers: { 'x-user-id': currentUserId }
      });
      setTeam(res.data);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [projectId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/teams/create`, { projectId, teamName }, {
        headers: { 'x-user-id': currentUserId }
      });
      toast.success('Team created successfully!');
      setCreatingTeam(false);
      fetchTeam();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create team');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    try {
      await axios.post(`${API_BASE}/teams/${team._id}/add-member`, { email: newMemberEmail }, {
        headers: { 'x-user-id': currentUserId }
      });
      toast.success('Member added!');
      setNewMemberEmail('');
      fetchTeam();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (studentId: string) => {
    if (!team) return;
    try {
      await axios.delete(`${API_BASE}/teams/${team._id}/remove-member/${studentId}`, {
        headers: { 'x-user-id': currentUserId }
      });
      toast.success('Member removed');
      fetchTeam();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading team...</div>;

  if (!team) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No Team Formed</h3>
        <p className="text-sm text-gray-500 mb-6">Create a team to start collaborating with other students.</p>
        
        {creatingTeam ? (
          <form onSubmit={handleCreateTeam} className="max-w-sm mx-auto space-y-4">
            <input
              type="text"
              placeholder="Enter Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Create</button>
              <button type="button" onClick={() => setCreatingTeam(false)} className="px-4 py-2 text-gray-500">Cancel</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setCreatingTeam(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Create Team
          </button>
        )}
      </div>
    );
  }

  const isLeader = team.members.find(m => m.studentId._id === currentUserId || m.studentId === (currentUserId as any))?.role === 'leader';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-gray-900">{team.teamName}</h3>
          <p className="text-sm text-gray-500">{team.members.filter(m => m.status === 'active').length} Active Members</p>
        </div>
        {isLeader && (
          <form onSubmit={handleAddMember} className="flex gap-2">
            <input
              type="email"
              placeholder="Student Email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm"
              required
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Add
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.members.filter(m => m.status === 'active').map((member) => (
          <div key={member.studentId._id} className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.role === 'leader' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {member.role === 'leader' ? <Crown className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-gray-900">{member.studentId.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${member.role === 'leader' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {member.role}
                  </span>
                  <span className="text-[10px] text-gray-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {isLeader && member.role !== 'leader' && (
              <button 
                onClick={() => handleRemoveMember(member.studentId._id)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
