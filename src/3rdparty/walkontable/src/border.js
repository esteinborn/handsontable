import {
  addClass,
  hasClass,
  removeClass,
  getComputedStyle,
  getTrimmingContainer,
  innerWidth,
  innerHeight,
  offset,
  outerHeight,
  outerWidth,
} from './../../../helpers/dom/element';
import { stopImmediatePropagation } from './../../../helpers/dom/event';
import { isMobileBrowser } from './../../../helpers/browser';
import EventManager from './../../../eventManager';
import CellCoords from './cell/coords';

const cornerDefaultStyle = {
  width: 6,
  height: 6,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#FFF'
};
const defaultBorder = {
  width: 1,
  color: '#000',
};
const selectionHandleDefaultWidth = 10;
const selectionHandleHitAreaDefaultWidth = 40;

/**
 *
 */
class Border {
  /**
   * @param {Walkontable} wotInstance
   * @param {Object} settings
   */
  constructor(wotInstance, settings) {
    if (!settings) {
      return;
    }
    this.eventManager = new EventManager(wotInstance);
    this.wot = wotInstance;
    this.settings = settings;
    this.mouseDown = false;

    this.bordersHolder = this.wot.wtTable.bordersHolder;

    if (!this.bordersHolder) {
      this.bordersHolder = this.wot.rootDocument.createElement('div');
      this.bordersHolder.className = 'htBorders';
      this.wot.wtTable.bordersHolder = this.bordersHolder;
      this.wot.wtTable.spreader.appendChild(this.bordersHolder);
    }

    this.top = null;
    this.left = null;
    this.bottom = null;
    this.right = null;
    this.corner = null;
    this.selectionHandles = {};

    this.registerListeners();
  }

  /**
   * Perform a callback for all DOM elements
   * @param {Function} callback Function to perform for all elements, with that element as the argument
   */
  forAllDomElements(callback) {
    if (this.top) {
      callback(this.top);
    }
    if (this.left) {
      callback(this.left);
    }
    if (this.bottom) {
      callback(this.bottom);
    }
    if (this.right) {
      callback(this.right);
    }
    if (this.corner) {
      callback(this.corner);
    }
    if (this.selectionHandles.topLeft) {
      callback(this.selectionHandles.topLeft);
      callback(this.selectionHandles.bottomRight);
      callback(this.selectionHandles.topLeftHitArea);
      callback(this.selectionHandles.bottomRightHitArea);
    }
  }

  /**
   * Register all necessary events
   */
  registerListeners() {
    const documentBody = this.wot.rootDocument.body;

    this.eventManager.addEventListener(documentBody, 'mousedown', () => this.onMouseDown());
    this.eventManager.addEventListener(documentBody, 'mouseup', () => this.onMouseUp());
  }

  /**
   * Mouse down listener
   *
   * @private
   */
  onMouseDown() {
    this.mouseDown = true;
  }

  /**
   * Mouse up listener
   *
   * @private
   */
  onMouseUp() {
    this.mouseDown = false;
  }

  /**
   * Mouse enter listener for fragment selection functionality.
   *
   * @private
   * @param {Event} event Dom event
   * @param {HTMLElement} parentElement Part of border element.
   */
  onMouseEnter(event, parentElement) {
    if (!this.mouseDown || !this.wot.getSetting('hideBorderOnMouseDownOver')) {
      return;
    }
    event.preventDefault();
    stopImmediatePropagation(event);

    const _this = this;
    const documentBody = this.wot.rootDocument.body;
    const bounds = parentElement.getBoundingClientRect();
    // Hide border to prevents selection jumping when fragmentSelection is enabled.
    parentElement.style.display = 'none';

    function isOutside(mouseEvent) {
      if (mouseEvent.clientY < Math.floor(bounds.top)) {
        return true;
      }
      if (mouseEvent.clientY > Math.ceil(bounds.top + bounds.height)) {
        return true;
      }
      if (mouseEvent.clientX < Math.floor(bounds.left)) {
        return true;
      }
      if (mouseEvent.clientX > Math.ceil(bounds.left + bounds.width)) {
        return true;
      }
    }

    function handler(handlerEvent) {
      if (isOutside(handlerEvent)) {
        _this.eventManager.removeEventListener(documentBody, 'mousemove', handler);
        parentElement.style.display = 'block';
      }
    }

    this.eventManager.addEventListener(documentBody, 'mousemove', handler);
  }

