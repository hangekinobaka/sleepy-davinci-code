const { paddingNumber } = require("./utils");
const {redis_keys} = require("../variables/config");

// Generate card array
const cardsArr = [];
for(let i = 0; i < 11; i++){
  cardsArr.push(i + 1 + "");
}
cardsArr.push("J");

/**
 * Generate a 4-digit room code
 * @param client An open redis client
 * count from 0000 to 9999
 * the pointer goes back to 0000 when comming back from 9999
 * if the room is taken, skip one digit to the next
 * if it goes to 9999 again in one turn, return @type{null}, meaning that `room is full`
 */
const roomCodeGenerator = async function(client){
  try {
    // init pointer
    let pointer = await client.get(redis_keys.ROOM_POINTER);
    if(pointer === null || pointer >= 9999) pointer = 1;
    else pointer++;
    await client.set(redis_keys.ROOM_POINTER, pointer);
    
    return {room_num: pointer, room_code: paddingNumber(pointer,4)};

  } catch (err) {
    console.error(err);
  }
};

// Fisher-Yates shuffle O(n2)
function shuffle(oldArr){
  const arr = [...oldArr];
  var result = [],
    random;
  while(arr.length>0){
    random = Math.floor(Math.random() * arr.length);
    result.push(arr[random]);
    arr.splice(random, 1);
  }
  return result;
}

const initData = () => {
  const wArr = [...shuffle(cardsArr)];
  const bArr = [...shuffle(cardsArr)];
  return {
    wArr,
    bArr,
    lines:{
      1: [],
      2: []
    },
    draggingLines:{
      1: [],
      2: []
    },
    guessing_card: {
      number: null, 
      index: null,
      isCorrect: null,
      opDraggingNum: null
    },
    restart:{
      1: false,
      2: false
    },
    isWinning: null,
    insertingIndex: null
  };
};

module.exports = {roomCodeGenerator, initData};