'use client';

export default function Counter({ action }: { action: () => Promise<void> }) {
  return (
    <form>
      <button
        formAction={() => {
          console.log('This is a client action hehe');
          action();
        }}
        className="px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-500"
      >
        Click me
      </button>
    </form>
  );
}