  /**
   * Create border elements
   *
   * @param {Object} settings
   */
  createBorder(position) {
    const div = this.wot.rootDocument.createElement('div');

    div.className = `wtBorder ${this.settings.className || ''}`; // + borderDivs[i];

    const style = div.style;
    style.backgroundColor = (this.settings[position] && this.settings[position].color) ? this.settings[position].color : this.settings.border.color;
    style.height = (this.settings[position] && this.settings[position].width) ? `${this.settings[position].width}px` : `${this.settings.border.width}px`;
    style.width = (this.settings[position] && this.settings[position].width) ? `${this.settings[position].width}px` : `${this.settings.border.width}px`;

    this.bordersHolder.appendChild(div);
    this[position] = div;

    if (position === 'corner') {
      div.className += ' corner';
      style.width = `${cornerDefaultStyle.width}px`;
      style.height = `${cornerDefaultStyle.height}px`;
      style.border = [
        `${cornerDefaultStyle.borderWidth}px`,
        cornerDefaultStyle.borderStyle,
        cornerDefaultStyle.borderColor
      ].join(' ');
    }

    this.eventManager.addEventListener(div, 'mouseenter', event => this.onMouseEnter(event, div));
  }

  /**
   * Create multiple selector handler for mobile devices
   */
  createMultipleSelectorHandles(position) {
    const positionHitArea = `${position}HitArea`;

    const div = this.wot.rootDocument.createElement('DIV');
    this.selectionHandles[position] = div;
    const divHitArea = this.wot.rootDocument.createElement('DIV');
    this.selectionHandles[positionHitArea] = divHitArea;

    div.className = `${position}SelectionHandle`;
    divHitArea.className = `${position}SelectionHandle-HitArea`;

    Object.assign(divHitArea.style, {
      position: 'absolute',
      height: `${selectionHandleHitAreaDefaultWidth}px`,
      width: `${selectionHandleHitAreaDefaultWidth}px`,
      'border-radius': `${parseInt(selectionHandleHitAreaDefaultWidth / 1.5, 10)}px`,
    });

    Object.assign(div.style, {
      position: 'absolute',
      height: `${selectionHandleDefaultWidth}px`,
      width: `${selectionHandleDefaultWidth}px`,
      'border-radius': `${parseInt(selectionHandleDefaultWidth / 1.5, 10)}px`,
      background: '#F5F5FF',
      border: '1px solid #4285c8'
    });

    this.bordersHolder.appendChild(div);
    this.bordersHolder.appendChild(divHitArea);

    this.eventManager.addEventListener(div, 'mouseenter', event => this.onMouseEnter(event, div));
    this.eventManager.addEventListener(divHitArea, 'mouseenter', event => this.onMouseEnter(event, divHitArea));
  }

  isPartRange(row, col) {
    const areaSelection = this.wot.selections.createOrGetArea();

    if (areaSelection.cellRange) {
      if (row !== areaSelection.cellRange.to.row || col !== areaSelection.cellRange.to.col) {
        return true;
      }
    }

    return false;
  }

