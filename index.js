const express = require('express')
const { db } = require('./models/users.js')
const cors = require('cors');
const userRouter = require('./routes/users');
const places = require('./routes/places')
const images = require('./routes/images')
const bookPlaces = require('./routes/bookPlaces')

require('./db/mongoose.js')
const app = express()

const port = process.env.PORT || 3000


app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb' }));
app.use(userRouter)
app.use(places)
app.use(images)
app.use(bookPlaces);
app.use(
  cors({
    allowedHeaders: ["sessionId", "Content-Type", "Authorization"],
    exposedHeaders: ["sessionId"],
    origin: "*",
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

  })
);
// app.use(bikeTypesRouter)
// app.use(bikeRouter)


app.listen(port, () => console.log("server is up", port))