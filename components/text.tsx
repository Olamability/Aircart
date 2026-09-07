import { cn } from "@/lib/utils";
import React from 'react';
import { twMerge } from "tailwind-merge";

export const Title = ({children,
  className,}: {children: React.ReactNode; className?: string}) => {
  return (
    <h2 className={twMerge("text-2xl font-semibold text-shop-dark-green capitalize tracking-wide font-sans", className)}>
    {children}</h2>
  );
};

export const SubTitle = ({children, className}: {children: React.ReactNode; className?: string}) => {
  return (
    <h3 className={cn(`text-gray-900 font-bold font-sans`, className)}>
    {children}</h3>
  );
};

export const SubText = ({children, className}: {children: React.ReactNode; className?: string}) => {
  
    return ( <p className={cn("text-gray-600 text-sm", className)}>
    {children}</p>
    );
};
