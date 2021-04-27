/**
 * Add padding to the number.
 * if I have the number 9, it will be "0009". 
 * If I have a number of say 10, it will be "0010". 
 * https://stackoverflow.com/a/10073737/4906586
 * @param number input number
 * @param length expected result length
 * @param char padding character [optional] default '0'
 */
const paddingNumber = (
  number,
  length,
  char = "0"
) => {
  let result = number.toString();

  while (result.length < length) {
    result = char + result;
  }

  return result;
};

module.exports = {paddingNumber};