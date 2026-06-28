import { Button } from '@/components/ui/button';

interface CookieConsentButtonsProps {
  onAccept: () => void;
  onReject: () => void;
}

export function CookieConsentButtons({ onAccept, onReject }: CookieConsentButtonsProps) {
  return (
    <div className="flex gap-3 flex-wrap sm:flex-nowrap">
      <Button
        onClick={onAccept}
        size="sm"
        className="flex-1 sm:flex-none"
      >
        Accept
      </Button>
      <Button
        onClick={onReject}
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none border-neutral-200 dark:border-white/20"
      >
        Reject
      </Button>
    </div>
  );
}