
const BankIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 10L12 2L21 10V11H3V10Z"
        fill="currentColor"
        className="text-bank-blue-500"
      />
      <path
        d="M5 12H7V19H5V12Z"
        fill="currentColor"
        className="text-bank-blue-600"
      />
      <path
        d="M9 12H11V19H9V12Z"
        fill="currentColor" 
        className="text-bank-blue-600"
      />
      <path
        d="M13 12H15V19H13V12Z"
        fill="currentColor"
        className="text-bank-blue-600"
      />
      <path
        d="M17 12H19V19H17V12Z"
        fill="currentColor"
        className="text-bank-blue-600"
      />
      <path
        d="M2 20H22V21H2V20Z"
        fill="currentColor"
        className="text-bank-blue-700"
      />
      <circle
        cx="12"
        cy="6"
        r="1"
        fill="currentColor"
        className="text-bank-gold-500 animate-pulse-slow"
      />
    </svg>
  );
};

export default BankIcon;
