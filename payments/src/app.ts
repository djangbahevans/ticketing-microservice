import { json } from "body-parser"
import cookieSession from "cookie-session"
import express from "express"
import "express-async-errors"
import { currentUser, NotFoundError, errorHandler } from "../lib"
import { createChargeRouter } from "./routes/new"


const app = express()
app.set('trust proxy', true)


app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test' // Only over HTTPS
  })
)

app.use(currentUser)

app.use(createChargeRouter)

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler);

export { app }

