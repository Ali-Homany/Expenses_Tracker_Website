export default function FiltersSideBar({ filters, categories, setFilters }) {
    return (
        <details className="filters-sidebar">
            <summary id="filters-trigger">Filters</summary>
            <div className="price_slider">
                <input type="range" name="min_price" id="min_price" min={0} max={1000000} value={filters.min_price} step={10} onChange={ (e) => setFilters({...filters, min_price: e.target.value}) }/>
                <p>min price: { filters.min_price }</p>
            </div>
            <div className="price_slider">
                <input type="range" name="max_price" id="max_price" min={0} max={1000000} value={filters.max_price} step={10} onChange={ (e) => setFilters({...filters, max_price: e.target.value}) }/>
                <p>max price: { filters.max_price }</p>
            </div>
            <select name="category" id="category" onChange={(e) => setFilters({...filters, 'category': e.target.value})}>
                <option value="">All</option>
                {
                categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))
                }

            </select>
            <input type="number" placeholder="year" name="year" id="year" step={1} min={2000} max={2100} onChange={ (e) => setFilters({...filters, 'year': e.target.value}) }/>
            <input type="number" placeholder="month" name="month" id="month" step={1} min={1} max={12} onChange={ (e) => setFilters({...filters, 'month': e.target.value}) }/>
        </details>
    )
}