  updateMultipleSelectionHandlesPosition(row, col, top, left, width, height) {
    if (this.settings.border.cornerVisible && this.settings.border.cornerVisible()) {
      this.updateElementPosition(this.selectionHandles.topLeft,
        top - selectionHandleDefaultWidth,
        left - selectionHandleDefaultWidth,
        null, null);
      this.updateElementPosition(this.selectionHandles.topLeftHitArea,
        parseInt(top - ((selectionHandleHitAreaDefaultWidth / 4) * 3), 10),
        parseInt(left - ((selectionHandleHitAreaDefaultWidth / 4) * 3), 10),
        null, null);

      if (this.isPartRange(row, col)) {
        this.hideElement(this.selectionHandles.bottomRight);
        this.hideElement(this.selectionHandles.bottomRightHitArea);
      } else {
        this.updateElementPosition(this.selectionHandles.bottomRight, top + height, left + width, null, null);
        this.updateElementPosition(this.selectionHandles.bottomRightHitArea,
          parseInt(top + height - (selectionHandleHitAreaDefaultWidth / 4), 10),
          parseInt(left + width - (selectionHandleHitAreaDefaultWidth / 4), 10),
          null, null);
      }

      if (row === this.wot.wtSettings.getSetting('fixedRowsTop') || col === this.wot.wtSettings.getSetting('fixedColumnsLeft')) {
        this.selectionHandles.topLeft.style.zIndex = '9999';
        this.selectionHandles.topLeftHitArea.style.zIndex = '9999';
      } else {
        this.selectionHandles.topLeft.style.zIndex = '';
        this.selectionHandles.topLeftHitArea.style.zIndex = '';
      }
    } else {
      this.hideElement(this.selectionHandles.topLeft);
      this.hideElement(this.selectionHandles.bottomRight);
      this.hideElement(this.selectionHandles.topLeftHitArea);
      this.hideElement(this.selectionHandles.bottomRightHitArea);
    }
  }

