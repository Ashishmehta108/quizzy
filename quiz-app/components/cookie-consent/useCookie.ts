import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export function useCookieConsent() {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    const accepted = stored === 'true';
    setIsAccepted(accepted);
    setIsVisible(!accepted);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsAccepted(true);
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'false');
    setIsAccepted(false);
    setIsVisible(false);
  };

  return {
    isAccepted,
    isVisible,
    acceptCookies,
    rejectCookies,
  };
}