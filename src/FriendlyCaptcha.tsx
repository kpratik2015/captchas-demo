import {
  FRCWidgetCompleteEvent,
  FriendlyCaptchaSDK,
  CreateWidgetOptions,
  WidgetErrorData,
  FRCWidgetErrorEventData,
  WidgetHandle,
} from "@friendlycaptcha/sdk";
import {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
  useCallback,
} from "react";

const sdk = new FriendlyCaptchaSDK({
  apiEndpoint: "global", // Set this to "eu" if you're using the EU endpoint.
  disableEvalPatching: false, // Set this to true if your React application uses eval in dev mode which is common in many frameworks.
});

type Props = Omit<CreateWidgetOptions, "element"> & {
  onComplete?: (response: string) => void;
  onError?: (error: WidgetErrorData) => void;
  onExpire?: () => void;
};

type Ref = {
  reset: () => void;
};

export const FriendlyCaptcha = forwardRef<Ref, Props>((props, ref) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<WidgetHandle | null>(null);

  // Memoize callbacks to prevent unnecessary re-renders
  const onComplete = useCallback(props.onComplete || (() => {}), [
    props.onComplete,
  ]);
  const onError = useCallback(props.onError || (() => {}), [props.onError]);
  const onExpire = useCallback(props.onExpire || (() => {}), [props.onExpire]);

  useEffect(() => {
    if (captchaRef.current) {
      const { onComplete, onError, onExpire, ...widgetProps } = props;
      // Create the widget
      const widget = sdk.createWidget({
        element: captchaRef.current,
        ...widgetProps,
      });

      // Store the widget reference
      widgetRef.current = widget;

      let onCompleteListener: EventListener;
      let onErrorListener: EventListener;
      let onExpireListener: EventListener;

      // Add event listeners to the widget element
      if (onComplete) {
        onCompleteListener = (e) => {
          onComplete((e as FRCWidgetCompleteEvent).detail.response);
        };
        captchaRef.current.addEventListener(
          "frc:widget.complete",
          onCompleteListener
        );
      }

      if (onError) {
        onErrorListener = (e) => {
          console.log("FriendlyCaptcha: onError", e);
          onError((e as CustomEvent<FRCWidgetErrorEventData>).detail.error);
        };
        captchaRef.current.addEventListener(
          "frc:widget.error",
          onErrorListener
        );
      }

      if (onExpire) {
        onExpireListener = () => {
          console.log("FriendlyCaptcha: onExpire");
          onExpire();
        };
        captchaRef.current.addEventListener(
          "frc:widget.expire",
          onExpireListener
        );
      }

      // Cleanup function
      return () => {
        if (widgetRef.current) {
          widgetRef.current.destroy();
          widgetRef.current = null;
        }
        if (captchaRef.current) {
          captchaRef.current.removeEventListener(
            "frc:widget.complete",
            onCompleteListener
          );
          captchaRef.current.removeEventListener(
            "frc:widget.error",
            onErrorListener
          );
          captchaRef.current.removeEventListener(
            "frc:widget.expire",
            onExpireListener
          );
        }
      };
    }
  }, [
    props.sitekey,
    props.language,
    props.startMode,
    onComplete,
    onError,
    onExpire,
  ]);

  // Expose the reset method to the parent component
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetRef.current) {
        widgetRef.current.reset();
      }
    },
  }));

  return <div ref={captchaRef} />;
});
