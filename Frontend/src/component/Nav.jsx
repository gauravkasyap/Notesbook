import "./Nav.css";
import { Link } from "react-router-dom";

function Nav() {
  return (
    <div className="nav">

      {/* VEHICLES  */}
      <div className="NAV-details">
         <Link to="/" className="nav-link">Home</Link>
      </div>

      {/* SHOPPING TOOL */}
      <div className="NAV-details">
        <h4>SHOPPING</h4>
        <ul className="NAV-details-ul2">
          <li className="NAV1-li2">
            The devil’s in the details. A classic Hellcat badge...
          </li>
          <li className="NAV1-li2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit...
          </li>
          <li className="NAV1-li2">
            Cumque ad veniam repellat quo molestiae reprehenderit...
          </li>
          <li className="NAV1-li2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit...
          </li>
          <li className="NAV1-li2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit...
          </li>
        </ul>
      </div>

      {/* DODGE MUSCLE */}
      <div className="NAV-details">
        <h4>DODGE</h4>
        <ul className="NAV-details-ul3">
          <div className="div-li3">
            <li className="NAV1-li3">Hellcat</li>
            <li className="NAV1-li3">Hellcat</li>
            <li className="NAV1-li3">Hellcat</li>
            <li className="NAV1-li3">Hellcat</li>
          </div>
        </ul>
      </div>

      {/* OWNER */}
      <div className="NAV-details">
        <Link to="/favorite" className="nav-link">Favorites</Link>
      </div>
    </div>
  );
}

export default Nav;
