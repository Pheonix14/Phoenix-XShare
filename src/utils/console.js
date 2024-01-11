import chalk from 'chalk';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function validateLevel(level) {
  if (!['warn', 'error', 'info'].includes(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return level;
}

export default function log(message, level = 'info') {
  const validatedLevel = validateLevel(level);
  const timestamp = formatTimestamp(new Date());
  const coloredMessage = chalk[colors[validatedLevel]].bold(message);

  console.log(`${timestamp} [${validatedLevel.toUpperCase()}] ${coloredMessage}`);
}