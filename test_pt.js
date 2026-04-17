const http = require('https');
const data = JSON.stringify({
  user_script: "let x = 1;\nx++;\nconsole.log(x);",
  options: {}
});
// let's try a GET request to pythontutor
const url = 'https://pythontutor.com/web_exec_js.py?user_script=let+x%3D1%3B%0Ax%2B%2B%3B%0Aconsole.log(x)%3B&cumulative_mode=false&heapPrimitives=nevernest';
http.get(url, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(body.substring(0, 500)));
});
