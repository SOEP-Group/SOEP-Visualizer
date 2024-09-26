const express = require('express');
const index_routes = require('./routes/index');
const path = require('path');

const app = express(),
	    bodyParser = require('body-parser'),
	    port = 3000;

app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

app.use("/", index_routes);

const PORT = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port::${port}`);
});
