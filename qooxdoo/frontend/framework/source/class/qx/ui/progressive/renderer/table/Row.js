/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Table Row for Progressive renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.Row",
{
  extend     : qx.ui.progressive.renderer.Abstract,


  /**
   */
  construct : function(columnWidths)
  {
    this.base(arguments);

    // Save the column widths
    this._columnWidths = columnWidths;

    // Create space to store renderers for each column
    this._renderers = { };

    // We need a default cell renderer to use if none is specified
    this._defaultCellRenderer =
      new qx.ui.progressive.renderer.table.cell.Default();

    // We don't yet know who our Progressive will be
    this._progressive = null;
  },


  statics :
  {
    /** Background colors of alternating rows */
    BACKGROUND_COLOR : [ "rgb(238, 255, 255)", "rgb(255, 255, 255)" ],

    __clazz : null,

    __tableCellStyleSheet :
        "  position: absolute;" +
        "  top: 0px;" +
        "  height: 100%;" +
        "  overflow:hidden;" +
        "  text-overflow:ellipsis;" +
        "  -o-text-overflow: ellipsis;" +
        "  white-space:nowrap;" +
        "  border-right:1px solid #eeeeee;" +
        "  border-bottom:1px solid #eeeeee;" +
        "  padding : 0px 6px;" +
        "  cursor:default;" +
        "  font-size: 11px;" +
        "  font-family: 'Segoe UI', Corbel, Calibri, Tahoma, 'Lucida Sans Unicode', sans-serif;" +
        (qx.core.Variant.isSet("qx.client", "mshtml")
         ? ''
         : ';-moz-user-select:none;')
  },


  properties :
  {
    defaultRowHeight :
    {
      init : 16
    }
  },


  members :
  {
    join : function(progressive, name)
    {
      // Are we already joined?
      if (this._progressive)
      {
        // Yup.  Let 'em know they can't do that.
        throw new Error("Renderer is already joined to a Progressive.");
      }

      // Save the Progressive to which we're joined
      this._progressive = progressive;

      // Save the name that Progressive knows us by
      this._name = progressive;

      // Arrange to be called when the window appears or is resized, so we
      // can set each style sheet's left and width field appropriately.
      progressive.addEventListener("widthChanged",
                                   this._resizeColumns,
                                   this);

      // If we haven't created style sheets for this table yet...
      var tr = qx.ui.progressive.renderer.table.Row;
      if (!tr.__clazz)
      {
        tr.__clazz = { };
      }

      var hash = progressive.toHashCode();
      if (!tr.__clazz[hash])
      {
        // ... then do it now.
        tr.__clazz[hash] =
          {
            rowstylesheet  : null,
            cellstylesheet : [ ]
          };

        var stylesheet =
          ".qx-progressive-" + hash + "-row {" +
          "  width : '100%';"
          "}";
        tr.__clazz[hash].rowstylesheet =
          qx.html.StyleSheet.createElement(stylesheet);

        for (var i = 0; i < this._columnWidths.getData().length; i++)
        {
          var stylesheet =
            ".qx-progressive-" + hash + "-cell-" + i + " {" +
            tr.__tableCellStyleSheet +
            "}";
          tr.__clazz[hash].cellstylesheet[i] =
            qx.html.StyleSheet.createElement(stylesheet);
        }

        // Save the hash too
        this._hash = hash;

        // Arrange to be called when the window appears or is resized, so we
        // can set each style sheet's left and width field appropriately.
        progressive.addEventListener("widthChanged",
                                     this._resizeColumns,
                                     this);
      }
    },

    addRenderer : function(column, renderer)
    {
      if (column < 0 || column >= this._columnWidths.length)
      {
        throw new Error("Column " +
                        column +
                        " out of range (max: " +
                        (this._columnWidths.length - 1) +
                        ")");
      }

      this._renderers[column] = renderer;
    },

    removeRenderer : function(column)
    {
      if (column < 0 || column >= this._columnWidths.length)
      {
        throw new Error("Column " +
                        column +
                        " out of range (max: " +
                        (this._columnWidths.length - 1) +
                        ")");
      }

      if (! this._renderers[column])
      {
        throw new Error("No existing renderer for column " + column);
      }

      delete this._renderers[column];
    },

    /**
     */
    render : function(state, element)
    {  
      var data = element.data;
      var html = [ ];
      var cellInfo;
      var renderer;
      var height = 0;

      // Initialize row counter, if necessary.  We'll use this for shading
      // alternate rows.
      if (state.getRendererData()[this._name] === undefined)
      {
        state.getRendererData()[this._name] =
          {
            end   : 0,
            start : 1,
            rows  : 0
          };
      }

      // Create the div for this row
      var div = document.createElement("div");

      // For each cell...
      for (i = 0; i < data.length; i++)
      {
        var stylesheet = "qx-progressive-" + this._hash + "-cell-" + i;

        // Determine what renderer to use for this column
        renderer = this._renderers[i] || this._defaultCellRenderer;

        // Specify information that cell renderer will need
        cellInfo =
        {
          state      : state,
          rowDiv     : div,
          stylesheet : stylesheet,
          cellData   : data[i],
          element    : element,
          dataIndex  : i,
          height     : height
        };

        // Render this cell
        html.push(renderer.render(cellInfo));

        // If this cell's height was greater than our current maximum...
        if (cellInfo.height > height)
        {
          // ... then it becomes our row height
          height = cellInfo.height;
        }
      }

      // Set properties for the row div
      div.style.position = "relative";
      div.style.height = height > 0 ? height : this.getDefaultRowHeight();
      div.setAttribute("class", "qx-progressive-" + this._hash + "-row");
      div.innerHTML = html.join("");

      // Get a reference to our renderer data
      var rendererData = state.getRendererData()[this._name];

      // Add this row to the table
      switch(element.location)
      {
      case "end":
        // Determine color of row based on state of last added row
        var index = state.getRendererData()[this._name].end;

        // Set the background color of this row
        div.style.backgroundColor =
          qx.ui.progressive.renderer.table.Row.BACKGROUND_COLOR[index];

        // Update state for next time
        rendererData.end = (index == 0 ? 1 : 0);

        // Append our new row to the pane.
        state.getPane().getElement().appendChild(div);
        break;

      case "start":
        // Get the pane element
        var elem = state.getPane().getElement();

        // Get its children array
        var children = elem.childNodes;

        // Are there any children?
        if (children.length > 0)
        {
          // Yup.  Determine color of row based on state of last added row
          var index = rendererData.start;

          // Set the background color of this row
          div.style.backgroundColor =
            qx.ui.progressive.renderer.table.Row.BACKGROUND_COLOR[index];

          // Update state for next time
          rendererData.start = (index == 0 ? 1 : 0);

          // Insert our new row before the first child.   
          elem.insertBefore(div, children[0]);
          break;
        }
        else
        {
          /* No children yet.  We can append our new row. */
          elem.appendChild(div);
        }
        break;

      default:
        throw new Error("Invalid location: " + element.location);
      }

      // Increment row count
      ++rendererData.rows;
    },

    _resizeColumns : function(e)
    {
      var width =
        (! this._progressive.getElement()
         ? 0
         : this._progressive.getInnerWidth()) -
        qx.ui.core.Widget.SCROLLBAR_SIZE;
      
      // Get the style sheet rule name for this row
      var stylesheet = ".qx-progressive-" + this._hash + "-row";

      // Remove the style rule for this row
      var tr = qx.ui.progressive.renderer.table.Row;
      qx.html.StyleSheet.removeRule(tr.__clazz[this._hash].rowstylesheet,
                                    stylesheet);


      // Create the new rule for this row
      var rule = "width: " + width + ";";

      // Apply the new rule
      qx.html.StyleSheet.addRule(tr.__clazz[this._hash].rowstylesheet,
                                 stylesheet,
                                 rule);

      // Compute the column widths
      qx.ui.util.column.FlexWidth.compute(this._columnWidths.getData(), width);

      // Reset each of the column style sheets to deal with width changes
      for (var i = 0,
             left = 0;
           i < this._columnWidths.getData().length;
           i++,
             left += width)
      {
        // Get the style sheet rule name for this cell
        var stylesheet = ".qx-progressive-" + this._hash + "-cell-" + i;

        // Remove the style rule for this column
        var tr = qx.ui.progressive.renderer.table.Row;
        qx.html.StyleSheet.removeRule(tr.__clazz[this._hash].cellstylesheet[i],
                                      stylesheet);

        // Get this column data.
        var columnData = this._columnWidths.getData()[i];

        //
        // Get the width of this column.
        //
        
        // Is this column a flex width?
        if (columnData._computedWidthTypeFlex)
        {
          // Yup.  Set the width to the calculated width value based on flex
          width = columnData._computedWidthFlexValue;
        }
        else if (columnData._computedWidthTypePercent)
        {
          // Set the width to the calculated width value based on percent
          width = columnData._computedWidthPercentValue;
        }
        else
        {
          width = columnData.getWidth();
        }

        // Create the new rule, based on calculated widths
        var rule =
          tr.__tableCellStyleSheet +
          "left: " + left + ";" +
          "width: " + width + ";";

        // Apply the new rule
        qx.html.StyleSheet.addRule(tr.__clazz[this._hash].cellstylesheet[i],
                                   stylesheet,
                                   rule);
      }
    }
  },


  /**
   */
  destruct : function()
  {
  }
});
