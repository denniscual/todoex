import { Configuration, OpenAIApi } from 'openai';
import { NextResponse } from 'next/server';
import { db, task } from '@/db';
import { sql } from 'drizzle-orm';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

/**
 * TODO:
 *
 * - fine tune the model to avoid doing destructive actions like dropping a table or moving a todo to another user. This is not good lol.
 * - add project model to the database and associate it with the user and task models.
 */
export async function POST(req: Request) {
  const { messages } = await req.json();

  messages[0].content = `${messages[0].content}. The query should be for user id 1. When retrieving todo/s, make sure to include the todo id.
   `;

  const response = await model.createChatCompletion({
    model: 'gpt-3.5-turbo-0613',
    messages,
    functions: functionsDefinitions,
    function_call: 'auto',
  });

  const message = response?.data?.choices?.[0]?.message;

  if (message?.function_call && message?.function_call.name && message.function_call.arguments) {
    const foundFunctions = functions[message.function_call.name];
    const functionArguments = JSON.parse(message.function_call.arguments);

    console.log(functionArguments);

    // We want the user to manually delete the todo. Due to this, we need to ask the user if they are sure they want to delete the todo.
    if (
      message?.function_call.name === 'ask_database' &&
      'action' in functionArguments &&
      functionArguments.action === 'DELETE'
    ) {
      const response = await model.createChatCompletion({
        model: 'gpt-3.5-turbo-0613',
        messages: [
          ...messages,
          message,
          {
            role: 'user',
            content:
              'Ask the user first if they are sure they want to delete the todo. You question should formal.',
          },
        ],
      });
      return NextResponse.json(response?.data?.choices[0].message?.content);
    }

    const functionResponse = await foundFunctions(functionArguments);
    const response = await model.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      messages: [
        ...messages,
        message,
        {
          role: 'function',
          name: message.function_call.name,
          content: functionResponse,
        },
      ],
    });
    return NextResponse.json(response?.data?.choices[0].message?.content);
  }

  return NextResponse.json(message?.content);
}

const functionsDefinitions: {
  name: string;
  description: string;
  parameters: object;
}[] = [
  {
    name: 'ask_database',
    description: 'Use this function to do a SQL query on the database.',
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
          `,
        },
        action: {
          type: 'string',
          description: 'Provide the SQL action type. Example: SELECT, INSERT, UPDATE, DELETE',
        },
      },
      required: ['query', 'action'],
    },
  },
];

const functions: Record<string, (args: any) => Promise<any>> = {
  ask_database,
};

async function ask_database({ query, action }: { query: string; action: string }) {
  console.log({
    query,
    action,
  });
  const data = await db.execute(sql.raw(query));
  return JSON.stringify(data.rows);
}

function createStringifyDbSchema() {
  const taskColumns = Object.values(task).map((column) => ({
    name: column.name,
    type: column.getSQLType(),
  }));

  const tables = [
    `Table (task):
   - table name (task),
   - table columns (${JSON.stringify(taskColumns)}})
  `,
  ];

  return tables.join(';');
}
