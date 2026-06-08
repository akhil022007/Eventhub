import {
  Search,
  User,
  Cloud,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    desc: "Find photos instantly using AI tags",
  },
  {
    icon: User,
    title: "Face Recognition",
    desc: "Discover your photos automatically",
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    desc: "Store media securely at scale",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Real-time updates and engagement",
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