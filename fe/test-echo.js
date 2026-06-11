const http = require('http');
http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log(req.headers);
    console.log(body.substring(0, 500));
    res.end('ok');
  });
}).listen(3001);
console.log("Listening on 3001");
