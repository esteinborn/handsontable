import {
  addClass,
  hasClass,
  removeClass,
  getTrimmingContainer,
  innerWidth,
  innerHeight,
  offset,
  outerHeight,
  outerWidth,
} from './../../../helpers/dom/element';
import { isMobileBrowser } from './../../../helpers/browser';
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
const _isMobileBrowser = isMobileBrowser();

function setStyleWithCaching(elem, styleProp, value) {
  // http://jsbench.github.io/#11df2cabbd7ef94644361be128cdd750
  if (elem._cachedStyle[styleProp] != value) {
    elem.style[styleProp] = value;
    elem._cachedStyle[styleProp] = value;
  }
}

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
    this.wot = wotInstance;
    this.settings = settings;

    this.appeared = false;
    this.top = null;
    this.left = null;
    this.bottom = null;
    this.right = null;
    this.corner = null;
    this.selectionHandleTopLeft = null;
    this.selectionHandleTopLeftHitArea = null;
    this.selectionHandleBottomRight = null;
    this.selectionHandleBottomRightHitArea = null;
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
    if (this.selectionHandleTopLeft) {
      callback(this.selectionHandleTopLeft);
    }
    if (this.selectionHandleTopLeftHitArea) {
      callback(this.selectionHandleTopLeftHitArea);
    }
    if (this.selectionHandleBottomRight) {
      callback(this.selectionHandleBottomRight);
    }
    if (this.selectionHandleBottomRightHitArea) {
      callback(this.corselectionHandleBottomRightHitAreaner);
    }
  }

  /**
   * Create border elements
   *
   * @param {Object} settings
   */
  createBorder(position) {
    let div = this.wot.wtTable.bordersHolder.reusablePool.shift();
    let needsAppending;
    if (!div) {
      div = this.wot.rootDocument.createElement('div');
      div.className = `wtBorder ${this.settings.className || ''}`; // + borderDivs[i];
      div._cachedStyle = {};
      needsAppending = true;
    } else {
      needsAppending = false;
    }

    setStyleWithCaching(div, 'backgroundColor', (this.settings[position] && this.settings[position].color) ? this.settings[position].color : this.settings.border.color);
    let height = (this.settings[position] && this.settings[position].width) ? this.settings[position].width : this.settings.border.width;
    let width = (this.settings[position] && this.settings[position].width) ? this.settings[position].width : this.settings.border.width;

    this[position] = div;
    div.ownName = position;

    if (position === 'corner') {
      div.className += ' corner';
      width = cornerDefaultStyle.width;
      height = cornerDefaultStyle.height;
      setStyleWithCaching(div, 'border', [
        `${cornerDefaultStyle.borderWidth}px`,
        cornerDefaultStyle.borderStyle,
        cornerDefaultStyle.borderColor
      ].join(' '));
    } else if (position === 'left' || position === 'right') {
      width = (this.settings[position] && this.settings[position].width) ? this.settings[position].width : this.settings.border.width;
    } else if (position === 'top' || position === 'bottom') {
      height = (this.settings[position] && this.settings[position].width) ? this.settings[position].width : this.settings.border.width;
    }

    setStyleWithCaching(div, 'height', height + 'px');
    setStyleWithCaching(div, 'width', width + 'px');

    if (needsAppending) {
      this.wot.wtTable.bordersHolder.container.appendChild(div);
    }
  }

  /**
   * Create multiple selector handler for mobile devices
   */
  createMultipleSelectorHandles(position) {
    const positionHitArea = `${position}HitArea`;

    const div = this.wot.rootDocument.createElement('DIV');
    div.ownName = position;
    div._cachedStyle = {};
    this[position] = div;
    const divHitArea = this.wot.rootDocument.createElement('DIV');
    divHitArea.ownName = positionHitArea;
    divHitArea._cachedStyle = {};
    this[positionHitArea] = divHitArea;

    div.className = `wtBorder ${position}SelectionHandle`;
    divHitArea.className = `wtBorder ${position}SelectionHandle-HitArea`;

    setStyleWithCaching(divHitArea, 'height', selectionHandleHitAreaDefaultWidth + 'px');
    setStyleWithCaching(divHitArea, 'width', selectionHandleHitAreaDefaultWidth + 'px');
    setStyleWithCaching(divHitArea, 'borderRadius', parseInt(selectionHandleHitAreaDefaultWidth / 1.5, 10) + 'px');

    setStyleWithCaching(div, 'height', selectionHandleDefaultWidth + 'px');
    setStyleWithCaching(div, 'width', selectionHandleDefaultWidth + 'px');
    setStyleWithCaching(div, 'borderRadius', parseInt(selectionHandleDefaultWidth / 1.5, 10) + 'px');
    setStyleWithCaching(div, 'background', '#F5F5FF');
    setStyleWithCaching(div, 'border', '1px solid #4285c8');

    this.wot.wtTable.bordersHolder.container.appendChild(div);
    this.wot.wtTable.bordersHolder.container.appendChild(divHitArea);
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

  /**
   * Show border around one or many cells. It is prohibited to do any DOM writes in this function.
   *
   * @param {Number} fromRow Source number of starting row
   * @param {Number} fromColumn Source number of starting column
   * @param {Number} toRow Source number of ending row
   * @param {Number} toColumn Source number of ending column
   * @param {Object} containerOffset
   */
  appear(fromRow, fromColumn, toRow, toColumn, containerOffset) {
    const { wtTable, rootWindow } = this.wot;

    const fromTD = wtTable.getCell(new CellCoords(fromRow, fromColumn));
    const isMultiple = (fromRow !== toRow || fromColumn !== toColumn);
    const toTD = isMultiple ? wtTable.getCell(new CellCoords(toRow, toColumn)) : fromTD;
    const fromOffset = offset(fromTD); //TODO perf read offset and widths from calculators, not DOM
    const toOffset = isMultiple ? offset(toTD) : fromOffset;
    const minTop = fromOffset.top;
    const minLeft = fromOffset.left;

    let left = minLeft - containerOffset.left - 1;
    let width = toOffset.left + outerWidth(toTD) - minLeft;

    let top = minTop - containerOffset.top - 1;
    let height = toOffset.top + outerHeight(toTD) - minTop;

    if (fromTD.parentElement.previousSibling == null) {
      top += 1;
      height = height > 0 ? height - 1 : 0;
    }
    if (fromTD.previousSibling == null || fromTD.previousSibling.nodeName !== 'TD') {
      left += 1;
      width = width > 0 ? width - 1 : 0;
    }

    const delta = Math.floor(this.settings.border.width / 2);

    let showCorner = false;
    let cornerTop = top + height - 4;
    let cornerLeft = left + width - 4;
    let cornerBorderRightWidth = 0;
    let cornerBorderBottomWidth = 0;
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

      if (!this.isPartRange(checkRow, checkCol)) {
        showCorner = true;
        if (!_isMobileBrowser) {

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
              cornerBorderRightWidth = 0;
            }
          }

          if (toRow === this.wot.getSetting('totalRows') - 1) {
            const toTdOffsetTop = trimToWindow ? toTD.getBoundingClientRect().top : toTD.offsetTop;
            const cornerBottomEdge = toTdOffsetTop + outerHeight(toTD) + (cornerDefaultStyle.height / 2);
            const cornerOverlappingContainer = cornerBottomEdge >= innerHeight(trimmingContainer);

            if (cornerOverlappingContainer) {
              cornerTop = Math.floor(top + height - 3 - (cornerDefaultStyle.height / 2));
              cornerBorderBottomWidth = 0;
            }
          }
        }
      }
    }

    return () => {
      if (this.shouldBorderBeRenderedAtPositon('top')) {
        this.updateElementPosition('top', top, left, width, null);
      }
      else {
        this.hideElement(this.top);
      }

      if (this.shouldBorderBeRenderedAtPositon('left')) {
        this.updateElementPosition('left', top, left, null, height);
      }
      else {
        this.hideElement(this.left);
      }

      if (this.shouldBorderBeRenderedAtPositon('bottom')) {
        this.updateElementPosition('bottom', top + height - delta, left, width, null);
      }
      else {
        this.hideElement(this.bottom);
      }

      if (this.shouldBorderBeRenderedAtPositon('right')) {
        this.updateElementPosition('right', top, left + width - delta, null, height + 1);
      }
      else {
        this.hideElement(this.right);
      }

      if (showCorner) {
        if (_isMobileBrowser) {
          this.updateElementPosition('selectionHandleTopLeft',
            top - selectionHandleDefaultWidth,
            left - selectionHandleDefaultWidth,
            null, null);
          this.updateElementPosition('selectionHandleTopLeftHitArea',
            parseInt(top - ((selectionHandleHitAreaDefaultWidth / 4) * 3), 10),
            parseInt(left - ((selectionHandleHitAreaDefaultWidth / 4) * 3), 10),
            null, null);

          this.updateElementPosition('selectionHandleBottomRight', top + height, left + width, null, null);
          this.updateElementPosition('selectionHandleBottomRightHitArea',
            parseInt(top + height - (selectionHandleHitAreaDefaultWidth / 4), 10),
            parseInt(left + width - (selectionHandleHitAreaDefaultWidth / 4), 10),
            null, null);

          if (toRow === this.wot.wtSettings.getSetting('fixedRowsTop') || toColumn === this.wot.wtSettings.getSetting('fixedColumnsLeft')) {
            setStyleWithCaching(this.selectionHandleTopLeft, 'zIndex', this.settings.className ? '9999' : '9998');
            setStyleWithCaching(this.selectionHandleTopLeftHitArea, 'zIndex', this.settings.className ? '9999' : '9998');
          } else {
            setStyleWithCaching(this.selectionHandleTopLeft, 'zIndex', '');
            setStyleWithCaching(this.selectionHandleTopLeftHitArea, 'zIndex', '');
          }
        }
        else {
          this.updateElementPosition('corner', cornerTop, cornerLeft, null, null);
          setStyleWithCaching(this.corner, 'borderRightWidth', cornerBorderRightWidth + 'px');
          setStyleWithCaching(this.corner, 'borderBottomWidth', cornerBorderBottomWidth + 'px');
        }
      }
      else {
        this.hideElement(this.corner);
      }

      this.appeared = true;
    }
  }

  shouldBorderBeRenderedAtPositon(position) {
    if (position === 'corner') {
      let cornerVisibleSetting = this.settings.border.cornerVisible; // TODO HOT only uses this as a function so why check for other options here
      cornerVisibleSetting = typeof cornerVisibleSetting === 'function' ? cornerVisibleSetting(this.settings.layerLevel) : cornerVisibleSetting;
      return cornerVisibleSetting;
    }
    return !((this.settings[position] && this.settings[position].hide) ? this.settings[position].hide : this.settings.border.hide);
  }

  ensureBorderAtPosition(position) {
    if (!this[position]) {
      if (position.indexOf('selectionHandle') > -1) {
        this.createMultipleSelectorHandles(position);
      }
      else {
        this.createBorder(position);
      }
    }
    return this[position];
  }

  /**
   * Change border style.
   *
   * @private
   * @param {String} borderElement Coordinate where add/remove border: top, right, bottom, left.
   */
  changeBorderStyle(borderElement, border) { //TODO remove me
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
  changeBorderToDefaultStyle(position) { //TODO remove me
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
  toggleHiddenClass(borderElement, remove) { //TODO remove me
    this.changeBorderToDefaultStyle(borderElement);

    if (remove) {
      addClass(this[borderElement], 'hidden');
    } else {
      removeClass(this[borderElement], 'hidden');
    }
  }

  /**
   * Update styles on element regarding it's position and show it
   * @param {Position} position
   * @param {Number} top
   * @param {Number} left
   * @param {Number} width Optional
   * @param {Number} height Optional
   */
  updateElementPosition(position, top, left, width, height) {
    let elem = this.ensureBorderAtPosition(position);
    setStyleWithCaching(elem, 'top', top + 'px');
    setStyleWithCaching(elem, 'left', left + 'px');
    if (width !== null) {
      setStyleWithCaching(elem, 'width', width + 'px');
    }
    if (height !== null) {
      setStyleWithCaching(elem, 'height', height + 'px');
    }
    setStyleWithCaching(elem, 'display', 'block');
  }

  /**
   * Hide element
   * @param {Object} elem
   */
  hideElement(elem) {
    if (elem) {
      setStyleWithCaching(elem, 'display', 'none');
      if (!this.settings.className) {
        this.wot.wtTable.bordersHolder.reusablePool.push(elem);
        this[elem.ownName] = null;
      }
    }
  }

  /**
   * Hide border
   */
  disappear() {
    if (this.appeared) {
      return () => {
        this.forAllDomElements(x => this.hideElement(x));
        this.appeared = false;
      };
    }
  }

  /**
   * Cleans up all the DOM state related to a Border instance. Call this prior to deleting a Border instance.
   */
  destroy() {
    if (this.destroyed) {
      throw new Error('This Border was already destroyed');
    }
    this.destroyed = true;
    this.forAllDomElements(x => this.wot.wtTable.bordersHolder.reusablePool.push(x));
  }
}

export default Border;
