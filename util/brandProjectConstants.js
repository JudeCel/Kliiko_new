'use strict';

const PARTICIPANT_COLOURS = ['#4DC0E9', '#4CB74A', '#F0EA36', '#9A58A3', '#34499E', '#F38220', '#EF6187', '#9B0E26'];

module.exports = {
  hexRegex: '^#+([a-fA-F0-9]{6})$',
  participantColours: PARTICIPANT_COLOURS,
  preferenceColours: {
    browserBackground: '#EFEFEF',
    mainBackground: '#FFFFFF',
    mainBorder: '#F0E935',
    font: '#58595B',
    headerButton: '#4CBFE9',
    consoleButtonActive: '#4CB649',
    facilitator: '#E51E39',
    participants: {
      '1': PARTICIPANT_COLOURS[0],
      '2': PARTICIPANT_COLOURS[1],
      '3': PARTICIPANT_COLOURS[2],
      '4': PARTICIPANT_COLOURS[3],
      '5': PARTICIPANT_COLOURS[4],
      '6': PARTICIPANT_COLOURS[5],
      '7': PARTICIPANT_COLOURS[6],
      '8': PARTICIPANT_COLOURS[7]
    }
  }
}
