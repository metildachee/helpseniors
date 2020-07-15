const router = require('express').Router();
const Lists = require('../models/list.model');
const Users = require('../models/user.model');
const blockUser = require('../config/loginBlocker');

/// DISPLAYING ALL LISTS ---> 

router.get("/", async (req, res) => {
    let lists = await Lists.find().populate("ownedBy");
    res.render("list/index", { lists });
})

/// CREATING NEW LISTS --->

router.get("/new", blockUser, async (req, res) => { res.render("list/new"); })

router.post("/new", async (req, res) => {
    let items;
    if (typeof req.body.item == Array) {
        req.body.item.forEach( (ele, index) => {
            items.push({
                name: ele,
                qty: req.body.qty[index]
            });
        })
    }
    else {
        items = {
            name: req.body.item,
            qty: req.body.qty
        };
    }
    try {
        let list = await Lists.create({ items: items, ownedBy: req.user._id });
        await Users.findByIdAndUpdate(req.user._id, { $push: { registeredLists: list._id }});
        res.redirect("/list");
    }
    catch(err) { console.log(err); }
})

/// HELPING ---->
router.post("/help/:id", async (req, res) => {
    try {
        if (req.user == null) {
            req.flash("error", "You need to sign in to help others");
            return res.redirect("/auth/login");
        }
        if (req.user.isSenior) {
            req.flash("error", "You're too old to help.");
            return res.redirect("/list");
        }
        
        let list = await Lists.findByIdAndUpdate(req.params.id, { helper: req.user._id, status: 1 });
        await Users.findByIdAndUpdate(req.user._id, { $push: { registeredLists: list._id }});
        req.flash("success", "Added a new list");
        res.redirect("/list");
    }
    catch(err) { console.log(err); }
})

router.get("/mylists", blockUser, async (req, res) => {
    try {
        let user = await Users.findById(req.user._id).
                   populate({
                       path: "registeredLists", 
                       populate: { path: "ownedBy", model: "User"}
                   });
        res.render("list/user", { user });
    }
    catch(err) { console.log(err); }
})

router.post("/complete/:id", async (req, res) => {
    try {
        await Lists.findByIdAndUpdate(req.params.id, { status: 2 });
        req.flash("success", "You have fulfilled a task");
        res.redirect("/list");
    }
    catch(err) { console.log(err); }
})

module.exports = router;