  /**
   * Show border around one or many cells
   *
   * @param {Array} corners
   */
  appear(corners) {
    const { wtTable, rootWindow } = this.wot;
    let fromRow;
    let toRow;
    let fromColumn;
    let toColumn;

    const rowsCount = wtTable.getRenderedRowsCount(); // TODO this is redundant, because Selection.js does the same thing

    for (let i = 0; i < rowsCount; i += 1) {
      const s = wtTable.rowFilter.renderedToSource(i);

      if (s >= corners[0] && s <= corners[2]) {
        fromRow = s;
        break;
      }
    }

    for (let i = rowsCount - 1; i >= 0; i -= 1) {
      const s = wtTable.rowFilter.renderedToSource(i);

      if (s >= corners[0] && s <= corners[2]) {
        toRow = s;
        break;
      }
    }

    const columnsCount = wtTable.getRenderedColumnsCount();

    for (let i = 0; i < columnsCount; i += 1) {
      const s = wtTable.columnFilter.renderedToSource(i);

      if (s >= corners[1] && s <= corners[3]) {
        fromColumn = s;
        break;
      }
    }

    for (let i = columnsCount - 1; i >= 0; i -= 1) {
      const s = wtTable.columnFilter.renderedToSource(i);

      if (s >= corners[1] && s <= corners[3]) {
        toColumn = s;
        break;
      }
    }
    if (fromRow === void 0 || fromColumn === void 0) {
      this.disappear();

      return;
    }
    let fromTD = wtTable.getCell(new CellCoords(fromRow, fromColumn));
    const isMultiple = (fromRow !== toRow || fromColumn !== toColumn);
    const toTD = isMultiple ? wtTable.getCell(new CellCoords(toRow, toColumn)) : fromTD;
    const fromOffset = offset(fromTD);
    const toOffset = isMultiple ? offset(toTD) : fromOffset;
    const containerOffset = offset(wtTable.TABLE);
    const minTop = fromOffset.top;
    const minLeft = fromOffset.left;

    let left = minLeft - containerOffset.left - 1;
    let width = toOffset.left + outerWidth(toTD) - minLeft;

    if (this.isEntireColumnSelected(fromRow, toRow)) {
      const modifiedValues = this.getDimensionsFromHeader('columns', fromColumn, toColumn, containerOffset);
      let fromTH = null;

      if (modifiedValues) {
        [fromTH, left, width] = modifiedValues;
      }

      if (fromTH) {
        fromTD = fromTH;
      }
    }

    let top = minTop - containerOffset.top - 1;
    let height = toOffset.top + outerHeight(toTD) - minTop;

    if (this.isEntireRowSelected(fromColumn, toColumn)) {
      const modifiedValues = this.getDimensionsFromHeader('rows', fromRow, toRow, containerOffset);
      let fromTH = null;

      if (modifiedValues) {
        [fromTH, top, height] = modifiedValues;
      }

      if (fromTH) {
        fromTD = fromTH;
      }
    }

    const style = getComputedStyle(fromTD, rootWindow);

    if (parseInt(style.borderTopWidth, 10) > 0) {
      top += 1;
      height = height > 0 ? height - 1 : 0;
    }
    if (parseInt(style.borderLeftWidth, 10) > 0) {
      left += 1;
      width = width > 0 ? width - 1 : 0;
    }

    if (this.shouldBorderBeRenderedAtPositon('top')) {
      this.ensureBorderAtPosition('top');
      this.updateElementPosition(this.top, top, left, width, null);
    }

    if (this.shouldBorderBeRenderedAtPositon('left')) {
      this.ensureBorderAtPosition('left');
      this.updateElementPosition(this.left, top, left, null, height);
    }

    const delta = Math.floor(this.settings.border.width / 2);

    if (this.shouldBorderBeRenderedAtPositon('bottom')) {
      this.ensureBorderAtPosition('bottom');
      this.updateElementPosition(this.bottom, top + height - delta, left, width, null);
    }

    if (this.shouldBorderBeRenderedAtPositon('right')) {
      this.ensureBorderAtPosition('right');
      this.updateElementPosition(this.right, top, left + width - delta, null, height + 1);
    }

    if (this.corner) {
      // Hide the fill handle, so the possible further adjustments won't force unneeded scrollbars.
      // Also: what if `cornerVisibleSetting` changed between appears (i.e. `this.isPartRange(checkRow, checkCol) == true`)? to repro: drag handle one cell down, release
      this.hideElement(this.corner);
    }
    if (this.shouldBorderBeRenderedAtPositon('corner')) {

      const hookResult = this.wot.getSetting('onModifyGetCellCoords', toRow, toColumn);
      let [checkRow, checkCol] = [toRow, toColumn];

      if (hookResult && Array.isArray(hookResult)) {
        [,, checkRow, checkCol] = hookResult;
      }

      if (!isMobileBrowser() && !this.isPartRange(checkRow, checkCol)) {
        this.ensureBorderAtPosition('corner');
        let cornerTop = top + height - 4;
        let cornerLeft = left + width - 4;
        this.corner.style.borderRightWidth = `${cornerDefaultStyle.borderWidth}px`;

        let trimmingContainer = getTrimmingContainer(wtTable.TABLE);
        const trimToWindow = trimmingContainer === rootWindow;

        if (trimToWindow) {
          trimmingContainer = this.wot.rootDocument.documentElement;
        }

        if (toColumn === this.wot.getSetting('totalColumns') - 1) {
          const toTdOffsetLeft = trimToWindow ? toTD.getBoundingClientRect().left : toTD.offsetLeft;
          const cornerRightEdge = toTdOffsetLeft + outerWidth(toTD) + (cornerDefaultStyle.width / 2);
          const cornerOverlappingContainer = cornerRightEdge >= innerWidth(trimmingContainer);

          if (cornerOverlappingContainer) {
            cornerLeft = Math.floor(left + width - 3 - (cornerDefaultStyle.width / 2));
            this.corner.style.borderRightWidth = 0;
          }
        }

        if (toRow === this.wot.getSetting('totalRows') - 1) {
          const toTdOffsetTop = trimToWindow ? toTD.getBoundingClientRect().top : toTD.offsetTop;
          const cornerBottomEdge = toTdOffsetTop + outerHeight(toTD) + (cornerDefaultStyle.height / 2);
          const cornerOverlappingContainer = cornerBottomEdge >= innerHeight(trimmingContainer);

          if (cornerOverlappingContainer) {
            cornerTop = Math.floor(top + height - 3 - (cornerDefaultStyle.height / 2));
            this.corner.style.borderBottomWidth = 0;
          }
        }

        this.updateElementPosition(this.corner, cornerTop, cornerLeft, null, null);
      }
    }

    if (isMobileBrowser()) {
      this.ensureMultipleSelectorHandleAtPosition('topLeft');
      this.ensureMultipleSelectorHandleAtPosition('bottomRight');
      this.updateMultipleSelectionHandlesPosition(toRow, toColumn, top, left, width, height);
    }
  }

