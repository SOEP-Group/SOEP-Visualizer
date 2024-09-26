const express = require('express');
const index_routes = require('./routes/index');
<<<<<<< HEAD
=======
const path = require('path');
>>>>>>> interface

const app = express(),
	    bodyParser = require('body-parser'),
	    port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

<<<<<<< HEAD
app.use(express.static('public'));
=======
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));
>>>>>>> interface

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
