import React from 'react';

export default function GymList({ gyms, onSelect, onDelete }) {
  return (
    <ul style={{ padding: 0, listStyle: 'none' }}>
      {gyms.map(gym => (
        <li key={gym.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <button style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', color: '#2d3748' }} onClick={() => onSelect(gym)}>
            {gym.name}
          </button>
          <button style={{ marginLeft: 8, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onDelete(gym.id)} title="Delete">✕</button>
        </li>
      ))}
    </ul>
  );
}
