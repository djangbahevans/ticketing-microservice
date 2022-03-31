import { json } from "body-parser"
import cookieSession from "cookie-session"
import express from "express"
import "express-async-errors"
import { NotFoundError } from "./errors/not-found-error"
import { errorHandler } from "./middlewares/error-handler"
import { signinRouter, signoutRouter, signupRouter } from "./routes"
import { currentUserRouter } from "./routes/current-user"


const app = express()
app.set('trust proxy', true)


app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test' // Only over HTTPS
  })
)

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler);

export { app }

