'use client';

import { motion, AnimatePresence } from "motion/react";
import { CookieConsentButtons } from "./cookieConsentButtons";
import { CookieConsentMessage } from "./cookieConsentMessage";
import { useCookieConsent } from "./useCookie";

export function CookieConsentBanner() {
  const { isVisible, acceptCookies, rejectCookies } = useCookieConsent();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cookie-banner"
          className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[360px] p-5 bg-white dark:bg-zinc-950 border border-neutral-200 dark:border-zinc-800 shadow-2xl shadow-black/5 dark:shadow-black/50 origin-bottom"
          
          initial={{ 
            opacity: 0, 
            y: 20, 
            scaleX: 0.95, 
            scaleY: 0.95,
            borderRadius: "12px"
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scaleX: 1, 
            scaleY: 1,
            borderRadius: "12px" 
          }}
          exit={{ 
            opacity: 0, 
            y: 120,              
            scaleX: 0.15,         
            scaleY: 0.45,         
            borderRadius: "160px",
            
            transition: { 
              duration: 0.45, 
              ease: [0.76, 0, 0.24, 1] 
            }
          }}
          transition={{
            type: "spring",
            stiffness: 240,
            damping: 24
          }}
        >
          <CookieConsentMessage onClose={rejectCookies} />
          <div className="mt-5">
            <CookieConsentButtons onAccept={acceptCookies} onReject={rejectCookies} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}