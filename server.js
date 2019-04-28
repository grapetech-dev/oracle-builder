const database = require("./database/rdms")


// Set up the connection first..
database.connect(()=>{
    console.log("Database connected....")
});
