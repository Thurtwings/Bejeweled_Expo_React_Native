import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('game.db');

export function initializeDB(callback)
{
    db.transaction(
        tx => {
            tx.executeSql(
                'create table if not exists users (id integer primary key not null, username text, password text, best_score int default 0);',
                [],
                () => console.log("Table users crée ou existe déjà")
            );
        },
        (error) => {
            console.error("DB Transaction Error:", error.message);
            if (callback) callback(false, error.message);
        },
        () => {
            console.log("DB initialisée.");
            if (callback) callback(true);
        }
    );
}

export function registerUser(username, password, callback)
{
    db.transaction(tx => {
        tx.executeSql(
            "select * from users where username = ?;",
            [username],
            (_, resultSet) => {
                if (resultSet.rows.length > 0)
                {
                    callback(false, "Username already exists.");
                }
                else
                {
                    const hashedPassword = hashPassword(password);
                    tx.executeSql(
                        "insert into users (username, password, best_score) values (?, ?, 0);",
                        [username, hashedPassword],
                        (_, result) => callback(true, "Registration successful."),
                        (_, error) => callback(false, error)
                    );
                }
            }
        );
    });
}

export function logAllUsers(callback)
{
    db.transaction(tx => {
        tx.executeSql(
            "select * from users;",
            [],
            (_, resultSet) => callback(true, resultSet.rows._array),
            (_, error) => callback(false, error)
        );
    });
}

export function authenticateUser(username, password, callback)
{
    //console.log("authenticateUser function called.");

    db.transaction(tx => {
        //console.log("Transaction started.");

        tx.executeSql(
            "select * from users where username = ?;",
            [username],
            (_, resultSet) => {
                //console.log("SQL executed. Result set length:", resultSet.rows.length);

                if (resultSet.rows.length > 0)
                {
                    const user = resultSet.rows.item(0);
                    //console.log("User found:", user);

                    if (hashPassword(password) === user.password)
                    {
                        //console.log("Password match.");
                        callback(true, "Login successful.");
                    }
                    else
                    {
                        //console.log("Password mismatch.");
                        callback(false, "Incorrect password.");
                    }
                }
                else
                {
                    //console.log("User not found.");
                    callback(false, "User not found.");
                }
            },
            (_, error) => {
                //console.log("SQL error:", error.message);
                callback(false, error.message);
            }
        );
    });
}

export function hashPassword(password)
{
    return password.split('').reverse().join('');
}


export function saveScore(username, score, callback)
{
    db.transaction(tx => {
        tx.executeSql(
            "select best_score from users where username = ?;",
            [username],
            (_, resultSet) => {
                const currentBestScore = resultSet.rows.item(0).best_score;

                if (score > currentBestScore)
                {
                    tx.executeSql(
                        "update users set best_score = ? where username = ?;",
                        [score, username],
                        (_, result) => callback(true, "Score updated successfully."),
                        (_, error) => callback(false, error)
                    );
                }
                else
                {
                    callback(true, "Score not updated as it is not higher than the current best score.");
                }
            }
        );
    });
}


export function getTopScores(callback)
{
    db.transaction(tx => {
        tx.executeSql(
            "select username, best_score from users order by best_score desc limit 3;",
            [],
            (_, resultSet) => callback(true, resultSet.rows._array),
            (_, error) => callback(false, error)
        );
    });
}

export function getUserBestScore(username, callback)
{
    db.transaction(tx => {
        tx.executeSql(
            "select best_score from users where username = ?;",
            [username],
            (_, resultSet) => callback(true, resultSet.rows.item(0).best_score),
            (_, error) => callback(false, error)
        );
    });
}
