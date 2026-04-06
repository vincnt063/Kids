import level01 from './level-01-home'
import level02 from './level-02-stars'
import level03 from './level-03-obstacle'
import level04 from './level-04-coordinates'
import level05 from './level-05-square'
import level06 from './level-06-repeat-row'
import level07 from './level-07-nested-repeat'
import level08 from './level-08-if-else'
import level09 from './level-09-switch-signal'
import level10 from './level-10-repeat-until'

export const teachingCases = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10
]

export const teachingCaseMap = teachingCases.reduce((result, item) => {
  result[item.id] = item
  return result
}, {})

export const getTeachingCaseById = (caseId) => {
  return teachingCaseMap[Number(caseId)] || teachingCases[0]
}
