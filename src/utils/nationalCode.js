export const isValidNationalCode = (nationalCode) => {
  if (!/^\d{10}$/.test(nationalCode)) {
    return false;
  }

  const invalidCodes = [
    '0000000000',
    '1111111111',
    '2222222222',
    '3333333333',
    '4444444444',
    '5555555555',
    '6666666666',
    '7777777777',
    '8888888888',
    '9999999999'
  ];

  if (invalidCodes.includes(nationalCode)) {
    return false;
  }

  const check = Number(nationalCode[9]);

  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += Number(nationalCode[i]) * (10 - i);
  }

  const remainder = sum % 11;

  return remainder < 2
    ? check === remainder
    : check === 11 - remainder;
};
