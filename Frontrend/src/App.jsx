import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from "./stores/authStore.js";
import { useThemeStore } from "./stores/themeStore.js";
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import LandingPage from './components/LandingPage';
import Feed from './components/Feed';
import Events from './components/Events';
import Clubs from './components/Clubs';
import ClubDetails from './components/ClubDetails';
import ClubMembers from './components/ClubMembers';
import ClubAbout from './components/ClubAbout';
import ClubActivities from './components/ClubActivities';
import Achievements from './components/Achievements';
import AchievementCategory from './components/AchievementCategory';
import AddAchievement from './components/AddAchievement';
import ENotice from './components/ENotice';
import LostFound from './components/LostFound';
import Messages from './components/Messages';
import Conversation from './components/Conversation';
import Connections from './components/Connections';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import ProfileModal from './components/profile/ProfileModal';
import UserProfile from './components/profile/UserProfile';
import FollowersList from './components/profile/FollowersList';
import FollowingList from './components/profile/FollowingList';
import ClubManagement from './components/clubs/ClubManagement';
import SharedPost from './components/SharedPost';
import Header from './components/Header';
import { Menu, X, Loader } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
function App() {
  const { user, isCheckingAuth, checkAuth, logout } = useAuthStore();
  const { setTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);

  useEffect(() => {
    checkAuth();
    // Set dark mode as default
    const savedTheme = localStorage.getItem('theme-storage');
    const isDark = savedTheme ? JSON.parse(savedTheme).state.isDarkMode : true;
    setTheme(isDark);
    // Ensure dark class is added to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleUpdateProfile = (profileData) => {
    useAuthStore.setState({ user: { ...user, ...profileData } });
  };

  const getHeaderColors = (pathname) => {
    const colorSchemes = {
      '/': { textColor: 'text-white', bgColor: 'bg-transparent', buttonColor: 'bg-blue-600 hover:bg-blue-700' },
      '/feed': { textColor: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-white dark:bg-gray-800 shadow-md', buttonColor: 'bg-blue-600 hover:bg-blue-700' },
      '/events': { textColor: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-gray-800 shadow-md', buttonColor: 'bg-green-600 hover:bg-green-700' },
      '/clubs': { textColor: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-gray-800 shadow-md', buttonColor: 'bg-purple-600 hover:bg-purple-700' },
      '/achievements': { textColor: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-gray-800 shadow-md', buttonColor: 'bg-orange-600 hover:bg-orange-700' },
      '/e-notice': { textColor: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-gray-800 shadow-md', buttonColor: 'bg-red-600 hover:bg-red-700' },
      '/lost-found': { textColor: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-gray-800 shadow-md', buttonColor: 'bg-yellow-600 hover:bg-yellow-700' },
      '/connections': { textColor: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-gray-800 shadow-md', buttonColor: 'bg-indigo-600 hover:bg-indigo-700' },
    };
    return colorSchemes[pathname] || { textColor: 'text-gray-800 dark:text-gray-200', bgColor: 'bg-white dark:bg-gray-800 shadow-md', buttonColor: 'bg-blue-600 hover:bg-blue-700' };
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/post/:postId" element={<SharedPost />} />
        </Routes>
        <Toaster position="top-right" reverseOrder={false} />
      </Router>
    );
  }

  const HeaderWrapper = () => {
    const location = useLocation();
    const colors = getHeaderColors(location.pathname);
    return <Header onGetStarted={() => setShowLogin(true)} {...colors} />;
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-16 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <Sidebar
            user={user}
            onLogout={logout}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onProfileClick={() => setShowProfileModal(true)}
          />

          <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
            <Routes>
             <Route
               path="/"
               element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/feed" />}
             />
             <Route path="/feed" element={<Feed user={user} />} />
             <Route path="/messages" element={<Messages user={user} />} />
             <Route path="/messages/:conversationId" element={<Conversation user={user} />} />
             <Route path="/connections" element={<Connections />} />
             <Route path="/events" element={<Events user={user} />} />
             <Route path="/clubs" element={<Clubs />} />
             <Route path="/clubs/:clubId" element={<ClubDetails user={user} />} />
             <Route path="/clubs/:clubId/members" element={<ClubMembers user={user} />} />
             <Route path="/clubs/:clubId/about" element={<ClubAbout user={user} />} />
             <Route path="/clubs/:clubId/activities" element={<ClubActivities user={user} />} />
             <Route path="/clubs/:clubId/manage" element={<ClubManagement user={user} />} />
             <Route path="/achievements" element={<Achievements user={user} />} />
             <Route path="/achievements/add" element={<AddAchievement user={user} />} />
             <Route
               path="/achievements/:category"
               element={<AchievementCategory user={user} />}
             />
             <Route path="/e-notice" element={<ENotice user={user} />} />
             <Route path="/lost-found" element={<LostFound user={user} />} />
             <Route path="/lostfound/resolve/:id" element={<LostFound user={user} />} />
             <Route path="/profile/:userId" element={<UserProfile />} />
             <Route path="/profile/:userId/followers" element={<FollowersList />} />
             <Route path="/profile/:userId/following" element={<FollowingList />} />
             <Route path="/post/:postId" element={<SharedPost />} />
             <Route path="/settings" element={<Settings />} />
             <Route
               path="/admin"
               element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
             />
             {/* Catch all route for unmatched paths - redirect to feed */}
             <Route path="*" element={<Navigate to="/feed" />} />
              <Route path="/events" element={<Events user={user} />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/:clubId" element={<ClubDetails user={user} />} />
              <Route path="/clubs/:clubId/members" element={<ClubMembers user={user} />} />
              <Route path="/clubs/:clubId/about" element={<ClubAbout user={user} />} />
              <Route path="/clubs/:clubId/activities" element={<ClubActivities user={user} />} />
              <Route path="/clubs/:clubId/manage" element={<ClubManagement user={user} />} />
              <Route path="/achievements" element={<Achievements user={user} />} />
              <Route path="/achievements/add" element={<AddAchievement user={user} />} />
              <Route
                path="/achievements/:category"
                element={<AchievementCategory user={user} />}
              />
              <Route path="/e-notice" element={<ENotice user={user} />} />
              <Route path="/lost-found" element={<LostFound user={user} />} />
              <Route path="/lostfound/resolve/:id" element={<LostFound user={user} />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/profile/:userId/followers" element={<FollowersList />} />
              <Route path="/profile/:userId/following" element={<FollowingList />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/admin"
                element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
              />
            </Routes>
          </main>

          <ProfileModal
            user={user}
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>
      </Router>
    </>
  );
}

export default App;
