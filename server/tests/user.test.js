const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/User.model");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User Controller", () => {
  describe("GET /users/all", () => {
    it("should return paginated list of users", async () => {
      await User.insertMany([
        {
          email: "one@test.com",
          firstName: "One",
          lastName: "Test",
          password: "Password123",
        },
        {
          email: "two@test.com",
          firstName: "Two",
          lastName: "Test",
          password: "Password123",
        },
        {
          email: "three@test.com",
          firstName: "Three",
          lastName: "Test",
          password: "Password123",
        },
      ]);

      const res = await request(app).get(
        "/users/all?page=1&limit=2&sortBy=email"
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.users.length).toBe(2);
      expect(res.body.totalUsers).toBe(3);
    });

    it("should return 400 for invalid sort field", async () => {
      const res = await request(app).get("/users/all?sortBy=invalidField");
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Invalid sort field");
    });
  });

  describe("PUT /users/update/:id", () => {
    it("should update a user's information", async () => {
      const user = await User.create({
        email: "update@test.com",
        firstName: "Old",
        lastName: "User",
        password: "Password123",
      });
      const res = await request(app)
        .put(`/users/update/${user._id}`)
        .send({ firstName: "New" });

      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBe("New");
    });
  });

  describe("DELETE /users/delete/:id", () => {
    it("should delete a user by id", async () => {
      const user = await User.create({
        email: "delete@test.com",
        firstName: "Delete",
        lastName: "User",
        password: "Password123",
      });
      const res = await request(app).delete(`/users/delete/${user._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
    });
  });

  describe("POST /users/import", () => {
    it("should import new users and skip duplicates", async () => {
      await User.create({
        email: "existing@test.com",
        firstName: "Dup",
        lastName: "User",
        password: "Secret123",
      });

      const res = await request(app)
        .post("/users/import")
        .send([
          {
            email: "existing@test.com",
            firstName: "Dup",
            lastName: "Dup",
            password: "123456",
          },
          {
            email: "new@test.com",
            firstName: "New",
            lastName: "One",
            password: "123456",
          },
          { firstName: "NoEmail", lastName: "Oops", password: "123456" },
        ]);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("Users partially imported");
      expect(res.body.errors.length).toBe(2); // 1 duplicate, 1 no email
    });
  });
});
