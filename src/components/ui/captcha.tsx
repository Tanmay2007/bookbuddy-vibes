import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface CaptchaRef {
  getValue: () => string | null;
  reset: () => void;
}

interface CaptchaProps {
  onVerify?: (token: string | null) => void;
}

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ onVerify }, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return recaptchaRef.current?.getValue() || null;
    },
    reset: () => {
      recaptchaRef.current?.reset();
    }
  }));

  const handleChange = (token: string | null) => {
    onVerify?.(token);
  };

  // Note: In a real application, you would get this from environment variables
  // For now, using the test site key. In production, replace with your actual site key
  const siteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
});

Captcha.displayName = 'Captcha';