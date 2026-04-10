export async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return true;
}

export function showToast(message) {
  const root = document.querySelector("#toast-root");
  if (!root) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  root.append(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

export function pulseButton(button, copiedLabel = "Copiado") {
  if (!button) {
    return;
  }

  const original = button.dataset.originalLabel || button.textContent;
  button.dataset.originalLabel = original;
  button.textContent = copiedLabel;
  button.classList.add("is-active");

  window.setTimeout(() => {
    button.textContent = original;
    button.classList.remove("is-active");
  }, 1600);
}
