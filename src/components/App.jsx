import { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Settings from './Settings';
import Summary from './Summary';


function App() {
    const [ expensesList, setExpensesList ] = useState(JSON.parse(localStorage.getItem('data')) || []);
    useEffect(() => {
        localStorage.setItem("data", JSON.stringify(expensesList));
    }, [ expensesList ]);

    const [ isDarkTheme, setIsDarkTheme ] = useState(localStorage.getItem('isDarkTheme') === 'true');
    useEffect(() => {
        document.documentElement.className = isDarkTheme ? 'dark-theme' : '';
        localStorage.setItem('isDarkTheme', isDarkTheme);
    }, [isDarkTheme]);


    function deleteExpensesList() {
        if (window.confirm("Are you sure you want to delete all expenses?")) {
            setExpensesList([]);
        }
    }
    return (
        <div className="App" >
            <Router>
                <Routes>
                    <Route path="/" element={<Home expensesList={expensesList} setExpensesList={setExpensesList}/>} />
                    <Route path="/settings" element={<Settings setIsDarkTheme={setIsDarkTheme} nb_expenses={expensesList.length} deleteExpensesList={deleteExpensesList}/>} />
                    <Route path='/summary' element={<Summary expensesList={expensesList}/>} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
