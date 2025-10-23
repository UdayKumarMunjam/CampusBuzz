import express from 'express';
import { Login, Logout, CheckAuth, UpdateProfile, GetProfile, GetUserById, AddClubMember, GetClubMembers, followUser, getFollowers, getFollowing, searchUsers, sendConnectionRequest, acceptConnectionRequest, declineConnectionRequest, cancelConnectionRequest, getConnectionStatus, getConnectionStatuses, getConnections, getConnectionRequests, disconnectUser, ForgotPassword, ResetPassword } from '../controller/userController.js';
import isAuthenticated from '../config/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// User auth routes
router.post('/login', Login);
router.post('/logout', isAuthenticated, Logout);
router.get('/check', isAuthenticated, CheckAuth);

// Password reset routes
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);

// User profile routes
router.get('/profile', isAuthenticated, GetProfile);
router.put('/profile', isAuthenticated, upload.single('avatar'), UpdateProfile);
router.get('/profile/:userId', isAuthenticated, GetUserById);

// Follow routes
router.post('/follow/:userId', isAuthenticated, followUser);
router.get('/:userId/followers', isAuthenticated, getFollowers);
router.get('/:userId/following', isAuthenticated, getFollowing);

// Connection routes
router.post('/connect/:userId', isAuthenticated, sendConnectionRequest);
router.post('/connect/:userId/accept', isAuthenticated, acceptConnectionRequest);
router.post('/connect/:userId/decline', isAuthenticated, declineConnectionRequest);
router.post('/connect/:userId/cancel', isAuthenticated, cancelConnectionRequest);
router.post('/connect/:userId/disconnect', isAuthenticated, disconnectUser);
router.get('/connect/:userId/status', isAuthenticated, getConnectionStatus);
router.post('/connect/statuses', isAuthenticated, getConnectionStatuses);
router.get('/:userId/connections', isAuthenticated, getConnections);
router.get('/connections/requests', isAuthenticated, getConnectionRequests);

// Club member routes
router.post('/club/member/add', isAuthenticated, AddClubMember);
router.get('/club/:clubId/members', GetClubMembers); // Public route for viewing members

// User search route
router.get('/search', isAuthenticated, searchUsers);

export default router;
