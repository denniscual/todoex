'use server';
import { Configuration, OpenAIApi } from 'openai';
import { db, task, Task } from '@/db';
import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

const FunctionHandlers = {
  searching: 'searching',
  creating: 'creating',
  updating: 'updating',
  deleting: 'deleting',
  suggesting: 'suggesting',
  dropping: 'dropping',
} as const;

/**
 * TODO:
 * - fine tune the function "createStringifyDbSchema". Sometimes the ai can't understand the generated table name and columns names.
 * - Increase or more fine tuning the model to avoid doing destructive actions like dropping a table or moving a todo to another user. I think
 *   for the fucntion that accepts a "MySQL query", we can blacklist some MySQL actions like DROP, DELETE, etc.
 * - add function defintion for handling couting and aggregating result. Make sure to add good function description to this
 *   to distinguish this function to "seaching" function. I think we can use the same function `ask_database` and call the `createChatCompletion`
 *   to pass message with role: "function" and append the `functionResponse` as the content. We let openai to generate the result for us and parse it by RSC.
 * - add project model to the database and associate it with the user and task models.
 */
export async function generate({ userId, messages }: { userId: string; messages: any[] }) {
  try {
    const response = await model.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages,
      functions: functionsDefinitions,
      function_call: 'auto',
    });

    const message = response?.data?.choices?.[0]?.message;

    if (message?.function_call && message?.function_call.name && message.function_call.arguments) {
      const functionName = message?.function_call.name as keyof typeof FunctionHandlers;
      const functionArguments = JSON.parse(message.function_call.arguments);
      const foundFunction = handlers[functionName];
      const functionResponse = await foundFunction({
        ...functionArguments,
        userId,
      });

      switch (functionName) {
        case FunctionHandlers.searching: {
          functionResponse;
          const { result, message } = functionResponse as InferHandlerReturnType<
            typeof functionName
          >;
          if (result.length === 0) {
            return {
              rsc: <div>I am sorry, but I could not find any todo list.</div>,
              message,
            };
          }
          return {
            rsc: (
              <ul>
                {result.map((row, idx) => (
                  <li key={row.id}>
                    <span className="font-medium">{idx + 1}.</span> Title: {row.title}
                  </li>
                ))}
              </ul>
            ),
            message,
          };
        }
        case FunctionHandlers.creating: {
          const { message } = functionResponse as InferHandlerReturnType<typeof functionName>;
          revalidatePath('/new-todo-list');
          return {
            message,
            rsc: <div>{message}</div>,
          };
        }
        case FunctionHandlers.updating: {
          const { message } = functionResponse as InferHandlerReturnType<typeof functionName>;
          revalidatePath('/new-todo-list');

          return {
            message,
            rsc: <div>{message}</div>,
          };
        }
        case FunctionHandlers.suggesting: {
          const { title, description, areThereDetailsNeededFromTheUser } =
            functionResponse as InferHandlerReturnType<typeof functionName>;

          if (areThereDetailsNeededFromTheUser) {
            return {
              message,
              rsc: <div>{description}</div>,
            };
          }
          return {
            message: `Suggested todo: Title = ${title}; Description = ${description}.`,
            rsc: (
              <div>
                <p>Ok, here is a suggestion:</p>
                <p>Title: {title}</p>
                <p>Description: {description}</p>
              </div>
            ),
          };
        }
        case FunctionHandlers.dropping: {
          return;
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

    return {
      message:
        'Apologies, but I am unable to understand your request. If you have a specific question or need assistance with your todo list, please let me know and I will be happy to help.',
      rsc: (
        <div>
          Apologies, but I am unable to understand your request. If you have a specific question or
          need assistance with your todo list, please let me know and I will be happy to help.
        </div>
      ),
    };
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

const tablesAllowedToOperate = ['"task"'];

const functionsDefinitions: {
  name: string;
  description: string;
  parameters: object;
}[] = [
  {
    name: FunctionHandlers.searching,
    description:
      'Use this function to do a MySQL SEARCH or MySQL update on the database. E.g querying or searching todos or updating todo. Or maybe doing filter.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `
          MySQL query extracting info to answer the user's question.
          MySQL should be written using this database schema:
          ${createStringifyDbSchema()}
          Make sure to check the appended db schema.
          These are the tables name: ${tablesAllowedToOperate.join(', ')}.
          Use the name of the tables to do the MySQL Search query.
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
    name: FunctionHandlers.creating,
    description: 'Use this function to do a MySQL INSERT on the database.',
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
    name: FunctionHandlers.updating,
    description: `Use this function to do a MySQL UPDATE on the database. E.g updating a todo or task, already done to a task, completing task, reopeining task, adding due date, etc. TAKE NOTE that this function will not move a task from other user.`,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `
          MySQL query extracting info to answer the user's question.
          MySQL should be written using this database schema:
          ${createStringifyDbSchema()}
          Make sure to check the appended db schema.
          The query should be returned in plain text, not in JSON. 
          Make sure to use the data from todos or tasks when creating a MySQL query. 
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
    name: FunctionHandlers.deleting,
    description: `Use this function to do a MySQL DELETE on the database. E.g deleting todo or task based on user input and criteria. TAKE NOTE that this function will not be used to DROP a table or database or a user.`,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: `
          MySQL query extracting info to answer the user's question.
          MySQL should be written using this database schema:
          ${createStringifyDbSchema()}
          The query should be returned in plain text, not in JSON. 
          Make sure to use the data from todos or tasks when creating a MySQL query. 
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
    name: FunctionHandlers.dropping,
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
  {
    name: FunctionHandlers.suggesting,
    description:
      'Use this function to do a todos or tasks suggestion. Give a meaningful suggestion to the user.',
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
        areThereDetailsNeededFromTheUser: {
          type: 'boolean',
          description: 'A flag to indicate if there are details needed from the user.',
        },
      },
      required: ['title', 'description', 'areThereDetailsNeededFromTheUser'],
    },
  },
];

//////////////////////////////////////////////
// Functions handlers
/////////////////////////////////////////////
const handlers = {
  [FunctionHandlers.searching]: searching,
  [FunctionHandlers.creating]: creating,
  [FunctionHandlers.updating]: updating,
  [FunctionHandlers.deleting]: deleting,
  [FunctionHandlers.suggesting]: suggesting,
  [FunctionHandlers.dropping]: dropping,
} as const;

async function searching({
  query,
  successMessage,
}: {
  query: string;
  successMessage: string;
}): Promise<{
  message: string;
  result: Task[];
}> {
  const data = await db.execute(sql.raw(query));
  return {
    message: successMessage,
    result: data.rows as Task[],
  };
}

async function creating({
  title,
  description,
  successMessage,
  userId,
}: {
  title: string;
  description: string;
  successMessage: string;
  userId: string;
}) {
  await db.insert(task).values({
    title,
    description,
    userId,
  });

  return {
    message: successMessage,
  };
}

async function updating({ query, successMessage }: { query: string; successMessage: string }) {
  await db.execute(sql.raw(query));
  return {
    message: successMessage,
  };
}

async function deleting(args: any) {
  return args;
}

async function dropping(args: any) {
  return args;
}

async function suggesting({
  title,
  description,
  successMessage,
  areThereDetailsNeededFromTheUser,
}: {
  title: string;
  description: string;
  successMessage: string;
  areThereDetailsNeededFromTheUser: boolean;
}) {
  return {
    message: successMessage,
    title,
    description,
    areThereDetailsNeededFromTheUser,
  };
}

export async function insertTaskById({
  title,
  description,
  id,
}: {
  title: string;
  description: string;
  id: string;
}) {
  await db.insert(task).values({
    title,
    description,
    userId: id,
  });
  revalidatePath('/dashboard');
}

type InferHandlerReturnType<F extends keyof typeof FunctionHandlers> = Awaited<
  ReturnType<(typeof handlers)[F]>
>;
