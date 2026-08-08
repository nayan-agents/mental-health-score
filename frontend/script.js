/* ════════════════════════════════════════════════════════════
   MindScore — Client-side Logic (Speedometer Edition)
   ════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── Configuration ──
  const API_URL = 'http://127.0.0.1:8000/predict';

  // ── DOM References ──
  const form         = document.getElementById('prediction-form');
  const submitBtn    = document.getElementById('submit-btn');
  const outputIdle   = document.getElementById('output-idle');
  const outputResult = document.getElementById('output-result');
  const gaugeNeedle  = document.getElementById('gauge-needle');
  const gaugeScoreText = document.getElementById('gauge-score-text');
  const scoreValue   = document.getElementById('score-value');
  const scoreBadge   = document.getElementById('score-badge');
  const scoreInterp  = document.getElementById('score-interpretation');
  const resetBtn     = document.getElementById('reset-btn');
  const errorToast   = document.getElementById('error-toast');
  const errorMsg     = document.getElementById('error-message');
  const toastClose   = document.getElementById('toast-close');

  // ── Field Definitions (mirrors Pydantic model) ──
  const FIELDS = [
    { id: 'age',                     type: 'int',    required: true },
    { id: 'gender',                  type: 'select', required: true },
    { id: 'country',                 type: 'select', required: true },
    { id: 'academic_level',          type: 'select', required: true },
    { id: 'most_used_platform',      type: 'select', required: true },
    { id: 'purpose_of_use',          type: 'select', required: true },
    { id: 'avg_daily_usage_hours',   type: 'float',  required: true },
    { id: 'daily_unlocks',           type: 'int',    required: true },
    { id: 'study_hours',             type: 'float',  required: true },
    { id: 'physical_activity_hours', type: 'float',  required: true },
    { id: 'sleep_hours_per_night',   type: 'float',  required: true },
    { id: 'stress_level',            type: 'select', required: true },
  ];

  // ── Helpers ──

  /** Show the error toast with a message */
  function showError(message) {
    errorMsg.textContent = message;
    errorToast.classList.remove('toast--hidden');
    errorToast.classList.add('toast--visible');

    // Auto-dismiss after 6s
    clearTimeout(showError._timer);
    showError._timer = setTimeout(hideError, 6000);
  }

  function hideError() {
    errorToast.classList.remove('toast--visible');
    errorToast.classList.add('toast--hidden');
  }

  /** Set the submit button into loading / idle state */
  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  /** Clear all invalid highlights */
  function clearValidation() {
    form.querySelectorAll('.form-input.invalid').forEach(el => el.classList.remove('invalid'));
  }

  /** Validate all fields; returns payload object or null */
  function validateAndCollect() {
    clearValidation();
    const payload = {};
    let firstInvalid = null;

    for (const field of FIELDS) {
      const el = document.getElementById(field.id);
      const raw = el.value.trim();

      // Check required
      if (field.required && raw === '') {
        el.classList.add('invalid');
        if (!firstInvalid) firstInvalid = el;
        continue;
      }

      // Parse by type
      if (field.type === 'int') {
        const n = parseInt(raw, 10);
        if (isNaN(n)) {
          el.classList.add('invalid');
          if (!firstInvalid) firstInvalid = el;
          continue;
        }
        payload[field.id] = n;
      } else if (field.type === 'float') {
        const n = parseFloat(raw);
        if (isNaN(n)) {
          el.classList.add('invalid');
          if (!firstInvalid) firstInvalid = el;
          continue;
        }
        payload[field.id] = n;
      } else {
        payload[field.id] = raw;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      showError('Please fill in all required fields with valid values.');
      return null;
    }

    return payload;
  }

  /** Get score interpretation text and badge class.
   *  Higher score = stronger mental health (low risk).
   *  Lower  score = weaker  mental health (high risk). */
  function getInterpretation(score) {
    if (score >= 7) {
      return {
        badge: 'Healthy',
        badgeClass: 'interp-badge--low',
        text: 'This score suggests a strong and healthy mental state. Keep up positive habits like regular sleep, exercise, and balanced screen time.'
      };
    } else if (score >= 4) {
      return {
        badge: 'Moderate Risk',
        badgeClass: 'interp-badge--moderate',
        text: 'This score indicates moderate mental health concerns. Consider reducing screen time, increasing physical activity, and seeking peer support.'
      };
    } else {
      return {
        badge: 'High Risk',
        badgeClass: 'interp-badge--high',
        text: 'This score suggests elevated mental health risk. Professional counseling, stress management strategies, and lifestyle changes are recommended.'
      };
    }
  }

  /**
   * Convert a score (0-10) to a needle rotation angle.
   * The gauge arc spans from -90° (left, score=0) to +90° (right, score=10).
   */
  function scoreToAngle(score) {
    const clamped = Math.min(Math.max(score, 0), 10);
    // Map 0→-90°, 10→+90°
    return -90 + (clamped / 10) * 180;
  }

  /** Animate a number from 0 to target in the score display */
  function animateScoreValue(target, duration = 1200) {
    const start = performance.now();
    const el = scoreValue;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = current.toFixed(2);
      gaugeScoreText.textContent = current.toFixed(1) + ' / 10';

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toFixed(2);
        gaugeScoreText.textContent = target.toFixed(1) + ' / 10';
      }
    }

    requestAnimationFrame(update);
  }

  /** Display the result with speedometer animation */
  function showResult(score) {
    // Switch to result state
    outputIdle.classList.add('output-state--hidden');
    outputResult.classList.remove('output-state--hidden');

    // Reset animation
    outputResult.style.animation = 'none';
    void outputResult.offsetWidth;
    outputResult.style.animation = '';

    // Animate the needle
    const angle = scoreToAngle(score);
    gaugeNeedle.style.transition = 'none';
    gaugeNeedle.style.transform = 'rotate(-90deg)';
    // Force reflow
    void gaugeNeedle.offsetWidth;
    gaugeNeedle.style.transition = 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    gaugeNeedle.style.transform = `rotate(${angle}deg)`;

    // Animate the score number
    animateScoreValue(score, 1400);

    // Set badge & interpretation
    const interp = getInterpretation(score);
    scoreBadge.textContent = interp.badge;
    scoreBadge.className = `interp-badge ${interp.badgeClass}`;
    scoreInterp.textContent = interp.text;

    // Scroll output panel into view on mobile
    const outputPanel = outputResult.closest('.panel--output');
    if (outputPanel && window.innerWidth <= 960) {
      outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /** Parse FastAPI validation error details into a readable message */
  function parseValidationErrors(detail) {
    if (!Array.isArray(detail)) return 'Validation error from server.';
    return detail.map(err => {
      const loc = err.loc ? err.loc.filter(l => l !== 'body').join(' → ') : '';
      return `${loc}: ${err.msg}`;
    }).join(' | ');
  }

  // ── Event Listeners ──

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    // Hide result & show idle while loading
    outputResult.classList.add('output-state--hidden');
    outputIdle.classList.remove('output-state--hidden');

    const payload = validateAndCollect();
    if (!payload) return;

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 422 && errorData?.detail) {
          showError(parseValidationErrors(errorData.detail));
        } else {
          showError(`Server error (${response.status}): ${errorData?.detail || 'Something went wrong.'}`);
        }
        return;
      }

      const data = await response.json();
      showResult(data.predicted_mental_health_score);

    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Cannot reach the server. Make sure your FastAPI backend is running on http://127.0.0.1:8000');
      } else {
        showError(`Unexpected error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  });

  resetBtn.addEventListener('click', () => {
    // Reset to idle state
    outputResult.classList.add('output-state--hidden');
    outputIdle.classList.remove('output-state--hidden');

    // Reset needle
    gaugeNeedle.style.transition = 'transform 0.8s ease-in';
    gaugeNeedle.style.transform = 'rotate(-90deg)';

    form.reset();
    clearValidation();

    if (window.innerWidth <= 960) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  toastClose.addEventListener('click', hideError);

  // Dismiss invalid highlight when user interacts
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('invalid')) {
      e.target.classList.remove('invalid');
    }
  });

  form.addEventListener('change', (e) => {
    if (e.target.classList.contains('invalid')) {
      e.target.classList.remove('invalid');
    }
  });

})();
