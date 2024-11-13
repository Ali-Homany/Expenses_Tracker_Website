import { useEffect, useState } from 'react';
import Hero from './Hero';
import ExpenseCreator from './ExpenseCreator';
import SearchBar from './SearchBar';
import ExpensesList from './ExpensesList';
import FiltersSideBar from './FiltersSideBar';
import { importData, downloadData, scroll_to_form } from '../utils/actions';


function App() {
    const [ expensesList, setExpensesList ] = useState(JSON.parse(localStorage.getItem('data')) || []);
    const [ expenseDraft, setExpenseDraft ] = useState({
        'title': '',
        'price': '',
        'currency': '$',
        'category': '',
        'date': new Date().toISOString().split('T')[0]
    });
    const [ isUpdateMode, setIsUpdateMode ] = useState(false);
    const [ filters, setFilters ] = useState({
        'title': '',
        'category': '',
        'min_price': 0,
        'max_price': 1000000,
        'month': null,
        'year': null
    })
    const [ isDarkTheme, setIsDarkTheme ] = useState(localStorage.getItem('isDarkTheme') === 'true');

    useEffect(() => {
        localStorage.setItem("data", JSON.stringify(expensesList));
    }, [ expensesList ]);
    useEffect(() => {
        document.documentElement.className = isDarkTheme ? 'dark-theme' : '';
        localStorage.setItem('isDarkTheme', isDarkTheme);
    }, [isDarkTheme]);


    
    function setSearchQuery(query) {
        setFilters((filters) => {
            return {...filters, 'title': query}
        })
    }
    function addExpense(e) {
        e.preventDefault();
        setExpensesList(() => {
            const newExpense = {
                ...expenseDraft,
                id: crypto.randomUUID()
            };
            return [...expensesList, newExpense];
        })
        setExpenseDraft({
            'title': '',
            'price': '',
            'currency': '$',
            'category': '',
            'date': new Date().toISOString().split('T')[0]
        });
    }
    function activateUpdateMode(id) {
        const expense = expensesList.find(expense => expense.id === id);
        setExpenseDraft(expense);
        setIsUpdateMode(true);
        scroll_to_form();
    }
    function updateExpense(e) {
        e.preventDefault();
        setExpensesList((expensesList) => {
            return expensesList.map((expense) => {
                if (expense.id === expenseDraft.id) {
                    return {...expenseDraft, id: expense.id};
                }
                return expense;
            })
        })
        setExpenseDraft({
            'title': '',
            'price': '',
            'currency': '$',
            'category': '',
            'date': new Date().toISOString().split('T')[0]
        });
        setIsUpdateMode(false);
    }
    

    return (
        <div className="App" >
            <Hero scroll={ scroll_to_form }/>
            <svg onClick={ () => setIsDarkTheme((isDarkTheme) => !isDarkTheme) } id="theme-btn" aria-hidden="true" data-prefix="fas" data-icon="adjust" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="svg-inline--fa fa-adjust fa-w-16 fa-7x"><path d="M8 256c0 136.966 111.033 248 248 248s248-111.034 248-248S392.966 8 256 8 8 119.033 8 256zm248 184V72c101.705 0 184 82.311 184 184 0 101.705-82.311 184-184 184z"></path></svg>
            <ExpenseCreator expenseDraft={ expenseDraft } setExpenseDraft={ setExpenseDraft } addExpense={ addExpense } isUpdateMode={ isUpdateMode } updateExpense={ updateExpense }/>
            <div className="controls">
                <button id="import" onClick={() => importData()}></button>
                { (expensesList.length !==0) ?
                    <>
                        <button id="delete" onDoubleClick={ () => setExpensesList(() => {return []})}></button>
                        <button id="download" onClick={() => downloadData()}></button>
                    </>
                    : <></>
                }
            </div>
            <div id='output'>
                { (expensesList.length !== 0) ?
                    <>
                        <FiltersSideBar filters={ filters } setFilters={ setFilters } categories={ [...new Set(expensesList.map(expense => expense.category))] }/>
                        <SearchBar searchQuery={ filters.title } setSearchQuery={ setSearchQuery } />
                        <ExpensesList expensesList={ expensesList } setExpensesList={ setExpensesList } filters={ filters } activateUpdateMode={ activateUpdateMode }/>
                    </>
                : <div></div>
                }
            </div>
        </div>
    );
}

export default App;
