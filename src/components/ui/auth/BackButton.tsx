"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
    label: string;
    href: string;
    }

const BackButton = ({label, href}: BackButtonProps) => {
  return (
    <Button variant="link" size="sm" asChild>
        <Link href={href}>
            {label}
        </Link>
    </Button>
  )
}

export default BackButton
