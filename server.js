const express = require("express");
const app = express();

// listen (파라미터1, 파라미터2), 파라미터1 : 서버 띄울 포트번호, 파라미터2 : 띄운 후 실행할 코드
app.listen(8080, function () {
  console.log("listening on 8080");
});

// get ('경로', function(요청, 응답){} )
app.get("/hello", function (req, res) {
  res.send("hello!");
});

app.get("/beauty", function (req, res) {
  res.send("뷰티 용품 페이지 입니다. 😄");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
