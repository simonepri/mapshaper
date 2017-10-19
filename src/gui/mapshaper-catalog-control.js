
function CatalogControl(catalog, onSelect) {
  var self = this,
      el = El('#file-catalog'),
      cols = catalog.cols,
      enabled = true,
      items = catalog.items,
      n = items.length,
      row = 0,
      html;

  this.reset = function() {
    enabled = true;
    this.progress(0);
  };

  this.progress = function() {}; // set by click handler

  if (n > 0 === false) {
    console.error("Catalog is missing array of items");
    return;
  }

  El('body').addClass('catalog-mode');

  if (!cols) {
    cols = Math.ceil(Math.sqrt(n));
  }
  rows = Math.ceil(n / cols);

  html = '<table>';
  if (catalog.title) {
    html += utils.format('<tr><th colspan="%d"><h4>%s</h4></th></tr>', cols, catalog.title);
  }
  while (row < rows) {
    html += renderRow(items.slice(row * cols, row * cols + cols));
    row++;
  }
  html += '</table>';
  el.node().innerHTML = html;
  Elements('#file-catalog td').forEach(function(el, i) {
    el.on('click', function() {
      selectItem(el, i);
    });
  });

  // Generate onprogress callback to show a progress indicator
  function getProgressFunction(el) {
    var visible = false,
        i = 0;
    return function(pct) {
      i++;
      if (i == 2 && pct < 0.5) {
        // only show progress bar if file will take a while to load
        visible = true;
      }
      if (visible) {
        el.css('background-size', (Math.round(pct * 100) + '% 100%'));
      }
    };
  }

  function renderRow(items) {
    var tds = items.map(function(o, col) {
      var i = row * cols + col;
      return renderCell(o, i);
    });
    return '<tr>' + tds.join('') + '</tr>';
  }

  function selectItem(el,i) {
    var pageUrl = window.location.href.toString().replace(/[?#].*/, '').replace(/\/$/, '') + '/';
    var item = items[i];
    var urls = item.files.map(function(file) {
      var url = (item.url || '') + file;
      if (/^http/.test(url) === false) {
        // assume relative url
        url = pageUrl + '/' + url;
      }
      return url;
    });
    if (enabled) { // only respond to first click
      self.progress = getProgressFunction(el);
      enabled = false;
      onSelect(urls);
    }
  }

  function renderCell(item, i) {
    var template = '<td data-id="%d" class="bg-progress"><h4 class="title">%s</h4><div class="subtitle">%s</div></td>';
    return utils.format(template, i, item.title, item.subtitle || '');
  }

}