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

  db.collection("counter").findOne({ name: "게시물 갯수" }, (err, result) => {
    var totalPost = result.totalPost;
    // DB에 저장!
    db.collection("post").insertOne(
      { _id: totalPost + 1, todo: req.body.todo, date: req.body.date },
      (err, result) => {
        console.log("저장완료");
        // 총 게시물 갯수 +1 해줘야함
        db.collection("counter").updateOne(
          { name: "게시물 갯수" },
          { $inc: { totalPost: 1 } },
          (err, result) => {
            if (err) return console.log(err);
          }
        );
      }
    );
  });
});

app.get("/list", (req, res) => {
  // DB에 저장된 post라는 Collection안의 ~ 데이터를 꺼내주세용
  db.collection("post")
    .find()
    .toArray((err, result) => {
      res.render("list.ejs", { posts: result });
    });
});

app.delete("/delete", (req, res) => {
  req.body._id = parseInt(req.body._id); // 정수로 변환
  db.collection("post").deleteOne(req.body, (err, result) => {
    console.log("삭제완료");
    res.status(200).send("삭제성공");
  });
});
