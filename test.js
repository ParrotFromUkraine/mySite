class constructorList {
  constructor(id, header, description, date) {
    this.id = id;
    this.header = header;
    this.description = description;
    this.date = date;
  }
}

let whatIDo = [
  new constructorList(1, 'HTML/CSS', 'firsts steps in web development', '2020-2021'),
  new constructorList(2, 'JavaScript', 'learning basics of JavaScript', '2021-2022'),
  new constructorList(3, 'React', 'building web applications with React', '2022-2023'),
  new constructorList(4, 'Переезд', 'Переезд в Польшу(Biała-Podlaska)', '30.08.2025'),
];

console.log(whatIDo);