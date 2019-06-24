describe('Walkontable.Border - mobile', () => {
  let $table;
  let $container;
  let $wrapper;
  const debug = false;

  beforeEach(() => {
    Walkontable.setBrowserMeta({
      // copied from Browser.spec.js
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B411 Safari/600.1.4'
    });
    $container = $('<div></div>');
    $wrapper = $('<div></div>');
    $container.width(100).height(200);
    $table = $('<table></table>');
    $container.append($wrapper);
    $wrapper.append($table);
    $container.appendTo('body');
    createDataArray();
  });

  afterEach(() => {
    if (!debug) {
      $('.wtHolder').remove();
    }
    $container.remove();
    Walkontable.setBrowserMeta();
  });

  it('should NOT execute onCellMouseDown callback when cell is clicked', () => {
    let calls = 0;
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown() {
        calls += 1;
      }
    });
    wt.draw();
    const $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    $td1.simulate('mousedown');
    expect(calls).toBe(0);
  });

  it('should execute onCellMouseDown callback when cell is touched', () => {
    let calls = 0;
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown() {
        calls += 1;
      }
    });
    wt.draw();
    const $td = $table.find('tbody tr:eq(1) td:eq(0)');
    $td[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));
    expect(calls).toBe(1);
  });

  it('should add/remove border to selection when cell is touched', () => {
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();

    const $td1 = $table.find('tbody tr:eq(1) td:eq(0)');

    const $td2 = $table.find('tbody tr:eq(2) td:eq(1)');
    const $top = $(wt.selections.getCell().getBorder(wt).top);
    const $right = $(wt.selections.getCell().getBorder(wt).right);
    const $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    const $left = $(wt.selections.getCell().getBorder(wt).left);

    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(23);
    expect($top.position().left).toBe(0);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(23);
    expect($right.position().left).toBe(49);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(46);
    expect($bottom.position().left).toBe(0);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(23);
    expect($left.position().left).toBe(0);

    $td2[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(46);
    expect($top.position().left).toBe(49);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(46);
    expect($right.position().left).toBe(99);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(69);
    expect($bottom.position().left).toBe(49);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(46);
    expect($left.position().left).toBe(49);
  });

  it('should add/remove border to selection when cell is touched and the table has only one column', () => {
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 1,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();

    const $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    const $top = $(wt.selections.getCell().getBorder(wt).top);
    const $right = $(wt.selections.getCell().getBorder(wt).right);
    const $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    const $left = $(wt.selections.getCell().getBorder(wt).left);

    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(23);
    expect($top.position().left).toBe(0);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(23);
    expect($right.position().left).toBe(49);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(46);
    expect($bottom.position().left).toBe(0);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(23);
    expect($left.position().left).toBe(0);
  });

  it('should properly add a selection border on an entirely selected column', () => {
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 2,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();

    wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
    wt.selections.getCell().add(new Walkontable.CellCoords(4, 0));
    wt.draw(true);

    const $top = $(wt.selections.getCell().getBorder(wt).top);
    const $right = $(wt.selections.getCell().getBorder(wt).right);
    const $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    const $left = $(wt.selections.getCell().getBorder(wt).left);

    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(0);
    expect($top.position().left).toBe(0);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(0);
    expect($right.position().left).toBe(49);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(115);
    expect($bottom.position().left).toBe(0);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(0);
    expect($left.position().left).toBe(0);
  });

  it('should add/remove corner to selection when cell is touched', () => {
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({}),
      }),
      onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();

    const $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    const $td2 = $table.find('tbody tr:eq(2) td:eq(1)');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);
    const $selectionHandleTopLeft = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeft);
    const $selectionHandleTopLeftHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeftHitArea);
    const $selectionHandleBottomRight = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRight);
    const $selectionHandleBottomRighHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRightHitArea);

    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.is(':visible')).toBe(false);
    expect($selectionHandleTopLeft.css('width')).toBe('10px');
    expect($selectionHandleTopLeft.css('height')).toBe('10px');
    expect($selectionHandleTopLeft.position().top).toBe(13);
    expect($selectionHandleTopLeft.position().left).toBe(-10);
    expect($selectionHandleTopLeftHitArea.css('width')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.css('height')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.position().top).toBe(-7);
    expect($selectionHandleTopLeftHitArea.position().left).toBe(-30);
    expect($selectionHandleBottomRight.css('width')).toBe('10px');
    expect($selectionHandleBottomRight.css('height')).toBe('10px');
    expect($selectionHandleBottomRight.position().top).toBe(46);
    expect($selectionHandleBottomRight.position().left).toBe(49);
    expect($selectionHandleBottomRighHitArea.css('width')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.css('height')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.position().top).toBe(36);
    expect($selectionHandleBottomRighHitArea.position().left).toBe(39);

    $td2[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.is(':visible')).toBe(false);
    expect($selectionHandleTopLeft.css('width')).toBe('10px');
    expect($selectionHandleTopLeft.css('height')).toBe('10px');
    expect($selectionHandleTopLeft.position().top).toBe(36);
    expect($selectionHandleTopLeft.position().left).toBe(39);
    expect($selectionHandleTopLeftHitArea.css('width')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.css('height')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.position().top).toBe(16);
    expect($selectionHandleTopLeftHitArea.position().left).toBe(19);
    expect($selectionHandleBottomRight.css('width')).toBe('10px');
    expect($selectionHandleBottomRight.css('height')).toBe('10px');
    expect($selectionHandleBottomRight.position().top).toBe(69);
    expect($selectionHandleBottomRight.position().left).toBe(99);
    expect($selectionHandleBottomRighHitArea.css('width')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.css('height')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.position().top).toBe(59);
    expect($selectionHandleBottomRighHitArea.position().left).toBe(89);
  });

  it('should draw only one corner if selection is added between overlays', () => {
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      fixedColumnsLeft: 2,
      fixedRowsTop: 2,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          className: 'current',
          border: {}
        }),
        area: new Walkontable.Selection({
          className: 'area',
          border: {
            cornerVisible() {
              return true;
            }
          }
        }),
      }),
    });

    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(0, 0));
    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(2, 2));

    wt.draw();

    expect($(wt.selections.getCell().getBorder(wt).corner).is(':visible')).toBe(false);
    expect($(wt.selections.getCell().getBorder(wt).selectionHandles.topLeft).is(':visible')).toBe(false);
    expect($(wt.selections.getCell().getBorder(wt).selectionHandles.topLeftHitArea).is(':visible')).toBe(true);
    expect($(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRight).is(':visible')).toBe(false);
    expect($(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRightHitArea).is(':visible')).toBe(true);
    expect($(wt.selections.getAreas()[0].getBorder(wt).corner).is(':visible')).toBe(false);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.topLeft).is(':visible')).toBe(true);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.topLeftHitArea).is(':visible')).toBe(true);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.bottomRight).is(':visible')).toBe(true);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.bottomRightHitArea).is(':visible')).toBe(true);
  });

  it('on touch, should move the fill handle / corner border to the left, if in the position it would overlap the container (e.g.: far-right)', () => {
    $container.css({
      overflow: 'hidden',
      width: '200px',
    });
    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 4,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({}),
      }),
      onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();

    const $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    const $td2 = $table.find('tbody tr:eq(3) td:eq(3)');
    const $td3 = $table.find('tbody tr:eq(2) td:eq(1)');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);
    const $selectionHandleTopLeft = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeft);
    const $selectionHandleTopLeftHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeftHitArea);
    const $selectionHandleBottomRight = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRight);
    const $selectionHandleBottomRighHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRightHitArea);

    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.is(':visible')).toBe(false);
    expect($selectionHandleTopLeft.css('width')).toBe('10px');
    expect($selectionHandleTopLeft.css('height')).toBe('10px');
    expect($selectionHandleTopLeft.position().top).toBe(13);
    expect($selectionHandleTopLeft.position().left).toBe(-10);
    expect($selectionHandleTopLeftHitArea.css('width')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.css('height')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.position().top).toBe(-7);
    expect($selectionHandleTopLeftHitArea.position().left).toBe(-30);
    expect($selectionHandleBottomRight.css('width')).toBe('10px');
    expect($selectionHandleBottomRight.css('height')).toBe('10px');
    expect($selectionHandleBottomRight.position().top).toBe(46);
    expect($selectionHandleBottomRight.position().left).toBe(49);
    expect($selectionHandleBottomRighHitArea.css('width')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.css('height')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.position().top).toBe(36);
    expect($selectionHandleBottomRighHitArea.position().left).toBe(39);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);

    $td2[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.is(':visible')).toBe(false);
    expect($selectionHandleTopLeft.css('width')).toBe('10px');
    expect($selectionHandleTopLeft.css('height')).toBe('10px');
    expect($selectionHandleTopLeft.position().top).toBe(59);
    expect($selectionHandleTopLeft.position().left).toBe(139);
    expect($selectionHandleTopLeftHitArea.css('width')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.css('height')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.position().top).toBe(39);
    expect($selectionHandleTopLeftHitArea.position().left).toBe(119);
    expect($selectionHandleBottomRight.css('width')).toBe('10px');
    expect($selectionHandleBottomRight.css('height')).toBe('10px');
    expect($selectionHandleBottomRight.position().top).toBe(92);
    expect($selectionHandleBottomRight.position().left).toBe(199);
    expect($selectionHandleBottomRighHitArea.css('width')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.css('height')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.position().top).toBe(82);
    expect($selectionHandleBottomRighHitArea.position().left).toBe(189);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);

    $td3[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.is(':visible')).toBe(false);
    expect($selectionHandleTopLeft.css('width')).toBe('10px');
    expect($selectionHandleTopLeft.css('height')).toBe('10px');
    expect($selectionHandleTopLeft.position().top).toBe(36);
    expect($selectionHandleTopLeft.position().left).toBe(39);
    expect($selectionHandleTopLeftHitArea.css('width')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.css('height')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.position().top).toBe(16);
    expect($selectionHandleTopLeftHitArea.position().left).toBe(19);
    expect($selectionHandleBottomRight.css('width')).toBe('10px');
    expect($selectionHandleBottomRight.css('height')).toBe('10px');
    expect($selectionHandleBottomRight.position().top).toBe(69);
    expect($selectionHandleBottomRight.position().left).toBe(99);
    expect($selectionHandleBottomRighHitArea.css('width')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.css('height')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.position().top).toBe(59);
    expect($selectionHandleBottomRighHitArea.position().left).toBe(89);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
  });

  it('on touch, should move the fill handle / corner border to the top, if in the position it would overlap the container (e.g.: far-bottom)', () => {
    $container.css({
      overflow: 'hidden',
      height: 'auto',
      marginTop: '2000px',
    });

    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 1,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({}),
      }),
      onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });

    wt.draw();

    const $td = $table.find('tbody tr:last-of-type td:last-of-type');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);
    const $selectionHandleTopLeft = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeft);
    const $selectionHandleTopLeftHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeftHitArea);
    const $selectionHandleBottomRight = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRight);
    const $selectionHandleBottomRighHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRightHitArea);

    $td[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    wt.draw();

    expect($table.css('height')).toBe('116px');
    expect($corner.is(':visible')).toBe(false);
    expect($selectionHandleTopLeft.css('width')).toBe('10px');
    expect($selectionHandleTopLeft.css('height')).toBe('10px');
    expect($selectionHandleTopLeft.position().top).toBe(82);
    expect($selectionHandleTopLeft.position().left).toBe(-10);
    expect($selectionHandleTopLeftHitArea.css('width')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.css('height')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.position().top).toBe(62);
    expect($selectionHandleTopLeftHitArea.position().left).toBe(-30);
    expect($selectionHandleBottomRight.css('width')).toBe('10px');
    expect($selectionHandleBottomRight.css('height')).toBe('10px');
    expect($selectionHandleBottomRight.position().top).toBe(115);
    expect($selectionHandleBottomRight.position().left).toBe(49);
    expect($selectionHandleBottomRighHitArea.css('width')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.css('height')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.position().top).toBe(105);
    expect($selectionHandleBottomRighHitArea.position().left).toBe(39);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
  });

  it('on touch, should move the corner border to the top-left, if is not enough area on the bottom-right corner of container', () => {
    $container.css({
      overflow: 'hidden',
      height: 'auto',
      width: '50px',
      marginTop: '2000px',
      marginLeft: '2000px',
    });

    const wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 1,
      totalColumns: 1,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({}),
      }),
      onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });

    wt.draw();

    const $td = $table.find('tbody tr:last-of-type td:last-of-type');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);
    const $selectionHandleTopLeft = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeft);
    const $selectionHandleTopLeftHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.topLeftHitArea);
    const $selectionHandleBottomRight = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRight);
    const $selectionHandleBottomRighHitArea = $(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRightHitArea);

    $td[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    wt.draw();

    expect($table.css('height')).toBe('24px');
    expect($corner.is(':visible')).toBe(false);
    expect($selectionHandleTopLeft.css('width')).toBe('10px');
    expect($selectionHandleTopLeft.css('height')).toBe('10px');
    expect($selectionHandleTopLeft.position().top).toBe(-10);
    expect($selectionHandleTopLeft.position().left).toBe(-10);
    expect($selectionHandleTopLeftHitArea.css('width')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.css('height')).toBe('40px');
    expect($selectionHandleTopLeftHitArea.position().top).toBe(-30);
    expect($selectionHandleTopLeftHitArea.position().left).toBe(-30);
    expect($selectionHandleBottomRight.css('width')).toBe('10px');
    expect($selectionHandleBottomRight.css('height')).toBe('10px');
    expect($selectionHandleBottomRight.position().top).toBe(23);
    expect($selectionHandleBottomRight.position().left).toBe(49);
    expect($selectionHandleBottomRighHitArea.css('width')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.css('height')).toBe('40px');
    expect($selectionHandleBottomRighHitArea.position().top).toBe(13);
    expect($selectionHandleBottomRighHitArea.position().left).toBe(39);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
  });
});
