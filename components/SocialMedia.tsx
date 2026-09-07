'use client';
import { cn } from '@/lib/utils';
import Link from "next/link";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { FaFacebook, FaGithub, FaLinkedin, FaYoutube, } from "react-icons/fa";
interface Props {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
};
const SocialLink = [
  {
    title: "Youtube",
    href: "https://www.youtube.com",
    icon: <FaYoutube className="w-5 h-5" />,
  },
{
    title: "Facebook",
    href: "https://www.facebook.com",
    icon: <FaFacebook className="w-5 h-5" />,
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com",
    icon: <FaLinkedin className="w-5 h-5" />,
  },
  {
    title: "Github",
    href: "https://www.github.com",
    icon: <FaGithub className="w-5 h-5" />,
  },

];

const SocialMedia = ({className, iconClassName, tooltipClassName }: Props ) => {
  return (
  <TooltipProvider>
    <div className={cn('flex items-center gap-4', className)}>
     {SocialLink?.map((item) => (
      <Tooltip key={item?.title}>
        <TooltipTrigger>
          <Link
          key={item?.title}
          target="_blank"
          rel="noopener noreferrer"          
          href={item?.href}
          className={cn("w-10 h-10 flex items-center justify-center border rounded-full hover:text-white hover:border-shop-light-green hoverEffect", iconClassName)}>
          {item?.icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent className={cn(`bg-white text-darkColor font-semibold border-shop-light-green border-shop_light_green`, tooltipClassName)}>
          {item?.title}
        </TooltipContent>
      </Tooltip>      
      ))}
    </div>
  </TooltipProvider>
  );
};

export default SocialMedia;
