import { Configuration, OpenAIApi } from 'openai';
import { NextResponse } from 'next/server';
import { db, task, user } from '@/db';
import { sql } from 'drizzle-orm';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

export async function POST(req: Request) {
  const { messages } = await req.json();

  messages[0].content = `${messages[0].content}. The query should be for user id 1.`;

  const response = await model.createChatCompletion({
    model: 'gpt-3.5-turbo-0613',
    messages,
    functions: functionsDefinitions,
    function_call: 'auto',
  });

  const message = response?.data?.choices?.[0]?.message;

  if (message?.function_call && message?.function_call.name && message.function_call.arguments) {
    const foundFunctions = functions[message.function_call.name];
    const functionResponse = await foundFunctions(JSON.parse(message.function_call.arguments));

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

    const answer = response?.data?.choices[0].message;

    // return NextResponse.json({
    //   content: answer?.content,
    //   data: functionResponse,
    // });

    return NextResponse.json(answer?.content);
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
      },
      required: ['query'],
    },
  },
];

const functions: Record<string, (args: any) => Promise<any>> = {
  ask_database,
  create_user_task,
};

async function ask_database({ query }: { userId: string; query: string }) {
  console.log({
    query,
  });
  const data = await db.execute(sql.raw(query));
  return JSON.stringify(data.rows);
}

async function create_user_task({
  userId,
  title,
  description,
}: {
  userId: string;
  title: string;
  description: string;
}) {
  const newTask = {
    userId: parseInt(userId),
    title,
    description,
  };
  await db.insert(task).values(newTask);
  return JSON.stringify(newTask);
}

function createStringifyDbSchema() {
  const tables = [
    `Table (task):
   - table name (task),
   - table columns (${Object.values(task).map((column) => column.name)})
  `,
    `Table (user):
   - table name (user),
   - table columns (${Object.values(task).map((column) => column.name)})
  `,
  ];

  return tables.join(';');
}
