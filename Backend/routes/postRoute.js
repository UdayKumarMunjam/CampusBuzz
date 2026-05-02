import express from "express";
import { createPost, getPosts, likePost, deletePost, getPostsByUser, addComment, getComments, deleteComment, getPostById } from "../controller/postController.js";
import isAuthenticated from "../config/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Accept media (multiple files)
router.route("/")
  .get(getPosts)
  .post(
    isAuthenticated,
    upload.array('media', 10), // Allow up to 10 files
    createPost
  );

router.route("/user/:userId").get(isAuthenticated, getPostsByUser);

router.route("/like/:postId").put(isAuthenticated, likePost);

router.route("/comment/:postId")
  .post(isAuthenticated, addComment)
  .get(isAuthenticated, getComments);

router.route("/comment/:postId/:commentId")
  .delete(isAuthenticated, deleteComment);

router.route("/:postId")
  .get(getPostById) // Public route for shared links
  .delete(isAuthenticated, deletePost);

export default router;
