import express from "express";
import passport from "passport";

const router = express.Router();

// Step 1: Redirect user to Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Handle callback and redirect
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = req.user.generateJWT(); // optional: generate JWT for frontend
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  }
);

export default router;
