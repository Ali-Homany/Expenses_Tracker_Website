export default function SearchBar({ searchQuery, setSearchQuery }) {
    return (
        <div className="searchBlock">
            <input type="text" placeholder="search by title" id="search" value={ searchQuery } onChange={ (e) => setSearchQuery(e.target.value) }/>
        </div>
    )
}