  shouldBorderBeRenderedAtPositon(position) {
    if (position === 'corner') {
      let cornerVisibleSetting = this.settings.border.cornerVisible;
      cornerVisibleSetting = typeof cornerVisibleSetting === 'function' ? cornerVisibleSetting(this.settings.layerLevel) : cornerVisibleSetting;
      return cornerVisibleSetting;
    }
    return !((this.settings[position] && this.settings[position].hide) ? this.settings[position].hide : this.settings.border.hide);
  }

  ensureBorderAtPosition(position) {
    if (!this[position]) {
      this.createBorder(position);
    }
  }

  ensureMultipleSelectorHandleAtPosition(position) {
    if (!this.selectionHandles[position]) {
      this.createMultipleSelectorHandles(position);
    }
  }

  /**
   * Check whether an entire column of cells is selected.
   *
   * @private
   * @param {Number} startRowIndex Start row index.
   * @param {Number} endRowIndex End row index.
   */
  isEntireColumnSelected(startRowIndex, endRowIndex) {
    return startRowIndex === this.wot.wtTable.getFirstRenderedRow() && endRowIndex === this.wot.wtTable.getLastRenderedRow();
  }

  /**
   * Check whether an entire row of cells is selected.
   *
   * @private
   * @param {Number} startColumnIndex Start column index.
   * @param {Number} endColumnIndex End column index.
   */
  isEntireRowSelected(startColumnIndex, endColumnIndex) {
    return startColumnIndex === this.wot.wtTable.getFirstRenderedColumn() && endColumnIndex === this.wot.wtTable.getLastRenderedColumn();
  }

  /**
   * Get left/top index and width/height depending on the `direction` provided.
   *
   * @private
   * @param {String} direction `rows` or `columns`, defines if an entire column or row is selected.
   * @param {Number} fromIndex Start index of the selection.
   * @param {Number} toIndex End index of the selection.
   * @param {Number} containerOffset offset of the container.
   * @return {Array|Boolean} Returns an array of [headerElement, left, width] or [headerElement, top, height], depending on `direction` (`false` in case of an error getting the headers).
   */
  getDimensionsFromHeader(direction, fromIndex, toIndex, containerOffset) {
    const { wtTable } = this.wot;
    const rootHotElement = wtTable.wtRootElement.parentNode;
    let getHeaderFn = null;
    let dimensionFn = null;
    let entireSelectionClassname = null;
    let index = null;
    let dimension = null;
    let dimensionProperty = null;
    let startHeader = null;
    let endHeader = null;

    switch (direction) {
      case 'rows':
        getHeaderFn = (...args) => wtTable.getRowHeader(...args);
        dimensionFn = (...args) => outerHeight(...args);
        entireSelectionClassname = 'ht__selection--rows';
        dimensionProperty = 'top';

        break;

      case 'columns':
        getHeaderFn = (...args) => wtTable.getColumnHeader(...args);
        dimensionFn = (...args) => outerWidth(...args);
        entireSelectionClassname = 'ht__selection--columns';
        dimensionProperty = 'left';
        break;
      default:
    }

    if (rootHotElement.className.includes(entireSelectionClassname)) {
      const columnHeaderLevelCount = this.wot.getSetting('columnHeaders').length;

      startHeader = getHeaderFn(fromIndex, columnHeaderLevelCount - 1);
      endHeader = getHeaderFn(toIndex, columnHeaderLevelCount - 1);

      if (!startHeader || !endHeader) {
        return false;
      }

      const startHeaderOffset = offset(startHeader);
      const endOffset = offset(endHeader);

      if (startHeader && endHeader) {
        index = startHeaderOffset[dimensionProperty] - containerOffset[dimensionProperty] - 1;
        dimension = endOffset[dimensionProperty] + dimensionFn(endHeader) - startHeaderOffset[dimensionProperty];
      }

      return [startHeader, index, dimension];
    }

    return false;
  }

