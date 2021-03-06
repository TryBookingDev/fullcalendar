import {
  Ref,
  ComponentChildren,
  createElement,
  DateMarker,
  DateComponent,
  CssDimValue,
  DateRange,
  buildNavLinkData,
  DayCellContentArg,
  RenderHook,
  WeekNumberRoot,
  DayCellRoot,
  DayCellContent,
  BaseComponent,
  DateProfile,
  VUIEvent,
  setRef,
  createFormatter,
  ViewApi,
  Dictionary,
  MountArg,
  Fragment,
  CustomDayCellContentArg,
} from '@fullcalendar/common'
import { TableSeg } from './TableSeg'


export interface TableCellProps {
  moreXPopover?: any
  date: DateMarker
  dateProfile: DateProfile
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
  elRef?: Ref<HTMLTableCellElement>
  innerElRef?: Ref<HTMLDivElement>
  bgContent: ComponentChildren
  fgContentElRef?: Ref<HTMLDivElement> // TODO: rename!!! classname confusion. is the "event" div
  fgContent: ComponentChildren
  fgPaddingBottom: CssDimValue
  // hasEvents: boolean // TODO: when reviving, event should "have events" even when none *start* on the cell
  moreCnt: number
  moreMarginTop: number
  showDayNumber: boolean
  showWeekNumber: boolean
  forceDayTop: boolean
  todayRange: DateRange
  buildMoreLinkText: (num: number) => string
  onMoreClick?: (arg: MoreLinkArg) => void
  segsByEachCol: TableSeg[] // for more-popover. includes segs that aren't rooted in this cell but that pass over it
  segIsHidden: { [instanceId: string]: boolean } // for more-popover. TODO: rename to be about selected instances
}

export interface TableCellModel { // TODO: move somewhere else. combine with DayTableCell?
  key: string
  date: DateMarker
  extraHookProps?: Dictionary
  extraDataAttrs?: Dictionary
  extraClassNames?: string[]
}

export interface MoreLinkArg {
  date: DateMarker
  allSegs: TableSeg[]
  hiddenSegs: TableSeg[]
  moreCnt: number
  dayEl: HTMLElement
  ev: VUIEvent
}

export interface HookProps {
  date: Date
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}

export interface MoreLinkContentArg {
  num: number
  text: string
  view: ViewApi
}

export type MoreLinkMountArg = MountArg<MoreLinkContentArg>

const DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: 'narrow' })

