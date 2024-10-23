const express = require("express");
const index_routes = require("./routes/index");
const util_routes = require("./routes/utils");
const path = require("path");

const app = express(),
  bodyParser = require("body-parser"),
  port = 3000;

// Set EJS as the templating engine
app.set("view engine", "ejs");

// Set the directory where your EJS files are located
app.set("views", "./views");

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
app.use("/utils/", util_routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port::${port}`);
});
