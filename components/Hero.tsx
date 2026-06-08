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
        AI-powered platform for organizing,
        sharing and discovering event media.
      </p>

      <div className="flex gap-4 mt-8">
        <button
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
        </button>

        <button
          className="
          border
          border-gray-700
          px-6
          py-3
          rounded-xl
          "
        >
          Live Demo
        </button>
      </div>

      <div
        className="
        mt-16
        w-full
        max-w-5xl
        h-[350px]
        rounded-3xl
        border
        border-gray-800
        bg-gradient-to-br
        from-blue-950
        via-black
        to-gray-950
        flex
        items-center
        justify-center
        text-gray-500
        "
      >
        Dashboard Preview Coming Soon
      </div>
    </section>
  );
}