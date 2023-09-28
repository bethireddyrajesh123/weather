const express = require("express");
const app = express();
app.use(express.static("public"));
const ejs = require("ejs");
app.set("view engine", "ejs");
const path = require("path");
const serviceAccount = require("./Key.json");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore,Filter } = require("firebase-admin/firestore");

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var passwordHash = require('password-hash');
const request = require('request');



    const firebaseApp = initializeApp({
        credential: cert(serviceAccount),
    });
    const db = getFirestore(firebaseApp);
    const api_key = "32c9b515af6a44d4921163928233105";

    app.get("/", function (req, res) {
        res.sendFile(__dirname+"/public/"+"dashboard.html");
    });

    app.post("/signupsubmit",function(req, res)  {
         console.log(req.body);
db.collection("Data")
.where(
    Filter.or(
        Filter.where("email", "==", req.body.email),
        Filter.where("fullname", "==", req.body.fullname)
    )
)
.get()
.then((docs) => {
    if (docs.size > 0) {
      res.send("hey, this account already exist with username");
    } else {
        db.collection("Data")
        .add({
            fullname: req.body.fullname,
            email: req.body.email,
            password: passwordHash.generate(req.body.password),
        })
        .then(() =>{
             
            res.sendFile(__dirname +"/public/"+ "login.html");
        })
        .catch(() => {
            res.send("something went wrong")
        })
    }
  })
  

});


app.post("/loginsubmit", function (req, res) {
  passwordHash.verify('password123', hashedPassword)
  var hashedPassword = passwordHash.generate('password123'); 
  const email = req.body.email;
  const password = req.body.password;
  console.log("Email:", email);
  console.log("Password:", password);

  // Check if email and password are defined and not empty
  if (email && password) {
    db.collection("Data")
      .where("email", "==", email)
      //.where("password", "==", password)
      .get()
      .then((docs) => {
        let verified= false;
        //console.log(docs[0].data());
        docs.forEach(doc => {
         

         verified =  passwordHash.verify(req.body.password, doc.data().password);

          console.log(doc.id, '=>', doc.data());
        });
        if(verified){
          //res.sendFile(__dirname + "/public/" + "home.html");
          res.render("home", { result: null });
          //res.sendFile( "/home.ejs");
       
        } else{
          res.send("fail");
        }
       
      })
      .catch((error) => {
        console.error("Error querying Firestore:", error);
        res.status(500).send("Server error");
      });
  } else {
    res.status(400).send("Invalid email or password"); // Return a 400 Bad Request status for invalid input
  }
});






app.get("/weatherinfo", function (req, res) {
  console.log("Query parameter 'location':", req.query.location); // Debugging line
const history = [];

  db.collection("history")
 
  .get()
  .then((docs) => {
   
    docs.forEach((doc) => {
     history.push(doc.data());
    });
  });



  
  if (req.query.location && req.query.location.length > 0) {
    db.collection("history")
    .add({
      name:req.query.location,
    })
    .then(() =>{
      request("http://api.weatherapi.com/v1/current.json?key=" + api_key + "&q=" + req.query.location + "&aqi=no", function (error, response, body) {
        console.log('body:', body); 
        console.log(JSON.parse(body).current.temp_c);const data = {
          temp: JSON.parse(body).current.temp_c,
          name: JSON.parse(body).location.name,
          region: JSON.parse(body).location.region,
          last_updated: JSON.parse(body).current.last_updated,
        };
        //res.sendFile( "/home.ejs");
        res.render("home", { result: data, });
     
      });

    })
    
  } else {
    res.send("Location not provided");
  }
});


  
app.listen(4000, () => {
    console.log("Server is running on port 4000");
});

    
      