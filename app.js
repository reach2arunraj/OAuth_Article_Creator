const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const morgan = require("morgan")
const path = require("path")
const exphbs = require("express-handlebars")
const connectDB = require("./config/db")
const passport = require("passport")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)

const app = express()

// Body-parser
app.use(express.urlencoded({extended:false}))


// Load Config
dotenv.config({ path: "./config/config.env"})

// Passport config
require("./config/passport")(passport)

// DB connection
connectDB()

//Logging
if(process.env.NODE_ENV === "development"){
    app.use(morgan("dev"))
}

//Handlebar helper

const { formatDate, stripTags, truncate, editIcon, select } = require("./helpers/hbs")


// Handlebars
app.engine('.hbs',exphbs({ helpers: {formatDate, stripTags, truncate, editIcon, select }, defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')

// session
app.use(session({
    secret: 'keyboard cat', 
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection:mongoose.connection })
  }))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//Set global variable
app.use(function (req,res,next){
  res.locals.user = req.user || null 
  next()
})

// Static Folder
app.use(express.static(path.join(__dirname, "public")))


// Routes
app.use("/", require("./routes/index"))
app.use("/auth", require("./routes/auth"))
app.use("/stories", require("./routes/stories"))

app.listen (process.env.PORT || 3000, () => console.log("server is up and running successfully"))  