import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { Welcome } from "@/components/landingpage/Welcome";   

export default async function Page() {

  const session = await auth();

    if(session) {
        redirect("/dashboard");
    }

  return <Welcome />;

}
