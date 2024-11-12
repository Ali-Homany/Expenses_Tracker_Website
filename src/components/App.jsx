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

    useEffect(() => {
        localStorage.setItem("data", JSON.stringify(expensesList));
    }, [ expensesList ]);


    
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
                <FiltersSideBar filters={ filters } setFilters={ setFilters } categories={ [...new Set(expensesList.map(expense => expense.category))] }/>
                { (expensesList.length !== 0) ?
                    <>
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
