import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('scores.db');

export function initializeDB() {
    db.transaction(tx => {
        tx.executeSql('create table if not exists scores (id integer primary key not null, name text, score int);');
    });
}
