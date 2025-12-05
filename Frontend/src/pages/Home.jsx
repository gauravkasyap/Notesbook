import "./Home.css";
import { useState } from "react";
import Scroll from "../component/Scroll.jsx";

function Home() {
  const [SearchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="Home">
      <div className="Base">
        <h1 className="h1_Base">
          Your notes deserve more—learn, share, and grow
        </h1>
        <div onSubmit={handleSubmit} className="searchContainer">
          <input
            className="p_Base"
            type="text"
            placeholder="Search your notes..."
            value={SearchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="button_Base">Search</button>
        </div>
      </div>
        <Scroll />
    </div>
  );
}

export default Home;
