const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listSchema = Schema({
    items: [{
        name: String,
        qty: Number,
    }],
    status: {
        type: Number,
        default: 0,
    },
    ownedBy: { type: Schema.Types.ObjectId,  ref: "User"},
    helper: { type: Schema.Types.ObjectId, ref: "User" }
})

const List = mongoose.model("List", listSchema);

module.exports = List;