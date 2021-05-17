export const GAME_INFO = {
  initTitle: 'Please wait',
  initText: 'If there is no response. Try to refresh the page',
  waitingTitle: 'Waiting',
  waitingText: 'Waiting for your opponent...',
  roomCodeText: 'Your room code is: ',
  opLeftTitle: 'Your Opponent has left',
  opLeftText: 'If he or she comes back in 3 mins, the game will be resumed',
  opExitTitle: 'Your Opponent has exited',
  opExitText: 'Please click exit and restart a game',
  drawCardNotification: 'Please draw a card...',
  waitDrawNotification: 'Opponent is drawing card.',
  putCardNotification: 'Please put the cards in your line',
  waitOpFinishNotification: 'Your opponent didn\'t finish yet, please wait.',
  guessCardNotification: 'Please guess a card in your opponent\'s line...',
  waitOpConfirmNotification: 'Opponent is confirming your guess. Please wait.',
  isCorrectNotification: 'Nice, you are correct!',
  makeDecisionNotification: 'Opponent is making decisions. Please wait.',
  waitOpPutNotification: 'Your opponent is inserting the card, please wait.',
  waitOpRestartNotification: 'Your opponent didn\'t restart yet, please wait.',
  // functions
  confirmNumInfoGenerator: num => `
  <span>Your opponent thinks that this card is a</span> 
  <span class="highlight" style="margin-left: 8px;">${num}</span>`,
  putCardInfoGenerator: isCorrect => isCorrect ? 
    'Please put your card in line.' :
    'Sorry, <span class="error">wrong guess</span>. Please put your card in line.', 
  waitGuessInfoGenerator: statusData => {
    switch(statusData.isCorrect){
    case false:
      return 'Sorry, <span class="error">wrong guess</span>. Opponent is guessing your card. Please wait.'
    case true:
    default:
      return 'Opponent is guessing your card. Please wait.'
    }
  }  
}