const root = ReactDOM.createRoot(document.querySelector('.root'));
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
              style={{ padding: 0, listStyle: 'none', display: 'grid', gap: '20px', margin: '20px 0' }}
            >
                {items.map(it => <Card key={it.id} item={it} />)}
            </ul>
        </div>
    );
}

root.render(<App />);