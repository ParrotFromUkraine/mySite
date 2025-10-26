const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// let whatIDo = [
// {
//   id: 1,
//   header: 'HTML/CSS',
//   description: 'firsts steps in web development',
//   date: '2020-2021'
// },
// {
//   id: 2,
//   header: 'HTML/CSS',
//   description: 'firsts steps in web development',
//   date: '2020-2021'
// }
// ]


class constructorList {
  constructor(id, header, description, date) {
    this.id = id;
    this.header = header;
    this.description = description;
    this.date = date;
  }
}
