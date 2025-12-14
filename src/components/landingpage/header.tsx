import { Button } from "@/components/ui/button";
// import Link from "next/link";

export default function Header() {
return (
<nav
    className="max-w-[90%] bg-black w-full flex text-center items-center justify-center mx-auto 
    shadow-sm shadow-gray-400 rounded-lg p-3 sticky top-5 z-50">
    <div className="flex flex-1  text-center justify-between items-center w-full ">
        <div className="text-white "> <img src="/ctu_logo.png" alt="Logo" className="h-8 w-8" /> </div>
        <div className="font-bold text-2xl text-white items-center text-center">SAST</div>
            <div className="hidden sm:flex flex-row-reverse gap-4">
                <a href="/signup">
                <Button variant="ghost"
                    className="text-md text-white border-white hover:bg-white hover:text-black border p-4 hover:scale-105 transition-transform duration-200">
                    Sign up
                </Button>
                </a>

                <a href="/signin">
                <Button
                    className="text-md hover:bg-white hover:text-black p-4 bg-gray-900 hover:scale-105 transition-transform duration-200">
                    Sign in
                </Button>
                </a>
            </div>
    </div>
</nav>
);
}
