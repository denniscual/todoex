'use server';
import { Configuration, OpenAIApi } from 'openai';
import { db, task, Task } from '@/db';
import { sql } from 'drizzle-orm';
import { FunctionHandlers } from './_utils.shared';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

function foo() {
  return 'im string' as any as boolean;
}

/**
 * TODO:
 * - Handle "deleting" and "dropping" functions on both server and client.
 * - handle dates. When interacting with AI, we need to explicitly tell the AI that that suggested dates are RELATIVE TO THE CURRENT DATE.
 * - when doing a suggesting, if the user will tell a date like "suggest a task for tomorrow", it would be good that we can also generate the date based on the users query.
 *   Just make sure that the date type matches the due date column type in the DB.
 * - add project model to the database and associate it with the user and task models.
 * - fine tune the function "createStringifyDbSchema". Sometimes the ai can't understand the generated table name and columns names.
 * - Increase or more fine tuning the model to avoid doing destructive actions like dropping a table or moving a todo to another user. I think
 *   for the fucntion that accepts a "MySQL query", we can blacklist some MySQL actions like DROP, DELETE, etc.
 * - add function defintion for handling couting and aggregating result. Make sure to add good function description to this
 *   to distinguish this function to "seaching" function. I think we can use the same function `ask_database` and call the `createChatCompletion`
 *   to pass message with role: "function" and append the `functionResponse` as the content. We let openai to generate the result for us and parse it by RSC.
 * - improve typescript.
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
          const { rows, message } = functionResponse as InferHandlerReturnType<typeof functionName>;
          return {
            handler: functionName,
            result: {
              message,
              rows,
            },
          };
        }
        case FunctionHandlers.creating: {
          const { message } = functionResponse as InferHandlerReturnType<typeof functionName>;
          return {
            handler: functionName,
            result: {
              message,
            },
          };
        }
        case FunctionHandlers.updating: {
          const { message } = functionResponse as InferHandlerReturnType<typeof functionName>;
          return {
            handler: functionName,
            result: {
              message,
            },
          };
        }
        case FunctionHandlers.deleting: {
          const { message } = functionResponse as InferHandlerReturnType<typeof functionName>;
          return {
            handler: functionName,
            result: {
              message,
            },
          };
        }
        case FunctionHandlers.dropping: {
          return {
            handler: functionName,
            result: {
              message: functionArguments.successMessage as string,
            },
          };
        }
        case FunctionHandlers.suggesting: {
          const { title, description, areThereDetailsNeededFromTheUser, message } =
            functionResponse as InferHandlerReturnType<typeof functionName>;
          const _message = areThereDetailsNeededFromTheUser
            ? message
            : `Suggested todo: Title = ${title}; Description = ${description}.`;
          return {
            handler: functionName,
            result: {
              title,
              description,
              message: _message,
              areThereDetailsNeededFromTheUser,
            },
          };
        }
        // TODO:
        // - handle here the "deleting" and "dropping"
        default: {
          return {
            handler: functionName,
            result: {
              message: functionArguments.successMessage as string,
            },
          };
        }
      }
    }

    return {
      result: {
        message:
          'Apologies, but I am unable to understand your request. If you have a specific question or need assistance with your todo list, please let me know and I will be happy to help.',
      },
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
  [FunctionHandlers.dropping]: dropping,
  [FunctionHandlers.suggesting]: suggesting,
} as const;

async function searching({
  query,
  successMessage,
}: {
  query: string;
  successMessage: string;
}): Promise<{
  message: string;
  rows: Task[];
}> {
  const data = await db.execute(sql.raw(query));
  return {
    message: successMessage,
    rows: data.rows as Task[],
  };
}
export type SearchingReturnType = Awaited<ReturnType<typeof searching>>;

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
export type CreatingReturnType = Awaited<ReturnType<typeof creating>>;

async function updating({ query, successMessage }: { query: string; successMessage: string }) {
  await db.execute(sql.raw(query));
  return {
    message: successMessage,
  };
}
export type UpdatingReturnType = Awaited<ReturnType<typeof updating>>;

async function deleting(args: any) {
  return args;
}
export type DeletingReturnType = Awaited<ReturnType<typeof deleting>>;

async function dropping(args: any) {
  return args;
}
export type DroppingReturnType = Awaited<ReturnType<typeof dropping>>;

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
export type SuggestingReturnType = Awaited<ReturnType<typeof suggesting>>;

type InferHandlerReturnType<F extends keyof typeof FunctionHandlers> = Awaited<
  ReturnType<(typeof handlers)[F]>
>;
