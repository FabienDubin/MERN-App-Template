const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth Routes", () => {
  describe("POST /auth/signup", () => {
    it("should create a new user and return a token", async () => {
      const response = await request(app).post("/auth/signup").send({
        email: "test@example.com",
        password: "Password123",
        firstName: "Test",
        lastName: "User",
        image: "",
        recaptchaToken: "fake-valid-token",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.user).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should not create user with invalid email", async () => {
      const response = await request(app).post("/auth/signup").send({
        email: "invalid",
        password: "Password123",
        firstName: "Test",
        lastName: "User",
        recaptchaToken: "fake-valid-token",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Provide a valid email address.");
    });

    it("should not create user if email already exists", async () => {
      await User.create({
        email: "test@example.com",
        password: "hashed",
        firstName: "Test",
        lastName: "User",
      });

      const response = await request(app).post("/auth/signup").send({
        email: "test@example.com",
        password: "Password123",
        firstName: "Test",
        lastName: "User",
        recaptchaToken: "fake-valid-token",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("User already exists.");
    });
  });

  describe("POST /auth/login", () => {
    it("should return token for valid credentials", async () => {
      const user = await User.create({
        email: "login@example.com",
        password: await require("bcryptjs").hash("Password123", 10),
        firstName: "Login",
        lastName: "User",
      });

      const response = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "Password123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("authToken");
    });

    it("should return error for invalid credentials", async () => {
      await User.create({
        email: "wrongpass@example.com",
        password: await require("bcryptjs").hash("Password123", 10),
        firstName: "Wrong",
        lastName: "User",
      });

      const response = await request(app).post("/auth/login").send({
        email: "wrongpass@example.com",
        password: "WrongPassword",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Unable to authenticate the user");
    });

    it("should return error for unknown user", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexisting@example.com",
        password: "Password123",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("User not found.");
    });
  });

  describe("GET /auth/verify", () => {
    it("should return user details if token is valid", async () => {
      const user = await User.create({
        email: "verify@example.com",
        password: "irrelevant",
        firstName: "Verify",
        lastName: "User",
        role: "user",
      });

      const token = jwt.sign(
        { _id: user._id },
        process.env.TOKEN_SECRET || "testsecret"
      );

      const response = await request(app)
        .get("/auth/verify")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe("verify@example.com");
    });
  });

  describe("POST /reset-password", () => {
    it("should return 404 if email does not exist", async () => {
      const response = await request(app).post("/auth/reset-password").send({
        email: "nonexistent@example.com",
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("user doesn't exist");
    });
  });
});
