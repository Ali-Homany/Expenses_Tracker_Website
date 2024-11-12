export default function ExpenseRow({ expense, editExpense, deleteExpense }) {
    return (
        <tr>
            <td>{ expense.date }</td>
            <td>{ expense.title }</td>
            <td>{ expense.price }</td>
            <td>{ expense.currency }</td>
            <td>{ expense.category }</td>
            <td>
                <img src="images/edit.svg" alt="" onClick={ () => editExpense(expense.id) }/>
                <img src="images/delete.svg" alt="" onDoubleClick={ () => deleteExpense(expense.id) }/>
            </td>
        </tr>
    )
}