  /**
   * Change border style.
   *
   * @private
   * @param {String} borderElement Coordinate where add/remove border: top, right, bottom, left.
   */
  changeBorderStyle(borderElement, border) {
    const borderStyle = border[borderElement];

    if (!borderStyle || borderStyle.hide) {
      if (this[borderElement]) {
        addClass(this[borderElement], 'hidden');
      }
    } else if (!this[borderElement]) {
      this.createBorder(borderElement);
    } else {
      if (hasClass(this[borderElement], 'hidden')) {
        removeClass(this[borderElement], 'hidden');
      }
      const style = this[borderElement].style;
      style.backgroundColor = borderStyle.color;

      if (borderElement === 'top' || borderElement === 'bottom') {
        style.height = `${borderStyle.width}px`;
      }

      if (borderElement === 'right' || borderElement === 'left') {
        style.width = `${borderStyle.width}px`;
      }
    }
  }

  /**
   * Change border style to default.
   *
   * @private
   * @param {HTMLElement} position
   */
  changeBorderToDefaultStyle(position) {
    const style = this[position].style;
    style.backgroundColor = defaultBorder.color;
    style.width = `${defaultBorder.width}px`;
    style.height = `${defaultBorder.width}px`;
  }

  /**
   * Toggle class 'hidden' to element.
   *
   * @private
   * @param {String} borderElement Coordinate where add/remove border: top, right, bottom, left.
   * @return {Boolean}
   */
  toggleHiddenClass(borderElement, remove) {
    this.changeBorderToDefaultStyle(borderElement);

    if (remove) {
      addClass(this[borderElement], 'hidden');
    } else {
      removeClass(this[borderElement], 'hidden');
    }
  }

  /**
   * Update styles on element regarding it's position and show it
   * @param {HTMLElement} elem
   * @param {Number} top
   * @param {Number} left
   * @param {Number} width Optional
   * @param {Number} height Optional
   */
  updateElementPosition(elem, top, left, width, height) {
    const style = elem.style;
    style.top = `${top}px`;
    style.left = `${left}px`;
    if (width !== null) {
      style.width = `${width}px`;
    }
    if (height !== null) {
      style.height = `${height}px`;
    }
    style.display = 'block';
  }

  /**
   * Hide element
   * @param {HTMLElement} elem
   */
  hideElement(elem) {
    elem.style.display = 'none';
  }

  /**
   * Hide border
   */
  disappear() {
    if (this.top) {
      this.hideElement(this.top);
    }
    if (this.left) {
      this.hideElement(this.left);
    }
    if (this.bottom) {
      this.hideElement(this.bottom);
    }
    if (this.right) {
      this.hideElement(this.right);
    }
    if (this.corner) {
      this.hideElement(this.corner);
    }
    if (this.selectionHandles.topLeft) {
      this.hideElement(this.selectionHandles.topLeft);
      this.hideElement(this.selectionHandles.topLeftHitArea);
    }
    if (this.selectionHandles.bottomRight) {
      this.hideElement(this.selectionHandles.bottomRight);
      this.hideElement(this.selectionHandles.bottomRightHitArea);
    }
  }

  /**
   * Cleans up all the DOM state related to a Border instance. Call this prior to deleting a Border instance.
   */
  destroy() {
    this.eventManager.destroyWithOwnEventsOnly();
    this.forAllDomElements(elem => elem.parentNode.removeChild(elem));
  }
}

export default Border;
