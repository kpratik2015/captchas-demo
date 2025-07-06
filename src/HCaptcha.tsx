import { useEffect, useRef, useState } from "react";
import HCaptchaExport from "@hcaptcha/react-hcaptcha";

export const HCaptcha = ({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) => {
  const captchaRef = useRef<HCaptchaExport>(null);
  const [token, setToken] = useState<string | null>(null);

  const onLoad = () => {
    // this reaches out to the hCaptcha JS API and runs the
    // execute function on it. you can use other functions as
    // documented here:
    // https://docs.hcaptcha.com/configuration#jsapi
    captchaRef.current?.execute();
  };

  useEffect(() => {
    if (token) onVerify(token);
  }, [token]);

  return (
    <HCaptchaExport
      sitekey={process.env.BUN_PUBLIC_HCAPTCHA_SITE_KEY!}
      onLoad={onLoad}
      onVerify={setToken}
      ref={captchaRef}
    />
  );
};
