import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

export default function Dashboard() {
  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <h1>LTI ATS</h1>
        <p className="dashboard__subtitle">Recruiter dashboard</p>
      </header>

      <section className="dashboard__content">
        <p>Manage candidates and track your hiring pipeline.</p>
        <Link to="/candidates/new" className="btn btn--primary dashboard__cta">
          Add candidate
        </Link>
      </section>
    </main>
  );
}
