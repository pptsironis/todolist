const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");
mongoose.set('strictQuery', true);
const date = require(__dirname + "/date.js");

const app = express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
});

const item2 = new Item({
    name: "Hit the button to aff a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String, items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Items added successfully!");
                }
            });
            res.redirect("/");
        }

        res.render("list", {listTitle: day, newListItems: foundItems});
    });

    let day = date.getDate();
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === date.getDate()) {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === date.getDate()){
        Item.findByIdAndDelete(checkedItemId, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Items deleted successfully!");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name:listName}, {$pull: {items:{_id: checkedItemId}}}, (err, foundList)=>{
            if(err) {
                console.log(err)
            }else {
                res.redirect("/" +listName);
            }
        });
    }
});


app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName, items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName)

            } else {
                // Show an existing list

                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

            }
        }
    });
});

app.get("/work", function (req, res) {
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function (req, res) {
    res.render("about")
});

app.listen(3000, function () {
    console.log("Server running at port 3000");
});
