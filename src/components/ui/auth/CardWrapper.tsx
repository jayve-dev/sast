"use client";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
  } from "@/components/ui/card"
import AuthHeader from "./AuthHeader";
import BackButton from "./BackButton";
   
interface CardWrapperProps {
    label: string;
    title: string;
    backButtonHref: string;
    backButtonLabel: string;
    children: React.ReactNode;
    className?: string;
    }

const CardWrapper = ({label, title, backButtonHref, backButtonLabel, className, children}: CardWrapperProps) => {
  return (
    <Card className={className}>
        <CardHeader>
            <AuthHeader label={label} title={title}/>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
        <CardFooter>
            <BackButton label={backButtonLabel} href={backButtonHref} />
        </CardFooter>

    </Card>
  )
}

export default CardWrapper
