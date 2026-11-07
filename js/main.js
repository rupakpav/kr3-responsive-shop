const orderDialog = document.getElementById('order-dialog');
const successMessage = document.querySelector('.success-message');
let opener = null;

// Текст ошибки использует встроенную HTML-валидацию браузера.
function showFieldError(field) {
  const error = document.getElementById(field.id + '-error');
  if (!error) return;
  const invalid = !field.checkValidity();
  error.textContent = invalid ? field.validationMessage : '';
  error.hidden = !invalid;
  if (invalid) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }
}

// Кнопки окна отделены от ссылок на страницу товара.
document.querySelectorAll('[data-order-product]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!orderDialog) return;
    opener = button;
    const form = orderDialog.querySelector('.order-form');
    form.reset();
    form.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
    form.querySelectorAll('.order-form__error').forEach((error) => {
      error.hidden = true;
      error.textContent = '';
    });
    form.elements.product.value = button.dataset.orderProduct;
    successMessage.hidden = true;
    orderDialog.showModal();
  });
});
document.querySelector('[data-close-dialog]')?.addEventListener('click', () => orderDialog.close());
orderDialog?.addEventListener('close', () => opener?.focus());

// Из URL принимается только товар, который есть в списке.
const requestedProduct = new URLSearchParams(window.location.search).get('product');
document.querySelectorAll('.order-form').forEach((form) => {
  const product = form.elements.product;
  if (requestedProduct && Array.from(product.options).some((option) => option.value === requestedProduct)) {
    product.value = requestedProduct;
  }
  form.addEventListener('input', (event) => {
    if (event.target.hasAttribute('aria-invalid')) showFieldError(event.target);
    successMessage.hidden = true;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successMessage.hidden = true;
    const fields = Array.from(form.elements).filter((field) => field.willValidate);
    fields.forEach(showFieldError);
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.reset();
    if (orderDialog?.contains(form)) orderDialog.close();
    successMessage.hidden = false;
    successMessage.focus();
  });
});
