import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
return (
<nav
    className="max-w-[90%] bg-black w-full hidden sm:flex text-center items-center justify-center mx-auto 
    shadow-sm shadow-gray-400  rounded-lg p-3 sticky top-5 z-50">
    <div className="flex flex-1  text-center justify-between items-center w-full ">
        <div className="ml-4 text-white "> Logo </div>
        <div className="font-bold text-2xl text-white items-center text-center ml-5 ">SAST</div>
        <div>
            <div className="flex flex-row-reverse gap-4">
                <Link href="/signup">
                <Button variant="ghost"
                    className="text-md text-white border-white hover:bg-white hover:text-black border p-4 hover:scale-105 transition-transform duration-200">
                    Sign up
                </Button>
                </Link>

                <Link href="/signin">
                <Button
                    className="text-md hover:bg-white hover:text-black p-4 bg-gray-900 hover:scale-105 transition-transform duration-200">
                    Sign in
                </Button>
                </Link>
            </div>
        </div>
    </div>
</nav>
);
}
