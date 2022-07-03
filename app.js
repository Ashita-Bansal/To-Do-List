//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose')
// const date = require(__dirname + "/date.js");
const _=require('lodash')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Ashita:test123@cluster0.gsawi.mongodb.net/todolistDB",{useNewUrlParser:true})

const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Buy food"
})
const item2=new Item({
  name:"Cook food"
})
const item3=new Item({
  name:"Eat food"
})

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {


Item.find({},function(err,foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err)
      }else{
        console.log("items added successfully")
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  
});

 

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName=req.body.list;


  const itemName= new Item({
    name:item
  })
 

  if(listName==="Today"){
    itemName.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(itemName);
      foundList.save();
      res.redirect("/"+listName)
    })
  }

  
});

app.post("/delete",function(req,res){
  // console.log(req.body.checkbox)
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err)
      }else{
        console.log("successfully removed");
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

app.get("/:topic",function(req,res){
  const listName=_.capitalize(req.params.topic);

  List.findOne({name:listName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:listName,
          items:defaultItems
        });
      
        list.save();
        res.redirect("/"+listName)
      }else{
        //show an existing list
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
      }
    }
  })
  

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});