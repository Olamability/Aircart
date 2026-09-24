import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const Logo = ({
  className,
  spanDesign,
  href = "/",
  onClick,
}: {
  className?: string;
  spanDesign?: string;
  href?: string;
  onClick?: () => void;
}) => {
  return (
    <Link href={href} onClick={onClick}>
      <h2
        className={cn(
          "text-2xl text-shop-dark-green font-black tracking-wider hover:text-shop-light-green uppercase hoverEffect group font-sans",
          className,
        )}
      >
        Airmar
        <span
          className={cn(
            "text-shop-light-green group-hover:text-shop-dark-green hoverEffect",
            spanDesign,
          )}
        >
          t
        </span>
      </h2>
    </Link>
  );
};

export default Logo;
