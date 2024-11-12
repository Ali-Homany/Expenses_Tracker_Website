import ExpenseRow from "../components/ExpenseRow";

export default function ExpensesList({ expensesList, searchQuery, setExpensesList, activateUpdateMode }) {
    function deleteExpense(expenseID) {
        setExpensesList(expensesList.filter(expense => expense.id !== expenseID))
    }
    
    return (
        <div className="output">
            <table>
                <thead>
                    <tr>
                        <th>date</th>
                        <th>title</th>
                        <th>price</th>
                        <th>currency</th>
                        <th>category</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="body">
                    { expensesList.map((expense) => 
                        (expense.title.toLowerCase().includes(searchQuery.toLowerCase())) ? 
                            <ExpenseRow key={ expense.id } expense={ expense } editExpense={ activateUpdateMode } deleteExpense={ deleteExpense } />
                        : null
                    )}
                </tbody>
            </table>
        </div>
    )
}