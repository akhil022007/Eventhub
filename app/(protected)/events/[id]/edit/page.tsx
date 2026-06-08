import { prisma } from "@/lib/prisma";
import EditEventForm from "@/components/events/EditEventForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({
  params,
}: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    return (
      <main className="p-8">
        Event not found
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Edit Event
      </h1>

      <EditEventForm
        event={event}
      />
    </main>
  );
}