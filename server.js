var sql_pass = "database";

var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');

//global variables
var username;
var password;
var email;
var movies;
var title;
var table;
var showtime;
var theatre;
var search;
var theatre_id;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/*
* Routing
*/
//initializes the login screen
app.get('/', function (req, res) {
  console.log("At login screen\n");
  res.render('login', {
    error: false,
    success: false
  });
});
app.listen(8000);


//creates the home page
app.post('/user-home', function(req, res){
  console.log("User Submitted!\n");
  username = req.body.username;
  password = req.body.password;
  console.log(req.body.manager);
    con.query(login_sql, ["Customer", username, password], function(error, result){
      if(error){ throw error; }
      if (result.length != 0){
        console.log("Logging in as user\n");
        con.query(nowPlaying_sql, function(error, result){
          movies = result;
          res.redirect('/home');
        });
      }
      else {
        res.render('login', {
          error: true,
          success: false
        });
      }
    });
});

//creates home page
app.get("/home", function(req, res){
  res.render('home', {
    username: username,
    movies: movies
  });
})

//goes from external pages back to home
app.post('/back-home', function(req, res){
  console.log("Going back to home\n");
  res.redirect('/home');
})

//creates the manager page
app.post('/manager-home', function(req, res){
  console.log("User Submitted!\n");
  username = req.body.username;
  password = req.body.password;
  console.log(req.body.manager);
    con.query(login_sql, ["Manager", username, password], function(error, result){
      if(error){ throw error; }
      if (result.length != 0){
        console.log("Logging in as manager\n");
        res.render('test', {
          username: username
        });
      }
      else {
        res.render('login', {
          error: true,
          success: false
        });
    }
    });
});

//creates registration page
app.post('/register', function(req, res){
  console.log("Registering!\n");
  res.render('register', {
    error: false,
    user_error: false
  });
});

//creates a new user
app.post('/create-user', function(req, res){
  console.log("Registering User!\n");
  username = req.body.username;
  email = req.body.email;
  pass = req.body.password;
  pass2 = req.body.password2;
  if (pass != pass2){
    res.render('register', {
      error: true,
      user_error: false
    });
  }
  else {
    con.query(check_register, ["Customer", username], function(error, result){
      if (result.length != 0){
        console.log("User exists\n");
        res.render('register',{
          user_error: true,
          error: false
        });
      }
      else {
        con.query(register_sql, ["Customer", username, email, pass], function(error, result){
          if (error) { throw error; }
          console.log("Adding Customer");
          res.render('login', {
            error: false,
            success: true
          });
        });
      }
    });
  }
});

//creates a new manager
app.post('/create-manager', function(req, res){
  console.log("Registering Manager!\n");
  username = req.body.username;
  email = req.body.email;
  pass = req.body.password;
  pass2 = req.body.password2;
  manager_pass = req.body.manager_password;
  if (pass != pass2){
    res.render('register', {
      error: true,
      user_error: false
    });
  }
  else {
    con.query(check_register, ["Manager", username], function(error, result){
      if (result.length != 0){
        console.log("User exists\n");
        res.render('register',{
          user_error: true,
          error: false
        });
      }
      else {
        con.query(check_password, [manager_pass], function(error, result){
          if (error) { throw error; }
          if (result.length == 0){
            console.log("Password Doesn't Exist\n");
            res.render('register', {
              user_error: true,
              error: false
            });
          }
          else {
            con.query(register_sql, ["Manager", username, email, pass], function(error, result){
              if (error) { throw error; }
              console.log("Adding manager");
              res.render('login', {
                error: false,
                success: true
              });
            });
          }
        });
      }
    });
  }
});

//creates the me page
app.get('/me', function(req, res){
  console.log("Viewing me page!");
  res.render('me', {
    username: username
  });
})

//creates the order history
app.get('/order-history', function(req, res){
  console.log("Viewing Order History");
  con.query(orderHistory_sql, function(error, result ){
    if (error) { throw error; }
    res.render('orders', {
    });
  })
})

//looks at the preferred theatre
app.get('/preferred-theatre', function(req, res){
  console.log("Viewing Preferred Theatre");
  con.query(viewtheatres_sql, [], function(error, result){
    if (error) { throw error; }
    res.render('preferred-theatre',{
      //
    });
  });
})

//go back
app.post('/back-me-theatre', function(req, res){
  res.redirect('/me');
})

//deletes selected theatre
app.post('/delete-theatre', function(req, res){
  deleted = req.body.theatrechoice;
  con.query(deletetheatre_sql, [deleted, username], function(error, result){
    if (error) { throw error; }
    res.redirect('/preferred-theatre');
  });
})

