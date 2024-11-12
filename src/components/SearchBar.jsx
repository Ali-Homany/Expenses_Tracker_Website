export default function SearchBar({ searchQuery, setSearchQuery }) {
    return (
        <div className="searchBlock">
            <input type="text" placeholder="search by title" id="search" value={ searchQuery } onChange={ (e) => setSearchQuery(e.target.value) }/>
            {/* <div className="btnSearch">
                <button onClick="setSearchMode(this.innerHTML)" id="searchTitle">search by title</button>
                <button onClick="setSearchMode(this.innerHTML)" id="searchCategory">search by category</button>
            </div> */}
        </div>
    )
}