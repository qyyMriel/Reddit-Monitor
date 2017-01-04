var express = require('express');
var path = require('path');
const snoowrap = require('snoowrap');
var getThreads = require('./backend/getThreads.js');
var getHotThreads = require('./backend/getHotThreads.js');


var app = module.exports = express();

app.set('port', process.env.PORT || 8000);
app.set('backend', path.join(__dirname, 'backend'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', require('ejs').__express);
app.engine('html', require('ejs').renderFile); 
app.set( 'x-powered-by', true);

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
 //  res.send('Hello World');
   getThreads.getTop30();
   getHotThreads.getTop30();
  // res.send(getThreads.ThreadsJSON);
   res.render('test', {name:"yiqin"});
})


//var jsonStr = '{"name":"Thread 1: Vote Today: If you get devoted, you will win","sex":"famle","address":"beijing"}'
app.get('/updateThread', function (req, res) {
	console.log(typeof(getThreads.ThreadsJSON));
	getThreads.getTop30();
	 res.send(getThreads.ThreadsJSON);
})

app.get('/updateHotThread', function (req, res) {
	console.log(typeof(getHotThreads.HotThreadsJSON));
	getHotThreads.getTop30();
	 res.send(getHotThreads.HotThreadsJSON);
})

app.listen(app.get('port'),
function(){
    console.log('Express server listening on port ' + app.get('port'));
});

 // console.log("Example app listening at http://:%s", port)
