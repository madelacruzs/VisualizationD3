var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + "/public/";

router.use(function(req, res, next) {
  console.log("/" + req.method);
  next();
});

router.get("/", function(req, res) {
  res.sendFile(path + "index.html");
});

app.use("/", express.static("public"));

app.use("/", router);

const PORT = process.env.PORT || 3000;

var server = app.listen(PORT, function() {
  console.log("app running on port.", PORT);
});
