'use server';
import { Configuration, OpenAIApi } from 'openai';
import {
  db,
  deleteTaskById,
  getUserProjects,
  getUserTasksByProjectId,
  Project,
  task,
  Task,
} from '@/db';
import { sql } from 'drizzle-orm';
import { FunctionHandlers } from './_utils.shared';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

/**
 * TODO:
 *
 * - when suggesting a task, make sure to capture the dueDate if the user includes deadline.
 * - utilize data fetching using Suspense like make it parallel as much as possible or maybe we can do preload.
 *   Check/review nextjs or reactjs docs about utilization.
 * - use Zod to validate the arguments.
 * - add project model to the database and associate it with the user and task models.
 * - fine tune the function "createStringifyDbSchema". Sometimes the ai can't understand the generated table name and columns names.
 * - Increase or more fine tuning the model to avoid doing destructive actions like dropping a table or moving a todo to another user. I think
 *   for the fucntion that accepts a "MySQL query", we can blacklist some MySQL actions like DROP, DELETE, etc.
 * - add function defintion for handling couting and aggregating result. Make sure to add good function description to this
 *   to distinguish this function to "seaching" function. I think we can use the same function `ask_database` and call the `createChatCompletion`
 *   to pass message with role: "function" and append the `functionResponse` as the content. We let openai to generate the result for us and parse it by RSC.
 * - improve typescript.
 */
export async function generate({
  userId,
  messages,
  projectId,
}: {
  userId: string;
  projectId: number;
  messages: any[];
}) {
  const date = new Date().toISOString();

  try {
    const userTasks = await getUserTasksByProjectId(userId, projectId);
    const userProjects = await getUserProjects(userId);
    const functionsDefinitions = createFunctionsDefinitions(date);

    const chatMessages = [
      {
        role: 'system',
        content: `You are friendly and clever AI Assistant assisting a user with their tasks. The current user id is: ${userId}. The current project id is: ${projectId}`,
      },
      {
        role: 'user',
        content: `Here are the current user todos/tasks for a current project: ${JSON.stringify(
          mapTasksFieldsToDbFields(userTasks)
        )}. Here are the current user projects: ${JSON.stringify(userProjects)}.`,
      },
      ...messages,
    ];

    const response = await model.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: chatMessages,
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
        projectId,
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
          const { message } = functionResponse as InferHandlerReturnType<typeof functionName>;
          return {
            handler: functionName,
            result: {
              message,
            },
          };
        }
        case FunctionHandlers.suggesting: {
          const { title, description, areThereDetailsNeededFromTheUser, message } =
            functionResponse as InferHandlerReturnType<typeof functionName>;

          if (!title && !description) {
            return {
              result: {
                message: `Apologies, but I am unable to understand your request. If you have a specific question or need assistance with your todo list, please let me know and I will be happy to help.`,
              },
            };
          }

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
          message?.content ??
          `Apologies, but I am unable to understand your request. If you have a specific question or need assistance with your todo list, please let me know and I will be happy to help.`,
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
  const taskColumns = Object.values(task).map((column) => {
    return `[${column.name}, ${column.getSQLType()}, ${
      column.notNull ? 'Not Nullable' : ' Nullable'
    }]`;
  });

  const tables = [
    `
      Table: task
      Columns: [ ${taskColumns.join(', ')} ]
    `,
  ];

  return tables;
}

function createFunctionsDefinitions(date: string) {
  const now = new Date();
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
          The query should be returned in plain text, not in JSON. 
          The user current date is ${date} in UTC format. Use this date if the user's question is using a relative date.
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
      description: `
          Use this function to do a MySQL INSERT on the database.
          The current date is ${date} in UTC format. Use this date if the user's question is using a relative date.
      `,
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
          dueDate: {
            type: 'string',
            description: 'The due date of the todo.',
          },
          projectId: {
            type: 'number',
            description: 'The project id of the todo.',
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
          The query should be returned in plain text, not in JSON. 
          Make sure to use the data from todos or tasks when creating a MySQL query. 
          The current date is ${date} in UTC format. Use this date if the user's question is using a relative date.
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
          id: {
            type: 'number',
            description: 'The id of the todo or task to be deleted.',
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
      description: `Use this function to do a todos or tasks suggestion. Give a meaningful suggestion to the user.
          The current date is ${date} in UTC format. Use this date if the user's question is using a relative date.
        `,
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
          dueDate: {
            type: 'string',
            description: 'A due date / deadline of a todo or task that is converted to UTC.',
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
  return functionsDefinitions;
}

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
  dueDate,
  projectId,
}: {
  title: string;
  description: string;
  successMessage: string;
  userId: string;
  dueDate?: string;
  projectId: number;
}) {
  console.log({
    userId,
    projectId,
  });
  await db.insert(task).values({
    title,
    description,
    userId,
    dueDate,
    projectId,
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

async function deleting({ id, successMessage }: { id: number; successMessage: string }) {
  await deleteTaskById(id);
  return {
    message: successMessage,
  };
}
export type DeletingReturnType = Awaited<ReturnType<typeof deleting>>;

async function dropping({ successMessage }: { successMessage: string }) {
  return {
    message: successMessage,
  };
}
export type DroppingReturnType = Awaited<ReturnType<typeof dropping>>;

async function suggesting({
  title,
  description,
  successMessage,
  areThereDetailsNeededFromTheUser,
  dueDate,
}: {
  title: string;
  description: string;
  successMessage: string;
  areThereDetailsNeededFromTheUser: boolean;
  dueDate: string;
}) {
  console.log({
    dueDate,
  });
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

function mapTasksFieldsToDbFields(tasks: Task[]) {
  // TODO:
  // - don't manually map the fields.
  return tasks.map((task) => ({
    id: task.id,
    user_id: task.userId,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    due_date: task.dueDate,
    status: task.status,
    title: task.title,
    description: task.description,
    project_id: task.projectId,
  }));
}
