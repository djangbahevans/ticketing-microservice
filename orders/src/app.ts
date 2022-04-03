import { json } from "body-parser"
import cookieSession from "cookie-session"
import express from "express"
import "express-async-errors"
import { currentUser, errorHandler, NotFoundError } from "../lib"
import { indexOrderRouter } from "./routes"
import { deleteOrderRouter } from "./routes/delete"
import { createOrderRouter } from "./routes/new"
import { showOrderRouter } from "./routes/show"


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

app.use(createOrderRouter)
app.use(showOrderRouter)
app.use(indexOrderRouter)
app.use(deleteOrderRouter)

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler);

export { app }

