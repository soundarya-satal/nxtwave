"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BuildNav() {
    const [card, setCard] = useState("");
    useEffect(() => {
        try { setCard(localStorage.getItem("tg_card") ?? ""); } catch { }
    }, []);

    return (
        <Link
            href={card ? `/card/${card}` : "/"}
            className="text-sm text-neutral-400 hover:text-neutral-100"
        >
            ← {card ? "My tombstone" : "Home"}
        </Link>
    );
}
