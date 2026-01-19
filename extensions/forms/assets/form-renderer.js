// extensions/forms/assets/form-renderer.js
(function () {
  const container = document.getElementById('formify-container');
  const formId = container?.getAttribute('data-form-id');
  const appTarget = document.getElementById('formify-app');

  // Replace with your actual production URL
  const APP_URL = "https://shop-form-nu.vercel.app"; 

  if (!formId || formId.trim() === "") {
    appTarget.innerHTML = "<p style='color: red;'>Missing Form ID. Please add it in the Theme Editor.</p>";
    return;
  }

  async function initForm() {
    try {
      const response = await fetch(`${APP_URL}/api/public/form/${formId}`);
      if (!response.ok) throw new Error("Form not found");
      const form = await response.json();
      renderForm(form);
    } catch (err) {
      console.error("Formify Error:", err);
      appTarget.innerHTML = "<p>Error loading form.</p>";
    }
  }

  function renderForm(form) {
    const s = form.settings;
    const questions = form.questions || [];

    appTarget.innerHTML = `
      <div style="max-width: ${s.maxWidth}px; background: ${s.backgroundColor}; padding: ${s.padding}px; border-radius: ${s.borderRadius}px; text-align: ${s.textAlign}; color: ${s.textColor}; font-family: ${s.fontFamily}; margin: 20px auto; border: 1px solid #eee; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="margin-top: 0;">${form.title}</h2>
        <p style="margin-bottom: 25px; opacity: 0.8;">${s.description}</p>
        <form id="formify-submit-form">
          ${questions.map(q => renderField(q)).join('')}
          <button type="submit" id="formify-btn" style="width: 100%; background: ${s.buttonColor}; color: ${s.buttonTextColor}; padding: 12px; border: none; border-radius: ${s.borderRadius}px; cursor: pointer; font-weight: bold; font-size: 16px;">
            ${s.buttonText}
          </button>
        </form>
      </div>
    `;

    // Handle Submission
    const formEl = document.getElementById('formify-submit-form');
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('formify-btn');
      btn.disabled = true;
      btn.innerText = "Submitting...";

      const formData = new FormData(formEl);
      const answers = {};
      
      // Map question text to user answers
      questions.forEach(q => {
        answers[q.text] = formData.get(q.id);
      });

      try {
        const res = await fetch(`${APP_URL}/api/public/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId: form.id, answers })
        });

        if (res.ok) {
          formEl.innerHTML = `<div style="text-align:center; padding: 20px;">
            <p style="font-size: 18px; color: ${s.buttonColor}; font-weight: bold;">
              ${s.successMessage || 'Submission Successful!'}
            </p>
          </div>`;
        } else {
          throw new Error();
        }
      } catch (err) {
        alert("Failed to submit. Please try again.");
        btn.disabled = false;
        btn.innerText = s.buttonText;
      }
    });
  }

  function renderField(q) {
    return `
      <div style="margin-bottom: 20px; text-align: left;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">
          ${q.text} ${q.required ? '<span style="color:red">*</span>' : ''}
        </label>
        <input 
          type="${q.type === 'email' ? 'email' : q.type === 'number' ? 'number' : 'text'}" 
          name="${q.id}" 
          placeholder="${q.placeholder || ''}"
          style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
          ${q.required ? 'required' : ''}
        />
      </div>
    `;
  }

  initForm();
})();