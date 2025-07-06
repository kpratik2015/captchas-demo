import { useEffect } from "react";

export const GeeTestCaptcha = ({ onVerify }: { onVerify: () => void }) => {
  useEffect(() => {
    let ignore = false;
    const script = document.createElement("script");
    script.src = "https://static.geetest.com/v4/gt4.js";
    document.body.appendChild(script);

    script.onload = () => {
      if (ignore) return;
      console.log("GEETEST: script loaded");
      /** @link https://docs.geetest.com/BehaviorVerification/apirefer/api/web */
      (window as any).initGeetest4(
        {
          captchaId: process.env.BUN_PUBLIC_GEETEST_ID,
          product: "float",
        },
        function (captchaObj: any) {
          (window as any).captchaObj = captchaObj;
          captchaObj
            .appendTo("#captcha-box")
            .onReady(function () {
              console.log("GEETEST: onReady");
            })
            .onSuccess(onVerify)
            .onError(function () {
              console.error("GEETEST: onError");
            });
        }
      );
    };
    return () => {
      ignore = true;
      if ((window as any).captchaObj) {
        (window as any).captchaObj.destroy();
      }
    };
  }, []);

  return <div id="captcha-box"></div>;
};
