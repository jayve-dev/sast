// import StudentsPageHeader from '@/components/student/studentsPageHeader'
import React from 'react'
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";


export default function page() {
return (
<div className="h-dvh w-full bg-[#FFFFE3]  p-4 ">
    {/*<StudentsPageHeader />*/}
    <div className="font-bold text-2xl mb-2"> Survey - Question</div>
    <div className="text-sm text-gray-600 mb-2"> Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    </div>

<div className="flex items-center justify-between p-4 ">
    <div className="p-2 flex gap-4 bg-zinc-200 w-fit rounded-lg shadow-md">
        <div className="flex gap-2"> <div className="bg-zinc-100 p-2 rounded-lg shadow-sm text-center w-[140px] "> <a>Question</a></div>   <Separator
            orientation="vertical"
            className="h-8 border-gray-500 border-1"
        />
            <div className="p-2 rounded-lg  text-center w-[140px] ">Lorem Ipsum</div>
            <Separator
                orientation="vertical"
                className="h-8 border-gray-500 border-1"
            />
            <div className=" p-2 rounded-lg  text-center w-[140px] ">Some Tab</div>
        </div>


    </div>

    <div> <Button size="lg"> Preview</Button></div>
</div>
</div>
)
}
