import { json } from "body-parser"
import cookieSession from "cookie-session"
import express from "express"
import "express-async-errors"
import { NotFoundError } from "./errors/not-found-error"
import { currentUser, errorHandler } from "./middlewares"
import { indexTicketRouter } from "./routers"
import { createTicketRouter } from "./routers/new"
import { showTicketRouter } from "./routers/show"
import { updateTicketRouter } from "./routers/update"


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

app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(indexTicketRouter)
app.use(updateTicketRouter)

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler);

export { app }

