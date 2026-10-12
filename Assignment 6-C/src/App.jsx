import React, { useState } from "react";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  function addTask(event) {
    event.preventDefault();
    const value = task.trim();
    if (!value) return;
    setTasks(current => [...current, { id: Date.now() + Math.random(), text: value, completed: false }]);
    setTask("");
  }

  function toggleTask(id) {
    setTasks(current => current.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  }

  function deleteTask(id) {
    setTasks(current => current.filter(item => item.id !== id));
  }

  return <main className="card">
    <p className="tag">REACT JS · ASSIGNMENT 3</p>
    <h1>To-Do List</h1>
    <p className="subtitle">Add your daily tasks and track your progress.</p>
    <form onSubmit={addTask} className="task-form">
      <label htmlFor="task">New task</label>
      <div className="input-row">
        <input id="task" value={task} onChange={e => setTask(e.target.value)} placeholder="e.g. Complete homework" />
        <button type="submit">Add Task</button>
      </div>
    </form>
    {tasks.length === 0 ? <p className="empty">No tasks yet. Add your first task above.</p> :
      <ul>{tasks.map(item => <li key={item.id}>
        <label className={`task ${item.completed ? "done" : ""}`}>
          <input type="checkbox" checked={item.completed} onChange={() => toggleTask(item.id)} />
          <span>{item.text}</span>
        </label>
        <button type="button" className="delete" onClick={() => deleteTask(item.id)}>Delete</button>
      </li>)}</ul>}
    <p className="summary">{tasks.filter(item => item.completed).length} of {tasks.length} tasks completed</p>
  </main>;
}