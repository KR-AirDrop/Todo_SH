const express = require("express");
const res = require("express/lib/response");
const app = express();
app.use(express.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use("/public", express.static("public"));

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
  res.render("index.ejs");
});

app.get("/write", (req, res) => {
  res.render("write.ejs");
});

app.get("/edit/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      if (!result) {
        res.render("error.ejs");
      } else {
        res.render("edit.ejs", { post: result });
      }
    }
  );
});

// 어떤 사람이 /add경로로 POST요청을 하면 ... ~를 실행해주세요.
app.post("/add", (req, res) => {
  db.collection("counter").findOne({ name: "게시물 갯수" }, (err, result) => {
    var totalPost = result.totalPost;
    // DB에 저장!
    db.collection("post").insertOne(
      { _id: totalPost + 1, todo: req.body.todo, date: req.body.date },
      (err, result) => {
        // 총 게시물 갯수 +1 해줘야함
        db.collection("counter").updateOne(
          { name: "게시물 갯수" },
          { $inc: { totalPost: 1 } },
          (err, result) => {
            if (err) return console.log(err);
            else res.redirect("/list");
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

app.get("/detail/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      console.log(result);
      if (!result) {
        res.render(__dirname + "/views/error.ejs");
      } else {
        res.render("detail.ejs", { data: result });
      }
    }
  );
});

app.put("/edit", function (req, res) {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { todo: req.body.todo, date: req.body.date } },
    function (err, result) {
      res.redirect("/list");
    }
  );
});
