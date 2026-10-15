const mongoose = require("mongoose");
require("dotenv").config();

const isProduction =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RENDER_SERVICE_ID);

// Resolve appropriate connection URI
let mongoUrl = process.env.MONGO_URL;

if (isProduction) {
  // On Render/Production, prioritize MONGO_URL_PROD if available, or MONGO_URL
  if (process.env.MONGO_URL_PROD) {
    mongoUrl = process.env.MONGO_URL_PROD;
  }
  if (!mongoUrl || mongoUrl.includes("localhost") || mongoUrl.includes("127.0.0.1")) {
    console.error("WARNING: In production but database URI points to localhost or is unset. Configure MONGO_URL in your hosting dashboard!");
  }
} else {
  mongoUrl = process.env.MONGO_URL || process.env.MONGO_URL_PROD;
}

if (mongoUrl) {
  mongoose
    .connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      const sanitizedUrl = mongoUrl.replace(/:([^:@]+)@/, ":****@");
      console.log(`Database Connected successfully to ${sanitizedUrl}`);
    })
    .catch((err) => console.error("MongoDb error:", err.message || err));
} else {
  console.error("MongoDb error: No connection string defined in MONGO_URL or MONGO_URL_PROD.");
}
