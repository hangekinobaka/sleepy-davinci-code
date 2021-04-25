const Client = require("../redis");
const { paddingNumber } = require("./utils");

/**
 * Generate a 4-digit room code
 * count from 0000 to 9999
 * the pointer goes back to 0000 when comming back from 9999
 * if the room is taken, skip one digit to the next
 * if it goes to 9999 again in one turn, return @type{null}, meaning that `room is full`
 */
const roomCodeGenerator = async function(){
  const client = new Client();

  try {
    // init pointer
    let pointer = await client.get("roomPointer");
    if(pointer === null) pointer = 0;
    else pointer++;
    // paddingNumber(pointer);


  } catch (err) {
    console.error(err);
  }

  client.quit();
};

module.exports = {roomCodeGenerator};