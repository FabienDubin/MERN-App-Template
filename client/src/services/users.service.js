import axios from "axios";
import { API_URL } from "@/config/api.config";

class UserService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL || "http://localhost:5005",
    });

    // Automatically set JWT token in the headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers = { Authorization: `Bearer ${storedToken}` };
      }

      return config;
    });
  }
  //GET /users/all
  //Gets all users depending on a page number and a limit sort by name or email or role or createdAt or updatedAt
  getAllUsers(page, limit, sortBy, order) {
    return this.api.get(
      `/users/all?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`
    );
  }

  // PUT /users/update/:id
  // Updates a user by id with name, email, image and role
  updateUser(id, userData) {
    return this.api.put(`/users/update/${id}`, userData);
  }

  // DELETE /users/delete/:id
  // Deletes a user by id
  deleteUser(id) {
    return this.api.delete(`/users/delete/${id}`);
  }

  // GET /users/search
  // Searches for users by name, email or role
  searchUsers(query, page, limit, sortBy, order) {
    return this.api.get(
      `/users/search?query=${query}&page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`
    );
  }

  //POST /users/import
  //Import a list of users
  bulkImport(users) {
    return this.api.post("users/import", users);
  }

  // PUT /update-image/:userId
  // Updates the user's profile picture via Cloudinary
  updateUserImage(userId, imageFile) {
    const imageData = new FormData();
    imageData.append("imageUrl", imageFile);
    imageData.append("upload_preset", "MernTemp");

    return this.api.put(`/users/update-image/${userId}`, imageData);
  }
}

//Create one instance of the service
const userService = new UserService();

export default userService;
