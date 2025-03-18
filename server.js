const express = require('express')
const dotenv = require('dotenv')
const qrcode = require('qrcode')
const cors = require('cors')

const app = express()
app.use(express.json())
dotenv.config()
const port = process.env.PORT || 3000

app.use(cors())

const toString = (data) => {
    if (typeof data !== 'string') {
        req.body.url = JSON.stringify(data)
    }
}
const validateType = (req, res, next) => {
    if (req.body) {
        if(req.body.url) {
            toString(req.body.url)
        }
        else if(req.body.text) {
            req.body.url = req.body.data
            delete req.body.data
        }
        next()
    } else {
        res.status(400).json({ error: 'Invalid request: "data" field is required.' })
    }
}

app.get('/', (req, res) => {
    res.send('Qr Genie Server')
})

app.post('/generate', validateType, async (req, res) => {
    try {
        const data = req.body.url
        const qrCode = await qrcode.toDataURL(data, {width: 165})
        res.send({ qrCode })
    }
    catch (error) {
        res.status(500).send({ error: 'Internal server error' })
    }
})

app.listen(port, () => {
    console.log('Server listening on port ' + port)
})