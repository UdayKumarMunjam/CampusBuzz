import express from 'express';
import { Login, Logout, CheckAuth, UpdateProfile, GetProfile, GetUserById, AddClubMember, GetClubMembers, followUser, getFollowers, getFollowing, searchUsers } from '../controller/userController.js';
import isAuthenticated from '../config/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// User auth routes
router.post('/login', Login);
router.post('/logout', isAuthenticated, Logout);
router.get('/check', isAuthenticated, CheckAuth);

// User profile routes
router.get('/profile', isAuthenticated, GetProfile);
router.put('/profile', isAuthenticated, upload.single('avatar'), UpdateProfile);
router.get('/profile/:userId', isAuthenticated, GetUserById);

// Follow routes
router.post('/follow/:userId', isAuthenticated, followUser);
router.get('/:userId/followers', isAuthenticated, getFollowers);
router.get('/:userId/following', isAuthenticated, getFollowing);

// Club member routes
router.post('/club/member/add', isAuthenticated, AddClubMember);
router.get('/club/:clubId/members', GetClubMembers); // Public route for viewing members

// User search route
router.get('/search', isAuthenticated, searchUsers);

export default router;
