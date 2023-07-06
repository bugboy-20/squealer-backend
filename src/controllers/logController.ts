import {Collection} from 'mongoose'
import {db_op} from '../db_utils'


async function addLog() {
    db_op("squealer","logs", (c : Collection<Document>) => {})
}
