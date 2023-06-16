'use client';
import { useState, experimental_useEffectEvent as useEffectEvent } from 'react';

export default function UsersList() {
  const [users, setUsers] = useState(['zion', 'irish', 'dennis']);

  return (
    <div className="space-y-5">
      <ul className="space-y-3">
        {users.map((user, idx) => (
          <ListItem
            onDelete={(name) => {
              setUsers(users.filter((u) => u !== name));
            }}
            key={idx}
          >
            {user}
          </ListItem>
        ))}
      </ul>
    </div>
  );
}

function ListItem({ children, onDelete }: { children: string; onDelete?: (name: string) => void }) {
  const [text, setText] = useState('');

  return (
    <li className="p-2 border-b border-slate-300">
      <div>{children}</div>
      <div className="flex gap-4">
        <input
          className="border border-gray-300"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button className="p-2 text-white bg-red-400 rounded" onClick={() => onDelete?.(children)}>
          Delete
        </button>
      </div>
    </li>
  );
}
