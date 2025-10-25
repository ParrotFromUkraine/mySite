const root = ReactDOM.createRoot(document.querySelector('.root'));

let test = [{
    id: 1, 
    header: 'Привет',
    description: 'Вот и начался мой путь в прогрмамирования', 
    date: '24-05-2008', 
},{
    id: 2, 
    header: 'Привет',
    description: 'Я попугай так-то', 
    date: '', 
}
]

const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `id_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

let items = Array.isArray(test) ? test.slice() : [test];

items = items.map((it, i) => {
    if (!it.id && it.id !== 0) it.id = generateId();
    // можна додати дефолтні поля
    it.header = it.header || 'Без заголовка';
    it.description = it.description || '';
    it.date = it.date || '';
    return it;
});

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
            <ul className="cards-grid" style={{ padding: 0, listStyle: 'none' }}>
                {items.map(it => <Card key={it.id} item={it}/>)}
            </ul>
        </div>
    );
}

root.render(<App />);