import React, { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";

function FormPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  function submitForm(event) {
    event.preventDefault();
    navigate("/details", { state: { name, city } });
  }

  return <main className="card">
    <p className="tag">REACT JS · ASSIGNMENT 2 · PAGE 1</p>
    <h1>Name and City Form</h1>
    <form onSubmit={submitForm}>
      <label htmlFor="name">Name</label>
      <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
      <label htmlFor="city">City</label>
      <input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter your city" required />
      <button type="submit">Submit</button>
    </form>
  </main>;
}

function DetailsPage() {
  const { state } = useLocation();
  return <main className="card">
    <p className="tag">REACT JS · ASSIGNMENT 2 · PAGE 2</p>
    <h1>Submitted Details</h1>
    {state?.name && state?.city ? <>
      <div className="detail"><strong>Name</strong><p>{state.name}</p></div>
      <div className="detail"><strong>City</strong><p>{state.city}</p></div>
    </> : <p>Please go back to Page 1 and submit your details.</p>}
    <Link className="button-link" to="/">← Back to Form</Link>
  </main>;
}

export default function App() {
  return <Routes><Route path="/" element={<FormPage />} /><Route path="/details" element={<DetailsPage />} /></Routes>;
}