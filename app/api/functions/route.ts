import { Configuration, OpenAIApi } from 'openai';
import { NextResponse } from 'next/server';
import { db, task } from '@/db';
import { eq } from 'drizzle-orm';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const model = new OpenAIApi(configuration);

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await model.createChatCompletion({
    model: 'gpt-3.5-turbo-0613',
    messages,
    functions: [functionDescription],
    function_call: 'auto',
  });

  const message = response?.data?.choices?.[0]?.message;

  if (message?.function_call && message.function_call.arguments) {
    const functionResponse = await get_user_tasks(JSON.parse(message.function_call.arguments));

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

    return NextResponse.json(answer?.content);
  }

  return NextResponse.json(message?.content);
}

interface Function {
  name: string;
  description: string;
  parameters: object;
}

const functionDescription: Function = {
  name: 'get_user_tasks',
  description: 'Get the current tasks of a user.',
  parameters: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'The id of the user.',
      },
    },
    required: ['userId'],
  },
};

async function get_user_tasks({ userId }: { userId: string }) {
  const tasks = await db
    .select()
    .from(task)
    .where(eq(task.userId, parseInt(userId)));
  return JSON.stringify(tasks);
}
