import { IncomingHttpHeaders } from 'http';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook, WebhookRequiredHeaders } from 'svix';
import { upsertUser, User } from '@/db';

const webhookSecret = process.env.WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const headersList = headers();

  // Doing verification.
  const svixId = headersList.get('svix-id');
  const svixIdTimeStamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');
  if (!svixId || !svixIdTimeStamp || !svixSignature) {
    console.log('svixId', svixId);
    console.log('svixIdTimeStamp', svixIdTimeStamp);
    console.log('svixSignature', svixSignature);
    return NextResponse.json(
      {
        message: 'Unauthenticated',
      },
      { status: 401 }
    );
  }

  const svixHeaders = {
    'svix-id': headersList.get('svix-id'),
    'svix-timestamp': headersList.get('svix-timestamp'),
    'svix-signature': headersList.get('svix-signature'),
  };
  const payload = await request.json();

  const webhook = new Webhook(webhookSecret);
  let event: Event | null = null;
  try {
    event = webhook.verify(
      JSON.stringify(payload),
      svixHeaders as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    console.error((err as Error).message);
    return NextResponse.json(
      {
        message: 'Error verifying webhooks.',
      },
      { status: 400 }
    );
  }

  const eventType: EventType = event.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { data } = event;

    if (eventType === 'user.created') {
      // TODO:
      // - Do an email welcome message here.
    } else {
      // TODO:
      // - Do an email to the user that something has changed.
    }

    const user = {
      id: data.id as string,
      firstName: data.first_name as string,
      lastName: data.last_name as string,
      username: data.username as string,
    } as User;

    if (
      data.email_addresses &&
      Array.isArray(data.email_addresses) &&
      data.email_addresses.length > 0
    ) {
      user.emailAddress = data.email_addresses[0].email_address as string;
    }

    await upsertUser(user);
  }

  // TODO:
  // - handle user deletion.
  if (eventType === 'user.deleted') {
  }

  return NextResponse.json(
    {
      message: 'Success',
    },
    {
      status: 200,
    }
  );
}

type EventType = 'user.created' | 'user.updated' | 'user.deleted';

type Event = {
  data: Record<string, string | number>;
  object: 'event';
  type: EventType;
};
