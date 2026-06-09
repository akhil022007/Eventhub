import {
  Calendar,
  Users,
  Tag,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Create Events",
    desc: "Start an event and you're its organizer",
  },
  {
    icon: Users,
    title: "Invite & Roles",
    desc: "Share a link to add viewers; promote them to uploaders",
  },
  {
    icon: Tag,
    title: "Upload & Tag",
    desc: "Upload photos and videos and organize them with tags",
  },
  {
    icon: Heart,
    title: "Like & Comment",
    desc: "React and comment on the media everyone shares",
  },
];

export default function Features() {
  return (
    <section
      className="
      grid
      md:grid-cols-4
      gap-6
      px-12
      pb-24
      "
    >
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <div
            key={feature.title}
            className="
            border
            border-gray-800
            rounded-2xl
            p-6
            "
          >
            <Icon className="mb-4" />

            <h2 className="text-xl font-semibold">
              {feature.title}
            </h2>

            <p className="text-gray-400 mt-3">
              {feature.desc}
            </p>
          </div>
        );
      })}
    </section>
  );
}