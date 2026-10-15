import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { telegram } from '../../../shared/lib/telegram';

interface ProxyIframeProps {
  profileId: string;
  refreshTrigger: number;
}

export const ProxyIframe: React.FC<ProxyIframeProps> = ({ profileId, refreshTrigger }) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Construct proxy URL with initData parameter for top-level iframe navigation
  const initData = telegram.getInitData();
  const queryParam = initData ? `?initData=${encodeURIComponent(initData)}` : '';
  const iframeSrc = `/proxy/${profileId}/${queryParam}`;

  useEffect(() => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  }, [profileId, refreshTrigger, iframeSrc]);

  return (
    <div className="w-full h-full relative bg-[#17212b]">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#17212b]/90 backdrop-blur-xs">
          <LoadingSpinner label="Sanitizing Origin & Hydrating Vault..." size="lg" />
          <p className="text-[11px] text-[#708499] mt-2">
            Stripping X-Frame-Options & Ingesting Cookies
          </p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        key={`${profileId}-${refreshTrigger}`}
        src={iframeSrc}
        title="Target Origin Mobile Web"
        className="w-full h-full border-none"
        onLoad={() => setIsLoading(false)}
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
        allow="geolocation; camera; microphone"
      />
    </div>
  );
};
