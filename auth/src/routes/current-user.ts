import express from "express"
import { currentUser } from "../../lib"

const router = express.Router()

router.get(
  '/api/users/currentuser',
  currentUser,
  (req, res) => {
    res.send({ currentUser: req.user })
  }
)

export { router as currentUserRouter }

