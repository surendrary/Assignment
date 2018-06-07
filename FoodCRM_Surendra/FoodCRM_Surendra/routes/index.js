var fs = require('fs');


/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
    Read the file of contact information
 */
exports.read = function(req,res)
{

    fs.readFile('data.json', function (err, buf) {
        var json_responses = {"status_code":"200", food : buf.toString()};
        res.send(json_responses);
        res.end();
    });
};

/*
    Persist the changes performed on the screen for the status of contacts
 */
exports.update = function(req, res){
    
    fs.writeFile('data.json', JSON.stringify(req.body), function (err) {
        if (err) return console.log(err);

    });
};