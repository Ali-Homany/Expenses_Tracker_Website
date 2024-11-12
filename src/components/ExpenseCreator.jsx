export default function ExpenseCreator({ expenseDraft, setExpenseDraft, addExpense, isUpdateMode, updateExpense }) {
    return (
        <form onSubmit={ (e) => {if (isUpdateMode) {updateExpense(e)} else addExpense(e) }}>
            <input type="text" placeholder="expense title"  required maxLength={25} id="title" value={ expenseDraft.title } onChange={ (e) => setExpenseDraft({...expenseDraft, title: e.target.value }) }/>
            <div className="price_row">
                <input type="number" placeholder="price" min="1" required id="price" value={ expenseDraft.price } onChange={ (e) => setExpenseDraft({...expenseDraft, price: e.target.value }) }/>
                <select required id="currency" value={ expenseDraft.currency } onChange={ (e) => setExpenseDraft({...expenseDraft, currency: e.target.value }) }>
                    <option value="LL">LL</option>
                    <option value="$">$</option>
                </select>
                <input type="text" placeholder="category" required id="category" value={ expenseDraft.category } onChange={ (e) => setExpenseDraft({...expenseDraft, category: e.target.value }) }/>
            </div>
            <div className="date_row">
                <input type="number" placeholder="day" min="1" max="31" required id="day" value={ expenseDraft.date.split('-')[2] }
                onChange={ (e) => setExpenseDraft({...expenseDraft, date: `${expenseDraft.date.split('-')[0]}-${expenseDraft.date.split('-')[1]}-${e.target.value}` }) }/>
                <input type="number" placeholder="month" min="1" max="12" required id="month" value={ expenseDraft.date.split('-')[1] }
                onChange={ (e) => setExpenseDraft({...expenseDraft, date: `${expenseDraft.date.split('-')[0]}-${e.target.value}-${expenseDraft.date.split('-')[2]}` }) }/>
                <input type="number" placeholder="year" min="2000" required id="year" value={ expenseDraft.date.split('-')[0] }
                onChange={ (e) => setExpenseDraft({...expenseDraft, date: `${e.target.value}-${expenseDraft.date.split('-')[1]}-${expenseDraft.date.split('-')[2]}` }) }/>
            </div>
            <button type="submit" id="submit">{ isUpdateMode ? 'update' : 'create'}</button>
        </form>
    )
}