describe('Walkontable.Border - desktop', () => {
  let $table;
  let $container;
  let $wrapper;
  const debug = false;

  beforeEach(() => {
    window.ontouchstart = true;
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
    window.ontouchstart = undefined;
  });

  it('should execute onCellMouseDown callback when cell is clicked', () => {
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
    $td.simulate('mousedown');
    expect(calls).toBe(1);
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

  it('should add/remove border to selection when cell is clicked', () => {
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
    $td1.simulate('mousedown');
    const $top = $(wt.selections.getCell().getBorder(wt).top);
    const $right = $(wt.selections.getCell().getBorder(wt).right);
    const $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    const $left = $(wt.selections.getCell().getBorder(wt).left);

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

    $td2.simulate('mousedown');

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
    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));
    const $top = $(wt.selections.getCell().getBorder(wt).top);
    const $right = $(wt.selections.getCell().getBorder(wt).right);
    const $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    const $left = $(wt.selections.getCell().getBorder(wt).left);

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

  it('should add/remove border to selection when cell is clicked and the table has only one column', () => {
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
    $td1.simulate('mousedown');
    const $top = $(wt.selections.getCell().getBorder(wt).top);
    const $right = $(wt.selections.getCell().getBorder(wt).right);
    const $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    const $left = $(wt.selections.getCell().getBorder(wt).left);

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
    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));
    const $top = $(wt.selections.getCell().getBorder(wt).top);
    const $right = $(wt.selections.getCell().getBorder(wt).right);
    const $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    const $left = $(wt.selections.getCell().getBorder(wt).left);

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

  it('should add/remove corner to selection when cell is clicked', () => {
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
    $td1.simulate('mousedown');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(42);
    expect($corner.position().left).toBe(45);

    $td2.simulate('mousedown');

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(65);
    expect($corner.position().left).toBe(95);
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
    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(42);
    expect($corner.position().left).toBe(45);

    $td2[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(65);
    expect($corner.position().left).toBe(95);
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
    expect($(wt.selections.getCell().getBorder(wt).selectionHandles.topLeftHitArea).is(':visible')).toBe(false);
    expect($(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRight).is(':visible')).toBe(false);
    expect($(wt.selections.getCell().getBorder(wt).selectionHandles.bottomRightHitArea).is(':visible')).toBe(false);
    expect($(wt.selections.getAreas()[0].getBorder(wt).corner).is(':visible')).toBe(true);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.topLeft).is(':visible')).toBe(false);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.topLeftHitArea).is(':visible')).toBe(false);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.bottomRight).is(':visible')).toBe(false);
    expect($(wt.selections.getAreas()[0].getBorder(wt).selectionHandles.bottomRightHitArea).is(':visible')).toBe(false);
  });

  it('on click, should move the fill handle / corner border to the left, if in the position it would overlap the container (e.g.: far-right)', () => {
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
    $td1.simulate('mousedown');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(42);
    expect($corner.position().left).toBe(45);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);

    $td2.simulate('mousedown');

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(88);
    expect($corner.position().left).toBe(193);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);

    $td3.simulate('mousedown');

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(65);
    expect($corner.position().left).toBe(95);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
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
    $td1[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(42);
    expect($corner.position().left).toBe(45);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);

    $td2[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(88);
    expect($corner.position().left).toBe(193);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);

    $td3[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(65);
    expect($corner.position().left).toBe(95);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
  });

  it('on click, should move the fill handle / corner border to the top, if in the position it would overlap the container (e.g.: far-bottom)', () => {
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
    $td.simulate('mousedown');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    wt.draw();

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($table.css('height')).toBe('116px');
    expect($corner.position().top).toBe(109); // table.height - corner.height - corner.borderTop
    expect($corner.position().left).toBe(45);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
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
    $td[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    wt.draw();

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($table.css('height')).toBe('116px');
    expect($corner.position().top).toBe(109); // table.height - corner.height - corner.borderTop
    expect($corner.position().left).toBe(45);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
  });

  it('on click, should move the corner border to the top-left, if is not enough area on the bottom-right corner of container', () => {
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
    $td.simulate('mousedown');
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    wt.draw();

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($table.css('height')).toBe('24px');
    expect($corner.position().top).toBe(17); // table.height - corner.height - corner.borderTop
    expect($corner.position().left).toBe(43);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
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
    $td[0].dispatchEvent(new CustomEvent('touchstart', { bubbles: true }));
    const $corner = $(wt.selections.getCell().getBorder(wt).corner);

    wt.draw();

    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($table.css('height')).toBe('24px');
    expect($corner.position().top).toBe(17); // table.height - corner.height - corner.borderTop
    expect($corner.position().left).toBe(43);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
  });

  describe('hideBorderOnMouseDownOver', () => {
    it('when `hideBorderOnMouseDownOver` is false, the border should NOT disappear if mouse cursor goes over it while selecting text', () => {
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
        hideBorderOnMouseDownOver: false
      });
      wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
      wt.draw(true);
      const $border = $(wt.selections.getCell().getBorder(wt).bottom);

      const $td1 = $table.find('tbody tr:eq(0) td:eq(0)');
      const $td2 = $table.find('tbody tr:eq(0) td:eq(1)');

      $td1.simulate('mousedown');
      expect($border.is(':visible')).toBe(true);

      $border.simulate('mouseover');
      expect($border.is(':visible')).toBe(true);

      $td2.simulate('mousemove');
      expect($border.is(':visible')).toBe(true);
    });

    it('when `hideBorderOnMouseDownOver` is true, the border should disappear if mouse cursor goes over it while selecting text', () => {
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
        hideBorderOnMouseDownOver: true
      });
      wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
      wt.draw(true);
      const $border = $(wt.selections.getCell().getBorder(wt).bottom);

      const $td1 = $table.find('tbody tr:eq(0) td:eq(0)');
      const $td2 = $table.find('tbody tr:eq(0) td:eq(1)');

      $td1.simulate('mousedown');
      expect($border.is(':visible')).toBe(true);

      $border.simulate('mouseover');
      expect($border.is(':visible')).toBe(false);

      $td2.simulate('mousemove');
      expect($border.is(':visible')).toBe(true);
    });
  });
});
