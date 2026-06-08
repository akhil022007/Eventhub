import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { getCurrentUser, accessibleEventsWhere } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Scope dashboard stats to the events this user can access.
  const eventWhere = accessibleEventsWhere(user);

  const eventCount =
    await prisma.event.count({ where: eventWhere });

  const mediaCount =
    await prisma.media.count({
      where: { event: eventWhere },
    });

  const recentEvents =
    await prisma.event.findMany({
      where: eventWhere,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div
        className="
          grid
          md:grid-cols-2
          lg:grid-cols-4
          gap-6
        "
      >
        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">
            Total Events
          </h3>

          <p className="text-3xl font-bold mt-2">
            {eventCount}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">
            Total Media
          </h3>

          <p className="text-3xl font-bold mt-2">
            {mediaCount}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">
            Cover Images
          </h3>

          <p className="text-3xl font-bold mt-2">
            {
              recentEvents.filter(
                (e) => e.coverImage
              ).length
            }
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm text-muted-foreground">
            Recent Events
          </h3>

          <p className="text-3xl font-bold mt-2">
            {recentEvents.length}
          </p>
        </Card>
      </div>

      <Card className="p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          Latest Events
        </h2>

        <div className="space-y-3">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="
                flex
                justify-between
                border-b
                pb-2
              "
            >
              <span>
                {event.title}
              </span>

              <span className="text-muted-foreground">
                {new Date(
                  event.createdAt
                ).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}