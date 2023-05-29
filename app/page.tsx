import ClientForm from './client-form';

export default async function Home() {
  console.log('Render home');

  return (
    <div className="space-y-6">
      <div>Add User</div>
      <ClientForm
        action={async (formData: FormData) => {
          'use server';
          const data = Object.fromEntries(formData.entries());
          // create errors object based on the data. if no errors, then return null
          const errors: any = {};
          if (!data.name) errors.name = 'Name is required.';
          if (!data.age) errors.age = 'Age is required.';

          if (Object.keys(errors).length) {
            return <div>Validation error</div>;
          }

          return <div>Successfull post!</div>;
        }}
      />
    </div>
  );
}
