/**
 * Imports
 */
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const { OAuth2Client } = require('google-auth-library')
const crypto = require('crypto')

/**
 * Global variables
 */
const app = express()
const port = process.env.PORT || '9000'
const clientId = process.env.CLIENT_ID || 'FILL_ME'
const oAuth2Client = new OAuth2Client(clientId)
const dataFilePath = path.join(__dirname, 'data.json')

/**
 * App configuration
 */
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.json())
app.listen(port, () => console.log(`Server started on port ${port}`))

/**
 * Request functions
 */
app.get('/', (req, res) => {
  res.render('main', { dogeParagraph: getDogeParagraph() })
})

app.post('/login/google', async (req, res) => {
  const loginTicket = await getUserData(req.body.idToken)

  if (loginTicket) {
    const payload = loginTicket.getPayload()
    let message
    if (isUserInDatabase(payload)) {
      message = `Welcome back ${payload.given_name} ${payload.family_name}`
    } else {
      addNewUser(payload)
      message = `Nice to see You here for the first time ${payload.given_name} ${payload.family_name}`
    }
    res.status(200).send({
      message: message,
      token: createUserSession(payload),
      googleToken: loginTicket,
      googleUserData: JSON.stringify(loginTicket, null, 4)
    })
  } else {
    res.status(401).send({
      message: 'Unable to login user using Google.'
    })
  }
})

/**
 * Helper functions
 */
async function getUserData (idToken) {
  try {
    FILL_ME
  } catch (e) {
    console.error(e)
    return undefined
  }
}

function getDogeParagraph () {
  return fs.readFileSync(path.join(__dirname, 'content', 'doge.html').toString())
}

function isUserInDatabase (payload) {
  const users = readData().users
  return users.filter(user => user.id === payload.sub).length > 0
}

function addNewUser (payload) {
  const data = readData()
  data.users.push(
    {
      id: payload.sub,
      name: payload.given_name,
      surname: payload.family_name,
      email: payload.email
    })
  saveData(data)
}

function createUserSession (payload) {
  const randomVal = crypto.randomBytes(64).toString('hex')
  return `ey${randomVal}.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
}

function readData () {
  return JSON.parse(fs.readFileSync(dataFilePath, { encoding: 'utf-8' }))
}

function saveData (data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data), { encoding: 'utf-8' })
}
