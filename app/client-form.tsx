'use client';
import { useState } from 'react';

export default function ClientForm({ action }: any) {
  const [postRes, setPostRes] = useState(null);

  return (
    <form
      action={async (formData) => {
        try {
          const res = await action(formData);
          setPostRes(res);
        } catch (error) {
          console.log('Client error');
          // console.log('This is the error:', JSON.parse((error as Error).message));
        }
      }}
      className="space-y-4"
    >
      <Counter />
      <div className="space-y-2">
        <label className="block">
          Name <input className="border" type="text" name="name" />
        </label>
        {/* {errors?.name && <span className="block text-xs text-red-500">{errors.name}</span>} */}
      </div>
      <div className="space-y-2">
        <label className="block">
          Age <input className="border" type="text" name="age" />
        </label>
        {/* {errors?.age && <span className="block text-xs text-red-500">{errors.age}</span>} */}
      </div>
      <button className="px-2 py-2 text-white bg-blue-500 rounded">Add User</button>
      {postRes}
    </form>
  );
}

function Counter() {
  const [counter, setCounter] = useState(0);

  return (
    <button
      type="button"
      onClick={() => {
        setCounter(counter + 1);
      }}
    >
      Increment {counter}
    </button>
  );
}
