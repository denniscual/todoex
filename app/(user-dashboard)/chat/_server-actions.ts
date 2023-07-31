'use server';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import {
  db,
  deleteTaskById,
  getProjectById,
  getUserProjects,
  getUserProjectTasks,
  task,
  Task,
  insertTask,
  Project,
  TaskWithProject,
} from '@/db';
import { sql } from 'drizzle-orm';
import { FunctionHandlers } from './_utils.shared';
import { revalidatePath } from 'next/cache';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

/**
 * TODO:
 *
 * - fix the Update problem in EditTask when this Component gets render in project intercepted route.
 *   The edit/mutation is working but it throws an error after mutation.
 * - create edit-task folder and then move all related Components including the EditTaskDialog and UserTaskDetails.
 * - change the spinning icon into ReloadIcon from radix in the instant loading state files.
 * - update the page content layout. We need to add max width for the content to avoid huge space in large viewport. Huge space is not good for the page content. Maybe
 *   in the future, some routes will require huge space. But for now, add max width for the page content.
 * - show a fallback Component while the UserButton or other Components are still loading. Right now, even using Suspense, it didn't suspend. Maybe we need to disable the SSR?
 *   Do a research regarding this. I think in the nectxjs docs there is a hint there.
 * - Review: make sure the pages like today will always get the latest data whenever the user navigates on it. This is related to nextjs client-caching.
 * - update the due date. I think we can make it to timestamp and add timezone. we can use UTC format.
 * - make the edit-task/status-select generic. All presentational ui can be generic
 * - add function defintion for handling couting and aggregating result. Make sure to add good function description to this
 *   to distinguish this function to "seaching" function. I think we can use the same function `ask_database` and call the `createChatCompletion`
 *   to pass message with role: "function" and append the `functionResponse` as the content. We let openai to generate the result for us and parse it by RSC.
 * - fine tune again the prompts like increase or more fine tuning the model to avoid doing destructive actions like dropping a table or moving a todo to another user. And also
 *   enhancing the prompts for better creation, updating task, suggesting todo, etc.
 * - add optimistic updates or maybe use 3rd party lib like react-hook-form to handle forms.
 * - improve typescript.
 * - use Zod to validate the form.
 */
async function generate({
  userId,
  messages,
  projectId,
}: {
  userId: string;
  projectId: Project['id'];
  messages: ChatCompletionRequestMessage[];
}) {
  const date = new Date().toISOString();
  const userProject = await getProjectById(projectId);

  if (!userProject) {
    throw new Error(`Project with an id ${projectId} is not found.`);
  }

  try {
    const [userTasks, userProjects] = await Promise.all([
      getUserProjectTasks(userId, projectId),
      getUserProjects(userId),
    ]);

    const functionsDefinitions = createFunctionsDefinitions({
      date,
    });

    const chatMessages: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: `You are an exceptional AI Task Assistant, embodying brilliance and intelligence. 
          Your role is to support users in their tasks, utilizing your genius-level AI capabilities. With vast knowledge and problem-solving skills,
          you provide insightful guidance and tailored prompts to optimize workflows, enhance productivity, and drive project success.`,
      },
      {
        role: 'user',
        content: `When assisting, make sure to use below information:
        1. Current user id: ${userId}.
        2. Current project id: ${projectId}.
        3. Project title = "${userProject.title}.
        4. Project description = "${userProject.description}.
        5. Current user projects: ${JSON.stringify(userProjects)}.
        6. Current user todos/tasks for a current project: ${JSON.stringify(
          mapTasksFieldsToDbFields(userTasks)
        )}.
        `,
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
          const { title, description, areThereDetailsNeededFromTheUser, message, dueDate } =
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
            : `Suggested todo: Title = ${title}; Description = ${description}. ${
                !!dueDate ? `Due date = ${dueDate}` : ''
              }.`;
          return {
            handler: functionName,
            result: {
              title,
              description,
              suggestMessage: message,
              message: _message,
              areThereDetailsNeededFromTheUser,
              dueDate,
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
    console.log('Error when generating response: ', (err as Error).toString());
    throw new Error('Server error');
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

function createFunctionsDefinitions({ date }: { date: string }) {
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
          The current date is ${date} in UTC format. Use this date if the user's question includes a relative date.
          E.g "Get my todos today". We are going to use the current date to get all todos where the due date is set today.
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
          The current date is ${date} in UTC format. Use this date if the user's question includes a relative date.
          This function can only add 1 task a time.
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
            description:
              'The due date of the todo. Make sure the value is compatible to Mysql date type. The field is optional.',
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
          The current date is ${date} in UTC format. Use this date if the user's question includes a relative date.
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
            description:
              'The id of the todo or task to be deleted. Make sure it is not undefined or not null.',
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
          The current date is ${date} in UTC format. Use this date if the user's question includes a relative date.
          Be creative and clever when creating the title and description.
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
            description:
              'The due date of the todo. Make sure the value is compatible to Mysql date type. This field is optional.',
          },
          successMessage: {
            type: 'string',
            description: `Provide the possible success message for the user. When using creating this message if there is a suggested task, no need  or avoid adding the title, description, and due date.
            E.g "Ok, here is the suggested task:" or "Allow me to introduce the suggested task at this moment:" No need the title, description, and due date..
            `,
          },
          areThereDetailsNeededFromTheUser: {
            type: 'boolean',
            description: 'A flag to indicate if there are details needed from the user.',
          },
        },
        required: ['title', 'description', 'areThereDetailsNeededFromTheUser', 'successMessage'],
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
  projectId: Project['id'];
}) {
  await insertTask({
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
  dueDate?: string;
}) {
  return {
    message: successMessage,
    title,
    description,
    areThereDetailsNeededFromTheUser,
    dueDate,
  };
}
export type SuggestingReturnType = Awaited<ReturnType<typeof suggesting>>;

type InferHandlerReturnType<F extends keyof typeof FunctionHandlers> = Awaited<
  ReturnType<(typeof handlers)[F]>
>;

function mapTasksFieldsToDbFields(tasks: TaskWithProject[]) {
  // TODO:
  // - don't manually map the fields.
  return tasks.map((task) => ({
    id: task.id,
    user_id: task.userId,
    created_at: task.createdAt,
    due_date: task.dueDate,
    status: task.status,
    title: task.title,
    description: task.description,
    project_id: task.projectId,
  }));
}

export const generateResponseAction: typeof generate = async ({ userId, projectId, messages }) => {
  'use server';

  const res = await generate({
    userId,
    projectId,
    messages,
  });

  revalidatePath('/today');

  return res;
};
