const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('./config');
const bcrypt = require('bcrypt');

function initialize(passport) {
  console.log('Initialized');

  const authenticateUser = (username, password, done) => {
    pool.query(
      `SELECT u.id, u.username, u.password, r.role_name FROM users u
       LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = $1`,
      [username],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);
        if (results.rows.length > 0) {
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password is not correct' });
            }
          });
        } else {
          return done(null, false, { message: 'You are not registered yet!' });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    pool.query(
      `SELECT u.id, u.name, u.username, r.role_name FROM users u
       LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1`,
      [id],
      (err, results) => {
        if (err) {
          return done(err);
        }
        if (results.rows.length > 0) {
          const user = results.rows[0];
          return done(null, user);
        } else {
          return done(new Error('User not found'));
        }
      }
    );
  });
}

module.exports = initialize;
