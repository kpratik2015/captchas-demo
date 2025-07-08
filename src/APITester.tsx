import { useCallback, useRef, useState, type FormEvent } from "react";
import { HCaptcha } from "./HCaptcha";
import { GeeTestCaptcha } from "./GeeTestCaptcha";
import { FriendlyCaptcha } from "./FriendlyCaptcha";
import { WidgetErrorData } from "@friendlycaptcha/sdk";

export function APITester() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const [captchaVerifiedState, setCaptchaVerifiedState] = useState({
    hcaptcha: false,
    geetest: false,
    friendlycaptcha: "FAILED",
  });

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const endpoint = formData.get("endpoint") as string;
      const url = new URL(endpoint, location.href);
      const method = formData.get("method") as string;
      const res = await fetch(url, { method });

      const data = await res.json();
      responseInputRef.current!.value = JSON.stringify(
        { ...data, captcha: captchaVerifiedState },
        null,
        2
      );
      responseInputRef.current!.rows = 50;
    } catch (error) {
      responseInputRef.current!.value = String(error);
    }
  };

  const onFriendlyCaptchaComplete = useCallback((response: string) => {
    console.log("FriendlyCaptcha: onComplete", response);
    setCaptchaVerifiedState((p) => ({
      ...p,
      friendlycaptcha: response,
    }));
  }, []);

  return (
    <div className="api-tester">
      <form
        onSubmit={testEndpoint}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <div className="endpoint-row">
          <select name="method" className="method">
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
          </select>
          <input
            type="text"
            name="endpoint"
            defaultValue="/api/hello"
            className="url-input"
            placeholder="/api/hello"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </div>
        <HCaptcha
          onVerify={() =>
            setCaptchaVerifiedState((p) => ({ ...p, hcaptcha: true }))
          }
        />
        <GeeTestCaptcha
          onVerify={() => {
            setCaptchaVerifiedState((p) => ({
              ...p,
              geetest: (window as any).captchaObj.getValidate(),
            }));
          }}
        />
        <FriendlyCaptcha
          sitekey={process.env.BUN_PUBLIC_FRIENDLY_CAPTCHA_SITEKEY!}
          onComplete={onFriendlyCaptchaComplete}
        />
      </form>
      <textarea
        ref={responseInputRef}
        readOnly
        placeholder="Do the captchas and then hit send to see the response..."
        className="response-area"
      />
    </div>
  );
}
