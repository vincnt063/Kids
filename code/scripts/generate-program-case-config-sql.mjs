import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const caseDataRoot = path.join(projectRoot, 'frontend', 'src', 'data', 'teaching-cases')

const CONFIG_KEYS = [
  'shortTitle',
  'goal',
  'tip',
  'helperText',
  'taskSteps',
  'availableBlocks',
  'focusBlocks',
  'difficultyLabel',
  'coverEmoji',
  'knowledgePoints',
  'backgroundId',
  'stage',
  'evaluation'
]

const loadCaseConfig = (filePath) => {
  const source = fs.readFileSync(filePath, 'utf8')
  const match = source.match(/const\s+\w+\s*=\s*({[\s\S]*?})\s*export\s+default/)

  if (!match) {
    throw new Error(`无法解析关卡文件: ${filePath}`)
  }

  return Function(`return (${match[1]})`)()
}

const escapeSqlString = (value) => value.replace(/'/g, "''")

const buildUpdateSql = (caseInfo) => {
  const caseConfig = Object.fromEntries(
    CONFIG_KEYS.map((key) => [key, caseInfo[key]])
  )
  const json = JSON.stringify(caseConfig)

  return `UPDATE \`program_case\`
SET \`case_config\` = '${escapeSqlString(json)}',
    \`update_time\` = NOW()
WHERE \`id\` = ${caseInfo.id};`
}

const caseDirectories = fs.readdirSync(caseDataRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^level-\d+/.test(entry.name))

const cases = caseDirectories
  .map((entry) => path.join(caseDataRoot, entry.name, 'index.js'))
  .filter((filePath) => fs.existsSync(filePath))
  .map((filePath) => loadCaseConfig(filePath))
  .filter((item) => Number.isInteger(item?.id))
  .sort((left, right) => left.id - right.id)

const statements = [
  'USE `kids_programming`;',
  '',
  'SET @has_case_config = (',
  '  SELECT COUNT(*)',
  '  FROM information_schema.COLUMNS',
  "  WHERE TABLE_SCHEMA = DATABASE()",
  "    AND TABLE_NAME = 'program_case'",
  "    AND COLUMN_NAME = 'case_config'",
  ');',
  '',
  "SET @ddl = IF(@has_case_config = 0, 'ALTER TABLE `program_case` ADD COLUMN `case_config` JSON NULL COMMENT ''关卡运行配置(JSON)'' AFTER `hint`', 'SELECT 1');",
  'PREPARE stmt FROM @ddl;',
  'EXECUTE stmt;',
  'DEALLOCATE PREPARE stmt;',
  ''
]

cases.forEach((caseInfo) => {
  statements.push(buildUpdateSql(caseInfo))
  statements.push('')
})

process.stdout.write(statements.join('\n'))
