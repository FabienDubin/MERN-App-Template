const app = require("./app");
const connectDB = require("./db");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 5005
const PORT = process.env.PORT || 5005;
const MONGO_URI =
  process.env.MONGODB_URI ||
  `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@127.0.0.1:27017/${process.env.APP_NAME}`;

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
