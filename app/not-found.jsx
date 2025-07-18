import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f9fafb] to-[#edf2f7] px-6 py-16 text-center">
      <div className="w-full max-w-lg space-y-6">
        <h1 className="font-extrabold text-transparent text-8xl bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="text-base text-gray-600">
          Sorry, we couldn't find the page you were looking for. It might have been moved or deleted.
        </p>

        <Link href="/" passHref>
          <Button className="gap-2 mt-4">
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Button>
        </Link>

        <div className="mt-10">
          <img
            src="/assets/404-illustration.svg"
            alt="Page not found illustration"
            className="w-full max-w-sm mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
