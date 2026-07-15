import { motion } from "framer-motion";
import Logo from "./Logo";

interface CustomLoaderProps {
  message?: string;
}

const CustomLoader = ({ message = "Carregando sua agenda..." }: CustomLoaderProps) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Logo size="lg" className="mb-8 animate-pulse" />
        
        <div className="relative w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#2AD467] to-transparent"
          />
        </div>
        
        <p className="text-[#132239] font-black text-sm uppercase tracking-[0.2em] animate-pulse">
          {message}
        </p>
      </motion.div>
    </div>
  );
};

export default CustomLoader;
