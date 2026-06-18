import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="text-destructive" size={28} />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-[#2872A1] hover:bg-[#1A4A6B] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}