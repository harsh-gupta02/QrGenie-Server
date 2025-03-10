const express = require('express')
const dotenv = require('dotenv')
const qrcode = require('qrcode')
const cors = require('cors')

const app = express()
app.use(express.json())
dotenv.config()
const port = process.env.PORT || 3000

app.use(cors())

const toString = (req, res, next) => {
    if (req.body) {
        if (typeof req.body.url !== 'string') {
            req.body.url = JSON.parse(req.body.url)
            console.log("1: ",req.body)
        }
        next()
    } else {
        res.status(400).json({ error: 'Invalid request: "data" field is required.' })
    }
}

app.get('/', (req, res) => {
    res.send('Qr Genie Server')
})

app.post('/generate', toString, async (req, res) => {
    try {
        const data = req.body.url
        const qrCode = await qrcode.toDataURL(data)
        res.send({ qrCode })
    }
    catch (error) {
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.listen(port, () => {
    console.log('Server listening on port ' + port)
})