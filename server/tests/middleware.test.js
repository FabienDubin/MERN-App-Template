// /tests/auth.middleware.test.js
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const { hasRole } = require("../middleware/role.middleware");
const { loginLimiter } = require("../middleware/rateLimit.middleware");

const TOKEN_SECRET = process.env.TOKEN_SECRET || "testsecret";

const createAppWithMiddlewares = (userPayload, requiredRoles = []) => {
  const app = express();

  // Inject a fake user for hasRole tests only if needed
  if (userPayload) {
    app.use((req, res, next) => {
      req.user = userPayload;
      next();
    });
  }

  // Define the route
  app.get(
    "/protected",
    requiredRoles.length > 0 ? hasRole(requiredRoles) : isAuthenticated,
    (req, res) => {
      const response = { message: "Access granted" };
      if (req.payload) response.payload = req.payload;
      res.status(200).json(response);
    }
  );

  // Error handler for express-jwt
  app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next(err);
  });

  return app;
};

//Test of jwt middleware

describe("isAuthenticated middleware", () => {
  it("should allow access with valid JWT token", async () => {
    const payload = { _id: "123", email: "test@example.com" };
    const token = jwt.sign(payload, TOKEN_SECRET, { algorithm: "HS256" });

    const app = createAppWithMiddlewares();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Access granted");
    expect(res.body.payload).toMatchObject(payload);
  });

  it("should deny access with missing Authorization header", async () => {
    const app = createAppWithMiddlewares();
    const res = await request(app).get("/protected");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });

  it("should deny access with malformed token", async () => {
    const app = createAppWithMiddlewares();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer malformedtoken");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });
});

// Tesf of role middleware
describe("hasRole middleware", () => {
  it("should allow access when user has the required role", async () => {
    const app = createAppWithMiddlewares({ role: "admin" }, ["admin"]);
    const res = await request(app).get("/protected");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Access granted");
  });

  it("should deny access when user has no role", async () => {
    const app = createAppWithMiddlewares({}, ["admin"]);
    const res = await request(app).get("/protected");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("🧙You shall not pass!");
  });

  it("should deny access when user's role is not included", async () => {
    const app = createAppWithMiddlewares({ role: "user" }, ["admin"]);
    const res = await request(app).get("/protected");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("🧙You shall not pass!");
  });
});

//Test of rate limit middleware
describe("loginLimiter middleware", () => {
  it("should allow up to 5 requests", async () => {
    const app = express();
    app.use("/login", loginLimiter);
    app.get("/login", (req, res) => {
      res.status(200).json({ message: "Login route" });
    });

    for (let i = 0; i < 5; i++) {
      const res = await request(app).get("/login");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Login route");
    }
  });

  it("should block the 6th request with error message", async () => {
    const app = express();
    app.use("/login", loginLimiter);
    app.get("/login", (req, res) => {
      res.status(200).json({ message: "Login route" });
    });

    for (let i = 0; i < 5; i++) {
      await request(app).get("/login");
    }

    const res = await request(app).get("/login");
    expect(res.statusCode).toBe(429);
    expect(res.body.message).toBe(
      "Too many login attempts from this IP. Please try again later."
    );
  });
});
