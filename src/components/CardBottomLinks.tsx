"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CardBottomLinks({ code }: { code: string }) {
    const [isOwner, setIsOwner] = useState<boolean | null>(null);

    useEffect(() => {
        try {
            setIsOwner(localStorage.getItem("tg_card") === code);
        } catch {
            setIsOwner(false);
        }
    }, [code]);

    const buryHref = `/?src=share&ref=${code}`;

    return (
        <>
            <Link href="/build" className="text-sm text-neutral-400 underline">
                Join the live build room
            </Link>
            <Link href="/resurrect" className="text-sm text-emerald-300 underline">
                Already built something? Submit it for your certificate
            </Link>
            {/* Show as prominent pill for visitors, subtle link for owner */}
            {isOwner === false ? (
                <Link
                    href={buryHref}
                    className="rounded-full bg-emerald-400 text-neutral-950 font-semibold px-8 py-3 text-center"
                >
                    Bury your own →
                </Link>
            ) : (
                <Link href={buryHref} className="text-sm text-neutral-500 underline">
                    Bury your own
                </Link>
            )}
        </>
    );
}
