const express = require("express");
const index_routes = require("./routes/index");
const api_routes = require("./routes/api");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express(),
  bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.set("views", "./views");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // It's recommended to pass `{ extended: true }`

app.use(express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));

// Middleware for handling CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Use the routes defined in index_routes
app.use("/", index_routes);
app.use("/api/", api_routes);

module.exports = app;

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port::${PORT}`);
  });
}