const formatDate = (date) => {
  let month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

export class TableCell extends DateComponent<TableCellProps> {

  private rootEl: HTMLElement
  private morePopupParentEl: HTMLElement;


  render() {
    let { options, viewApi } = this.context
    let { props } = this
    let { date, dateProfile } = props

    let hookProps: MoreLinkContentArg = {
      num: props.moreCnt,
      text: props.buildMoreLinkText(props.moreCnt),
      view: viewApi
    }

    let navLinkAttrs = options.navLinks
      ? { 'data-navlink': buildNavLinkData(date, 'week'), tabIndex: 0 }
      : {}

    let customDayCellContentArg: CustomDayCellContentArg = {
      date:props.date,
      dateProfile:props.dateProfile,
      todayRange:props.todayRange
    }

    return (
      <DayCellRoot
        date={date}
        dateProfile={dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        extraHookProps={props.extraHookProps}
        elRef={this.handleRootEl}
      >
        {(rootElRef, classNames, rootDataAttrs, isDisabled) => (
          <td
            ref={rootElRef}
            className={[ 'fc-daygrid-day' ].concat(classNames, props.extraClassNames || [],
              options.dayCellMainContainerClassNamesCallback ? options.dayCellMainContainerClassNamesCallback(customDayCellContentArg) as string[] : []).join(' ')}
            {...rootDataAttrs}
            {...props.extraDataAttrs}
          >
            <div className='fc-daygrid-day-frame fc-scrollgrid-sync-inner' data-date={formatDate(props.date)} ref={this.handleInnerRefEl /* different from hook system! RENAME */}>

              {/*{(options as any).showPopover === formatDate(props.date) && props.moreXPopover}*/}

              {props.showWeekNumber &&
                <WeekNumberRoot date={date} defaultFormat={DEFAULT_WEEK_NUM_FORMAT}>
                  {(rootElRef, classNames, innerElRef, innerContent) => (
                    <a
                      ref={rootElRef}
                      className={[ 'fc-daygrid-week-number' ].concat(classNames).join(' ')}
                      {...navLinkAttrs}
                    >
                      {innerContent}
                    </a>
                  )}
                </WeekNumberRoot>
              }

              { options.customDayCellParentHeaderContentClassName &&
              <div
                className={ options.customDayCellParentHeaderContentClassName || '' }
                ref={props.fgContentElRef}
              >
                {options.customDayCellHeaderContent &&
                <RenderHook<CustomDayCellContentArg>
                  hookProps={customDayCellContentArg}
                  classNames={options.customDayCellHeaderContentClassNames}
                  content={options.customDayCellHeaderContent}
                  didMount={options.customDayCellHeaderContentDidMount}
                  willUnmount={options.customDayCellHeaderContentWillUnmount}
                >
                  {(rootElRef, classNames, innerElRef, innerContent) => (
                    <div ref={rootElRef}
                         className={['fc-daygrid-custom-event-header-content'].concat(classNames).join(' ')}>
                      {innerContent}
                    </div>
                  )}
                </RenderHook>
                }
              </div>
              }

              {!isDisabled &&
                <TableCellTop
                  date={date}
                  dateProfile={dateProfile}
                  showDayNumber={props.showDayNumber}
                  forceDayTop={props.forceDayTop}
                  todayRange={props.todayRange}
                  extraHookProps={props.extraHookProps}
                />
              }
              <div
                className='fc-daygrid-day-events'
                ref={props.fgContentElRef}
                style={{ paddingBottom: props.fgPaddingBottom }}
              >
                {!options.hideEvents && props.fgContent}
                {options.customDayCellParentContentClassName &&
                <div
                  className={options.customDayCellParentContentClassName || ''}
                  ref={props.fgContentElRef}
                >
                  {options.customDayCellContent &&
                  <RenderHook<CustomDayCellContentArg>
                    hookProps={customDayCellContentArg}
                    classNames={options.customDayCellContentClassNames}
                    content={options.customDayCellContent}
                    didMount={options.customDayCellContentDidMount}
                    willUnmount={options.customDayCellContentWillUnmount}
                  >
                    {(rootElRef, classNames, innerElRef, innerContent) => (
                      <div ref={rootElRef} className={['fc-daygrid-custom-event-content'].concat(classNames).join(' ')}>
                        {innerContent}
                      </div>
                    )}
                  </RenderHook>
                  }
                </div>
                }

                {Boolean(props.moreCnt) &&
                  <div className='fc-daygrid-day-bottom' style={{ marginTop: props.moreMarginTop, position: 'relative' }}>

                    <RenderHook<MoreLinkContentArg> // needed?
                      hookProps={hookProps}
                      classNames={options.moreLinkClassNames}
                      content={options.moreLinkContent}
                      defaultContent={renderMoreLinkInner}
                      didMount={options.moreLinkDidMount}
                      willUnmount={options.moreLinkWillUnmount}
                    >
                      {(rootElRef, classNames, innerElRef, innerContent) => {

                        return !options.hideMoreContentLink ? (<a onClick={e => this.handleMoreLinkClick(e, formatDate(props.date)) } ref={rootElRef}
                           className={['fc-daygrid-more-link'].concat(classNames).join(' ')}>
                          {innerContent}
                        </a>) : (<div className='empty-more-content-link'></div>);

                      }}
                    </RenderHook>
                  </div>
                }
              </div>
              <div className='fc-daygrid-day-bg'>
                {props.bgContent}
              </div>
            </div>
          </td>
        )}
      </DayCellRoot>
    )
  }


  handleRootEl = (el: HTMLElement) => {
    this.rootEl = el

    setRef(this.props.elRef, el)
  }

  handleInnerRefEl = (el: HTMLElement) => {
    this.morePopupParentEl = el
    setRef(this.props.innerElRef, el)
  }


  handleMoreLinkClick = (ev: VUIEvent, date?: string) => {
    let { props } = this;
    let { options } = this.context;

    (options as any).showPopover = date;
    (options as any).morePopupParentEl = this.morePopupParentEl;

    if (props.onMoreClick) {
      let allSegs = props.segsByEachCol
      let hiddenSegs = allSegs.filter(
        (seg: TableSeg) => props.segIsHidden[seg.eventRange.instance.instanceId]
      )

      props.onMoreClick({
        date: props.date,
        allSegs,
        hiddenSegs,
        moreCnt: props.moreCnt,
        dayEl: this.rootEl,
        ev
      })
    }
  }

}


function renderTopInner(props: DayCellContentArg) {
  return props.dayNumberText
}


function renderMoreLinkInner(props) {
  return props.text
}


interface TableCellTopProps {
  date: DateMarker
  dateProfile: DateProfile
  showDayNumber: boolean
  forceDayTop: boolean // hack to force-create an element with height (created by a nbsp)
  todayRange: DateRange
  extraHookProps?: Dictionary
}

class TableCellTop extends BaseComponent<TableCellTopProps> {

  render() {
    let { props } = this

    let navLinkAttrs = this.context.options.navLinks
      ? { 'data-navlink': buildNavLinkData(props.date), tabIndex: 0 }
      : {}

    return (
      <DayCellContent
        date={props.date}
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        showDayNumber={props.showDayNumber}
        extraHookProps={props.extraHookProps}
        defaultContent={renderTopInner}
      >
        {(innerElRef, innerContent) => (
          (innerContent || props.forceDayTop) &&
            <div className='fc-daygrid-day-top' ref={innerElRef}>
              <a className='fc-daygrid-day-number' {...navLinkAttrs}  data-date={formatDate(props.date)}>
                {innerContent || <Fragment>&nbsp;</Fragment>}
              </a>
            </div>
        )}
      </DayCellContent>
    )
  }

}
