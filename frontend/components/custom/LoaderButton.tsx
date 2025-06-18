import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface propType {
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const LoaderButton = ({
  isLoading,
  onClick,
  className,
  children,
}: propType) => {
  return (
    <Button
      onClick={onClick}
      className={`relative ${className}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        children || "Submit"
      )}
    </Button>
  );
};

export default LoaderButton;
