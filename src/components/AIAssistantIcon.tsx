
const AIAssistantIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-bank-blue-400 animate-pulse-slow"
      />
      <circle
        cx="12"
        cy="12"
        r="6"
        fill="currentColor"
        className="text-bank-blue-500/20"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
        className="text-bank-blue-600 animate-float"
      />
      <path
        d="M8 8L10 10M16 8L14 10M8 16L10 14M16 16L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-bank-blue-400"
      />
    </svg>
  );
};

export default AIAssistantIcon;
