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
          <button type="submit" id="formify-btn" style="width: 100%; background: ${s.buttonColor}; color: #fff; padding: 12px; border: none; border-radius: ${s.borderRadius}px; cursor: pointer; font-weight: bold; font-size: 16px; margin-top: 10px;">
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
        if (q.type === 'checkboxes') {
          // Use getAll for checkboxes to capture multiple values
          answers[q.text] = formData.getAll(q.id).join(', ');
        } else {
          answers[q.text] = formData.get(q.id);
        }
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
    let inputHtml = '';
    const commonStyle = `width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-family: inherit; font-size: 14px;`;

    if (q.type === 'select') {
      inputHtml = `
        <select name="${q.id}" style="${commonStyle}" ${q.required ? 'required' : ''}>
          <option value="" disabled selected>${q.placeholder || 'Select an option...'}</option>
          ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      `;
    } else if (q.type === 'checkboxes') {
      inputHtml = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${q.options.map((opt, i) => `
            <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; cursor: pointer; font-size: 14px;">
              <input type="checkbox" name="${q.id}" value="${opt}" style="width: auto;"> ${opt}
            </label>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'paragraph') {
      inputHtml = `
        <textarea 
          name="${q.id}" 
          placeholder="${q.placeholder || ''}" 
          style="${commonStyle} min-height: 100px; resize: vertical;" 
          ${q.required ? 'required' : ''}
        ></textarea>
      `;
    } else {
      inputHtml = `
        <input 
          type="${q.type === 'email' ? 'email' : q.type === 'number' ? 'number' : 'text'}" 
          name="${q.id}" 
          placeholder="${q.placeholder || ''}"
          style="${commonStyle}"
          ${q.required ? 'required' : ''}
        />
      `;
    }

    return `
      <div style="margin-bottom: 20px; text-align: left;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px;">
          ${q.text} ${q.required ? '<span style="color:red">*</span>' : ''}
        </label>
        ${inputHtml}
      </div>
    `;
  }

  initForm();
})();