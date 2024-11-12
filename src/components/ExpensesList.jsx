import { List, AutoSizer } from 'react-virtualized';
import ExpenseRow from "../components/ExpenseRow";

export default function ExpensesList({ expensesList, searchQuery, setExpensesList, activateUpdateMode }) {
    function deleteExpense(expenseID) {
        setExpensesList(expensesList.filter(expense => expense.id !== expenseID))
    }
    
    return (
        <div className="output">
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
                            height={600}
                            width={width}
                            rowCount={ expensesList.length }
                            rowHeight={ 50 }
                            rowRenderer={ ({ index, style, key, parent }) => {
                                const expense = expensesList[index];
                                const result = (expense.title.toLowerCase().includes(searchQuery.toLowerCase())) ? 
                                    <ExpenseRow key={ expense.id } style={ style } expense={ expense } editExpense={ activateUpdateMode } deleteExpense={ deleteExpense } />
                                    : null
                                return result;
                            }}
                        >
                        </List>
                    )}
                </AutoSizer>
        </div>
    )
}