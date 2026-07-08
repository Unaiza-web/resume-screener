export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="11" fill="#9E8B90" />
      <path
        d="M14 10.5C14 9.67 14.67 9 15.5 9H21.5L26 13.5V29.5C26 30.33 25.33 31 24.5 31H15.5C14.67 31 14 30.33 14 29.5V10.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M21.5 9L26 13.5H22.5C21.95 13.5 21.5 13.05 21.5 12.5V9Z" fill="white" fillOpacity="0.65" />
      <path
        d="M16.5 22H18.3L19.4 19.2L20.8 24.8L21.9 22H23.5"
        stroke="#9E8B90"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="20" cy="26.5" r="0.9" fill="#AD6F6F" />
      <circle cx="17" cy="26.5" r="0.9" fill="#AD6F6F" opacity="0.6" />
      <circle cx="23" cy="26.5" r="0.9" fill="#AD6F6F" opacity="0.6" />
    </svg>
  );
}