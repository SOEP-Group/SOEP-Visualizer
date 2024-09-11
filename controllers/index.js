const path = require('path');

exports.Home = async function(req, res){
  return res.render("index"); 
}

exports.Dynamic = async function(req, res){
  // process.env.INIT_CWD is the root folder
  return res.sendFile(path.join(process.env.INIT_CWD, 'views/test.html')); 
}
