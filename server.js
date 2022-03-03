const express = require("express");
const res = require("express/lib/response");
const app = express();
app.use(express.urlencoded({ extended: true }));

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb+srv://hyuktodo:chltjdgur1@cluster0.g0bua.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  (error, client) => {
    app.listen(8080, () => {
      console.log("listening on 8080");
    });
  }
);

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
