const express = require("express");
const res = require("express/lib/response");
const app = express();
app.use(express.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

var db;
MongoClient.connect(
  "mongodb+srv://hyuktodo:chltjdgur1@cluster0.g0bua.mongodb.net/hyuktodo?retryWrites=true&w=majority",
  (error, client) => {
    if (error) return console.log(error);

    db = client.db("hyuktodo");

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
  db.collection("post").insertOne(
    { todo: req.body.todo, date: req.body.date },
    (err, 결과) => {
      console.log("저장완료");
    }
  );
});

app.get("/list", (req, res) => {
  // DB에 저장된 post라는 Collection안의 ~ 데이터를 꺼내주세용
  db.collection("post")
    .find()
    .toArray((err, 결과) => {
      console.log(결과);
      res.render("list.ejs", { posts: 결과 });
    });
});
