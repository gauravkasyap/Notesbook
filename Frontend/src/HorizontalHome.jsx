// HorizontalHome.jsx
import { useRef } from "react";
import useHorizontalScroll from "./App.js"; // your hook
import Home from "./pages/Home.jsx";
import Second from "./pages/Second.jsx";
import Third from "./pages/Third.jsx";
import Forth from "./pages/Forth.jsx";
import Fifth from "./pages/Fifth.jsx";
import Last from "./pages/Footer.jsx";

export default function HorizontalHome() {
  const containerRef = useRef(null);
  const spacerRef = useRef(null);

  useHorizontalScroll(containerRef, spacerRef, {
    snap: true,
    snapDebounce: 250,
    snapDuration: 450,
    useFullHeight: true,
  });

  return (
    <>
      <div className="h-scroll fixed" ref={containerRef} aria-hidden="false">
        <section className="panel" id="home">
          <Home />
        </section>
        <section className="panel" id="second">
          <Second />
        </section>
        <section className="panel" id="third">
          <Third />
        </section>
        <section className="panel" id="forth">
          <Forth />
        </section>
        <section className="panel" id="fifth">
          <Fifth />
        </section>
      </div>

      <div className="spacer" ref={spacerRef} />

      <Last />
    </>
  );
}
