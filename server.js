// const app = require('./app')

// app.listen(3000, () => {
//   console.log(`Server running. Use our API on port: ${PORT}`)
// })

const mongoose = require('mongoose');

const {DB_HOST} = process.env
  
mongoose.connect(DB_HOST)
  .then(() => console.log('Database connection successful'))
  .catch((error) => console.log(error.message));
