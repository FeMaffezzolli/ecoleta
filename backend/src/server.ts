import express from 'express'

const app = express()

app.get('/test', (req, res) => {
  return res.json({hello: "world"})
})

app.listen(3333)