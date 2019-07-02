import { addClass, hasClass, offset } from './../../../helpers/dom/element';
import Border from './border';
import CellCoords from './cell/coords';
import CellRange from './cell/range';

/**
 * @class Selection
 */
class Selection {
  /**
   * @param {Object} settings
   * @param {CellRange} cellRange
   */
  constructor(settings, cellRange) {
    this.settings = settings;
    this.cellRange = cellRange || null;
    this.instanceBorders = {};
    this.classNames = [this.settings.className];
    this.classNameGenerator = this.linearClassNameGenerator(this.settings.className, this.settings.layerLevel);
  }

  /**
   * Each Walkontable clone requires it's own border for every selection. This method creates and returns selection
   * borders per instance
   *
   * @param {Walkontable} wotInstance
   * @returns {Border}
   */
  getBorder(wotInstance) {
    if (!this.instanceBorders[wotInstance.guid]) {
      this.instanceBorders[wotInstance.guid] = new Border(wotInstance, this.settings);
    }

    return this.instanceBorders[wotInstance.guid];
  }

  /**
   * Return an existing intance of Border class if defined for a given Walkontable instance
   *
   * @param {Walkontable} wotInstance
   * @returns {Border|undefined}
   */
  getBorderIfExists(wotInstance) {
    return this.instanceBorders[wotInstance.guid];
  }

  /**
   * Checks if selection is empty
   *
   * @returns {Boolean}
   */
  isEmpty() {
    return this.cellRange === null;
  }

  /**
   * Adds a cell coords to the selection
   *
   * @param {CellCoords} coords
   */
  add(coords) {
    if (this.isEmpty()) {
      this.cellRange = new CellRange(coords);

    } else {
      this.cellRange.expand(coords);
    }

    return this;
  }

  /**
   * If selection range from or to property equals oldCoords, replace it with newCoords. Return boolean
   * information about success
   *
   * @param {CellCoords} oldCoords
   * @param {CellCoords} newCoords
   * @returns {Boolean}
   */
  replace(oldCoords, newCoords) {
    if (!this.isEmpty()) {
      if (this.cellRange.from.isEqual(oldCoords)) {
        this.cellRange.from = newCoords;

        return true;
      }
      if (this.cellRange.to.isEqual(oldCoords)) {
        this.cellRange.to = newCoords;

        return true;
      }
    }

    return false;
  }

  /**
   * Clears selection
   *
   * @returns {Selection}
   */
  clear() {
    this.cellRange = null;

    return this;
  }

  /**
   * Returns the top left (TL) and bottom right (BR) selection coordinates
   *
   * @returns {Array} Returns array of coordinates for example `[1, 1, 5, 5]`
   */
  getCorners() {
    const topLeft = this.cellRange.getTopLeftCorner();
    const bottomRight = this.cellRange.getBottomRightCorner();

    return [
      topLeft.row,
      topLeft.col,
      bottomRight.row,
      bottomRight.col,
    ];
  }

  /**
   * Adds class name to cell element at given coords
   *
   * @param {Walkontable} wotInstance Walkontable instance
   * @param {Number} sourceRow Cell row coord
   * @param {Number} sourceColumn Cell column coord
   * @param {String} className Class name
   * @param {Boolean} [markIntersections=false] If `true`, linear className generator will be used to add CSS classes
   *                                            in a continuous way.
   * @returns {Selection}
   */
  addClassAtCoords(wotInstance, sourceRow, sourceColumn, className, markIntersections = false) {
    const TD = wotInstance.wtTable.getCell(new CellCoords(sourceRow, sourceColumn));

    if (typeof TD === 'object') {
      let cellClassName = className;

      if (markIntersections) {
        cellClassName = this.classNameGenerator(TD);

        if (!this.classNames.includes(cellClassName)) {
          this.classNames.push(cellClassName);
        }
      }

      addClass(TD, cellClassName);
    }

    return this;
  }

  /**
   * Generate helper for calculating classNames based on previously added base className.
   * The generated className is always generated as a continuation of the previous className. For example, when
   * the currently checked element has 'area-2' className the generated new className will be 'area-3'. When
   * the element doesn't have any classNames than the base className will be returned ('area');
   *
   * @param {String} baseClassName Base className to be used.
   * @param {Number} layerLevelOwner Layer level which the instance of the Selection belongs to.
   * @return {Function}
   */
  linearClassNameGenerator(baseClassName, layerLevelOwner) {
    // TODO: Make this recursive function Proper Tail Calls (TCO/PTC) friendly.
    return function calcClassName(element, previousIndex = -1) {
      if (layerLevelOwner === 0 || previousIndex === 0) {
        return baseClassName;
      }

      let index = previousIndex >= 0 ? previousIndex : layerLevelOwner;
      let className = baseClassName;

      index -= 1;

      const previousClassName = index === 0 ? baseClassName : `${baseClassName}-${index}`;

      if (hasClass(element, previousClassName)) {
        const currentLayer = index + 1;

        className = `${baseClassName}-${currentLayer}`;

      } else {
        className = calcClassName(element, index);
      }

      return className;
    };
  }

