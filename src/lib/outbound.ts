export function openWhatsApp(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  window.open(
    `https://wa.me/${digits}?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export function openMail(email: string, subject: string, body: string) {
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
