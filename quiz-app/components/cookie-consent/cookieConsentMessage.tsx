import { X } from 'lucide-react';

interface CookieConsentMessageProps {
  onClose?: () => void;
}

export function CookieConsentMessage({ onClose }: CookieConsentMessageProps) {
  return (
    <div className="space-y-2 md:space-y-2.5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm md:text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Cookie Preferences
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
      <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
        By accepting, you consent to our cookie policy.
      </p>
    </div>
  );
}