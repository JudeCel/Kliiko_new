'use strict';

const MEMBER_COLOURS = ['#E51E39', '#4DC0E9', '#4CB74A', '#c3be2e', '#9a58a3', '#34499e', '#f38220', '#ef6187', '#9b0e26'];

module.exports = {
  hexRegex: '^#+([a-fA-F0-9]{6})$',
  memberColours: {
    facilitator: MEMBER_COLOURS[0],
    participants: {
      '1': MEMBER_COLOURS[1],
      '2': MEMBER_COLOURS[2],
      '3': MEMBER_COLOURS[3],
      '4': MEMBER_COLOURS[4],
      '5': MEMBER_COLOURS[5],
      '6': MEMBER_COLOURS[6],
      '7': MEMBER_COLOURS[7],
      '8': MEMBER_COLOURS[8]
    }
  },
  preferenceColours: {
    browserBackground: '#EFEFEF',
    font: '#58595B',
    mainBackground: '#FFFFFF',
    headerButton: '#4CBFE9',
    mainBorder: '#F0E935',
    consoleButtonActive: '#4CB649',
    email: {
        hyperlinks: '#2F9F69',
        notAtAllButton: '#E51D39',
        acceptButton: '#4CB649',
        notThisTimeButton: '#4CBFE9',
    },
  },
}
