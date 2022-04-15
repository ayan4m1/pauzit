import winston from 'winston';

const { Container, format, transports } = winston;
const { combine, label, prettyPrint, printf } = format;

const loggers = {};
const container = new Container();

const createLogger = (category, categoryLabel) => {
  let formatter = (data) => `[${data.level}][${data.label}] ${data.message}`;

  container.add(category, {
    transports: [
      new transports.Console({
        level: process.env.PAU_LOG_LEVEL || 'info',
        format: combine.apply(null, [
          label({ label: categoryLabel }),
          prettyPrint(),
          printf(formatter)
        ])
      })
    ]
  });

  return container.get(category);
};

export const getLogger = (category, categoryLabel = category) => {
  if (!loggers[category]) {
    loggers[category] = createLogger(category, categoryLabel);
  }

  return loggers[category];
};
