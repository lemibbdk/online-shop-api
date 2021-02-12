const express = require('express');
require('./db/mongoose')
const cors = require('cors')
const userRouter = require('./routers/user')
const itemRouter = require('./routers/item')
const cartRouter = require('./routers/cart')
const statsRouter = require('./routers/stats')

const app = express();
const port = process.env.PORT

app.use(express.json({limit: '10mb', extended: true}))
app.use(cors())
app.use(userRouter)
app.use(itemRouter)
app.use(cartRouter)
app.use(statsRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port);
})

// app.listen(port, '192.168.0.27');

