document.addEventListener('DOMContentLoaded', () => {
  const boxes = Array.from(document.querySelectorAll('.code-box'));
  const verifyButton = document.querySelector('main button');
  const resendText = document.querySelector('main p span');
  const codeGroup = document.querySelector('#code-group');

  if (!boxes.length) return;

  const RESEND_SECONDS = 45;

  /* ---------- 1. CODE BOXES ---------- */
  
  boxes[0].setAttribute('autocomplete', 'one-time-code');
  boxes[0].focus();

  const fillFrom = (startIndex, digits) => {
    digits.split('').forEach((digit, i) => {
      const box = boxes[startIndex + i];
      if (box) box.value = digit;
    });
    const nextIndex = Math.min(startIndex + digits.length, boxes.length - 1);
    boxes[nextIndex].focus();
  };

  boxes.forEach((box, index) => {
    // Typing: keep digits only, then jump to the next box
    box.addEventListener('input', () => {
      const digits = box.value.replace(/\D/g, '');
      box.value = '';
      if (!digits) return;
      fillFrom(index, digits);
      clearError();
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && index > 0) {
        boxes[index - 1].value = '';
        boxes[index - 1].focus();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        boxes[index - 1].focus();
      } else if (e.key === 'ArrowRight' && index < boxes.length - 1) {
        boxes[index + 1].focus();
      } else if (e.key === 'Enter') {
        submitCode();
      }
    });

    // Pasting a full code (e.g. "482913") fills every box
    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData)
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, boxes.length - index);
      if (!pasted) return;
      fillFrom(index, pasted);
      clearError();
    });

    // Select the digit on focus so typing replaces it
    box.addEventListener('focus', () => box.select());
  });

  /* ---------- 2. ERROR MESSAGE ---------- */
  // Created here so the HTML stays untouched
  const errorMessage = document.createElement('p');
  errorMessage.className = 'mt-3 font-[Inter] text-[14px] font-medium text-red-600';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.hidden = true;
  codeGroup.after(errorMessage);

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    boxes.forEach((box) => box.classList.add('border-red-500'));
  }

  function clearError() {
    errorMessage.hidden = true;
    boxes.forEach((box) => box.classList.remove('border-red-500'));
  }

  /* ---------- 3. VERIFY BUTTON ---------- */
  const getCode = () => boxes.map((box) => box.value).join('');

  function submitCode() {
    const code = getCode();

    if (code.length < boxes.length) {
      showError('Please enter all 6 digits.');
      const firstEmpty = boxes.find((box) => !box.value);
      if (firstEmpty) firstEmpty.focus();
      return;
    }

    clearError();
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';

    // TODO: replace this with your real API call once the endpoint exists
    console.log('Code to verify:', code);

    setTimeout(() => {
      verifyButton.disabled = false;
      verifyButton.textContent = 'Verify Code';
    }, 800);
  }

  verifyButton.addEventListener('click', submitCode);

  /* ---------- 4. RESEND COUNTDOWN ---------- */
  let secondsLeft = RESEND_SECONDS;
  let timerId = null;

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function startCountdown() {
    secondsLeft = RESEND_SECONDS;
    resendText.classList.remove('cursor-pointer', 'underline');
    resendText.removeAttribute('role');
    resendText.removeAttribute('tabindex');
    resendText.textContent = `Resend in ${formatTime(secondsLeft)}`;

    clearInterval(timerId);
    timerId = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        resendText.textContent = `Resend in ${formatTime(secondsLeft)}`;
      } else {
        clearInterval(timerId);
        enableResend();
      }
    }, 1000);
  }

  function enableResend() {
    resendText.textContent = 'Resend code';
    resendText.classList.add('cursor-pointer', 'underline');
    resendText.setAttribute('role', 'button');
    resendText.setAttribute('tabindex', '0');
  }

  function resendCode() {
    if (secondsLeft > 0) return;

    // TODO: call your "resend code" endpoint here
    console.log('Resend code requested');

    boxes.forEach((box) => (box.value = ''));
    clearError();
    boxes[0].focus();
    startCountdown();
  }

  resendText.addEventListener('click', resendCode);
  resendText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      resendCode();
    }
  });

  startCountdown();
});