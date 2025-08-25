"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Register new user
router.post('/register', validation_1.validateAuth, authController_1.AuthController.register);
// Login user
router.post('/login', validation_1.validateAuth, authController_1.AuthController.login);
// Logout user
router.post('/logout', authController_1.AuthController.logout);
// Refresh token
router.post('/refresh', authController_1.AuthController.refreshToken);
// Get current user profile
router.get('/profile', authController_1.AuthController.getProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map