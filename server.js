const express = require("express");
const res = require("express/lib/response");
const app = express();

app.use(express.urlencoded({ extended: true }));

// listen (파라미터1, 파라미터2), 파라미터1 : 서버 띄울 포트번호, 파라미터2 : 띄운 후 실행할 코드
app.listen(8080, () => {
  console.log("listening on 8080");
});

// get ('경로', function(요청, 응답){} )
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", (req, res) => {
  res.sendFile(__dirname + "/write.html");
});

// 어떤 사람이 /add경로로 POST요청을 하면 ... ~를 실행해주세요.
app.post("/add", (req, res) => {
  res.send("전송완료");
  console.log(req.body.todo);
  console.log(req.body.date);
  // DB에 저장!
});
