import React from "react";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

interface ContactItemData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const data: ContactItemData[] = [
  {
    title: "Visit Us",
    subtitle: "Nigeria",
    icon: <MapPin />,
  },

  {
    title: "Call Us",
    subtitle: "+234 815 577 6374",
    icon: <Phone />,
  },

  {
    title: "Working Hours",
    subtitle: "24/7",
    icon: <Clock />,
  },

  {
    title: "Email Us",
    subtitle: "hello@spaazr.com",
    icon: <Mail />,
  },
];
const FooterTop = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-4 justify-items-center">
      {data?.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 group hover:bg-gray-50 py-2 transition-colors hoverEffect"
        >
          {item?.icon}

          <div className="grid justify-items-center">
            <h3 className="font-semibold text-gray-900 group-hover:text-black hoverEffect">
              {item?.title}
            </h3>
            <p className=" text-gray-600 text-sm mt-1 group-hover:text-gray-900 hoverEffect">
              {item?.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FooterTop;
