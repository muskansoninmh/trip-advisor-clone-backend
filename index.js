const express = require('express')
const { db } = require('./models/users.js')
const cors = require('cors');
const userRouter = require('./routes/users');
const places = require('./routes/places')
// const bikeTypesRouter = require('./routes/bike-types')
// const bikeRouter = require('./routes/bike')

require('./db/mongoose.js')
const app = express()

const port = process.env.PORT || 3000


app.use(express.json())

app.use(userRouter)
app.use(places)
app.use(
  cors({
    allowedHeaders: ["sessionId", "Content-Type", "Authorization"],
    exposedHeaders: ["sessionId"],
    origin: "*",
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
  })
);
// app.use(bikeTypesRouter)
// app.use(bikeRouter)


app.listen(port, () => console.log("server is up", port))