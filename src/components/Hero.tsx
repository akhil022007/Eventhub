import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="
      flex
      flex-col
      items-center
      justify-center
      text-center
      py-24
      px-6
      "
    >
      <h1
        className="
        text-6xl
        font-bold
        max-w-5xl
        "
      >
        Manage Event Memories
        <br />
        Like Never Before
      </h1>

      <p
        className="
        mt-6
        text-xl
        text-gray-400
        max-w-3xl
        "
      >
        Create events, invite your people, and upload,
        tag, and share photos and videos — all in one place.
      </p>

      <div className="flex gap-4 mt-8">
        <Link
          href="/register"
          className="
          bg-white
          text-black
          px-6
          py-3
          rounded-xl
          font-medium
          "
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
