import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowLeft, User, Mail, Building, MapPin, Calendar, Edit2, Save, Coins } from "lucide-react";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "User",
    email: "user@example.com",
    company: "My Startup",
    location: "Mumbai, India",
    bio: "Building the next big thing with AI",
    joinedDate: "January 2025"
  });
  const [editedProfile, setEditedProfile] = useState(profile);
  const [userStats, setUserStats] = useState({
    projectsCreated: 0,
    credits: 100,
    subscriptionTier: "free",
    daysActive: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data on mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/auth/user/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setProfile({
            name: data.user.name,
            email: data.user.email,
            company: "My Startup",
            location: "Mumbai, India",
            bio: "Building the next big thing with AI",
            joinedDate: new Date(data.user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          });
          setEditedProfile({
            name: data.user.name,
            email: data.user.email,
            company: "My Startup",
            location: "Mumbai, India",
            bio: "Building the next big thing with AI",
            joinedDate: new Date(data.user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
          });
          setUserStats({
            projectsCreated: data.stats.projects_created || 0,
            credits: data.user.credits || 100,
            subscriptionTier: data.user.subscription_tier || "free",
            daysActive: Math.floor((new Date().getTime() - new Date(data.user.created_at).getTime()) / (1000 * 60 * 60 * 24))
          });
          // Update localStorage
          localStorage.setItem("userName", data.user.name);
          localStorage.setItem("userCredits", data.user.credits);
          localStorage.setItem("userSubscription", data.user.subscription_tier);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem("userName", editedProfile.name);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const stats = [
    { label: "Projects Created", value: userStats.projectsCreated.toString(), icon: "🚀" },
    { label: "Credits Remaining", value: userStats.credits.toString(), icon: "💎" },
    { label: "Team Members", value: "5", icon: "👥" },
    { label: "Days Active", value: userStats.daysActive.toString(), icon: "📅" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <Navbar />
      <Breadcrumbs />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-pulse-500 to-pulse-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl">
                  👤
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
                  <p className="text-white/90 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {profile.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="px-6 py-3 bg-white text-pulse-600 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? editedProfile.name : profile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg",
                        isEditing ? "focus:ring-2 focus:ring-pulse-500 focus:border-transparent" : "bg-gray-50"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={isEditing ? editedProfile.email : profile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg",
                        isEditing ? "focus:ring-2 focus:ring-pulse-500 focus:border-transparent" : "bg-gray-50"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? editedProfile.company : profile.company}
                      onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg",
                        isEditing ? "focus:ring-2 focus:ring-pulse-500 focus:border-transparent" : "bg-gray-50"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={isEditing ? editedProfile.location : profile.location}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg",
                        isEditing ? "focus:ring-2 focus:ring-pulse-500 focus:border-transparent" : "bg-gray-50"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    disabled={!isEditing}
                    value={isEditing ? editedProfile.bio : profile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 border border-gray-300 rounded-lg",
                      isEditing ? "focus:ring-2 focus:ring-pulse-500 focus:border-transparent" : "bg-gray-50"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Account & Preferences */}
            <div className="space-y-8">
              {/* Account Info */}
              <div className="bg-white rounded-2xl shadow-elegant p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">{profile.joinedDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Coins className="w-5 h-5 text-pulse-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Available Credits</p>
                        <p className="text-sm text-gray-600">{userStats.credits} credits remaining</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/pricing")}
                      className="text-sm font-medium text-pulse-600 hover:text-pulse-700"
                    >
                      Buy More
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Account Status</p>
                        <p className="text-sm text-green-600">Active - {userStats.subscriptionTier.charAt(0).toUpperCase() + userStats.subscriptionTier.slice(1)} Plan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-pulse-50 to-orange-50 rounded-2xl p-8 border border-pulse-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full py-3 bg-white border-2 border-pulse-600 text-pulse-600 rounded-lg hover:bg-pulse-50 transition-colors font-medium"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => alert("Password reset email sent!")}
                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to logout?")) {
                        localStorage.clear();
                        navigate("/login");
                      }
                    }}
                    className="w-full py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
