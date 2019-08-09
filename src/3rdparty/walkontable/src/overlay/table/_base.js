import Table from '../../table';

class OverlayTable extends Table {
  constructor(wotInstance, table) {
    super(wotInstance, table);
    this.isClone = true;
  }
}

export default OverlayTable;
