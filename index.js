const express = require('express');
const index_routes = require('./routes/index');

const app = express(),
	    bodyParser = require('body-parser'),
	    port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

app.use("/", index_routes);

app.listen(port, () => {
  console.log(`Server listening on port::${port}`);
});
