import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="
      flex
      justify-between
      items-center
      px-8
      py-5
      border-b
      border-gray-800
      "
    >
      <h1 className="text-2xl font-bold">
        EventHub
      </h1>

      <div className="flex gap-6 items-center">
        <Link
          href="/login"
          className="hover:text-blue-400"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="
          px-4
          py-2
          rounded-lg
          bg-white
          text-black
          font-medium
          "
        >
          Register
        </Link>
      </div>
    </nav>
  );
}