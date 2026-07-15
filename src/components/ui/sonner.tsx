import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-[#25D366] group-[.toaster]:border-2 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-[#25D366] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-green-500",
          error: "group-[.toaster]:border-red-500",
          warning: "group-[.toaster]:border-yellow-500",
          info: "group-[.toaster]:border-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
