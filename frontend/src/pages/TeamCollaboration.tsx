import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MessageSquare, 
  Video,
  Calendar,
  FileText,
  Upload,
  Download,
  Plus,
  X,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Send,
  Mic,
  Paperclip,
  Search,
  Filter,
  Settings,
  Bell
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

const TeamCollaboration = () => {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'You', email: 'you@example.com', role: 'Owner', avatar: '👤', status: 'online' }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newMember, setNewMember] = useState({ email: '', role: 'member' });
  const [activeTab, setActiveTab] = useState('workspace');
  const [userCredits, setUserCredits] = useState(20);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [workspaceForm, setWorkspaceForm] = useState({
    projectName: '',
    projectDescription: '',
    teamMembers: [] as { email: string; role: string }[]
  });

  useEffect(() => {
    const credits = localStorage.getItem('userCredits');
    if (credits) {
      setUserCredits(parseInt(credits));
    }
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userCredits < 1) {
      alert('Insufficient credits. You need at least 1 credit to create a workspace.');
      return;
    }

    if (!workspaceForm.projectName || !workspaceForm.projectDescription) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsCreatingWorkspace(true);

    try {
      const response = await fetch('http://localhost:8000/api/team-collaboration/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          projectName: workspaceForm.projectName,
          projectDescription: workspaceForm.projectDescription,
          teamMembers: workspaceForm.teamMembers,
          userId: localStorage.getItem('userId')
        })
      });

      const data = await response.json();
      setWorkspace(data.data);
      setTasks(data.data.task_board?.tasks || []);
      
      // Update credits
      const newCredits = userCredits - 1;
      setUserCredits(newCredits);
      localStorage.setItem('userCredits', newCredits.toString());
      
      setIsCreatingWorkspace(false);
      setActiveTab('kanban');
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Error creating workspace. Please try again.');
      setIsCreatingWorkspace(false);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.email) {
      const newTeamMember: TeamMember = {
        id: (teamMembers.length + 1).toString(),
        name: newMember.email.split('@')[0],
        email: newMember.email,
        role: newMember.role === 'admin' ? 'Admin' : 'Member',
        avatar: '👤',
        status: 'offline'
      };
      setTeamMembers([...teamMembers, newTeamMember]);
      setNewMember({ email: '', role: 'member' });
      alert('Invitation sent!');
    }
  };

  const addTeamMemberToForm = () => {
    if (newMember.email) {
      setWorkspaceForm(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, { email: newMember.email, role: newMember.role }]
      }));
      setNewMember({ email: '', role: 'member' });
    }
  };

  const removeTeamMemberFromForm = (index: number) => {
    setWorkspaceForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-700';
      case 'todo': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'review': return 'bg-purple-100 text-purple-700';
      case 'done': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'bg-gray-50' },
    { id: 'todo', title: 'To Do', color: 'bg-blue-50' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-50' },
    { id: 'review', title: 'Review', color: 'bg-purple-50' },
    { id: 'done', title: 'Done', color: 'bg-green-50' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Team <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Collaboration</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Work together seamlessly on your startup projects
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-gray-200">
            {[
              { id: "workspace", label: "Workspace Setup" },
              { id: "kanban", label: "Kanban Board" },
              { id: "team", label: "Team Members" },
              { id: "communication", label: "Communication" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-3 font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
              </button>
            ))}
          </div>

          {/* Workspace Setup Tab */}
          {activeTab === "workspace" && !workspace && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-elegant p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Team Workspace</h3>
                <form onSubmit={handleCreateWorkspace} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={workspaceForm.projectName}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, projectName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={workspaceForm.projectDescription}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, projectDescription: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe your project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Members (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="team@example.com"
                      />
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={addTeamMemberToForm}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {workspaceForm.teamMembers.map((member, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-sm text-indigo-700">
                          {member.email} ({member.role})
                          <button
                            type="button"
                            onClick={() => removeTeamMemberFromForm(index)}
                            className="ml-2 text-indigo-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingWorkspace || userCredits < 1}
                    className={cn(
                      "w-full py-4 rounded-full font-medium text-white transition-all duration-300",
                      "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:shadow-lg",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "flex items-center justify-center space-x-2"
                    )}
                  >
                    {isCreatingWorkspace ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Workspace...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5" />
                        <span>Create Workspace (1 Credit)</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Kanban Board Tab */}
          {activeTab === "kanban" && workspace && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{workspace.name} - Task Board</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {columns.map((column) => (
                  <div key={column.id} className={cn("rounded-lg p-4", column.color)}>
                    <h4 className="font-semibold text-gray-900 mb-4">{column.title}</h4>
                    <div className="space-y-3">
                      {tasks.filter(task => task.status === column.id).map((task) => (
                        <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          <h5 className="font-medium text-gray-900 mb-2">{task.title}</h5>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs px-2 py-1 rounded-full", getPriorityColor(task.priority))}>
                              {task.priority}
                            </span>
                            {task.assignedTo && (
                              <span className="text-xs text-gray-500">{task.assignedTo}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members Tab */}
          {activeTab === "team" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Member Form */}
              <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserPlus className="w-6 h-6 mr-2 text-indigo-600" />
                  Invite Team Member
                </h3>
                <form onSubmit={handleAddMember} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="colleague@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Role Permissions</h4>
                        <p className="text-xs text-gray-600">
                          <strong>Admin:</strong> Full access to all projects and settings<br />
                          <strong>Member:</strong> Can view and edit assigned projects
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Send Invitation</span>
                  </button>
                </form>
              </div>

              {/* Team Members List */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Team Members ({teamMembers.length})</h3>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                          {member.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        member.role === "Owner" ? "bg-yellow-100 text-yellow-700" :
                        member.role === "Admin" ? "bg-indigo-100 text-indigo-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* Communication Tab */}
          {activeTab === "communication" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
                  Team Chat
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm">
                        👤
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">You</span>
                          <span className="text-xs text-gray-500">2 min ago</span>
                        </div>
                        <p className="text-sm text-gray-700">Let's review the MVP progress today</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all">
                    Send
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Video className="w-6 h-6 mr-2 text-indigo-600" />
                  Video Meetings
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Quick Meeting</h4>
                    <p className="text-sm text-gray-600 mb-4">Start an instant video call with your team</p>
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      Start Meeting
                    </button>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Schedule Meeting</h4>
                    <p className="text-sm text-gray-600 mb-4">Plan a meeting for later</p>
                    <button className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamCollaboration;
