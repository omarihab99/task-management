export default () => ({
  port: process.env.PORT || 5000,
  frontUrl: process.env.FRONT_URL,
  environment: process.env.ENV,
  postgres: {
    db:
      process.env.ENV === 'test'
        ? process.env.PG_DATABASE_TEST
        : process.env.PG_DATABASE,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    port: +(process.env.PG_PORT || 1),
  },
  jwt: { secret: process.env.SECRET },
  bcrypt: {
    paper: process.env.PAPER,
    salt: +(process.env.SALT || '1'),
  },
  mailer: {
    username: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    port: +(process.env.MAIL_PORT || '1'),
    host: process.env.MAIL_HOST,
  },
});
