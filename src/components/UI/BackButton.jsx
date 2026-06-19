import { useNavigate } from 'react-router-dom';

export function BackButton({ to = -1, label = 'Atras' }) {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-ghost"
      style={{ gap: 8, padding: '10px 20px' }}
      onClick={() => navigate(to)}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M5 12l7-7M5 12l7 7" />
      </svg>
      {label}
    </button>
  );
}
export function HomeButton({ to = "/home", label = 'Ir a inicio', className="" }) {
  const navigate = useNavigate();
  return (
    <button
      className={`btn btn-ghost ${className}`}
      onClick={() => navigate(to)}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M5 12l7-7M5 12l7 7" />
      </svg>
      {label}
    </button>
  );
}

