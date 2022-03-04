const express = require("express");
const res = require("express/lib/response");
const app = express();
app.use(express.urlencoded({ extended: true }));
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use("/public", express.static("public"));
require("dotenv").config();

var db;
MongoClient.connect(process.env.DB_URL, (error, client) => {
  if (error) return console.log(error);

  db = client.db("hyuktodo");

  app.listen(process.env.PORT, () => {
    console.log("listening on 8080");
  });
});

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

// find는 게시물 수가 많아지면 느려짐...ㅠㅠ > 미리 제목으로 정렬해두고(indexing) binary search 사용
app.get("/search", (req, res) => {
  var 검색조건 = [
    {
      $search: {
        index: "todoSearch",
        text: {
          query: req.query.value,
          path: ["todo", "date"], // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 100 },
    { $project: { _id: 0, todo: 1, date: 1 } },
  ];
  db.collection("post")
    .aggregate(검색조건)
    .toArray(function (err, result) {
      console.log(result);
      res.render("search.ejs", { posts: result });
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

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({ secret: "seonchoi", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (req, res) {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/mypage", logined, function (req, res) {
  console.log(req.user);
  res.render("mypage.ejs", { user: req.user });
});

function logined(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.render("login.ejs");
  }
}

// 아이디 비번 인증하는 세부 코드
passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (inputID, inputPW, done) {
      db.collection("login").findOne({ id: inputID }, function (err, result) {
        if (err) return done(err);

        if (!result)
          return done(null, false, {
            message: "존재하지 않는 아이디입니다.",
          });
        if (inputPW == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "비밀번호가 틀렸습니다." });
        }
      });
    }
  )
);

// 세션 저장
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// 이 세션 데이터 가진 사람을 DB에서 찾기
passport.deserializeUser(function (아이디, done) {
  db.collection("login").findOne({ id: 아이디 }, function (err, result) {
    done(null, result);
  });
});
