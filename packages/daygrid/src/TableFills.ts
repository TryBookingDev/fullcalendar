import {
  VNode,
  htmlToElement,
  appendToElement,
  prependToElement,
  FillRenderer,
  Seg,
  ComponentContext,
  removeElement,
  BaseFillRendererProps,
  subrenderer,
  renderVNodes
} from '@fullcalendar/core'


const EMPTY_CELL_HTML = '<td style="pointer-events:none"></td>'


export interface TableFillsProps extends BaseFillRendererProps {
  type: string
  rowEls: HTMLElement[]
  colCnt: number
  renderIntro: () => VNode[]
}

export default class TableFills extends FillRenderer<TableFillsProps> {

  fillSegTag: string = 'td' // override the default tag name

  private attachSegs = subrenderer(attachSegs, detachSegs)


  render(props: TableFillsProps) {
    let segs = props.segs

    // don't render timed background events
    if (props.type === 'bgEvent') {
      segs = segs.filter(function(seg) {
        return seg.eventRange.def.allDay
      })
    }

    segs = this.renderSegs({
      type: props.type,
      segs
    })

    this.attachSegs({
      type: props.type,
      segs,
      rowEls: props.rowEls,
      colCnt: props.colCnt,
      renderIntro: props.renderIntro
    })
  }

}


function attachSegs(props: TableFillsProps, context: ComponentContext) {
  let { segs, rowEls } = props
  let els = []
  let i
  let seg
  let skeletonEl: HTMLElement

  for (i = 0; i < segs.length; i++) {
    seg = segs[i]
    skeletonEl = renderFillRow(seg, props, context)
    rowEls[seg.row].appendChild(skeletonEl)
    els.push(skeletonEl)
  }

  return els
}


function detachSegs(els: HTMLElement[]) {
  els.forEach(removeElement)
}


// Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
function renderFillRow(seg: Seg, { colCnt, type, renderIntro }: TableFillsProps, context: ComponentContext): HTMLElement {
  let { isRtl } = context
  let startCol = seg.firstCol
  let endCol = seg.lastCol + 1
  let className
  let skeletonEl: HTMLElement
  let trEl: HTMLTableRowElement

  if (type === 'businessHours') {
    className = 'bgevent'
  } else {
    className = type.toLowerCase()
  }

  skeletonEl = htmlToElement(
    '<div class="fc-' + className + '-skeleton">' +
      '<table><tr></tr></table>' +
    '</div>'
  )
  trEl = skeletonEl.getElementsByTagName('tr')[0]

  if (startCol > 0) {
    let emptyCellHtml = new Array(startCol + 1).join(EMPTY_CELL_HTML) // will create (startCol + 1) td's

    if (isRtl) {
      prependToElement(trEl, emptyCellHtml)
    } else {
      appendToElement(trEl, emptyCellHtml)
    }
  }

  ;(seg.el as HTMLTableCellElement).colSpan = endCol - startCol

  if (isRtl) {
    trEl.insertBefore(seg.el, trEl.firstChild)
  } else {
    trEl.appendChild(seg.el)
  }

  if (endCol < colCnt) {
    let emptyCellHtml = new Array(colCnt - endCol + 1).join(EMPTY_CELL_HTML)

    if (isRtl) {
      prependToElement(trEl, emptyCellHtml)
    } else {
      appendToElement(trEl, emptyCellHtml)
    }
  }

  let introEls = renderVNodes(renderIntro(), context)

  if (isRtl) {
    appendToElement(trEl, introEls)
  } else {
    prependToElement(trEl, introEls)
  }

  return skeletonEl
}