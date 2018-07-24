import Datastore from 'nedb-promise';
// import Datastore from 'nedb';
import path from 'path';
import { remote } from 'electron';  // eslint-disable-line

const account = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/account.db'),
});
export default account;
