'use server';
import { Configuration, OpenAIApi } from 'openai';
import { db, task } from '@/db';
import { sql, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

/**
 * TODO:
 * - fine tune the function "createStringifyDbSchema". Sometimes the ai can't understand the generated table name and columns names.
 * - Increase or more fine tuning the model to avoid doing destructive actions like dropping a table or moving a todo to another user. I think
 *   for the fucntion that accepts a "SQL query", we can blacklist some SQL actions like DROP, DELETE, etc.
 * - the initial todos come from all the users. Make sure to only get the todos of the current user.
 * - add project model to the database and associate it with the user and task models.
 */
export async function generate(messages: any[]) {
  try {
    // TODO: We can add this initial message in the frontend. The user id should be the current user.
    const userTodos = await db.select().from(task).where(eq(task.userId, 1));
    const initialMessage = {
      role: 'user',
      content: `Here are the current user todos: ${JSON.stringify(userTodos)}`,
    };

    const response = await model.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: [initialMessage, ...messages],
      functions: functionsDefinitions,
      function_call: 'auto',
    });

    const message = response?.data?.choices?.[0]?.message;

    if (message?.function_call && message?.function_call.name && message.function_call.arguments) {
      const functionName = message?.function_call.name;
      const foundFunctions = functionsHandlers[message.function_call.name];
      const functionArguments = JSON.parse(message.function_call.arguments);
      const functionResponse = await foundFunctions(functionArguments);

      switch (functionName) {
        case 'searching': {
          const { result } = functionResponse as {
            result: any[];
          };
          if (result.length === 0) {
            return <div>I am sorry, but I could not find any todo list.</div>;
          }
          return (
            <ul>
              {result.map((row, idx) => (
                <li key={row.id}>
                  <span className="font-medium">{idx + 1}.</span> Title: {row.title}
                </li>
              ))}
            </ul>
          );
        }
        case 'creating': {
          const { message } = functionResponse as {
            message: string;
          };
          revalidatePath('/new-todo-list');
          return <div>{message}</div>;
        }
        case 'updating': {
          const { message } = functionResponse as {
            message: string;
          };
          revalidatePath('/new-todo-list');
          return <div>{message}</div>;
        }
        // TODO:
        // handle this case. This will throw an error in the frontend.
        default: {
          return {
            message: functionArguments.successMessage,
            data: functionResponse,
          };
        }
      }
    }

    return (
      <div>
        Apologies, but I am unable to understand your request. If you have a specific question or
        need assistance with your todo list, please let me know and I will be happy to help.
      </div>
    );
  } catch (err) {
    throw err;
  }
}

//////////////////////////////////////////////
// Functions definitions
/////////////////////////////////////////////
function createStringifyDbSchema() {
  const taskColumns = Object.values(task).map((column) => ({
    columnName: column.name,
    columnType: column.getSQLType(),
    isNull: !column.notNull,
  }));

  const tables = [
    `create table task (
      table columns for table "task" ${JSON.stringify(taskColumns)}"
    )
  `,
  ];

  return tables;
}

const tablesAllowedToOperate = ['task'];

const functionsDefinitions: {
  name: string;
  description: string;
  parameters: object;
}[] = [
  {
    name: 'searching',
    description:
      'Use this function to do a SQL SEARCH or SQL update on the database. E.g querying or searching todos or updating todo. Or maybe doing filter.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `
          SQL query extracting info to answer the user's question.
          SQL should be written using this database schema:
          ${createStringifyDbSchema()}
          Make sure to check the appended db schema.
          These are the tables name: ${tablesAllowedToOperate.join(', ')}.
          Use the name of the tables to do the SQL Search query.
          The query should be returned in plain text, not in JSON. 
          `,
        },
        successMessage: {
          type: 'string',
          description: 'Provide the possible success message for the user.',
        },
      },
      required: ['query', 'successMessage'],
    },
  },
  {
    name: 'creating',
    description: 'Use this function to do a SQL INSERT on the database.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the todo.',
        },
        description: {
          type: 'string',
          description: 'The description of the todo.',
        },
        successMessage: {
          type: 'string',
          description: 'Provide the possible success message for the user.',
        },
      },
      required: ['title', 'successMessage'],
    },
  },
  {
    name: 'suggesting',
    description: 'Use this function to do a todos or tasks suggestion.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the todo.',
        },
        description: {
          type: 'string',
          description: 'The description of the todo.',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'updating',
    description: `Use this function to do a SQL UPDATE on the database. E.g updating a todo or task, already done to a task, completing task, reopeining task, adding due date, etc. TAKE NOTE that this function will not move a task from other user.`,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `
          SQL query extracting info to answer the user's question.
          SQL should be written using this database schema:
          ${createStringifyDbSchema()}
          Make sure to check the appended db schema.
          The query should be returned in plain text, not in JSON. 
          Make sure to use the data from todos or tasks when creating a SQL query. 
          `,
        },
        successMessage: {
          type: 'string',
          description: 'Provide the possible success message for the user.',
        },
      },
      required: ['query', 'successMessage'],
    },
  },
  {
    name: 'deleting',
    description: `Use this function to do a SQL DELETE on the database. E.g deleting todo or task based on user input and criteria. TAKE NOTE that this function will not be used to DROP a table or database or a user.`,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `
          SQL query extracting info to answer the user's question.
          SQL should be written using this database schema:
          ${createStringifyDbSchema()}
          The query should be returned in plain text, not in JSON. 
          Make sure to use the data from todos or tasks when creating a SQL query. 
          `,
        },
        successMessage: {
          type: 'string',
          description: 'Provide the possible success message for the user.',
        },
      },
      required: ['query', 'successMessage'],
    },
  },
  {
    name: 'dropping',
    description: 'Use this function for dropping or deleting or removing table or database.',
    parameters: {
      type: 'object',
      properties: {
        successMessage: {
          type: 'string',
          description:
            'Dropping or deleting or removing is not allowed. Create a message for the user to inform them that dropping is not allowed.',
        },
      },
      required: ['successMessage'],
    },
  },
];

//////////////////////////////////////////////
// Functions handlers
/////////////////////////////////////////////
const functionsHandlers: Record<string, (args: any) => Promise<any>> = {
  searching,
  creating,
  updating,
  deleting,
  suggesting,
  dropping,
};

async function searching({ query, successMessage }: { query: string; successMessage: string }) {
  const data = await db.execute(sql.raw(query));
  return {
    message: successMessage,
    result: data.rows,
  };
}

async function creating({
  title,
  description,
  successMessage,
}: {
  title: string;
  description: string;
  successMessage: string;
}) {
  await db.insert(task).values({
    title,
    description,
    userId: 1,
  });

  return {
    message: successMessage,
  };
}

async function updating({ query, successMessage }: { query: string; successMessage: string }) {
  console.log({ query });
  await db.execute(sql.raw(query));
  return {
    message: successMessage,
  };
}

async function deleting(args: any) {
  return args;
}

async function suggesting(args: any) {
  return args;
}

async function dropping(args: any) {
  return args;
}
