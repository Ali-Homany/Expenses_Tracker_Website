export default function ExpenseRow({ expense, editExpense, deleteExpense, style }) {
    return (
        <div className="row" style={ style }>
            <div>{ expense.date }</div>
            <div>{ expense.title }</div>
            <div>{ expense.price }</div>
            <div>{ expense.currency }</div>
            <div>{ expense.category }</div>
            <div>
                <img src="images/edit.svg" alt="" onClick={ () => editExpense(expense.id) }/>
                <img src="images/delete.svg" alt="" onDoubleClick={ () => deleteExpense(expense.id) }/>
            </div>
        </div>
    )
}