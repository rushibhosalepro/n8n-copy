const inputTypes = [
  "text",
  "email",
  "number",
  "password",
  "url",
  "tel",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "file",
  "checkbox",
  "radio",
  "range",
  "hidden",
];

interface FormFields {
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
}
export const formBuilder = ({
  formDescription,
  formTitle,
  formFields,
  webhookId,
}: {
  formTitle: string;
  formDescription: string;
  formFields: FormFields[];
  webhookId: string;
}) => {
  const allfields = formFields
    .map((field) => {
      const requiredAttr = field.required ? "required" : "";
      return `<div class="mb-4">
        <label for="${field.name}" class="block text-gray-700 font-medium mb-1">${field.name}</label>
        <input 
          type="${field.type}" 
          id="${field.name}" 
          name="${field.name}" 
          placeholder="${field.placeholder}" 
          ${requiredAttr} 
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
  <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
    <h1 class="text-2xl font-bold mb-2 text-center">${formTitle}</h1>
    <p class="text-gray-600 mb-6 text-center">${formDescription}</p>
    <form id="form" class="space-y-4">
      ${allfields}
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
        Submit
      </button>
    </form>
    <div id="response" class="mt-4 text-green-600 font-semibold"></div>
  </div>

  <script>
    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); 
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      const response = await fetch('/${webhookId}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      document.getElementById('response').innerText = 'Form submitted successfully!';
      console.log(result);
    });
  </script>
</body>
</html>`;
};
