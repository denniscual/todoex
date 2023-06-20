import { Configuration, OpenAIApi } from 'openai';
import { NextResponse } from 'next/server';
import { db, task } from '@/db';
import { sql, eq } from 'drizzle-orm';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

/**
 * TODO:
 *
 * - Increase or more fine tuning the model to avoid doing destructive actions like dropping a table or moving a todo to another user. I think
 *   for the fucntion that accepts a "SQL query", we can blacklist some SQL actions like DROP, DELETE, etc.
 * - the initial todos come from all the users. Make sure to only get the todos of the current user.
 * - use server actions for the chat.
 * - add project model to the database and associate it with the user and task models.
 */
export async function POST(req: Request) {
  const { messages } = await req.json();

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
    const foundFunctions = functionsHandlers[message.function_call.name];
    const functionArguments = JSON.parse(message.function_call.arguments);
    const functionResponse = await foundFunctions(functionArguments);

    console.log({
      ...functionResponse,
      functionName: message?.function_call.name,
    });

    return NextResponse.json({
      message: functionArguments.successMessage,
      data: functionResponse,
    });
  }

  return NextResponse.json({
    message: `Apologies, but I am unable to undertand your request. If you have a specific question or need assistance with your todo list, please let me know and I'll be happy to help.`,
  });
}

//////////////////////////////////////////////
// Functions definitions
/////////////////////////////////////////////
function createStringifyDbSchema() {
  const taskColumns = Object.values(task).map((column) => ({
    name: column.name,
    type: column.getSQLType(),
    isNull: !column.notNull,
  }));

  const tables = [
    `create table task (
      table columns ${JSON.stringify(taskColumns)}"
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
      },
      required: ['title'],
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

async function searching({ query }: { query: string; successMessage: string }) {
  const data = await db.execute(sql.raw(query));
  return {
    result: JSON.stringify(data.rows),
  };
}

async function creating(args: any) {
  return args;
}

async function updating(args: any) {
  return args;
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
