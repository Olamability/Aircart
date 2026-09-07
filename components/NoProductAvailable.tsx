"use client"
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react"; 

const NoProductAvailable = ({
  selectedTab, 
  className,
}:{
  selectedTab?: string;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 min-h-80 space-y-4 bg-gray-100 w-full mt-10", className)}>
    <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-medium text-gray-500">
      No products available for <span className="font-bold">{selectedTab}</span>
      </h2>
    </motion.div>

    <motion.p
    initial={{ opacity: 0}}
    animate={{ opacity: 1}}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="text-gray-600"
    >
      We&apos;re sorry, but there are currently no products available in this {" "}
      <span className="text-base font-semibold text-darkColor">
        {selectedTab} category.
        </span>{" "}
        Please check back later or explore other categories.
      </motion.p>
    
      <motion.div
      animate={{ scale:  [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="flex items-center space-x-2 text-shop-dark-green font-bold"
        >
          <Loader2 className="w-5 h-5 animate-spin"/>
          <span>We&apos;re restocking shortly...</span>
      </motion.div>

  <motion.p
    initial={{ opacity: 0}}
    animate={{ opacity: 1}}
    transition={{ duration: 0.4, delay: 0.5 }}
    className="text-sm text-gray-600"
    >
      Please check back later or explore other categories for available products.
  </motion.p>

        
    </div>
  );
};
export default NoProductAvailable;