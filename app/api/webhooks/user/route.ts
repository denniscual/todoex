import { IncomingHttpHeaders } from 'http';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook, WebhookRequiredHeaders } from 'svix';

const webhookSecret = process.env.WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  const payload = await request.json();
  const headersList = headers();

  // Doing verification.
  const svixId = headersList.get('svix-id');
  const svixIdTimeStamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');
  if (!svixId || !svixIdTimeStamp || !svixSignature) {
    console.log('svixId', svixId);
    console.log('svixIdTimeStamp', svixIdTimeStamp);
    console.log('svixSignature', svixSignature);
    return new Response('Error occured', {
      status: 400,
    });
  }
  const svixHeaders = {
    'svix-id': headersList.get('svix-id'),
    'svix-timestamp': headersList.get('svix-timestamp'),
    'svix-signature': headersList.get('svix-signature'),
  };

  const webhook = new Webhook(webhookSecret);
  let evt: Event | null = null;
  try {
    evt = webhook.verify(
      JSON.stringify(payload),
      svixHeaders as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    console.error((err as Error).message);
    return NextResponse.json({}, { status: 400 });
  }

  const { id } = evt.data;
  const eventType: EventType = evt.type;
  console.log('Event type:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    // Sync the user to the database.
    console.log('------------------ Sync Data ----------------------:');
    console.log('Data: ', evt.data);
    console.log('------------------ End of Sync Data ----------------------:');
  }

  console.log(`User ${id} was ${eventType}`);
  return new Response('', {
    status: 201,
  });
}

type EventType = 'user.created' | 'user.updated' | '*';

type Event = {
  data: Record<string, string | number>;
  object: 'event';
  type: EventType;
};
