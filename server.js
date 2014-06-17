var express = require("express"),
    app = express(),
    fs = require('fs'),
    url = require('url'),
    port = parseInt(process.env.PORT, 10) || 4567;

app.get("/", function (req, res) {
  res.redirect("/index.html");
});

app.use(express.static(__dirname + '/public'));

app.post('/recieve', function(request, respond) {
    var body = '';
    filePath = __dirname + '/public/contacts.json';
    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function (){
        fs.writeFile(filePath, body, function() {
            respond.end();
        });
    });
});

app.listen(port);
