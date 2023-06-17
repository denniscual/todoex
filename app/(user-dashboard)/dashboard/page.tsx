import { User, db, users } from '@/db';
import { revalidatePath } from 'next/cache';
import FormLoader from './_form-loader';

export const runtime = 'edge';

export default async function Dashboard() {
  const allUsers = await db.select().from(users);

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <h2 className="font-medium">Users</h2>
        <ul>
          {allUsers.map((user) => (
            <li key={user.id}>
              {user.name} - {user.age}
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="font-medium">Add User</h2>
        <form
          className="flex flex-col items-start gap-3"
          action={async (formData) => {
            'use server';
            const values = Object.fromEntries(formData.entries());
            await db.insert(users).values({
              name: values.name,
              age: parseInt(values.age as string),
            } as User);

            revalidatePath('/dashboard');
          }}
        >
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 ">
              First name
            </label>
            <input
              type="text"
              name="name"
              className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="E.g John Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="age" className="block mb-2 text-sm font-medium text-gray-900 ">
              Age
            </label>
            <input
              type="number"
              name="age"
              className="bg-gray-50 border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
              placeholder="E.g 20"
            />
          </div>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>{' '}
          <FormLoader />
        </form>
      </section>
    </div>
  );
}