//looks at the payment Information
app.get('/payment-info', function(req, res){
  console.log("Viewing Payment Information");
  con.query(viewpayment_sql, [], function(error, result){
    if (error) { throw error; }
    res.render('payment-info', {
      //
    });
  })
})

//update preferred payment and go back
app.post('/back-me-payment', function(req, res){
  preffered_payment = req.body.paymentchoice;
  res.redirect('/me');
})

//deletes selected payment
app.post('/delete-theatre', function(req, res){
  deleted = req.body.paymentchoice;
  con.query(deletepayment_sql, [deleted, username], function(error, result){
    if (error) { throw error; }
    res.redirect('/preferred-theatre');
  });
})

//determines which movie page to create
app.get('/movie/:id', function(req, res){
  title = req.params.id;
  console.log("Accessing " + title);
  res.redirect('/movie');
})

//goes back to movie
app.post('/back-movies', function(req, res){
  console.log("Going back to all movies");
  res.redirect('/movie');
})

//creates movie page
app.get('/movie', function(req, res){
  con.query(movieInfo_sql, [title], function(error, result){
    if (error) { throw error; }
    var releasedate = (result[0].releasedate).toString();
    releasedate = releasedate.substring(0, 15);
    res.render('movie', {
      data: result,
      releasedate: releasedate
    });
  });
})

//creates overview page
app.get('/overview', function(req, res){
  console.log("Viewing Overview for " + title);
  con.query(overview_sql, [title], function(error, result){
    if (error) { throw error; }
    var cast = (result[0].cast).toString();
    var cast = cast.split(',');
    res.render('overview', {
      data: result,
      cast: cast
    });
  });
})

//creates the review page
app.get('/review', function(req, res){
  console.log("Viewing reviews for " + title);
  con.query(showrating_sql, [title, title], function(error, result){
    if (error) { throw error; }
    table = result;
    res.render('review', {
        rating: result[1],
        title: title,
        reviews: result[0],
        error: false
    });
  });
})

//creates the review page
app.post('/give-review', function(req, res){
  console.log(username + " Leaving Review for " + title);
    con.query(checkSeen_sql, [title, username], function(error, result){
      if (error) { throw error; }
      if (result.length != 0) {
        if (result[0].status.toString() == "Completed"){
          console.log("He's seen it");
          res.render('give-review', {
            title: title
          });
        }
        else {
          console.log("He bought the ticket but hasn't seen it");
          res.render('review', {
            rating: table[1],
            title: title,
            reviews: table[0],
            error: true
          });
        }
      }
      else {
        console.log("He hasn't seen it");
        res.render('review', {
          rating: table[1],
          title: title,
          reviews: table[0],
          error: true
        });
      }
    });
  })

//goes back to the review page
app.post('/back-review', function(req, res){
  console.log("Going back to reviews");
  res.redirect('/review');
})

//goes back to search results
app.post('/back-showtimes', function(req, res){
  console.log("Going back to showtimes");
  res.redirect('/generate-search');
})

//adds a review into the database then goes to the movie homepage
app.post('/add-review', function(req, res){
  var comment = req.body.comment;
  var reviewtitle = req.body.title;
  var rating = req.body.rating;
  console.log("Review Added");
  con.query(addreview_sql, [title, comment, rating, username, reviewtitle], function(error, result) {
    if (error) { throw error; }
    console.log(comment + reviewtitle + rating + "Review added!");
    res.redirect('/movie');
  });
})

//redirects back to the choose theatre page
app.post('/back-theatre', function(req, res){
  console.log("Back to the theatre");
  res.redirect('/choose-theatre');
});

//creates the create theatre page
app.get('/choose-theatre', function(req, res){
  con.query(preferredTheatres_sql, [username], function(error, result){
    if (error) { throw error; }
    var preferred_theatres = [];
    console.log("Viewing preferred theatres");
      for (var i = 0; i < result.length; i++){
          preferred_theatres.push(result[i]['Name']);
      }
      res.render('theatre', {
        theatres: preferred_theatres
    });
    });
})

//generate the search results
app.get('/generate-search', function(req, res){
  con.query(searchTheatre_sql, [title, search, search, search], function(error, result){
    if (error) { throw error; }
    res.render('search', {
      result: result
    });
  });
})

//creates search result page
app.post('/search', function(req, res){
  search = req.body.search;
  res.redirect('/generate-search');
})

//creates the valid times
app.post('/choose-time', function(req, res){
  var savedtheatre = req.body.save;
  theatre = req.body.location;
    con.query(getTheatreID_sql, [theatre], function(error, result){
     theatre_id = result[0].TheatreID;
      console.log(id + " is the id");
      if (savedtheatre == 'save'){
        con.query(insertSavedTheatre_sql, [id, username], function(error, result){});
        console.log("Saved the theatre");
      }
        con.query(selectShowtime_sql, [id, title], function(error, result){
          res.render('time', {
            rows: result
          });
        });
    });
  })

