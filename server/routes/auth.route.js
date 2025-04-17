const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  verify,
  moderation,
  admin,
  resetPasswordRequest,
  resetPasswordConfirm,
} = require("../controllers/auth.controller");

const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const { hasRole } = require("../middleware/role.middleware.js");
const { loginLimiter } = require("../middleware/rateLimit.middleware.js");

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", signup);

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", loginLimiter, login);

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, verify);

// GET  /auth/moderation  -  Used to check if the user is an admin or moderator
router.get(
  "/moderation",
  isAuthenticated,
  hasRole(["moderator", "admin"]),
  moderation
);
router.get("/admin", isAuthenticated, hasRole(["admin"]), admin);

// POST  /auth/reset-password - Sends a password reset email to the user's email address
router.post("/reset-password", resetPasswordRequest);
router.post("/reset-password/:token", resetPasswordConfirm);

module.exports = router;
