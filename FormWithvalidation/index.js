const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/Danial'sBookStore",{

   useNewUrlParser: true,
   useUnifiedTopology: true,


});

const Product = mongoose.model("Product",{

    name: String,
    studentid: String,
    html5books: Number,
    css3books: Number,
    pens: Number,
    subtotal: Number,
    afterTax: Number,
    total: Number,
});

var myApp = express();

myApp.use(bodyParser.urlencoded({extended: false}));

myApp.set("views", path.join(__dirname, "views"));

myApp.use(express.static(__dirname + "/public"));

myApp.set("view engine", "ejs");

myApp.get("/", (req, res) =>{
  res.render("form");
});

var studentidRegex = /^\d{7}(?:\d{2})?$/;

function checkRegx(userInput, regex){
    if(regex.test(userInput)){
    
        return true;
    }
    else{
    
        return false;
      }
    }

    function customStudentidValidation(value){
    
        if(!checkRegx(value, studentidRegex)){
    
            throw new Error('Not a Valid Student ID !');
        }
       return true;
    }

    myApp.post(
        "/",
        [check("name","name Can not be empty !").not().isEmpty(),
        check("studentid").custom(customStudentidValidation),

    ],
    (req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            
            res.render("form",{
     
              errors: errors.array(),
            });
        }else{
            let name = req.body.name;
            let studentid = req.body.studentid;

            let taxRate = 0.13;

            let html5books = 0;
            if(req.body.html5books && req.body.html5books >= 0){
        
                html5books = parseInt(req.body.html5books);
            }
            let css3books = 0;
            if(req.body.css3books && req.body.css3books >= 0){
        
                css3books = parseInt(req.body.css3books);
            }
            let pens = 0;
            if(req.body.pens && req.body.pens >= 0){
        
                pens = parseInt(req.body.pens);
            }
            let subtotal = html5books * 62.99 + css3books  * 51.99 +pens * 2.99 ;
        
            let afterTax = subtotal * taxRate;

            let total = afterTax + subtotal;

            let items ={

                name : name,
                studentid : studentid,
                html5books : html5books,
                css3books : css3books,
                pens : pens ,
                afterTax : afterTax,
                subtotal : subtotal,
                total : total,

            };

            let product = new Product (items);
            
            
            product
            .save()
            .then(() => {
                res.render("form", items)
      
      
            })
            .catch(() => {
              res.render("form");
            });

        }
      }
    );

    myApp.get("/allorders", (req,res) => {
   
        Product.find({}).exec((err , stuff) =>{
    
            if(stuff){
    
              res.render("allorders",{
                orders: stuff,
              }); 
    
            }else{
             
                res.redirect("/")
            }
        });
     });
    
    
    
    myApp.listen(3000, () => {
    
      console.log("The app is running on port 3000")
    
    });