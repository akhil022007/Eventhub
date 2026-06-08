//import MediaModal from "@/components/gallery/MediaModal";
import { prisma } from "@/lib/prisma";
import EventGallery from "@/components/gallery/EventGallery";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
  media: {
    include: {
      likes: true,
      comments: true,
    },
  },
},
  });

  if (!event) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">
          Event Not Found
        </h1>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          {event.title}
        </h1>

        <p className="text-muted-foreground mt-2">
          {event.description || "No description"}
        </p>

        <p className="mt-2">
          {event.media.length} Files
        </p>
      </div>

     <EventGallery
     media={event.media}
/>
    </main>
  );
}