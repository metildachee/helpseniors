const router = require('express').Router();
const Lists = require('../models/list.model');
const Users = require('../models/user.model');

/// DISPLAYING ALL LISTS ---> 

router.get("/", async (req, res) => {
    // This page shows all the available lists
    let lists = await Lists.find().populate("ownedBy");
    res.render("list/index", { lists });
})

/// CREATING NEW LISTS --->

router.get("/new", async (req, res) => {
    res.render("list/new");
})

router.post("/new", async (req, res) => {
    // This page saves the list
    let items = [];
    req.body.item.forEach( (ele, index) => {
        items.push({
            name: ele,
            qty: req.body.qty[index]
        });
    })
    try {
        // action: add in the current user, see below for ref
        let list = await Lists.create({ items: items, ownedBy: req.user._id });
        await Users.findByIdAndUpdate(req.user._id, { $push: { registeredLists: list._id }});
        res.redirect("/list");
    }
    catch(err) { console.log(err); }
})

/// HELPING ---->

router.post("/help/:id", async (req, res) => {
    try {
        // check to make sure is not senior
        if (req.user == null) {
            req.flash("error", "You need to sign in to help others");
            return res.redirect("/auth/login");
        }
        if (req.user.isSenior) {
            req.flash("error", "You're too old to help.");
            return res.redirect("/list");
        }
        
        // 1. add the helper's id to this particular List and change status
        let list = await Lists.findByIdAndUpdate(req.params.id, { helper: req.user._id, status: 1 });
        // 2. Add this list to the current helper

        await Users.findByIdAndUpdate(req.user._id, { $push: { registeredLists: list._id }});
        req.flash("success", "Added a new list");
        res.redirect("/list");
    }
    catch(err) { console.log(err); }
})

router.get("/mylists", async (req, res) => {
    console.log("viewing my lists");
    // get all the lists of that particular and render
    try {
        let user = await Users.findById(req.user._id).populate("ownedBy registeredLists");
        res.render("list/user", { user });
    }
    catch(err) { console.log(err); }
})

module.exports = router;