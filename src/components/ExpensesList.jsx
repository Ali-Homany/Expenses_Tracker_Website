import { List, AutoSizer } from 'react-virtualized';
import ExpenseRow from "../components/ExpenseRow";

export default function ExpensesList({ expensesList, filters, setExpensesList, activateUpdateMode }) {
    function deleteExpense(expenseID) {
        setExpensesList(expensesList.filter(expense => expense.id !== expenseID))
    }
    
    // filter expenses based on all filters
    var expenses = expensesList;
    if (filters.title !== '')
        expenses = expenses.filter((expense) => expense.title.toLowerCase().includes(filters.title.toLowerCase()));
    if (filters.category !== '')
        expenses = expenses.filter((expense) => expense.category.toLowerCase() === filters.category.toLowerCase());
    if (filters.min_price !== null && filters.min_price > 0)
        expenses = expenses.filter((expense) => Number(expense.price) >= Number(filters.min_price));
    if (filters.max_price !== null && filters.max_price > 0)
        expenses = expenses.filter((expense) => Number(expense.price) <= Number(filters.max_price));
    if (filters.year !== null && filters.year !== "")
        expenses = expenses.filter((expense) => Number(expense.date.split('-')[0]) === Number(filters.year));
    if (filters.month !== null && filters.month !== "")
        expenses = expenses.filter((expense) => Number(expense.date.split('-')[1]) === Number(filters.month));


    return (
        <div className="data">
                <div className="row header">
                    <div>date</div>
                    <div>title</div>
                    <div>price</div>
                    <div>currency</div>
                    <div>category</div>
                    <div></div>
                </div>
                <AutoSizer>
                    {({ width, height }) => (
                        <List
                            height={550}
                            width={width}
                            rowCount={ expenses.length }
                            rowHeight={ 50 }
                            rowRenderer={ ({ index, style, key, parent }) => {
                                const expense = expenses[index];
                                return (
                                    <ExpenseRow key={ expense.id } style={ style } expense={ expense } editExpense={ activateUpdateMode } deleteExpense={ deleteExpense } />
                                )
                            }}
                        >
                        </List>
                    )}
                </AutoSizer>
        </div>
    )
}