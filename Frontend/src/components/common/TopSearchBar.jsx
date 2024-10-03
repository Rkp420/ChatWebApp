import "./TopSearchBar.css";

export default function TopSearchBar() {
  return (
    <>
      <div className="topbar">
        <div className="searchBar">
          <input className="searchInput" type="text" placeholder="Search" />
          <button className="searchIcon">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
    </>
  );
}
