import React, { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  return (
    <main className="card">
      <p className="tag">REACT JS · ASSIGNMENT 1</p>
      <h1>Counter and Text Box</h1>
      <section>
        <h2>Counter: {count}</h2>
        <button onClick={() => setCount(value => value + 1)}>Increase</button>
      </section>
      <hr />
      <section>
        <label htmlFor="user-text">Enter any text</label>
        <input id="user-text" type="text" value={text}
          onChange={event => setText(event.target.value)}
          placeholder="Type something..." />
        <div className="output"><strong>Entered text:</strong><p>{text || "Your text will appear here."}</p></div>
      </section>
    </main>
  );
}