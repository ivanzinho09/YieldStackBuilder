import { Link } from 'react-router-dom';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="logo text-display">
        <div className="logo-mark"></div>
        YIELD_STACK_BUILDER
        <span className="version-badge">V.1.0</span>
      </div>
      <nav className="nav">
        <a href="#">Protocols</a>
        <a href="#">Strategies</a>
        <a href="#">Risk Analysis</a>
        <a href="#">Docs</a>
      </nav>
      <Link to="/builder/step-1" className="btn-main">Launch App</Link>
    </header>
  );
}
