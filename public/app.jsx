const root = ReactDOM.createRoot(document.querySelector('.root'));
class constructorList {
  constructor(id, header, description, date, waga) {
    this.id = id;
    this.header = header;
    this.description = description;
    this.date = date;
    this.waga = waga;
  }
}

// if (waga === 1) {
//     console.log('waga 1')
//     style
// }


let whatIDo = [
  new constructorList(4, 'Переезд', 'Переезд в Польшу в город Бяла-Подляска (Biała-Podlaska)', '30.08.2025'),
  new constructorList(2, 'Node.js', 'learning basics framework on JavaScript', '2024-2025'),
  new constructorList(3, 'JavaScript', 'learning basics of JavaScript', '2022-2024'),
  new constructorList(1, 'HTML/CSS', 'firsts steps in web development', '2020-2021'),
];

console.log(whatIDo);

// добавляем алиас items (раньше в коде items не было — это причина ошибки)
const items = whatIDo;

function Card({ item }) {
    return (
        <li className="card" id={item.id}>
            <h3 className="card-header">{item.header}</h3>
            {item.description && <p className="card-desc">{item.description}</p>}
            {item.date && <div className="card-date">{item.date}</div>}
        </li>
    );
}

function App() {
    return (
        <div className="container">
            <h1 className="page-title">Чим я займаюсь</h1>
            <ul
              className="cards-grid"
              style={{ padding: 0, listStyle: 'none', display: 'grid' }}
            >
                {items.map(it => <Card key={it.id} item={it} />)}
            </ul>
        </div>
    );
}

root.render(<App />);