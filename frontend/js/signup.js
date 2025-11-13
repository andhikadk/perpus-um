/**
 * Signup Page JavaScript
 * Handles signature canvas and form submission
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set line style for signature
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    /**
     * Resize canvas for high-DPI displays
     */
    function resizeCanvasForDisplay() {
      const ratio = window.devicePixelRatio || 1;
      const w = canvas.clientWidth * ratio;
      const h = canvas.clientHeight * ratio;

      if (canvas.width !== w || canvas.height !== h) {
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = w;
        canvas.height = h;
        ctx.putImageData(img, 0, 0);
        ctx.scale(ratio, ratio);
      }
    }

    /**
     * Pointer down event - start drawing
     */
    canvas.addEventListener('pointerdown', (e) => {
      drawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    });

    /**
     * Pointer move event - draw line
     */
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastX = x;
      lastY = y;
    });

    /**
     * Stop drawing on pointer up/leave/cancel
     */
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
      canvas.addEventListener(ev, () => drawing = false)
    );

    /**
     * Clear signature button
     */
    const clearBtn = document.getElementById('clearSig');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('signature').value = '';
        document.getElementById('sigStatus').textContent = 'Belum disimpan';
      });
    }

    /**
     * Save signature button
     */
    const saveBtn = document.getElementById('saveSig');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        // Save canvas as PNG data URL
        const dataURL = canvas.toDataURL('image/png');
        document.getElementById('signature').value = dataURL;
        document.getElementById('sigStatus').textContent = 'Tersimpan';
      });
    }

    // Make canvas sharp on load and resize
    window.addEventListener('load', resizeCanvasForDisplay);
    window.addEventListener('resize', resizeCanvasForDisplay);
  });
})();
