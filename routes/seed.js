var mongoose=require("mongoose");
var book=require("../models/book")

var data=[
      
      {
                        id        :   1,
                        title     :  "Basic Mathematics",
                        course    :  "FC001",
                        author    :  "Jaggi and Mathur",
                        publisher :  "Evergreen",
                        branch    :  "ECE",
                        semester  :   1,
                        price     :   150
      },
      {
        
                        id        :   2,
                        title     :  "Advance Mathematics",
                        course    :  "FC002",
                        author    :  "Jaggi and Mathur",
                        publisher :  "Evergreen",
                        branch    :  "ECE",
                        semester  :   1,
                        price     :   120
      },
      {
          
                        id        :   3,
                        title     :  "Let Us C",
                        course    :  "FC003",
                        author    :  "Yashwant Kanitka",
                        publisher :  "Oxford Publications",
                        branch    :  "ECE",
                        semester  :   1,
                        price     :   170
      },
      {
                        id        :   4,
                        title     :  "Eectrical and Electronics",
                        course    :  "FC004",
                        author    :  "Dr. BL threja",
                        publisher :  "Evergreen Publications",
                        branch    :  "ECE",
                        semester  :   200,
                        price     :   250 
      },
      {
                        id        :   5,
                        title     :  "Signals And Systems",
                        course    :  "EC0012",
                        author    :  "Dr. Tarun Kumar Rawat",
                        publisher :  "Evergreen Publications",
                        branch    :  "ECE",
                        semester  :   3,
                        price     :   300    
      },
      {
                        id        :   6,
                        title     :  "Electronics",
                        course    :  "EC009",
                        author    :  "Sedra and Smith",
                        publisher :  "Oxford Publications",
                        branch    :  "ECE",
                        semester  :   2,
                        price     :   500
      }
    
    ];


function seedDB(){
    book.remove({},function(err){
    if(err)
    {
        console.log(err);
    }
    console.log("Removed the data");
     
       data.forEach(function(seed){
       book.create(seed,function(err,product){
           if(err)
           {
               console.log(err);
           }
           else
           {
           	   product.save();
               console.log("Added a book");
           }
       });
   });
})};

module.exports=seedDB;