// extensions/form-block/assets/form-renderer.js
(function() {
  const container = document.getElementById('formify-container');
  const formId = container?.getAttribute('data-form-id');
  const appTarget = document.getElementById('formify-app');

  if (!formId) {
    appTarget.innerHTML = "<p>Please enter a Form ID in the theme editor.</p>";
    return;
  }

  async function initForm() {
    try {
      // Replace with your actual App URL
      const response = await fetch(`https://your-app-url.com/api/public/form/${formId}`);
      const form = await response.json();

      renderForm(form);
    } catch (err) {
      appTarget.innerHTML = "<p>Error loading form.</p>";
    }
  }

  function renderForm(form) {
    const settings = form.settings;
    const questions = form.questions; // This is the JSON array from Prisma

    let html = `
      <div style="
        max-width: ${settings.maxWidth}px; 
        background: ${settings.backgroundColor}; 
        padding: ${settings.padding}px; 
        border-radius: ${settings.borderRadius}px;
        text-align: ${settings.textAlign};
        color: ${settings.textColor};
        font-family: sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        margin: auto;
      ">
        <h2>${form.title}</h2>
        <p style="opacity: 0.8; margin-bottom: 20px;">${settings.description}</p>
        <form id="formify-actual-form">
          ${questions.map(q => renderField(q, settings)).join('')}
          <button type="submit" style="
            width: 100%;
            background: ${settings.buttonColor};
            color: ${settings.buttonTextColor || '#fff'};
            padding: 12px;
            border: none;
            border-radius: ${settings.borderRadius}px;
            cursor: pointer;
            font-weight: bold;
          ">
            ${settings.buttonText}
          </button>
        </form>
      </div>
    `;

    appTarget.innerHTML = html;
  }

  function renderField(q, settings) {
    const radius = settings.borderRadius / 2;
    return `
      <div style="margin-bottom: 15px; text-align: left;">
        <label style="display: block; margin-bottom: 5px; font-weight: 600;">
          ${q.text} ${q.required ? '<span style="color:red">*</span>' : ''}
        </label>
        <input 
          type="${q.type === 'email' ? 'email' : 'text'}" 
          name="${q.id}" 
          placeholder="${q.placeholder || ''}"
          style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: ${radius}px; box-sizing: border-box;"
          ${q.required ? 'required' : ''}
        />
      </div>
    `;
  }

  initForm();
})();