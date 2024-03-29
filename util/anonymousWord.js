'use strict';
var csv = require('fast-csv');
var pathToFile = './util/files/V1-AnonymousCodeWords.csv'
let Bluebird = require('bluebird');
var _ = require('lodash');
var wordsList = [];

const parseFile = () => {
  return new Bluebird((resolve, reject) =>  {
    if (_.isEmpty(wordsList)) {
      try {
        csv.fromPath(pathToFile, {
          headers: true
        }).on('data', function(data) {
          wordsList.push(data.comet)
        }).on('error', function(error) {
          reject(error);
        }).on('end', function() {
          wordsList = _.uniq(wordsList);
          resolve(wordsList);
        });
      } catch (e) {
        wordsList = [];
        reject(e);
      }
    }else{
      resolve(wordsList);
    }
  })
}

const getWord = (usedNamesList, listFromFile) => {
  return new Bluebird((resolve, reject) =>  {
    let diff = _.difference(listFromFile, usedNamesList);
    if (diff.length > 0) {
      resolve(_.sample(diff));
    }else{
      resolve(findCustomWordInLists(listFromFile, usedNamesList))
    }
  })
}


function findCustomWordInLists(listFromFile, usedNamesList) {
  let namePrefixNr = 1;
  while (true) {
    let tmpName = null;
    for (let item of listFromFile) {
      if (!_.includes(usedNamesList, `${item}#${namePrefixNr}`)) {
        tmpName = `${item}#${namePrefixNr}`
        break;
      }
    }

    if (tmpName) {
      return tmpName;
    }else{
      namePrefixNr++
    }
  }
}

module.exports = {
  parseFile: parseFile,
  getWord: getWord,
  wordsList: wordsList
}
