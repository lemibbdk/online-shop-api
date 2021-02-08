const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(r => console.log('Connected to database'))
    .catch(err => {
        console.log('Cannot connect to database! ' + err)
    });