  setClassNames(elem, classNames) {
    if (elem) {
      addClass(elem, classNames);
    }
  }

  /**
   * @param wotInstance
   */
  draw(wotInstance) {
    if (this.isEmpty()) {
      const existingBorder = this.getBorderIfExists(wotInstance);
      if (this.settings.border && existingBorder) {
        return existingBorder.disappear();
      }

      return;
    }

    const renderedRows = wotInstance.wtTable.getRenderedRowsCount();
    if (renderedRows == 0) {
return;
    }
    const renderedColumns = wotInstance.wtTable.getRenderedColumnsCount();
    if (renderedColumns == 0) {
return;
    }
    const corners = this.getCorners();
    const [firstRow, firstColumn, lastRow, lastColumn] = corners;
    let viewportFromSourceRow;
    let viewportFromSourceColumn;
    let viewportToSourceRow;
    let viewportToSourceColumn;

    if (this.settings.highlightHeaderClassName || this.settings.highlightColumnClassName) {
      for (let sourceColumn = firstColumn; sourceColumn <= lastColumn; sourceColumn += 1) {
        this.setClassNames(wotInstance.wtTable.getColumnHeader(sourceColumn), this.settings.highlightHeaderClassName, this.settings.highlightColumnClassName);

        if (this.settings.highlightColumnClassName) {
          for (let renderedRow = 0; renderedRow < renderedRows; renderedRow += 1) {
            const sourceRow = wotInstance.wtTable.rowFilter.renderedToSource(renderedRow);
            this.addClassAtCoords(wotInstance, sourceRow, sourceColumn, this.settings.highlightColumnClassName);
          }
        }
      }
    }

    if (this.settings.highlightHeaderClassName || this.settings.highlightRowClassName) {
      for (let sourceRow = firstRow; sourceRow <= lastRow; sourceRow += 1) {
        this.setClassNames(wotInstance.wtTable.getRowHeader(sourceRow), this.settings.highlightHeaderClassName, this.settings.highlightColumnClassName);

        if (this.settings.highlightRowClassName) {
          for (let renderedColumn = 0; renderedColumn < renderedColumns; renderedColumn += 1) {
            const sourceColumn = wotInstance.wtTable.columnFilter.renderedToSource(renderedColumn);
            this.addClassAtCoords(wotInstance, sourceRow, sourceColumn, this.settings.highlightRowClassName);
          }
        }
      }
    }

    for (let sourceRow = firstRow; sourceRow <= lastRow; sourceRow += 1) {
      this.setClassNames(wotInstance.wtTable.getRowHeader(sourceRow), this.settings.highlightHeaderClassName, this.settings.highlightRowClassName);

      for (let sourceColumn = firstColumn; sourceColumn <= lastColumn; sourceColumn += 1) {

        if (wotInstance.wtTable.areCoordsBeyondRendered(sourceRow, sourceColumn) === false) {

          if (viewportFromSourceRow === undefined) {
            viewportFromSourceRow = sourceRow;
            viewportFromSourceColumn = sourceColumn;
          }
          viewportToSourceRow = sourceRow;
          viewportToSourceColumn = sourceColumn;

          if (this.settings.className) {
            this.addClassAtCoords(wotInstance, sourceRow, sourceColumn, this.settings.className, this.settings.markIntersections);
          }
        }
      }
    }

    wotInstance.getSetting('onBeforeDrawBorders', corners, this.settings.className);

    if (this.settings.border) {
      // warning! border.appear modifies corners!
      if (viewportFromSourceRow !== undefined) {
        // const fromTD = wotInstance.wtTable.getCell(new CellCoords(viewportFromSourceRow, viewportFromSourceColumn));
    // if (!fromTD) {
      // debugger;
// return;
    // }
        return this.getBorder(wotInstance).appear(viewportFromSourceRow, viewportFromSourceColumn, viewportToSourceRow, viewportToSourceColumn,  offset(wotInstance.wtTable.TABLE));
      } else {
        const existingBorder = this.getBorderIfExists(wotInstance);
        if (existingBorder) {
          return existingBorder.disappear();
        }
      }
    }
  }

  /**
   * Cleans up all the DOM state related to a Selection instance. Call this prior to deleting a Selection instance.
   */
  destroy() {
    Object.values(this.instanceBorders).forEach(border => border.destroy());
    this.instanceBorders = null;
  }
}

export default Selection;
