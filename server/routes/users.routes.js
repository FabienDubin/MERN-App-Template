const express = require("express");
const router = express.Router();

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// GET /users/all
// Gets all users depending on a page number and a limit sort by name or email or role or createdAt or updatedAt
router.get("/all", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "lastName",
      order = "asc",
    } = req.query;

    // Check the parameters
    const validSortFields = [
      "lastName",
      "firstName",
      "email",
      "role",
      "createdAt",
      "updatedAt",
    ];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }

    // Defining the sort order of the response
    const sortOrder = order === "desc" ? -1 : 1;

    // Finding the users
    const users = await User.find()
      .sort({ [sortBy]: sortOrder }) // Apply the sort
      .skip((page - 1) * limit) // Pagination
      .limit(Number(limit))
      .select("-password"); // Remove the passwords form the documents

    // Getting the number of users to calculate the pagination
    const totalUsers = await User.countDocuments();

    // Final response
    res.status(200).json({
      users,
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /users/update/:id
// Updates a user by id with name, email, image and role
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, userData, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /users/update-image/:userId
// // Change Profile Picture via Cloudinary
const uploader = require("../middleware/cloudinary.middleware.js");
router.put(
  "/update-image/:userId",
  uploader.single("imageUrl"),
  async (req, res, next) => {
    console.log("Route atteinte");
    // the uploader.single() callback will send the file to cloudinary and get you and obj with the url in return
    console.log("file is: ", req.file, "user id", req.params.userId);

    if (!req.file) {
      console.log("there was an error uploading the file");
      next(new Error("No file uploaded!"));
      return;
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { image: req.file.path },
        { new: true }
      );
      console.log("user image updated", updatedUser);
      res.status(200).json({ message: "🥳 user image updated", updatedUser });
    }
  }
);

// DELETE /users/delete/:id
// Deletes a user by id
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /users/search
// Searches for users by name, email or role
router.get("/search", async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "lastName",
      order = "asc",
    } = req.query;

    // Check the parameters
    const validSortFields = [
      "lastName",
      "firstName",
      "email",
      "role",
      "createdAt",
      "updatedAt",
    ];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }

    // Defining the sort order of the response
    const sortOrder = order === "desc" ? -1 : 1;

    // Searching for users
    const searchedUsers = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        // { role: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ [sortBy]: sortOrder }) // Apply the sort
      .skip((page - 1) * limit) // Pagination
      .limit(Number(limit))
      .select("-password"); // Remove the passwords form the documents

    // Getting the number of users to calculate the pagination
    const totalUsers = await User.countDocuments({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { role: { $regex: query, $options: "i" } },
      ],
    });

    // Final response
    res.status(200).json({
      searchedUsers,
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
