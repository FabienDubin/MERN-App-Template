import axios from "axios";
import { API_URL } from "@/config/envVar.config";

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });

    // Automatically set JWT token on the request headers for every request
    this.api.interceptors.request.use((config) => {
      // Retrieve the JWT token from the local storage
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        config.headers = { Authorization: `Bearer ${storedToken}` };
      }

      return config;
    });
  }

  login = (requestBody) => {
    return this.api.post("/auth/login", requestBody);
    // same as
    // return axios.post("http://localhost:5005/auth/login");
  };

  signup = (requestBody) => {
    return this.api.post("/auth/signup", requestBody);
    // same as
    // return axios.post("http://localhost:5005/auth/singup");
  };

  verify = () => {
    return this.api.get("/auth/verify");
    // same as
    // return axios.post("http://localhost:5005/auth/verify");
  };

  forgotPassword = (requestBody) => {
    return this.api.post("auth/reset-password", requestBody);
  };

  resetPassword = (token, requestBody) => {
    return this.api.post(`auth/reset-password/${token}`, requestBody);
  };
}

// Create one instance (object) of the service
const authService = new AuthService();

export default authService;
