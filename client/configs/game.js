export const DESIGN_WIDTH = 2436
export const DESIGN_HEIGHT = 1125

export const CARD_STATUS = {
  none: 0,
  draw: 1,
  dragable: 2,
  stand:3,
  lay:4,
  disabled: 5
}

export const WHITE_CARD_NUM = 12
export const BLACK_CARD_NUM = 12

export const CARD_WIDTH = 180
export const CARD_HEIGHT = 252
export const CARD_WIDTH_LAY = 250
export const CARD_HEIGHT_LAY = 200

export const LINE_X = 120
export const LINE_Y = DESIGN_HEIGHT - 160
export const LINE_WIDTH = CARD_WIDTH * 12 + 20
export const LINE_HEIGHT = 140

export const CARD_PILE = {
  CARD_MARGIN_BETWWEN: 1000
}

// Usage example: numSheetTextures[NUM_SHEET_MAP.b2_l]
export const NUM_SHEET_MAP = {
  b1_l: '1b-l.png',
  b1_s: '1b-s.png',
  w1_l: '1w-l.png',
  w1_s: '1w-s.png',
  b2_l: '2b-l.png',
  b2_s: '2b-s.png',
  w2_l: '2w-l.png',
  w2_s: '2w-s.png',
  b3_l: '3b-l.png',
  b3_s: '3b-s.png',
  w3_l: '3w-l.png',
  w3_s: '3w-s.png',
  b4_l: '4b-l.png',
  b4_s: '4b-s.png',
  w4_l: '4w-l.png',
  w4_s: '4w-s.png',
  b5_l: '5b-l.png',
  b5_s: '5b-s.png',
  w5_l: '5w-l.png',
  w5_s: '5w-s.png',
  b6_l: '6b-l.png',
  b6_s: '6b-s.png',
  w6_l: '6w-l.png',
  w6_s: '6w-s.png',
  b7_l: '7b-l.png',
  b7_s: '7b-s.png',
  w7_l: '7w-l.png',
  w7_s: '7w-s.png',
  b8_l: '8b-l.png',
  b8_s: '8b-s.png',
  w8_l: '8w-l.png',
  w8_s: '8w-s.png',
  b9_l: '9b-l.png',
  b9_s: '9b-s.png',
  w9_l: '9w-l.png',
  w9_s: '9w-s.png',
  b10_l: '10b-l.png',
  b10_s: '10b-s.png',
  w10_l: '10w-l.png',
  w10_s: '10w-s.png',
  b11_l: '11b-l.png',
  b11_s: '11b-s.png',
  w11_l: '11w-l.png',
  w11_s: '11w-s.png',
  bJ_l: 'Jb-l.png',
  bJ_s: 'Jb-s.png', 
  wJ_l: 'Jw-l.png', 
  wJ_s: 'Jw-s.png'  
}

export const GAME_STATUS = {
  USER_1_DRAW_INIT: 1,
  USER_2_DRAW_INIT: 2,
  USER_1_DRAG_INIT: 3,
  USER_2_DRAG_INIT: 4,
  USER_1_DRAW: 5,
  USER_2_DRAW: 6,
  USER_1_GUESS_MUST: 7,
  USER_2_GUESS_MUST: 8,
  USER_1_GUESS: 9,
  USER_2_GUESS: 10,
  USER_1_ANSWER: 11,
  USER_2_ANSWER: 12,
  USER_1_DRAG: 13,
  USER_2_DRAG: 14,
  USER_LEFT: 15,
  USER_EXIT: 16
}