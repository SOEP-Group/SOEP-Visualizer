const express = require("express");
const index_routes = require("./routes/index");
const api_routes = require("./routes/api");
const path = require("path");
const cors = require("cors");
const pool = require("./db");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

const app = express(),
  bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.set("views", "./views");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // It's recommended to pass `{ extended: true }`

app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", process.env.NODE_ORIGIN);
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    },
  })
);
app.use("/views", express.static(path.join(__dirname, "views")));

// Middleware for handling CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Origin", process.env.NODE_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Embedder-Policy", "require-corp");

  next();
});

// Use the routes defined in index_routes
app.use("/", index_routes);
app.use("/api/", api_routes);

module.exports = app;

const PORT = process.env.PORT || 3000;

function Shutdown() {
  console.log("Shutting down server...");
  pool.end(() => {
    console.log("Database connection pool has ended.");
    process.exit(0);
  });
}

process.on("SIGTERM", Shutdown); // e.g., kill command
process.on("SIGINT", Shutdown); // e.g., Ctrl+C in terminal

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port::${PORT}`);
  });
}
