//This controller handles the authentication process for users. It includes functions to sign up new users, log in existing users, and handle password reset requests.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Mailjet = require("node-mailjet");

//Mailjet config for reset password
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

const saltRounds = 10;

// POST /auth/signup - Creates a new user in the database
exports.signup = async (req, res, next) => {
  const { email, password, lastName, firstName, image, recaptchaToken } =
    req.body;

  //Check if the recaptcha token exists
  if (!recaptchaToken)
    return res.status(400).json({ message: "Captcha requiered" });

  try {
    // Check if email or password or name are provided as empty strings
    if (email === "" || password === "" || firstName === "" || lastName == "") {
      return res
        .status(400)
        .json({ message: "Provide email, password and name" });
    }

    // This regular expression check that the email is of a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Provide a valid email address." });
    }

    // This regular expression checks password for special characters and minimum length
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
      });
    }

    // Trim spaces from beginning and end of firstName and lastName and capitalize first letter of firstName and lastName
    let cleanedFirstName = firstName
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
    let cleanedLastName = lastName
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());

    // Check the users collection if a user with the same email already exists
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    //Check if the user should be admin by default according to the array in the .env file
    const admins = process.env.ADMINS;
    let role = admins.includes(email) ? "admin" : "user";

    // If email is unique, proceed to hash the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in the database
    const createdUser = await User.create({
      email,
      password: hashedPassword,
      firstName: cleanedFirstName,
      lastName: cleanedLastName,
      image,
      role,
    });

    // Generating a token to avoid to login right after creating the account
    // Create an object that will be set as the token payload
    const { _id } = createdUser;
    const payload = { _id, cleanedFirstName, cleanedLastName };

    // Create a JSON Web Token and sign it
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    // Create a new object that doesn't expose the password
    const user = { firstName, lastName, _id, email, image, token, role };

    //Send a json response containing the user object
    res.status(201).json({ user: user });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login - Verifies email and password and returns a JWT
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    return res.status(400).json({ message: "Provide email and password." });
  }

  try {
    const foundUser = await User.findOne({ email });
    // Check the users collection if a user with the same email exists
    if (!foundUser) {
      // If the user is not found, send an error response
      return res.status(401).json({ message: "User not found." });
    }

    // Compare the provided password with the one saved in the database
    const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
    if (passwordCorrect) {
      // Deconstruct the user object to omit the password
      const { _id, email, firstName, lastName, role } = foundUser;

      // Create an object that will be set as the token payload
      const payload = { _id, email, firstName, lastName };
      // Adding the role if the user is moderator or admin
      if (role === "moderator" || role === "admin") {
        payload.role = role;
      }

      // Create a JSON Web Token and sign it
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });
      // Send the token as the response
      res.status(200).json({ authToken });
    } else {
      res.status(401).json({ message: "Unable to authenticate the user" });
    }
  } catch (err) {
    next(err); // In this case, we send error handling to the error handling middleware.
  }
};

// GET /auth/verify - Used to verify JWT stored on the client
exports.verify = async (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`
  try {
    const currentUser = await User.findById(req.payload._id);
    // Checking the role of the current user
    if (currentUser.role === "admin" || currentUser.role === "moderator") {
      res.status(200).json({
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        image: currentUser.image,
        role: currentUser.role,
      });
    } else {
      // Send back the token payload object containing the user data without the role
      res.status(200).json({
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        image: currentUser.image,
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET /auth/moderation - Grant access to moderators and admin users
exports.moderation = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Access granted to moderators and admin users",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// GET /auth/admin - Grant access to admin users only
exports.admin = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Access granted to moderators and admin users",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// POST /reset-password - Generate a token to reset user's password using Mailjet API
exports.resetPasswordRequest = async (req, res, next) => {
  const { email } = req.body;
  try {
    //Check if the user exists in the db
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "user doesn't exist" });
    //Generate a 1 hour expirency token
    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    //Generate the reset password link
    const resetLink = `${process.env.ORIGIN}/reset-password/${token}`;
    //Send the reset link via Mailjet
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER,
            Name: process.env.MAILJET_NAME,
          },
          To: [{ Email: email }],
          Subject: "Password Reset",
          HTMLPart: `<h3>Hello ${user.firstName}!</h3>
            <p>Follow the link below to reset your password</p>
            <p><a href="${resetLink}">Reset my password</a></p>
            <p>This link expires in 1 hour</p>`,
        },
      ],
    });

    res.status(200).json({ message: "email sent" });
  } catch (error) {
    next(error);
  }
};

// POST /reset-password/:token - Check the token and update the new password
exports.resetPasswordConfirm = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  // This regular expression checks password for special characters and minimum length
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    //Check if the token has already been used
    const usedTokenIndex = user.passwordResetTokens.findIndex(
      (t) => t.token === token && t.isUsed
    );
    if (usedTokenIndex !== -1)
      return res.status(400).json({ message: "Invalid or expired token" });
    //Hash the new password
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(password, salt);
    //Burn the token
    if (usedTokenIndex === -1) {
      user.passwordResetTokens.push({ token, isUsed: true });
    } else {
      user.passwordResetTokens[usedTokenIndex].isUsed = true;
    }

    await user.save();
    res.status(200).json({ message: "Password reset succefully " });
  } catch (error) {
    console.log("Invalid token", error);
    next(error);
  }
};
