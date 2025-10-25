/**
 * Valide un numéro de SIRET (14 chiffres) avec l'algorithme de Luhn.
 */
export const validateSiret = (value: string): boolean => {
  const digits = value.replace(/\s+/g, "");

  if (!/^\d{14}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  const length = digits.length;

  for (let offset = 0; offset < length; offset += 1) {
    const character = digits[length - 1 - offset];
    const digit = Number.parseInt(character ?? "0", 10);

    if (Number.isNaN(digit)) {
      return false;
    }

    let product = digit;

    if (offset % 2 === 1) {
      product = digit * 2;
      if (product > 9) {
        product -= 9;
      }
    }

    sum += product;
  }

  return sum % 10 === 0;
};