//create purchase page
app.post('/buy', function(req, res){
  showtime = req.body.name;
  con.query(savedCards_sql, [username], function(error, result){
    if (error) { throw error; }
    console.log(result);
    res.render('buy', {
      title: title,
      theatre: theatre,
      showtime: showtime,
      cards: result
    });
  });
})

app.post('/confirm', function(req, res){
  var numSeniorTix = req.body.adult;
  var numAdultTix = req.body.senior;
  var numChildTix = req.body.senior;
  var totalTix = numSeniorTix + numAdultTix + numChildTx;
  var cardName = req.body.cardname;
  var cardNo = req.body.cardname;
  var cardcvv = req.body.cardname;
  var cardexp = req.body.cardexp;
  var savedcard = req.body.paysave;
  if (savedcard == 'paysave'){
    con.query(insertSavedCard_sql, [cardNo, cardcvv, cardName, cardexp, username], function(error, result){
      if (error) { throw error; }
    });
  }
  con.query(newOrder_sql, [numSeniorTix, numChildTix, numAdultTix, totalTix, cardNo, username, title, theatre_id], function(error, result){
    if (error) { throw error; }
    res.render('confirm', {

    });
  });
})


/*
* MySQL stuff
*/
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: sql_pass,
  database: "movies",
  multipleStatements: true
});

con.connect (function(err) {
  if (err) throw err;
  console.log("Connected!");
});


/*
* Queries
*/
var login_sql = `
  SELECT username, 'password'
  FROM ?? WHERE
  username = ? AND password = ?;`

var register_sql = `
INSERT INTO ?? (Username, Email, Password) values
(?, ?, ?);`

var check_register = `
SELECT * FROM ?? WHERE Username = ?;`

var check_password = `
SELECT * FROM MANAGER WHERE Password = ?;`

var nowPlaying_sql = `
SELECT DISTINCT title FROM PlaysAt WHERE playing = 'Y';`

var orderHistory_sql = `
`
var movieInfo_sql = `
SELECT movie.title, movie.length, movie.genre, movie.releasedate, avg(review.rating) AS avgreview
FROM movie JOIN review ON movie.title = review.title
WHERE movie.title = ?;
`
var overview_sql = `
SELECT movie.title, movie.cast, movie.synopsis
FROM movie WHERE
title = ?;`

var showrating_sql = `
SELECT review.ReviewTitle, review.comment, review.rating
FROM review
WHERE title = ?;
SELECT AVG(rating) AS avgrating
FROM review
WHERE title = ?;`

var checkSeen_sql = `
SELECT orders.status
FROM orders
WHERE orders.title = ?
AND orders.status = 'completed'
AND orders.username = ?;
`
var addreview_sql = `
INSERT INTO review
VALUES (NULL, ?, ?, ?, ?, ?);
`

var deletetheatre_sql = `
`

var viewtheatres_sql = `
`

var deletepayment_sql = `
`

var viewpayment_sql = `
`

var preferredTheatres_sql = `
SELECT Theatre.Name
FROM Theatre
INNER JOIN Prefers
ON Theatre.TheatreID=Prefers.TheatreID
WHERE Username = ?;
`
var searchTheatre_sql = `
SELECT DISTINCT Theatre.Name, Theatre.State, Theatre.City, Theatre.Street, Theatre.Zip
FROM Theatre INNER JOIN Showtime
ON Theatre.TheatreID=Showtime.TheatreID
WHERE Showtime.title = ?
AND (Theatre.city = ? or Theatre.state = ? or Theatre.Name = ?);`

var getTheatreID_sql = `
SELECT TheatreID
FROM Theatre
WHERE Name = ?;
`
var insertSavedTheatre_sql = `
INSERT INTO PREFERS (TheatreID, Username) values
(?, ?);`

var selectShowtime_sql = `
SELECT Showtime FROM Showtime
WHERE TheatreID = ? and Title = ?;`

var savedCards_sql = `
SELECT right(CardNo, 4) AS Card
FROM PAYMENT_INFO
WHERE Username = ? and saved = 'Y';`

var insertSavedCard_sql = `
insert into PAYMENT_INFO (CardNo, CVV, Name, Expiration, Saved, Username) values
(?, ?, ?, ?, 'Y', ?);`

var newOrder_sql = `
insert into ORDERS(OrderID, Date, numSeniorTix, numChildTix, numAdultTix, Time, totalTix, Status, CardNo, Username, Title, TheatreID) values
(NULL, CURDATE(), ?, ?, ?, CURRENT_TIME(), ?, 'Unused', ?, ?, ?, ?);
`
