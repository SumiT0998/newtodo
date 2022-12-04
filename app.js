const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin:5233@cluster0.rf7oixn.mongodb.net/todolist?retryWrites=true&w=majority");
const itemsSchema={
  name:String
};
const Item =mongoose.model("Item",itemsSchema);

const item1= new Item({
  name:"welcome to todo list!"
});
const item2= new Item({
  name:"hit + to add!"
});
const item3= new Item({
  name:"<-- hit to delete!"
});

const deafaultItems =[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List =mongoose.model("List",listSchema);



app.get("/", function(req, res) {

 Item.find({},function(err,foundItems){

   if (foundItems.length===0) {
     Item.insertMany(deafaultItems,function(err){
       if (err) {
         console.log(err);
       }else {
         console.log("sucessfully done");
       }
     });
     res.redirect("/");
   } else{
  res.render("list", {listTitle:"Today", newListItems: foundItems});
   }
 });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName==="Today") {
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.post("/delete",function(req,res){
  const checkeditemid =req.body.checkbox;
  const listName = req.body.listName;
  if (listName==="Today") {
    Item.findByIdAndRemove(checkeditemid,function(err){
      if(!err){console.log("sucesfully delete the checked item");
      res.redirect("/");
    }
    });
  }else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemid}}},function(err,foundList){
      if (!err) {
        res.redirect("/"+listName);
      }

    });
  }



});

app.get("/:customlist",function(req,res){
  const customlist = _.capitalize(req.params.customlist);
List.findOne({name:customlist},function(err,foundList){
  if(!err){
     if (!foundList) {
       //create a new list
       const list = new List({
         name:customlist,
         items:deafaultItems
       });
       list.save();
       res.redirect("/"+ customlist);
     }else{// if exists try to make with another name
       res.render("list",{listTitle:foundList.name, newListItems: foundList.items})
     }
  }
});


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
