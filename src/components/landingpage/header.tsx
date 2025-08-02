import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <nav
      className={` max-w-[90%] w-full  hidden sm:flex  text-center items-center  justify-center mx-auto   bg-gray-200 shadow-gray-400 shadow-lg rounded-lg p-3 top-5 sticky `}
    >
      <div className="flex text-center justify-between items-center w-full ">
        <div className="ml-4"> Logo </div>
        <div className="font-bold text-2xl">SAST</div>
        <div>
          <div className="flex gap-2">
            <Link href="/signup">
              <Button
                variant="ghost"
                className="text-md border-black hover:bg-black hover:text-white border p-4 hover:scale-105 transition-transform duration-200"
              >
                Sign up
              </Button>
            </Link>

            <Link href="/signin">
              <Button className="text-md p-4 hover:scale-105 transition-transform duration-200">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
