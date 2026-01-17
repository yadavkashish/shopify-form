// extensions/forms/assets/form-renderer.js
(function () {
  const container = document.getElementById('formify-container');
  const formId = container?.getAttribute('data-form-id');
  const appTarget = document.getElementById('formify-app');

  // CHANGE THIS: Replace with your actual ngrok or production URL
  const APP_URL = "https://shop-form-nu.vercel.app"; 

  if (!formId || formId.trim() === "") {
    appTarget.innerHTML = "<p style='color: red;'>Missing Form ID. Please add it in the Theme Editor.</p>";
    return;
  }

  async function initForm() {
    try {
      console.log("Formify: Fetching form...", formId);
      const response = await fetch(`${APP_URL}/api/public/form/${formId}`);
      
      if (!response.ok) throw new Error("Form not found");
      
      const form = await response.json();
      console.log("Formify: Data received", form);
      
      renderForm(form);
    } catch (err) {
      console.error("Formify Error:", err);
      appTarget.innerHTML = "<p>Error loading form. Check console for details.</p>";
    }
  }

  function renderForm(form) {
    const s = form.settings;
    const questions = form.questions || [];

    appTarget.innerHTML = `
      <div style="
        max-width: ${s.maxWidth}px; 
        background: ${s.backgroundColor}; 
        padding: ${s.padding}px; 
        border-radius: ${s.borderRadius}px;
        text-align: ${s.textAlign};
        color: ${s.textColor};
        font-family: ${s.fontFamily};
        margin: 20px auto;
        border: 1px solid #eee;
      ">
        <h2 style="margin-top: 0;">${form.title}</h2>
        <p style="margin-bottom: 25px; opacity: 0.8;">${s.description}</p>
        <form id="formify-submit-form">
          ${questions.map(q => renderField(q, s)).join('')}
          <button type="submit" style="
            width: 100%;
            background: ${s.buttonColor};
            color: ${s.buttonTextColor || '#ffffff'};
            padding: 12px;
            border: none;
            border-radius: ${s.borderRadius}px;
            cursor: pointer;
            font-weight: bold;
            font-size: 16px;
          ">
            ${s.buttonText}
          </button>
        </form>
      </div>
    `;
  }

  function renderField(q, s) {
    return `
      <div style="margin-bottom: 20px; text-align: left;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">
          ${q.text} ${q.required ? '<span style="color:red">*</span>' : ''}
        </label>
        <input 
          type="${q.type === 'email' ? 'email' : 'text'}" 
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