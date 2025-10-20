import express from 'express';
import { 
  AddUserByAdmin, 
  EditUserByAdmin, 
  DeleteUserByAdmin, 
  getAllUsers 
} from '../controller/userController.js';
import isAuthenticated from '../config/auth.js';
import isAdmin from '../config/adminAuth.js';

const router = express.Router();

// All routes here are protected: admin only
router.use(isAuthenticated, isAdmin);

// Admin routes
router.post('/user/add', AddUserByAdmin);
router.put('/user/edit/:userId', EditUserByAdmin);
router.delete('/user/delete/:userId', DeleteUserByAdmin);
router.get('/user/all', getAllUsers);

export default router;
