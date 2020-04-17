import { Action } from './types'
import { PluginHooks } from '../plugin-system'
import { DateEnv } from '../datelib/env'
import { Calendar } from '../Calendar'
import { Emitter } from '../common/Emitter'
import { parseFieldSpecs } from '../util/misc'
import { createDuration, Duration } from '../datelib/duration'


export interface ReducerContext {
  dateEnv: DateEnv
  options: any
  computedOptions: ComputedOptions
  pluginHooks: PluginHooks
  emitter: Emitter
  calendar: Calendar
  dispatch(action: Action): void
}

export interface ComputedOptions {
  eventOrderSpecs: any
  nextDayThreshold: Duration
  defaultAllDayEventDuration: Duration
  defaultTimedEventDuration: Duration
  slotDuration: Duration | null
  snapDuration: Duration | null
  slotMinTime: Duration
  slotMaxTime: Duration
}

export function buildComputedOptions(options: any): ComputedOptions {
  return {
    eventOrderSpecs: parseFieldSpecs(options.eventOrder),
    nextDayThreshold: createDuration(options.nextDayThreshold),
    defaultAllDayEventDuration: createDuration(options.defaultAllDayEventDuration),
    defaultTimedEventDuration: createDuration(options.defaultTimedEventDuration),
    slotDuration: options.slotDuration ? createDuration(options.slotDuration) : null,
    snapDuration: options.snapDuration ? createDuration(options.snapDuration) : null,
    slotMinTime: createDuration(options.slotMinTime),
    slotMaxTime: createDuration(options.slotMaxTime)
  }
}