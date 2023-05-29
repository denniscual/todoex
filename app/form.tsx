import { cookies } from 'next/headers';

export default function Form({ validation, revalidate, action, children, id }: any) {
  let errors = null;

  const _formId = `${id}_errors`;
  const formErrors = cookies().get(_formId)?.value;

  if (formErrors) {
    errors = JSON.parse(formErrors);
  }

  async function handleFormAction(formData: FormData) {
    'use server';
    const errors = await validation(formData);
    if (Object.keys(errors).length) {
      setErrors(errors, id);
    } else {
      try {
        await action(formData);
      } catch (err) {
        console.error(`Mutation error from ${id}: ${(err as Error).message}`);
        return {
          errors: {},
        };
      }
    }

    revalidate();
  }

  return children({ errors, action: handleFormAction });
}

function setErrors(err: { [key: string]: string }, formId: string) {
  cookies().set(`${formId}_errors`, JSON.stringify(err));
}
