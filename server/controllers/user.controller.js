//This controller handles all the logic on the user route. It includes functions to get all users, get a single user by ID, and update a user's information. It also handles password reset requests for users.
const User = require("../models/User.model.js");
const uploader = require("../middleware/cloudinary.middleware.js");

// GET /users/all
// Gets all users depending on a page number and a limit sort by name or email or role or createdAt or updatedAt
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "lastName",
      order = "asc",
    } = req.query;

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
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password");

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
};

// PUT /users/update/:id
// Updates a user by id with name, email, image and role
exports.updateUser = async (req, res) => {
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
};

// PUT /users/update-image/:userId
// // Change Profile Picture via Cloudinary (to be updated to Azure Blob for example)
exports.updateUserImage = async (req, res, next) => {
  if (!req.file) {
    console.log("there was an error uploading the file");
    next(new Error("No file uploaded!"));
    return;
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { image: req.file.path },
      { new: true }
    );
    console.log("user image updated", updatedUser);
    res.status(200).json({ message: "🥳 user image updated", updatedUser });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/delete/:id
// Delete a user by its id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /users/search
// Searches for users by name, email or role
exports.searchUsers = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      sortBy = "lastName",
      order = "asc",
    } = req.query;

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
        // { role: { $regex: query, $options: "i" } },
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
};

//POST /import
// import a list of user to the db
exports.importUsers = async (req, res) => {
  try {
    const users = req.body;
    let importedUsers = [];
    let errors = [];

    //Check if the user has an email
    for (const user of users) {
      if (!user.email) {
        errors.push(`Email is missing : ${JSON.stringify(user)}`);
        continue;
      }
      //Check if the email is already used
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        errors.push(`Email already in database : ${user.email}`);
        continue;
      }
      //Add the current user to the array of users to import
      importedUsers.push(user);
    }

    if (importedUsers.length > 0) {
      await User.insertMany(importedUsers);
    }

    if (errors.length > 0) {
      return res.json({
        message:
          "Users partially imported. The following users haven't been added :",
        errors,
      });
    }

    return res.json({ message: "Users imported successfully", errors });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "😩 Import error :", error });
  }
};
