const PINCODE_LENGTH = 6;
const MAX_REPEATS = 2;
const MAX_SEQUENTIAL_NUMBERS = 2;
const MAX_REPEATING_SETS = 2;

function validatePincode(pin: number): boolean {
  const pinString = pin.toString();

  if (pinString.length < PINCODE_LENGTH) return false;

  let repeatCount = 0;
  let sequenceCount = 0;
  let pairCount = 0;
  let lastDifference = 0;

  // Iterate over the pincode string
  for (let i = 0; i < pinString.length; i++) {
    const currentNumber = parseInt(pinString[i], 10);
    const lastNumber = parseInt(pinString[i - 1], 10);
    const secondLastNumber = parseInt(pinString[i - 2], 10);
    const currentDifference = currentNumber - lastNumber;

    // Check for repeating numbers
    if (currentNumber === lastNumber) {
      repeatCount++;

      if (repeatCount > MAX_REPEATS) return false;

      if (i > 1 && lastNumber !== secondLastNumber) {
        pairCount++;
      }

      if (pairCount >= MAX_REPEATING_SETS) return false;
    } else {
      repeatCount = 1;
    }

    // Check for sequential numbers
    if (Math.abs(currentDifference) === 1) {
      if (
        Math.abs(lastDifference) === 1 &&
        currentDifference === lastDifference
      ) {
        sequenceCount++;
      } else {
        sequenceCount = 1;
      }

      if (sequenceCount >= MAX_SEQUENTIAL_NUMBERS) return false;
    }

    lastDifference = currentDifference;
  }

  return true;
}

const testPincodes = [
  { pin: 17283, result: false },
  { pin: 172839, result: true },
  { pin: 111822, result: false },
  { pin: 112762, result: true },
  { pin: 123743, result: false },
  { pin: 321895, result: false },
  { pin: 124578, result: true },
  { pin: 112233, result: false },
  { pin: 882211, result: false },
  { pin: 887712, result: true },
];

testPincodes.forEach(({ pin, result }) => {
  const isValid = validatePincode(pin);
  console.log(`${pin} ${isValid ? '✅' : '❌'}`);
  if (isValid !== result) {
    console.log(
      `\x1b[31mTest failed for pincode ${pin}. Expected ${result} but got ${isValid}.\x1b[0m`,
    );
  }
});
